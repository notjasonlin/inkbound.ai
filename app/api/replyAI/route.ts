import OpenAI from "openai";
import { NextResponse } from "next/server";
import { getCorsHeaders, handleOptions } from "@/utils/api-headers";

export const OPTIONS = handleOptions;

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
    if (!openai.apiKey) {
        return NextResponse.json(
            { error: "OpenAI API key not configured" },
            { status: 500, headers: getCorsHeaders(req) },
        );
    }

    try {
        const {
            coach_email,
            classification,
            action_item,
            example_email,
            user_email,
        } = await req.json();
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content:
                        "You are an AI assistant helping a high school athlete determine how to respond to a college coach's email. You will be sent the coach's email",
                },
                {
                    role: "user",
                    content:
                        `I just received this email from a coach: \n${coach_email}\n
                        The coach's response seems ${classification}. I need to do the following: ${action_item}\n
                        This is an example of how I should respond to a coach email like the one above: \n${example_email}\n
                        Based on the information I gave you, can you help me draft a response to this coach? Only send the draft and nothing else`,
                },
            ],
        });

        // WIP
        // content:
        //                 `I just received this email from a coach: \n${coach_email}\n
        //                 This coach's email is in response to this email that I sent: \n${user_email}\n
        //                 The coach's response seems ${classification}. I need to do the following: ${action_item}\n
        //                 This is an example of how I should respond to a coach email like the one above: \n${example_email}\n
        //                 In the style of my writing and based on the information I gave you, can you help me draft a response to this coach?`,

        return NextResponse.json(
            { content: completion.choices[0].message.content },
            { headers: getCorsHeaders(req) },
        );
    } catch (error: any) {
        if (error.response) {
            console.error(error.response.status, error.response.data);
            return NextResponse.json(
                error.response.data,
                { status: error.response.status, headers: getCorsHeaders(req) },
            );
        } else {
            console.error(`Error fetching data: ${error.message}`);
            return NextResponse.json(
                { error: "An error occurred during your request." },
                { status: 500, headers: getCorsHeaders(req) },
            );
        }
    }
}
