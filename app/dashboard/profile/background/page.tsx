import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import BackgroundEditor from './components/BackgroundEditor';

export const dynamic = 'force-dynamic';

export default async function BackgroundPage() {
  const supabase = createServerComponentClient({ cookies });
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return <div>Please log in to access this page.</div>;
  }

  let { data: profile } = await supabase
    .from('player_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (!profile) {
    const { data: newProfile, error } = await supabase
      .from('player_profiles')
      .insert({ 
        user_id: user.id, 
        stats: {},
        highlights: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating data:', error);
      return <div>Error creating profile. Please try again.</div>;
    }
    
    profile = newProfile;
  }

  return <BackgroundEditor profile={profile} userId={user.id} />;
}
