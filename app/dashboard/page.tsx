"use client";

import { useState } from 'react';
import { FaUser, FaCog, FaSignOutAlt, FaBars } from 'react-icons/fa';
import ProfileWidget from './components/ProfileWidget'; // Import ProfileWidget
import FavoriteSchoolsWidget from './components/FavoriteSchoolsWidget'; // Import Favorite Schools Widget
import CollegeSoccerInbox from './components/CollegeSoccerInboxWidget'; // Import College Soccer Inbox
import RandomFactsWidget from './components/RandomFactsWidget'; // Import Random Facts Widget

interface DashboardMenuProps {
  userEmail: string;
}

const DashboardMenu: React.FC<DashboardMenuProps> = ({ userEmail }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    console.log('Logging out...');
  };

  return (
    <nav className="w-full bg-white shadow-md py-2 rounded-full px-6">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">Dashboard</h1>

        {/* User Email and Dropdown for larger screens */}
        <div className="hidden md:flex items-center space-x-6">
          <span className="text-gray-700">{userEmail}</span>
          <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition">
            <FaCog />
            <span>Settings</span>
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600 transition"
          >
            <FaSignOutAlt />
            <span>Log Out</span>
          </button>
        </div>

        {/* Hamburger menu for mobile */}
        <div className="md:hidden">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-blue-600 focus:outline-none"
          >
            <FaBars className="text-2xl" />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden mt-4 space-y-4">
          <span className="block text-gray-700">{userEmail}</span>
          <button className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition">
            <FaUser />
            <span>Profile</span>
          </button>
          <button className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition">
            <FaCog />
            <span>Settings</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600 transition"
          >
            <FaSignOutAlt />
            <span>Log Out</span>
          </button>
        </div>
      )}
    </nav>
  );
};

export default function Dashboard() {
  const userStats = {
    totalSchools: '8',
    emailsSent: '0',
    profileCompletion: '100',
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Top Navbar */}
      <DashboardMenu userEmail="user@example.com" />

      {/* Main Content Area */}
      <div className="flex-1 grid grid-cols-4 gap-6 p-6">
        {/* Profile Widget - Top Left */}
        <div className="col-span-1 flex flex-col space-y-4">
          <ProfileWidget userName="John Smith" stats={userStats} />
          <FavoriteSchoolsWidget />
        </div>

        {/* Inbox Widget - Full Height in Middle */}
        <div className="col-span-2 h-full">
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
