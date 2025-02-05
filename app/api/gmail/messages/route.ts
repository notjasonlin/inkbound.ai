import { google } from "googleapis";
import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { gmail_v1 } from "googleapis";
import { getCorsHeaders, handleOptions } from "@/utils/api-headers";

export const OPTIONS = handleOptions;

export async function POST(request: Request) {
  const supabase = await createClient();

  // Get the current session
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401, headers: getCorsHeaders(request) },
    );
  }

  const accessToken = session.provider_token;

  if (!accessToken) {
    return NextResponse.json(
      { error: "No access token available" },
      { status: 401, headers: getCorsHeaders(request) },
    );
  }

  // Parse the request body to get the coach's email
  const { coachEmail } = await request.json();

  if (!coachEmail) {
    return NextResponse.json(
      { error: "Coach email is required" },
      { status: 400, headers: getCorsHeaders(request) },
    );
  }

  // Create a new OAuth2Client using the access token
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });

  const gmail = google.gmail({ version: "v1", auth });

  // Modify the query to include both emails sent to and from the coach
  const query = `to:${coachEmail} OR from:${coachEmail}`;

  try {
    const response = await gmail.users.messages.list({
      userId: "me",
      q: query,
    });

    console.log(response.data.messages);

    const decodeBase64Url = (
      data: any[] | undefined,
      to: string,
      from: string,
    ) => {
      if (!data) return null;
      const decodedParts = data.map((datum) => {
        const base64 = datum.body.data.replace(/-/g, "+").replace(/_/g, "/");
        let decoded = atob(base64);
        let toSliceIdx = -1;
        let fromSliceIdx = -1;
        let coachSliceIdx = decoded.indexOf("<" + coachEmail + "> wrote:");

        if (to.includes(coachEmail)) {
          to.replace("<" + coachEmail + ">", "").trim();
          toSliceIdx = decoded.indexOf(to + " <" + coachEmail + "> wrote:");
        } else {
          toSliceIdx = decoded.indexOf("<" + to + "> wrote:");
        }

        if (from.includes(coachEmail)) {
          from = from.replace("<" + coachEmail + ">", "").trim();
          fromSliceIdx = decoded.indexOf(from + " <" + coachEmail + "> wrote:");
        } else {
          fromSliceIdx = decoded.indexOf("<" + from + "> wrote:");
        }

        const maxIdx = Math.max(
          Math.max(toSliceIdx, fromSliceIdx),
          coachSliceIdx,
        );

        if (toSliceIdx === -1) toSliceIdx = maxIdx;
        if (fromSliceIdx === -1) fromSliceIdx = maxIdx;
        if (coachSliceIdx === -1) coachSliceIdx = maxIdx;

        if (toSliceIdx >= 0 && fromSliceIdx && coachSliceIdx >= 0) {
          decoded = decoded.substring(
            0,
            Math.min(Math.min(toSliceIdx, fromSliceIdx), coachSliceIdx),
          );
        }

        decoded = decoded.replace(
          /On\s+\w{3},\s+\w{3}\s+\d{1,2},\s+\d{4}\s+at\s+\d{1,2}:\d{2}[\s\wâ¯]*[APM]{2}/g,
          "",
        );

        return decoded.trim();
      });
      return decodedParts;
    };

    // let userEmail: string | null = null;
    const fullEmails = await Promise.all(
      (response.data.messages ?? []).map(
        async (message: gmail_v1.Schema$Message) => {
          if (message.id) {
            const emailResponse = await gmail.users.messages.get({
              userId: "me",
              id: message.id,
              format: "full",
            });
            const emailData = emailResponse.data;

            const from = emailData.payload?.headers?.find((
              h: gmail_v1.Schema$MessagePartHeader,
            ) => h.name === "From")?.value || "No Subject";

            const to = emailData.payload?.headers?.find((
              h: gmail_v1.Schema$MessagePartHeader,
            ) => h.name === "To")?.value || "No Subject";

            const parts = decodeBase64Url(emailData.payload?.parts, to, from);
            
            return {
              id: emailData.id,
              subject: emailData.payload?.headers?.find((
                h: gmail_v1.Schema$MessagePartHeader,
              ) => h.name === "Subject")?.value || "No Subject",
              from: emailData.payload?.headers?.find((
                h: gmail_v1.Schema$MessagePartHeader,
              ) => h.name === "From")?.value || "Unknown",
              date: emailData.payload?.headers?.find((
                h: gmail_v1.Schema$MessagePartHeader,
              ) => h.name === "Date")?.value || "Unknown",
              snippet: emailData.snippet || "No preview available",
              content: parts ? parts[0] : "No content available",
            };
          }
        },
      ),
    );

    return NextResponse.json(
      { messages: fullEmails },
      { headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json(
      { error: "Error fetching data" },
      { status: 500, headers: getCorsHeaders(request) },
    );
  }
}
