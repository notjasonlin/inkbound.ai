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
    .from('coachinformation')
    .select('*');
  
  if (error) {
    console.error('Error fetching coaches:', error);
    return [];
  }
  
  return data || [];
}

export async function getUniqueSchools() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('coachinformation')
    .select('school, state, division')
    .order('school');
  
  if (error) {
    console.error('Error fetching schools:', error);
    return [];
  }
  
  // Filter unique schools and keep additional information
  const uniqueSchools = Array.from(new Set(data.map(item => JSON.stringify(item))))
    .map(item => JSON.parse(item));
  
  return uniqueSchools;
}