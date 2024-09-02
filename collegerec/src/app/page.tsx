"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkLoginStatus = () => {
      const isLoggedIn = document.cookie.includes('isLoggedIn=true');
      console.log('Cookies on landing page:', document.cookie); // Add this line
      console.log('Is logged in:', isLoggedIn); // Add this line
      if (isLoggedIn) {
        router.push('/dashboard');
      } else {
        setIsLoading(false);
      }
    };

    checkLoginStatus();
  }, [router]);

  const handleLogin = () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const redirectUri = `${window.location.origin}/auth/callback`;
    const scope = 'email profile https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send';
    
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&response_type=token` +
      `&scope=${encodeURIComponent(scope)}`;

    window.location.href = authUrl;
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <h1 className="text-6xl font-bold">
          Welcome to <span className="text-blue-600">Commit</span>
        </h1>

        <p className="mt-3 text-2xl">
          Get started by logging in
        </p>

        <div className="flex mt-6 space-x-4">
          <button
            onClick={handleLogin}
            className="px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700"
          >
            Log In with Google
          </button>
        </div>
      </main>
    </div>
  );
}