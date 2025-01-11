import { SupabaseClient } from '@supabase/supabase-js';

// Add this helper function to get next Sunday
function getNextSunday(): Date {
  const now = new Date();
  const today = now.getDay(); // 0 is Sunday, 1 is Monday, etc.
  const daysUntilSunday = 7 - today;
  const nextSunday = new Date(now);
  nextSunday.setDate(now.getDate() + daysUntilSunday);
  nextSunday.setHours(0, 0, 0, 0);
  return nextSunday;
}

export async function fetchOrCreateUserCredits(supabase: SupabaseClient, userId: string): Promise<number> {
  try {
    // First, try to get the user's credits
    let { data: credits, error } = await supabase.rpc('get_user_credits', { input_user_id: userId });

    if (error) throw error;

    // If credits are null or 0, create initial credits
    if (credits === null || credits === 0) {
      const { error: createError } = await supabase.rpc('create_user_credits', { input_user_id: userId });
      if (createError) throw createError;

      // Fetch the credits again after creating
      const { data: newCredits, error: fetchError } = await supabase.rpc('get_user_credits', { input_user_id: userId });
      if (fetchError) throw fetchError;

      credits = newCredits;
    }

    return credits || 0;
  } catch (error) {
    console.error('Error fetching data', error);
    return 0;
  }
}

export async function fetchUserSubscription(supabase: SupabaseClient, userId: string): Promise<any> {
  try {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error fetching data', error);
    return null;
  }
}

export async function fetchUserUsage(supabase: SupabaseClient, userId: string): Promise<any> {
  try {
    let { data, error } = await supabase
      .from('user_usage')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      // User doesn't have a record, create one with default values
      const { data: newData, error: insertError } = await supabase
        .from('user_usage')
        .insert({ 
          user_id: userId,
          ai_calls_used: 0,
          schools_sent: 0,
          templates_used: 0,
          reset_day: getNextSunday().toISOString()
        })
        .select()
        .single();

      if (insertError) throw insertError;
      data = newData;
    }

    return data;
  } catch (error) {
    console.error('Error fetching data', error);
    return null;
  }
}

export function shouldResetUsage(resetDay: string): boolean {
  const now = new Date();
  const resetDate = new Date(resetDay);
  return now >= resetDate;
}
