"use client";
import { Button } from "@/components/ui/button";
import { getGoogleSignInUrl } from "@/lib/auth-actions";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

const SignInWithGoogleButton = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      const url = await getGoogleSignInUrl(`${window.location.origin}/auth/callback`);
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('No URL returned');
      }
    } catch (error) {
      console.error('Sign in error:', error);
      alert('Sign in failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      onClick={handleSignIn}
      disabled={isLoading}
    >
      {isLoading ? 'Loading...' : 'Login with Google'}
    </Button>
  );
};

export default SignInWithGoogleButton;
