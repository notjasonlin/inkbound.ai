import OpenAI from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  if (!openai.apiKey) {
    return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
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

    return NextResponse.json({ content: completion.choices[0].message.content });
  } catch (error: any) {
    if (error.response) {
      console.error(error.response.status, error.response.data);
      return NextResponse.json(error.response.data, { status: error.response.status });
    } else {
      console.error(`Error fetching data: ${error.message}`);
      return NextResponse.json({ error: 'An error occurred during your request.' }, { status: 500 });
    }
  }
}
