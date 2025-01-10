'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function AuthCallbackPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const handleAuthCallback = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) {
        console.error('Error fetching data', error)
        router.push('/error')
      } else if (session?.user) {
        try {
          // Check if profile exists
          const { data: existingProfile } = await supabase
            .from('player_profiles')
            .select('id')
            .eq('user_id', session.user.id)
            .single();

          // Create profile if it doesn't exist
          if (!existingProfile) {
            await supabase
              .from('player_profiles')
              .insert([{ 
                user_id: session.user.id,
                stats: {},
                highlights: [],
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }]);
          }

          // Add to SendGrid contact list
          await fetch('/api/sendgrid/addToContact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: session.user.email,
              firstName: session.user.user_metadata?.first_name || ''
            })
          })
        } catch (err) {
          console.error('Error in auth callback:', err)
        }
        router.push('/')
      }
    }

    handleAuthCallback()
  }, [router, supabase])

  return <div>Loading...</div>
}
