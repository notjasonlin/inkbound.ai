'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function AuthCallbackPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const handleAuthCallback = async () => {
      const { error } = await supabase.auth.getSession()
      if (error) {
        console.error('Error fetching data', error)
        router.push('/error')
      } else {
        router.push('/')
      }
    }

    handleAuthCallback()
  }, [router, supabase])

  return <div>Loading...</div>
}
