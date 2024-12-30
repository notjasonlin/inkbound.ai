import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(req: Request) {
  
  try {
    const { schoolId, userId } = await req.json();
    
    // Create supabase client with properly awaited cookies
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set({ name, value: '', ...options });
          },
        },
      }
    );

    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from('player_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (profileError) {
      console.error('Error:', profileError);
      throw profileError;
    }

    // Fetch school information
    const { data: schoolBio, error: schoolError } = await supabase
      .from('school_bio')
      .select('*')
      .eq('school_id', schoolId)
      .single();

    if (schoolError) {
      console.error('Error:', schoolError);
      throw schoolError;
    }

    const prompt = `Generate a 2-3 line personalized message for a college coach showing genuine interest in their program. 
    Do not include any greeting or closing - only generate the personalized part.
    Student profile: ${JSON.stringify(profile)}
    School information: ${JSON.stringify(schoolBio)}
    
    Focus on matching the student's interests with specific school attributes. Keep it concise and authentic.`;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-3.5-turbo",
    });

    const generatedMessage = completion.choices[0].message.content;

    return NextResponse.json({ generatedMessage });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to generate data' }, { status: 500 });
  }
}