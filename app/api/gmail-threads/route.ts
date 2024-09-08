import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { createClient } from '@/utils/supabase/server';
import { EmailThread } from '@/types/threads/index';

export async function GET(req: Request) {
  console.log("1");

  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  console.log("2");

  if (!session?.provider_token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  console.log("3");

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: session.provider_token });

  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

  try {
    const url = new URL(req.url);
    const threadIds = url.searchParams.getAll('threadId'); // Fetch thread IDs from query parameters

    if (!threadIds.length) {
      return NextResponse.json({ error: 'No thread IDs provided' }, { status: 400 });
    }


    // Fetch specific threads by ID
    const emailThreads: EmailThread[] = await Promise.all(
      threadIds.map(async (threadId) => {
        console.log("THREADID", threadId);
        const threadDetails = await gmail.users.threads.get({
          userId: 'me',
          id: threadId,
        });

        console.log("CHECKPOINT");

        const messages = threadDetails.data.messages || [];
        const threadMessages = messages.map((message) => {
          const headers = message.payload?.headers;
          return {
            id: message.id!,
            subject: headers?.find((h) => h.name === 'Subject')?.value || 'No Subject',
            from: headers?.find((h) => h.name === 'From')?.value || 'Unknown',
            date: headers?.find((h) => h.name === 'Date')?.value || '',
            snippet: message.snippet || '',
          };
        });

        return {
          threadId: threadId,
          messages: threadMessages,
        };
      })
    );

    console.log("TEST", emailThreads);

    return NextResponse.json(emailThreads);
  } catch (error) {
    console.error('Error fetching email threads:', error);
    return NextResponse.json({ error: 'Failed to fetch email threads' }, { status: 500 });
  }
}
