import { google } from "googleapis";
import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const supabase = createClient();

    // Get the current session
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const accessToken = session.provider_token;

    if (!accessToken) {
        return new NextResponse("No access token available", { status: 401 });
    }

    // Parse the request body to get the coach's email, message, and threadId
    const { coachEmail, message, threadId } = await request.json();

    if (!coachEmail || !message) {
        return new NextResponse("Coach email and message are required", {
            status: 400,
        });
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


    const rawMessage = [
        `To: ${coachEmail}`, // Recipient's email
        `Subject: ${subject}`, // Subject with school name
        "MIME-Version: 1.0", // MIME version
        `In-Reply-To: ${inReplyTo}`, // In-Reply-To header to link to the thread
        `References: ${references}`, // References header for linking the thread
        `Content-Type: multipart/mixed; boundary="${boundary}"`, // Boundary for multipart email
        "", // Blank line separating headers from body
        `--${boundary}`, // Start of the first part (text content)
        "Content-Type: text/html; charset=utf-8", // Content-Type header for HTML email
        "", // Blank line before the actual content
        emailContent, // HTML content of the email
        `--${boundary}--`, // End of the multipart message
    ];

    // Encode the message in Base64 for Gmail API
    const encodedMessage = Buffer.from(rawMessage.join("\n"))
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
        return new NextResponse(JSON.stringify({ id: result.data.id }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Error sending data:", error);
        return new NextResponse("Failed to send message", { status: 500 });
    }
}
