import { google } from 'googleapis';
import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from 'next/server';
import { gmail_v1 } from 'googleapis';
import { getCorsHeaders, handleOptions } from '@/utils/api-headers';

export const OPTIONS = handleOptions;

export async function POST(request: Request) {
    const supabase = await createClient();
    
    // Get the current session
    const { data: { session } } = await supabase.auth.getSession();
  
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: getCorsHeaders(request) }
      );
    }
  
    const accessToken = session.provider_token;
  
    if (!accessToken) {
      return NextResponse.json(
        { error: 'No access token available' },
        { status: 401, headers: getCorsHeaders(request) }
      );
    }
  
    // Parse the request body to get the coach emails
    const { coachEmails } = await request.json();
  
    if (!coachEmails || !Array.isArray(coachEmails) || coachEmails.length === 0) {
      return NextResponse.json(
        { error: 'Coach emails are required' },
        { status: 400, headers: getCorsHeaders(request) }
      );
    }
  
    // Create a new OAuth2Client using the access token
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
  
    const gmail = google.gmail({ version: 'v1', auth });
  
    // Create a query to filter emails from or to any of the coach emails
    const query = coachEmails.map(email => `from:${email} OR to:${email}`).join(' OR ');
  
  
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
        { headers: getCorsHeaders(request) }
      );
    } catch (error) {
      console.error('Error fetching messages:', error);
      return NextResponse.json(
        { error: 'Failed to fetch messages' },
        { status: 500, headers: getCorsHeaders(request) }
      );
    }
  }