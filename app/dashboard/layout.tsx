"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaInbox, FaHome, FaSchool, FaUser, FaEdit, FaDollarSign } from "react-icons/fa"; // Import icons
import { Shrikhand } from "next/font/google"; // Import the Shrikhand font

const shrikhand = Shrikhand({ subsets: ["latin"], weight: "400" });

const sidebarItems = [
  { name: "Home", path: "/dashboard", icon: FaHome },
  { name: "Schools", path: "/dashboard/schools", icon: FaSchool },
  { name: "Profile", path: "/dashboard/profile", icon: FaUser },
  { name: "Upgrade", path: "/dashboard/upgrade", icon: FaDollarSign },
  { name: "Compose", path: "/dashboard/compose", icon: FaEdit },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-gray-100 text-black">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:block w-64 bg-white shadow-md">
        <div className="p-4">
          {/* Inkbound text with Shrikhand font and baby blue color */}
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
              className={`flex items-center px-6 py-3 text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-colors ${
                pathname === item.path
                  ? "bg-gray-100 text-gray-800 border-r-4 border-blue-500"
                  : ""
              }`}
            >
              <item.icon className="mr-3" />
              {item.name}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
        {/* Top bar with inbox icon */}
        <div className="bg-white shadow-sm">
          <div className="container mx-auto px-6 py-3 flex justify-end items-center">
            <Link href="/dashboard/emails" className="mr-4">
              <button className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors">
                <FaInbox className="text-gray-600" size={20} />
              </button>
            </Link>
          </div>
        </div>

        {/* Page content */}
        <div className="container mx-auto px-6 py-8">{children}</div>
      </main>

      {/* Bottom Navbar for Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-md md:hidden">
        <div className="flex justify-around items-center py-2">
          {sidebarItems.map((item) => (
            <Link key={item.path} href={item.path}>
              <button
                className={`flex flex-col items-center text-sm ${
                  pathname === item.path ? "text-blue-600" : "text-gray-600"
                }`}
              >
                <item.icon className="mb-1" size={20} />
                <span>{item.name}</span>
              </button>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
