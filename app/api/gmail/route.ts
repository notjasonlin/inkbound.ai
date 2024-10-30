import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { createClient } from '@/utils/supabase/server';
import { Email } from '@/types/email/index';
import { Readable } from 'stream';

export async function GET(req: Request) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.provider_token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: session.provider_token });

  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

  try {
    // Fetch user's email
    const profile = await gmail.users.getProfile({ userId: 'me' });
    const userEmail = profile.data.emailAddress;

    if (!userEmail) {
      return NextResponse.json({ error: 'Unable to fetch user email' }, { status: 500 });
    }

    const url = new URL(req.url);
    const numEmails = url.searchParams.getAll('numEmails');

    if (!numEmails.length) {
      return NextResponse.json({ error: 'No thread IDs provided' }, { status: 400 });
    }

    const res = await gmail.users.messages.list({
      userId: 'me',
      q: `bcc:${userEmail}`,
      maxResults: parseInt(numEmails[0]),
    });

    const messages = res.data.messages || [];
    const emails: Email[] = await Promise.all(
      messages.map(async (message) => {
        const email = await gmail.users.messages.get({
          userId: 'me',
          id: message.id!,
        });

        const headers = email.data.payload?.headers;
        return {
          id: message.id!,
          subject: headers?.find((h) => h.name === 'Subject')?.value || 'No Subject',
          from: headers?.find((h) => h.name === 'From')?.value || 'Unknown',
          date: headers?.find((h) => h.name === 'Date')?.value || '',
          snippet: email.data.snippet || '', // Add this line
        };
      })
    );

    return NextResponse.json(emails);
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}

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
    const formData = await req.formData();
    const to = formData.get('to') as string;
    const subject = formData.get('subject') as string;
    const content = formData.get('content') as string;
    const attachments = formData.getAll('attachments') as File[];

    // Fetch user's email for BCC
    const profile = await gmail.users.getProfile({ userId: 'me' });
    const userEmail = profile.data.emailAddress;

    if (!userEmail) {
      return NextResponse.json({ error: 'Unable to fetch user email' }, { status: 500 });
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
    ];

    // Add attachments
    for (const attachment of attachments) {
      const buffer = await attachment.arrayBuffer();
      const base64Data = Buffer.from(buffer).toString('base64');
      
      message = message.concat([
        `--${boundary}`,
        `Content-Type: ${attachment.type}`,
        'Content-Transfer-Encoding: base64',
        `Content-Disposition: attachment; filename="${attachment.name}"`,
        '',
        base64Data
      ]);
    }

    // Close the boundary
    message.push(`--${boundary}--`);

    const encodedMessage = Buffer.from(message.join('\n')).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    // Send email
    const response = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    });

    return NextResponse.json({ success: true, messageId: response.data.id });
  } catch (error: any) {
    console.error('Error sending data:', error);
    return NextResponse.json({ 
      error: 'Failed to send email', 
      details: error.message || 'Unknown error'
    }, { status: 500 });
  }
}
