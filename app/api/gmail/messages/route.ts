import { google } from 'googleapis';
import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from 'next/server';
import { gmail_v1 } from 'googleapis';
import { corsHeaders, handleOptions } from '@/utils/api-headers';

export const OPTIONS = handleOptions;

export async function POST(request: Request) {
  const supabase = createClient();
  
  // Get the current session
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401, headers: corsHeaders }
    );
  }

  const accessToken = session.provider_token;

  if (!accessToken) {
    return NextResponse.json(
      { error: 'No access token available' },
      { status: 401, headers: corsHeaders }
    );
  }

  // Parse the request body to get the coach's email
  const { coachEmail } = await request.json();

  if (!coachEmail) {
    return NextResponse.json(
      { error: 'Coach email is required' },
      { status: 400, headers: corsHeaders }
    );
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


    return NextResponse.json(
      { messages: fullEmails },
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json(
      { error: 'Error fetching data' },
      { status: 500, headers: corsHeaders }
    );
  }
}
