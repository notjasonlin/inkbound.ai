import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getCorsHeaders, handleOptions } from '@/utils/api-headers';

export const OPTIONS = handleOptions;

export async function GET(request: Request) {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json(
      { error: 'Unauthorized' }, 
      { status: 401, headers: getCorsHeaders(request) }
    );
  }

  const { data: templates, error } = await supabase
    .from('templates')
    .select('*')
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json(
      { error: 'Failed to fetch templates' }, 
      { status: 500, headers: getCorsHeaders(request) }
    );
  }

  return NextResponse.json(templates, { headers: getCorsHeaders(request) });
}
