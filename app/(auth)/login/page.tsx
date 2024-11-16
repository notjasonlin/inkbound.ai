'use client';

import React from 'react'
import dynamic from 'next/dynamic'

const LoginForm = dynamic(() => import('./components/LoginForm'), {
  ssr: false,
  loading: () => <p>Loading...</p>
})

const LoginPage = () => {
  return (
    <div className="flex h-screen items-center justify-center bg-babyblue-600"> {/* Full screen height with centered items */}
      <LoginForm />
    </div>
  )
}

export default LoginPage
