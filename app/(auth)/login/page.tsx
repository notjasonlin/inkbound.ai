import React from 'react'
import dynamic from 'next/dynamic'

const LoginForm = dynamic(() => import('./components/LoginForm'), {
  ssr: false,
  loading: () => <p>Loading...</p>
})

const LoginPage = () => {
  return (
    <div className="flex h-svh items-center">
      <LoginForm />
    </div>
  )
}

export default LoginPage