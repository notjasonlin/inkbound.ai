'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import dynamic from 'next/dynamic'

const SignInWithGoogleButton = dynamic(() => import("./SignInWithGoogleButton"), {
  ssr: false,
  loading: () => <p>Loading...</p>
})

export function LoginForm() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return <p>Loading...</p> // or any loading indicator
  }

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Sign In</CardTitle>
        <CardDescription>
          Use your Google account to sign in
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <SignInWithGoogleButton />
        </div>
      </CardContent>
    </Card>
  )
}

export default LoginForm
