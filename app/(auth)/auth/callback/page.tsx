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
      } else {
        try {
          await fetch('/api/sendgrid/addToContact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: session?.user?.email,
              firstName: session?.user?.user_metadata?.first_name || ''
            })
          })
        } catch (err) {
          console.error('Failed to add user to mailing list:', err)
        }
        router.push('/')
      }
    }

    handleAuthCallback()
  }, [router, supabase])

  return <div>Loading...</div>
}
