'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import { getGoogleSignInUrl } from "@/lib/auth-actions";
import { useRouter } from "next/navigation";
import Image from 'next/image';
import googleLogo from '@/public/google-logo-2.png';

const LoginForm = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);

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
    <div className="text-center">
      {/* Heading */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Welcome to Inkbound.ai</h1>
        <p className="text-gray-600 text-lg">AI College Athletic Recruitment Coach</p>
      </div>

      {/* Sign-In Button */}
      <div className="mb-8">
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
      </div>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative text-center">
          <span className="bg-white px-2 text-sm text-gray-500">or</span>
        </div>
      </div>

      {/* Terms and Privacy */}
      <div className="text-sm text-gray-500">
        By signing up, you agree to our{' '}
        <a
          href="policy/terms-and-conditions"
          className="text-blue-600 hover:underline"
        >
          Terms and Conditions
        </a>{' '}
        and{' '}
        <a
          href="policy/privacy"
          className="text-blue-600 hover:underline"
        >
          Privacy Policy
        </a>.
      </div>
    </div>
  );
};

export default LoginForm;
