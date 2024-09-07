"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const sidebarItems = [
  { name: 'Home', path: '/dashboard' },
  { name: 'Schools', path: '/dashboard/schools' },
  { name: 'Emails', path: '/dashboard/emails' },
  { name: 'Background', path: '/dashboard/background' },
  { name: 'Outline', path: '/dashboard/outline' }, 
  { name: 'Upgrade', path: '/dashboard/upgrade' },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md">
        <div className="p-4">
          <h1 className="text-2xl font-bold text-gray-800">Commit</h1>
        </div>
        <nav className="mt-6">
          {sidebarItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center px-6 py-3 text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-colors ${
                pathname === item.path ? 'bg-gray-100 text-gray-800 border-r-4 border-blue-500' : ''
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
        <div className="container mx-auto px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
