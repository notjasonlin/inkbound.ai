import { google } from 'googleapis';
import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const supabase = createClient();

  // Get the current session
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const accessToken = session.provider_token;

  if (!accessToken) {
    return new NextResponse('No access token available', { status: 401 });
  }

  // Parse the request body to get the coach's email and message
  const { coachEmail, message, threadId } = await request.json();

  console.log(coachEmail);

  if (!coachEmail || !message) {
    return new NextResponse('Coach email and message are required', { status: 400 });
  }

  // Create a new OAuth2Client using the access token
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });

  const gmail = google.gmail({ version: 'v1', auth });

  // Construct the email in RFC 822 format (raw message)
  const rawMessage = `
To: ${coachEmail}
Subject: New Message

${message}
`;

  // Base64 encode the message for Gmail's API
  const encodedMessage = Buffer.from(rawMessage)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  try {
    // Send the message using Gmail API
    const result = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
        threadId: threadId || undefined, // Send as part of the existing thread if provided
      },
    });

    // Return the sent message details
    return new NextResponse(JSON.stringify({ id: result.data.id }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error sending email:', error);
    return new NextResponse('Failed to send message', { status: 500 });
  }
}
