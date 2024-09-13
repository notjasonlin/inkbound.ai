"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

const LoginButton = ({ label }: { label?: string }) => {
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
        router.push('/dashboard');
      }
    };
    fetchUser();
  }, [supabase.auth, router]);

  if (user) {
    return null; // No need for a login button if the user is already logged in
  }

  return (
    <button
      className="px-4 py-2 font-semibold text-white bg-babyblue-600 rounded-lg hover:bg-babyblue-700"
      onClick={() => {
        router.push("/login"); // Redirect to login page
      }}
    >
      {label ? label : "Login"}
    </button>
  );
};

export default LoginButton;
