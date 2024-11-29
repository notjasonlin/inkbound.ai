import { google } from "googleapis";
import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { corsHeaders, handleOptions } from '@/utils/api-headers';

export const OPTIONS = handleOptions;

export async function POST(request: NextRequest) {
    const supabase = await createClient();

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

    // Parse the request body to get the coach's email, message, and threadId
    const { coachEmail, message, threadId } = await request.json();

    if (!coachEmail || !message) {
        return NextResponse.json(
            { error: 'Coach email and message are required' },
            { status: 400, headers: corsHeaders }
        );
    }

    // Create a new OAuth2Client using the access token
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });

    const gmail = google.gmail({ version: "v1", auth });

    let subject = "New Message"; // Default subject if no thread is provided
    let references = "";
    let inReplyTo = "";

    if (threadId) {
        // Fetch the thread to get the subject and headers
        const threadResponse = await gmail.users.threads.get({
            userId: "me",
            id: threadId,
        });

        const messages = threadResponse.data.messages;
        if (messages && messages.length > 0) {
            const lastMessage = messages[messages.length - 1];
            subject = lastMessage.payload?.headers?.find((header) =>
                header.name === "Subject"
            )?.value || subject;
            inReplyTo = lastMessage.payload?.headers?.find((header) =>
                header.name === "Message-ID"
            )?.value || "";
            references = lastMessage.payload?.headers?.find((header) =>
                header.name === "References"
            )?.value || "";
        }
    }

    const emailContent = message
    const boundary = '-----' + Math.random().toString(36).slice(2);

    const paragraphs = emailContent.split("\n").map((
        p: string,
      ) => (p.trim() ? `<p>${p}</p>` : "<br>")).join("");
      console.log(paragraphs);
  
      const htmlContent = `<!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          p { margin: 0; line-height: 1.5; }
        </style>
      </head>
      <body>
        ${paragraphs}
      </body>
      </html>`;
  
      console.log("HTML", htmlContent);

    const rawMessage = [
        `To: ${coachEmail}`,
        `Subject: ${subject}`,
        "MIME-Version: 1.0",
        `In-Reply-To: ${inReplyTo}`,
        `References: ${references}`,
        `Content-Type: multipart/mixed; boundary="${boundary}"`,
        "",
        `--${boundary}`,
        "Content-Type: text/html; charset=utf-8",
        "",
        emailContent,
        `--${boundary}--`,
        "Content-Type: text/html; charset=utf-8",
        "",
        htmlContent, // HTML content
        `--${boundary}--`,
    ];

    // Encode the message in Base64 for Gmail API
    const encodedMessage = Buffer.from(rawMessage.join("\r\n"))
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, ""); // Remove any padding characters

    try {
        // Send the message using Gmail API, including the threadId
        const result = await gmail.users.messages.send({
            userId: "me",
            requestBody: {
                raw: encodedMessage,
                threadId: threadId || undefined, // Send as part of the existing thread if provided
            },
        });

        // Return the sent message details
        return NextResponse.json(
            { id: result.data.id },
            { status: 200, headers: corsHeaders }
        );
    } catch (error) {
        console.error("Error sending data:", error);
        return NextResponse.json(
            { error: 'Failed to send message' },
            { status: 500, headers: corsHeaders }
        );
    }
}
