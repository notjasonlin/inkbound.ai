import { google } from 'googleapis';
import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from 'next/server';
import { gmail_v1 } from 'googleapis';

export async function POST(request: Request) {
  const supabase = await createClient();
  
  // Get the current session
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }

  const accessToken = session.provider_token;

  if (!accessToken) {
    return new Response('No access token available', { status: 401 });
  }

  // Parse the request body to get the coach's email
  const { coachEmail } = await request.json();

  if (!coachEmail) {
    return new Response('Coach email is required', { status: 400 });
  }

  // Create a new OAuth2Client using the access token
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });

  const gmail = google.gmail({ version: 'v1', auth });

  // Modify the query to include both emails sent to and from the coach
  const query = `to:${coachEmail} OR from:${coachEmail}`;


  try {
    const response = await gmail.users.messages.list({
      userId: 'me',
      q: query,
    });


    // Fetch full details for each email
    const fullEmails = await Promise.all(
      (response.data.messages ?? []).map(async (message: gmail_v1.Schema$Message) => {
        if (message.id) {
          const emailResponse = await gmail.users.messages.get({
            userId: 'me',
            id: message.id,
            format: 'full',
          });
          const emailData = emailResponse.data;
          return {
            id: emailData.id,
            subject: emailData.payload?.headers?.find((h: gmail_v1.Schema$MessagePartHeader) => h.name === 'Subject')?.value || 'No Subject',
            from: emailData.payload?.headers?.find((h: gmail_v1.Schema$MessagePartHeader) => h.name === 'From')?.value || 'Unknown',
            date: emailData.payload?.headers?.find((h: gmail_v1.Schema$MessagePartHeader) => h.name === 'Date')?.value || 'Unknown',
            snippet: emailData.snippet || 'No preview available',
          };
        }
      })
    );


    return new Response(JSON.stringify({ messages: fullEmails }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    return new Response('Error fetching data', { status: 500 });
  }
}
