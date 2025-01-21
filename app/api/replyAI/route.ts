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
            genuine_score,
            category,
            example_email,
            user_email,
        } = await req.json();

        const coachContent = `I just received this email from a coach: \n${coach_email}\n`;
        const classificationContent =  `The coach's response seems ${genuine_score}% genuine or ${classification}. What the coach is looking for seems to fall in the category of ${category}\n`;
        const userContent = `This is how I started the conversation: \n${user_email}\n`;
        const exampleContent = (example_email !== "") ? `This is an example of how I should respond to a coach email like the one above: \n${example_email}\n` : "";
        const closingContent = `In the style of my writing, can you help me draft a response to this coach?\n(Only send the body of the email and nothing else. Do not send "Dear coach" or a sign-off. Include newline characters only where you see fit)`;

        const prompt = coachContent + classificationContent + userContent + exampleContent + closingContent;
        console.log(prompt);
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
                    content: prompt,
                },
            ],
        });

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
