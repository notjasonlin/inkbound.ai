"use client";
import { createClient } from "@/utils/supabase/client";
import React, { useEffect, useState } from "react";

const UserGreetText = () => {
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();
  
  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();
  }, []);

  const baseClassName = "fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30";

  if (user !== null) {
    return (
      <div className={baseClassName}>
        <p className="text-center">
          Welcome to your athletic journey,&nbsp;
          <span className="font-mono font-bold">{user.user_metadata.full_name ?? "Future Champion"}!</span>
        </p>
      </div>
    );
  }

  return (
    <div className={baseClassName}>
      <p className="text-center">
        Welcome, Future College Athlete!
        <br />
        <span className="text-sm">Sign in to begin your journey to greatness.</span>
      </p>
    </div>
  );
};

export default UserGreetText;