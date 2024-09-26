import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { google } from 'googleapis';

export async function POST(req: Request) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.provider_token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: session.provider_token });

  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

  try {
    // Fetch the next email from the queue
    const { data: queuedEmail, error } = await supabase
      .from('email_queue')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(1)
      .single();

    if (error || !queuedEmail) {
      return NextResponse.json({ message: 'No emails in queue' }, { status: 200 });
    }

    // Fetch the school data
    const { data: school, error: schoolError } = await supabase
      .from('schools')
      .select('*')
      .eq('id', queuedEmail.school_id)
      .single();

    if (schoolError || !school) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 });
    }

    // Fetch user's email for BCC
    const profile = await gmail.users.getProfile({ userId: 'me' });
    const userEmail = profile.data.emailAddress;

    if (!userEmail) {
      return NextResponse.json({ error: 'Unable to fetch user email' }, { status: 500 });
    }

    const to = school.coaches.map((coach: any) => coach.email).join(', ');
    const subject = `Email for ${school.school}`;
    const content = queuedEmail.content;

    // Generate a boundary for multipart message
    const boundary = '-----' + Math.random().toString(36).slice(2);

    // Construct email
    let message = [
      `To: ${to}`,
      `Subject: ${subject}`,
      `Bcc: ${userEmail}`,
      'MIME-Version: 1.0',
      `Content-Type: multipart/mixed; boundary="${boundary}"`,
      '',
      `--${boundary}`,
      'Content-Type: text/html; charset=utf-8',
      '',
      content,
      `--${boundary}--`
    ];

    const encodedMessage = Buffer.from(message.join('\n')).toString('base64')
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    // Send email
    const response = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    });

    console.log('Email sent successfully:', response.data);

    // Update the email status in the queue
    await supabase
      .from('email_queue')
      .update({ status: 'sent' })
      .eq('id', queuedEmail.id);

    // Save coach emails
    const { error: coachEmailError } = await supabase
      .from('school_coach_emails')
      .upsert({
        user_id: session.user.id,
        school_id: queuedEmail.school_id,
        coach_emails: to.split(',').map((email: string) => email.trim()),
      }, {
        onConflict: 'user_id,school_id'
      });

    if (coachEmailError) {
      console.error('Error saving coach emails:', coachEmailError);
    }

    return NextResponse.json({ success: true, messageId: response.data.id });
  } catch (error: any) {
    console.error('Error processing email queue:', error);
    return NextResponse.json({ 
      error: 'Failed to process email queue', 
      details: error.message || 'Unknown error'
    }, { status: 500 });
  }
}