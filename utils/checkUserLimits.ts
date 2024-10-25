import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Plan, plans } from '../app/dashboard/upgrade/constants';

export async function checkUserLimits(userId: string, action: 'template' | 'school' | 'aiCall'): Promise<boolean> {
  const supabase = createClientComponentClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error('Authentication error:', authError);
    return false;
  }

  const { data: subscription, error: subscriptionError } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (subscriptionError) {
    console.error('Error fetching subscription:', subscriptionError);
    return false;
  }

  const { data: usage, error: usageError } = await supabase
    .from('user_usage')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (usageError && usageError.code !== 'PGRST116') {
    console.error('Error fetching usage:', usageError);
    return false;
  }

  if (!usage) {
    const { error: insertError } = await supabase.from('user_usage').insert({ 
      user_id: userId, 
      ai_calls_used: 0, 
      schools_sent: 0, 
      templates_used: 0 
    });

    if (insertError) {
      console.error('Error initializing usage:', insertError);
      return false;
    }

    return true;
  }

  switch (action) {
    case 'school':
      return usage.schools_sent < subscription.schools_sent_limit;
    case 'template':
      return usage.templates_used < subscription.template_limit;
    case 'aiCall':
      return usage.ai_calls_used < subscription.ai_call_limit;
    default:
      return false;
  }
}

export async function incrementUsage(userId: string, usage: { [key: string]: number }) {
  const supabase = createClientComponentClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error('Authentication error:', authError);
    return;
  }

  const { error } = await supabase
    .from('user_usage')
    .update(usage)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error incrementing usage:', error);
  }
}

export async function getUserUsage() {
  const supabase = createClientComponentClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error('Authentication error:', authError);
    return null;
  }

  const { data: subscription, error: subscriptionError } = await supabase
    .from('user_subscriptions')
    .select('ai_call_limit, schools_sent_limit, template_limit')
    .eq('user_id', user.id)
    .single();

  if (subscriptionError) {
    console.error('Error fetching user subscription:', subscriptionError);
    return null;
  }

  const { data: usage, error: usageError } = await supabase
    .from('user_usage')
    .select('ai_calls_used, schools_sent, templates_used')
    .eq('user_id', user.id)
    .single();

  if (usageError) {
    console.error('Error fetching user usage:', usageError);
    return null;
  }

  if (!usage) {
    const { data: newUsage, error: insertError } = await supabase
      .from('user_usage')
      .insert({ user_id: user.id, ai_calls_used: 0, schools_sent: 0, templates_used: 0 })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating user usage record:', insertError);
      return null;
    }
    return { ...newUsage, ...subscription };
  }

  return { ...usage, ...subscription };
}
