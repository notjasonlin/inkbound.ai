import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import BackgroundEditor from './components/BackgroundEditor';
import { initialFormData } from './constants';

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
    try {
      const { data: newProfile, error: profileError } = await supabase
        .from('player_profiles')
        .insert({ 
          user_id: user.id, 
          stats: initialFormData,
          highlights: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (profileError) {
        console.error('Error creating profile:', profileError);
        return <div>Error creating profile in database. Please try again.</div>;
      }
      
      profile = newProfile;
    } catch (error) {
      console.error('Unexpected error during profile creation:', error);
      return <div>An unexpected error occurred. Please try again.</div>;
    }
  }

  return <BackgroundEditor profile={profile} userId={user.id} />;
}
