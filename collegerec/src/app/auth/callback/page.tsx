"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const hash = window.location.hash;
    console.log('Auth callback - hash:', hash);
    
    if (hash.startsWith('#access_token=')) {
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get('access_token');

      if (accessToken) {
        console.log('Auth callback - access token found');
        fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
          .then((response) => response.json())
          .then((data) => {
            console.log('Auth callback - user data received:', data);
            // Store user data in localStorage
            localStorage.setItem('user', JSON.stringify(data));
            localStorage.setItem('access_token', accessToken);
            console.log('Access token stored:', accessToken);
            // Set a cookie to indicate the user is logged in
            document.cookie = 'isLoggedIn=true; path=/; max-age=2592000'; // 30 days
            console.log('Auth callback - Cookies after login:', document.cookie);
            
            // Add a small delay to ensure the cookie is set before redirecting
            setTimeout(() => {
              router.push('/dashboard');
            }, 100);
          })
          .catch((error) => {
            console.error('Error fetching user data:', error);
            router.push('/');
          });
      } else {
        console.error('No access token found');
        router.push('/');
      }
    } else {
      console.error('Invalid callback URL');
      router.push('/');
    }
  }, [router]);

  return <div>Processing authentication...</div>;
}
