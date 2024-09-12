"use client";
import { Button } from "@/components/ui/button";
import { getGoogleSignInUrl } from "@/lib/auth-actions";
import { useRouter } from "next/navigation";
import React from "react";

const SignInWithGoogleButton = () => {
  const router = useRouter();

  const handleSignIn = async () => {
    try {
      const url = await getGoogleSignInUrl(`${window.location.origin}/auth/callback`);
      router.push(url);
    } catch (error) {
      console.error('Sign in error:', error);
      alert('Sign in failed. Please try again.');
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      onClick={handleSignIn}
    >
      Login with Google
    </Button>
  );
};

export default SignInWithGoogleButton;
