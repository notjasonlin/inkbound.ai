import { SupabaseClient } from '@supabase/supabase-js';

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
    console.error('Error fetching or creating user credits:', error);
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
    console.error('Error fetching user subscription:', error);
    return null;
  }
}
