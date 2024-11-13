import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { google } from 'googleapis';

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.provider_token) {
    console.error('Not authenticated');
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: session.provider_token });

  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

  try {
    const { to, subject, content, schoolId, schoolName } = await request.json();

    // Generate a boundary for multipart message
    const boundary = '-----' + Math.random().toString(36).slice(2);

    // Construct email
    let message = [
      `To: ${to}`,
      `Subject: ${subject} - ${schoolName}`,
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

    // Save coach emails
    const coachEmails = to.split(',').map((email: string) => email.trim());
    const { error: coachEmailError } = await supabase
      .from('school_coach_emails')
      .upsert({
        user_id: session.user.id,
        school_id: schoolId,
        coach_emails: coachEmails,
      }, {
        onConflict: 'user_id,school_id'
      });

    if (coachEmailError) {
      console.error('Error saving data:', coachEmailError);
    }

    return NextResponse.json({ success: true, messageId: response.data.id });
  } catch (error: any) {
    console.error('Error sending email:', error);
    return NextResponse.json({ 
      error: 'Failed to send email', 
      details: error.message || 'Unknown error'
    }, { status: 500 });
  }
}
