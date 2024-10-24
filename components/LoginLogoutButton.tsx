"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

interface LoginButtonProps {
  label?: string;
  className?: string; // Accept className prop for custom styling
}

const LoginButton: React.FC<LoginButtonProps> = ({ label, className }) => {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      // Redirect to dashboard if user is logged in
      if (user) {
        router.push("/dashboard");
      }
    };
    fetchUser();
  }, [supabase.auth, router]);

  if (user) {
    return null; // No need for a login button if the user is already logged in
  }

  return (
    <button
      className={`px-6 py-2 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 hover:text-white whitespace-nowrap transition-colors duration-300 ${className}`} // Use className prop if passed
      onClick={() => {
        router.push("/login"); // Redirect to login page
      }}
    >
      {label ? label : "Login"}
    </button>
  );
};

export default LoginButton;
