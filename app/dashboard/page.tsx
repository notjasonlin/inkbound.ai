"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

import OnboardingModal from "@/components/OnboardingModal";
import ProfileWidget from "./components/ProfileWidget";
import FavoriteSchoolsWidget from "./components/FavoriteSchoolsWidget";
import CollegeSoccerInbox from "./components/CollegeSoccerInboxWidget";
import RandomFactsWidget from "./components/RandomFactsWidget";

export default function Dashboard() {
  const supabase = createClientComponentClient();

  const [userName, setUserName] = useState("Loading...");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [userStats, setUserStats] = useState({
    totalSchools: "0",
    profileCompletion: "0",
  });

  useEffect(() => {
    (async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (!error && user) {
        setUserName(user.user_metadata?.full_name ?? "User");
        const { data: favData, error: favError } = await supabase
          .from("favorite_schools")
          .select("data")
          .eq("uuid", user.id)
          .single();

        let totalSchoolsCount = 0;
        if (!favError && favData?.data) {
          totalSchoolsCount = Array.isArray(favData.data)
            ? favData.data.length
            : 0;
        }

        // 3) Fetch stats from player_profiles
        //    "user_id" must match user.id
        const { data: profileData, error: profileError } = await supabase
          .from("player_profiles")
          .select("stats")
          .eq("user_id", user.id)
          .single(); // assume one row per user

        let computedCompletion = 0;
        if (!profileError && profileData?.stats) {
          // If `stats` is an object with X keys, then your formula is (X ÷ 8) * 100
          const statsObj = profileData.stats;
          const statsKeyCount = Object.keys(statsObj).length;
          computedCompletion = Math.floor((statsKeyCount / 8) * 100);
        }

        // 4) Update userStats state
        setUserStats({
          totalSchools: totalSchoolsCount.toString(),
          profileCompletion: computedCompletion.toString(),
        });
      }

      // Onboarding check
      const isFirstVisit = !localStorage.getItem("onboardingCompleted");
      setShowOnboarding(isFirstVisit);
    })();
  }, [supabase]);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    localStorage.setItem("onboardingCompleted", "true");
  };

  const restartOnboarding = () => setShowOnboarding(true);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-700">
      {/* Onboarding Modal */}
      <OnboardingModal
        isOpen={showOnboarding}
        onClose={handleOnboardingComplete}
      />

      {/* TOP NAVBAR */}
      <header className="flex items-center justify-between bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
        <div className="flex items-center space-x-3">
          {/* Hamburger (mobile) */}
          <button
            className="md:hidden p-2 rounded-md hover:bg-gray-100 transition"
            onClick={toggleSidebar}
          >
            <svg
              className="h-6 w-6 text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isSidebarOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>

          <h1 className="text-xl md:text-2xl font-bold tracking-wide text-gray-800">
            My Recruiting Dashboard
          </h1>
        </div>
        <button
          onClick={restartOnboarding}
          className="hidden md:block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition"
        >
          Restart Onboarding
        </button>
      </header>

      {/* LAYOUT WRAPPER */}
      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR - Animated for mobile */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.aside
              key="sidebar"
              className="
                fixed
                top-0
                left-0
                z-40
                h-full
                w-64
                bg-white
                border-r
                border-gray-200
                shadow-lg
                flex
                flex-col
                p-4
                md:hidden
              "
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3 }}
            >
              <button
                onClick={toggleSidebar}
                className="flex items-center mb-4 text-gray-600 hover:text-gray-800"
              >
                <svg
                  className="h-6 w-6 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                Close
              </button>

              <button
                onClick={() => {
                  toggleSidebar();
                  restartOnboarding();
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
              >
                Restart Onboarding
              </button>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {/* 
            4-column responsive grid:
            - On mobile (<=768px): single column
            - On md+ (>=768px): 4 columns
              [1 column for profile/favorites | 2 columns for inbox | 1 column for random facts]
          */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* LEFT COLUMN: Profile + Favorites */}
            <motion.div
              layout
              transition={{ type: "spring", stiffness: 90, damping: 15 }}
              className="space-y-6 md:col-span-1"
            >
              {/* Profile Widget: now receives real stats from DB */}
              <motion.div
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white border border-gray-200 rounded-lg shadow-sm p-4"
              >
                <ProfileWidget userName={userName} stats={userStats} />
              </motion.div>

              {/* FavoriteSchoolsWidget remains the same */}
              <motion.div
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-white border border-gray-200 rounded-lg shadow-sm p-4"
              >
                <FavoriteSchoolsWidget />
              </motion.div>
            </motion.div>

            {/* MIDDLE COLUMN: 2 columns wide -> Inbox */}
            <motion.div
              layout
              transition={{ type: "spring", stiffness: 90, damping: 15 }}
              className="space-y-6 md:col-span-2"
            >
              <motion.div
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white border border-gray-200 rounded-lg shadow-sm p-4"
              >
                <CollegeSoccerInbox />
              </motion.div>
            </motion.div>

            {/* RIGHT COLUMN: Random Facts */}
            <motion.div
              layout
              transition={{ type: "spring", stiffness: 90, damping: 15 }}
              className="space-y-6 md:col-span-1"
            >
              <motion.div
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-white border border-gray-200 rounded-lg shadow-sm p-4"
              >
                <RandomFactsWidget />
              </motion.div>
            </motion.div>
          </div>
        </main>
      </div>

      {/* FOOTER */}
      <footer className="bg-white border-t border-gray-200 py-3 text-center hidden md:block">
        <p className="text-xs text-gray-400">
          &copy; {new Date().getFullYear()} My Company. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
