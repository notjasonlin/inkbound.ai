"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaInbox,
  FaHome,
  FaSchool,
  FaUser,
  FaEdit,
  FaDollarSign,
} from "react-icons/fa";
import { Shrikhand } from "next/font/google";
import { useMemo } from "react";

const shrikhand = Shrikhand({ subsets: ["latin"], weight: "400" });

const sidebarItems = [
  { name: "Home", path: "/dashboard", icon: FaHome },
  { name: "Schools", path: "/dashboard/schools", icon: FaSchool },
  { name: "Profile", path: "/dashboard/profile", icon: FaUser },
  { name: "Compose", path: "/dashboard/compose", icon: FaEdit },
  { name: "Inbox", path: "/dashboard/inbox", icon: FaInbox },
  { name: "Upgrade", path: "/dashboard/upgrade", icon: FaDollarSign }
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Determine the active sidebar item based on the pathname
  const activeItemName = useMemo(() => {
    const activeItem = sidebarItems.find((item) =>
      pathname.startsWith(item.path)
    );
    return activeItem ? activeItem.name : "Dashboard";
  }, [pathname]);

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 to-blue-100 text-black">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:block w-64 bg-white shadow-lg">
        <div className="p-4">
          <h1
            className={`text-3xl font-bold bg-gradient-to-r from-babyblue-500 to-blue-500 bg-clip-text text-transparent ${shrikhand.className}`}
          >
            Inkbound
          </h1>
        </div>
        <nav className="mt-6">
          {sidebarItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center px-6 py-3 text-gray-600 hover:bg-gradient-to-r from-blue-100 to-blue-200 hover:text-blue-800 transition-colors ${
                pathname === item.path
                  ? "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-r-4 border-blue-500"
                  : ""
              }`}
            >
              <item.icon className="mr-3" />
              <span className="text-sm">{item.name}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto">
        {/* Top bar with active item name */}
        <div className="bg-white shadow-md">
          <div className="container mx-auto px-6 py-2 flex justify-between items-center">
            {/* Active item title */}
            <h1 className="text-2xl font-semibold text-blue-900">
              {activeItemName}
            </h1>
            {/* Inbox icon */}
            <Link href="/dashboard/inbox">
              <button className="p-2 rounded-full bg-gradient-to-r from-blue-100 to-blue-200 hover:from-blue-200 hover:to-blue-300 transition-colors shadow-md">
                <FaInbox className="text-blue-600" size={20} />
              </button>
            </Link>
          </div>
        </div>

        {/* Page content */}
        <div className="container mx-auto px-6 py-4">{children}</div>
      </main>

      {/* Bottom Navbar for Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-lg md:hidden">
        <div className="flex justify-around items-center py-2">
          {sidebarItems.map((item) => (
            <Link key={item.path} href={item.path}>
              <button
                className={`flex flex-col items-center text-xs transition-colors ${
                  pathname === item.path ? "text-blue-600" : "text-gray-600"
                }`}
              >
                <item.icon className="mb-1" size={20} />
                <span className="text-xs">{item.name}</span>
              </button>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
