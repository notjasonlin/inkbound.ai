"use client";
import { Button } from "@/components/ui/button"; // Your Button component
import { getGoogleSignInUrl } from "@/lib/auth-actions";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import Image from 'next/image';
import googleLogo from '@/public/google-logo-2.png'; // Assuming you have the Google logo in your public folder

const SignInWithGoogleButton = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      const url = await getGoogleSignInUrl(`${window.location.origin}/auth/callback`);
      window.location.href = url;
    } catch (error) {
      console.error('Error fetching data', error);
      router.push('/error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full py-3 px-6 bg-white border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-100 transition-all"
      onClick={handleSignIn}
      disabled={isLoading}
    >
      {isLoading ? (
        'Loading...'
      ) : (
        <div className="flex items-center justify-center space-x-2">
          {/* Google logo */}
          <Image src={googleLogo} alt="Google" width={20} height={20} className="mr-2" />
          <span className="text-gray-800 font-semibold">Continue with Google</span>
        </div>
      )}
    </Button>
  );
};

export default SignInWithGoogleButton;
