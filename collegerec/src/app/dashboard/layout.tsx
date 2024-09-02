"use client";

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const sidebarItems = [
  { name: 'Home', path: '/dashboard' },
  { name: 'Schools', path: '/dashboard/schools' },
  { name: 'Emails', path: '/dashboard/emails' },
  { name: 'Background', path: '/dashboard/background' },
];

interface User {
  name: string;
  picture: string;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleSignOut = () => {
    // Clear localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('access_token');
    // Clear the login cookie
    document.cookie = 'isLoggedIn=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    console.log('Cookies after sign out:', document.cookie); // Add this line
    router.push('/');
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-gray-800 text-white p-4 flex justify-end items-center">
        <button 
          onClick={handleSignOut}
          className="mr-4 px-4 py-2 bg-red-500 rounded hover:bg-red-600"
        >
          Sign Out
        </button>
        {user && (
          <Link href="/dashboard/profile">
            <Image
              src={user.picture}
              alt={user.name}
              width={40}
              height={40}
              className="rounded-full cursor-pointer"
            />
          </Link>
        )}
      </header>
      <div className="flex flex-1">
        <aside className="w-64 bg-gray-800 text-white p-4">
          <nav>
            <ul>
              {sidebarItems.map((item) => (
                <li key={item.name} className="mb-2">
                  <Link 
                    href={item.path}
                    className={`block p-2 rounded ${
                      pathname === item.path ? 'bg-blue-500' : 'hover:bg-gray-700'
                    }`}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
