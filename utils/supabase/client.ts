import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export async function getCoaches() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('coaches')
    .select('id, School, Name, Position, Email');

  if (error) throw error;
  return data;
}

export async function getUniqueSchools() {
  const coaches = await getCoaches();
  const uniqueSchools = [...new Set(coaches.map(coach => coach.School))];
  return uniqueSchools.sort();  // Sort schools alphabetically
}