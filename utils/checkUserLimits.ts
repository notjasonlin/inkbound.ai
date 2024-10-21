// app/utils/checkUserLimits.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Plan, plans } from '../app/dashboard/upgrade/constants';

export async function checkUserLimits(userId: string, limitType: 'school' | 'template' | 'aiCall') {
  const supabase = createClientComponentClient();
  
  // Fetch user's current subscription
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('plan_id')
    .eq('user_id', userId)
    .single();

  // Get the user's plan
  const userPlan = plans.find(plan => plan.id === subscription?.plan_id) || plans[0]; // Default to basic plan

  // Fetch current usage
  const { data: usage } = await supabase
    .from('user_usage')
    .select('schools_used, templates_used, ai_calls_used')
    .eq('user_id', userId)
    .single();

  if (!usage) {
    // Initialize usage if it doesn't exist
    await supabase.from('user_usage').insert({ user_id: userId, schools_used: 0, templates_used: 0, ai_calls_used: 0 });
    return true;
  }

  switch (limitType) {
    case 'school':
      return usage.schools_used < userPlan.schoolLimit;
    case 'template':
      return usage.templates_used < userPlan.templateLimit;
    case 'aiCall':
      return usage.ai_calls_used < userPlan.aiCallLimit;
  }
}

export async function incrementUsage(userId: string, limitType: 'school' | 'template' | 'aiCall') {
  const supabase = createClientComponentClient();
  
  const field = limitType === 'school' ? 'schools_used' : 
                limitType === 'template' ? 'templates_used' : 'ai_calls_used';

  await supabase.rpc('increment_usage', { user_id: userId, field_name: field });
}
