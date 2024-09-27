import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
  const supabase = createClient();
  const { schoolId, to, subject, content } = await request.json();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { data, error } = await supabase
      .from('email_queue')
      .insert({
        user_id: user.id,
        school_id: schoolId,
        recipient: to,
        email_subject: subject,
        email_content: content,
        status: 'pending'
      });

    if (error) throw error;

    return NextResponse.json({ message: 'Email queued successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error queueing email:', error);
    return NextResponse.json({ error: 'Failed to queue email' }, { status: 500 });
  }
}
