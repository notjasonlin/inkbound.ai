import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Plan, plans } from '../app/dashboard/upgrade/constants';

export async function checkUserLimits(userId: string, limitType: 'school' | 'template' | 'aiCall') {
  const supabase = createClientComponentClient();
  
  // Fetch user's current subscription
  const { data: subscription } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (!subscription) {
    console.error('No subscription found for user');
    return false;
  }

  // Fetch current usage
  const { data: usage, error } = await supabase
    .from('user_usage')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error || !usage) {
    // Initialize usage if it doesn't exist
    await supabase.from('user_usage').insert({ 
      user_id: userId, 
      ai_calls_used: 0, 
      schools_sent: 0, 
      templates_used: 0 
    });
    return true;
  }

  // Check if it's time to reset monthly limits
  const lastReset = new Date(usage.last_reset);
  const now = new Date();
  if (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
    // Reset monthly limits
    await supabase.from('user_usage').update({
      ai_calls_used: 0,
      schools_sent: 0,
      last_reset: now.toISOString()
    }).eq('user_id', userId);
    
    // Update local usage object
    usage.ai_calls_used = 0;
    usage.schools_sent = 0;
  }

  switch (limitType) {
    case 'school':
      return usage.schools_sent < subscription.schools_sent_limit;
    case 'template':
      return usage.templates_used < subscription.template_limit;
    case 'aiCall':
      return usage.ai_calls_used < subscription.ai_call_limit;
  }
}

export async function incrementUsage(userId: string, limitType: 'school' | 'template' | 'aiCall') {
  const supabase = createClientComponentClient();
  
  const field = limitType === 'school' ? 'schools_sent' : 
                limitType === 'template' ? 'templates_used' : 'ai_calls_used';

  const { data, error } = await supabase
    .from('user_usage')
    .update({ [field]: supabase.rpc('increment', { row_id: userId, column_name: field }) })
    .eq('user_id', userId);

  if (error) {
    console.error('Error incrementing usage:', error);
  }
}

export async function getUserUsage(userId: string): Promise<{
  ai_calls_used: number;
  schools_sent: number;
  templates_used: number;
  ai_call_limit: number;
  schools_sent_limit: number;
  template_limit: number;
} | null> {
  const supabase = createClientComponentClient();

  const { data: usage, error: usageError } = await supabase
    .from('user_usage')
    .select('*')
    .eq('user_id', userId)
    .single();

  const { data: subscription, error: subscriptionError } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (usageError || subscriptionError) {
    console.error('Error fetching user usage or subscription:', usageError || subscriptionError);
    return null;
  }

  return {
    ai_calls_used: usage.ai_calls_used,
    schools_sent: usage.schools_sent,
    templates_used: usage.templates_used,
    ai_call_limit: subscription.ai_call_limit,
    schools_sent_limit: subscription.schools_sent_limit,
    template_limit: subscription.template_limit,
  };
}
