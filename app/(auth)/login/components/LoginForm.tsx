'use client'

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Shrikhand } from 'next/font/google';

const shrikhand = Shrikhand({
  subsets: ['latin'],
  weight: '400',
});

const SignInWithGoogleButton = dynamic(() => import('./SignInWithGoogleButton'), {
  ssr: false,
  loading: () => <p>Loading...</p>,
});

export function LoginForm() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <p>Loading...</p>; // or any loading indicator
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      {/* Heading Section with Shrikhand Font */}
      <div className="text-center mb-8">
        <h1 className={`text-4xl font-bold text-white mb-4 ${shrikhand.className}`}>
          Welcome to Inkbound.ai!
        </h1>
        <p className="text-lg text-gray-200">AI College Athletic Recruitment Coach</p>
      </div>

      {/* Floating Card Section */}
      <div className="text-center mb-6">
        <SignInWithGoogleButton /> {/* Updated button with Google logo */}
      </div>

      {/* Terms and Privacy Links */}
      <div className="text-center mt-6">
        <p className="text-sm text-gray-500">
          By signing up, you agree to the{' '}
          <a href="policy/terms-and-conditions" className="text-blue-600 hover:underline">
            Terms and Conditions
          </a>{' '}
          and{' '}
          <a href="policy/privacy" className="text-blue-600 hover:underline">
            Privacy Policy
          </a>.
        </p>
      </div>
    </div>
  );
}

export default LoginForm;
