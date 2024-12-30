import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import BackgroundEditor from './components/BackgroundEditor';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

export default async function BackgroundPage() {
  const supabase = createServerComponentClient({ cookies });
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    // Handle the case where the user is not logged in
    return <div>Please log in to access this page.</div>;
  }

  let { data: profile } = await supabase
    .from('player_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (!profile) {
    // Create a new profile if one doesn't exist
    const { data: newProfile, error } = await supabase
      .from('player_profiles')
      .insert({ user_id: user.id, stats: {}, profile_id:uuidv4() })
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
