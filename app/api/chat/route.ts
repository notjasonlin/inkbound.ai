import OpenAI from 'openai';
import { NextResponse } from 'next/server';

// API response headers for security and caching
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Cache-Control': 'no-store, no-cache, must-revalidate',
};

// OPTIONS handler for CORS preflight requests
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  if (!openai.apiKey) {
    return NextResponse.json(
      { error: 'OpenAI API key not configured' },
      { status: 500, headers: corsHeaders }
    );
  }

  try {
    const { prompt, placeholders } = await req.json();

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are an AI assistant helping with college recruitment letters. Use the provided placeholders where appropriate." },
        { role: "user", content: `Placeholders: ${JSON.stringify(placeholders)}. Prompt: ${prompt}` }
      ],
    });

    return NextResponse.json(
      { content: completion.choices[0].message.content },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    if (error.response) {
      console.error(error.response.status, error.response.data);
      return NextResponse.json(
        error.response.data,
        { status: error.response.status, headers: corsHeaders }
      );
    } else {
      console.error(`Error fetching data: ${error.message}`);
      return NextResponse.json(
        { error: 'An error occurred during your request.' },
        { status: 500, headers: corsHeaders }
      );
    }
  }
}
