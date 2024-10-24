'use client';

import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import ProfileWidget from './components/ProfileWidget'; // Profile Widget Component
import FavoriteSchoolsWidget from './components/FavoriteSchoolsWidget'; // Favorite Schools Widget Component
import CollegeSoccerInbox from './components/CollegeSoccerInboxWidget'; // College Soccer Inbox Widget
import RandomFactsWidget from './components/RandomFactsWidget'; // Random Facts Widget

// Main Dashboard Component
export default function Dashboard() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const supabase = createClientComponentClient(); // Initialize Supabase client

  // Fetch the user's email and name on component mount
  useEffect(() => {
    const fetchUserInfo = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Error fetching user:', error.message);
      } else if (user) {
        setUserEmail(user.email || null);
        setUserName(user.user_metadata?.full_name || 'User'); // Assuming 'full_name' is stored in user_metadata
      }
    };

    fetchUserInfo();
  }, [supabase]);

  const userStats = {
    totalSchools: '8',
    emailsSent: '0',
    profileCompletion: '100',
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Main Content Area */}
      <div className="flex-1 grid grid-cols-4 gap-6 p-6">
        {/* Profile Widget - Top Left */}
        <div className="col-span-1 flex flex-col space-y-4">
          <ProfileWidget userName={userName || 'Loading...'} stats={userStats} />
          <FavoriteSchoolsWidget />
        </div>

        {/* Inbox Widget - Full Height in Middle */}
        <div className="col-span-2 h-5/6">
          <CollegeSoccerInbox />
        </div>

        {/* Random Facts Widget - Top Right */}
        <div className="col-span-1 h-1/2">
          <RandomFactsWidget />
        </div>
      </div>
    </div>
  );
}
