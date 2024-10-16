import { google } from "googleapis";
import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const supabase = createClient();

    console.log("1");
    // Get the current session
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    console.log("2");

    const accessToken = session.provider_token;

    if (!accessToken) {
        return new NextResponse("No access token available", { status: 401 });
    }

    console.log("3");

    // Parse the request body to get the coach's email and message
    const { coachEmail, message, threadId } = await request.json();

    console.log("4");

    if (!coachEmail || !message) {
        return new NextResponse("Coach email and message are required", {
            status: 400,
        });
    }

    // Create a new OAuth2Client using the access token
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });

    console.log("5");

    const gmail = google.gmail({ version: "v1", auth });

    console.log("6");

    // Construct the email in RFC 822 format (raw message)
    const rawMessage = `To: ${coachEmail}
    Subject: New Message
    ${message}`;

    console.log("7");

    // Base64 encode the message for Gmail's API
    const encodedMessage = Buffer.from(rawMessage)
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");

    console.log("8");

    try {
        // Send the message using Gmail API
        const result = await gmail.users.messages.send({
            userId: "me",
            requestBody: {
                raw: encodedMessage,
                threadId: threadId || undefined, // Send as part of the existing thread if provided
            },
        });

        console.log("9");


        // Return the sent message details
        return new NextResponse(JSON.stringify({ id: result.data.id }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });

    } catch (error) {
        console.error("Error sending email:", error);
        return new NextResponse("Failed to send message", { status: 500 });
    }
}
