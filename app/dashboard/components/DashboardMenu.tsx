"use client";

import { useState } from 'react';
import { useTheme } from 'next-themes';
import { signout } from '@/lib/auth-actions';
import { useRouter } from 'next/navigation';
import { useUser } from '@/components/UserContext'; // Make sure this path is correct

function DashboardMenu({ userEmail }: { userEmail: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const { setUser } = useUser();

  const handleSignOut = async () => {
    try {
      await signout();
      setUser(null); // Clear the user in your context
      router.refresh(); // Force a refresh of the page
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="absolute top-4 right-4">
      <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-gray-600 dark:text-gray-300">
        ☰
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg">
          {userEmail && (
            <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">
              {userEmail}
            </div>
          )}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
          <button
            onClick={handleSignOut}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}

export default DashboardMenu;