import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { google } from 'googleapis';

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.provider_token) {
    console.error('Not authenticated');
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: session.provider_token });

  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

  try {
    const { to, subject, content, coachEmails, schoolName, schoolId } = await request.json();

    console.log('Received data:', { to, subject, schoolName, schoolId });
    console.log('Coach Emails:', coachEmails);

    // Generate a boundary for multipart message
    const boundary = '-----' + Math.random().toString(36).slice(2);

    // Construct email content with coach information
    let emailContent = content;
    emailContent += '<h2>Coach Information:</h2>';

    if (coachEmails && Object.keys(coachEmails).length > 0) {
      emailContent += `<h3>${schoolName} (ID: ${schoolId})</h3>`;
      emailContent += '<ul>';
      for (const [coachName, email] of Object.entries(coachEmails)) {
        emailContent += `<li>${coachName}: ${email}</li>`;
      }
      emailContent += '</ul>';
    } else {
      emailContent += '<p>No coach information available for this school.</p>';
    }

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
      emailContent,
      `--${boundary}--`
    ];

    const encodedMessage = Buffer.from(message.join('\n')).toString('base64')
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    console.log('Sending email...');
    // Send email
    const response = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    });

    console.log('Email sent successfully:', response.data);

    return NextResponse.json({ success: true, messageId: response.data.id });
  } catch (error: any) {
    console.error('Error sending email:', error);
    return NextResponse.json({ 
      error: 'Failed to send email', 
      details: error.message || 'Unknown error'
    }, { status: 500 });
  }
}
