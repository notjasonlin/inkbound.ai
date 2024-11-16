import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { createClient } from '@/utils/supabase/server';
import { corsHeaders, handleOptions } from '@/utils/api-headers';

export const OPTIONS = handleOptions;

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.provider_token) {
    return NextResponse.json(
      { error: 'Not authenticated' },
      { status: 401, headers: corsHeaders }
    );
  }

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: session.provider_token });

  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

  try {
    const { to, subject, content, schoolId } = await req.json();

    // Fetch user's email for BCC
    const profile = await gmail.users.getProfile({ userId: 'me' });
    const userEmail = profile.data.emailAddress;

    if (!userEmail) {
      return NextResponse.json(
        { error: 'Unable to fetch user email' },
        { status: 500, headers: corsHeaders }
      );
    }

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

    // Delete the draft from the email_drafts table
    const { error: deleteError } = await supabase
      .from('email_drafts')
      .delete()
      .match({ user_id: session.user.id, school_id: schoolId });

    if (deleteError) {
      console.error('Error deleting data:', deleteError);
    }

    // Save coach emails
    const { error: coachEmailError } = await supabase
      .from('school_coach_emails')
      .upsert({
        user_id: session.user.id,
        school_id: schoolId,
        coach_emails: to.split(',').map((email: string) => email.trim()),
      }, {
        onConflict: 'user_id,school_id'
      });

    if (coachEmailError) {
      console.error('Error saving data:', coachEmailError);
    }

    return NextResponse.json(
      { success: true, messageId: response.data.id },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    console.error('Error sending data:', error);
    return NextResponse.json({ 
      error: 'Failed to send email', 
      details: error.message || 'Unknown error'
    }, { status: 500, headers: corsHeaders });
  }
}
