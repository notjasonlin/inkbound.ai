/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaInbox,
  FaHome,
  FaSchool,
  FaUser,
  FaEdit,
  FaDollarSign,
  FaSignOutAlt,
  FaCog,
  FaListAlt,
} from "react-icons/fa";
import { Shrikhand } from "next/font/google";
import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { signout } from "../../lib/auth-actions";
import inkboundLogo from '@public/inkbound-full-logo.png'

// Google font import
const shrikhand = Shrikhand({ subsets: ["latin"], weight: "400" });

// Nav items for the sidebar and bottom nav
const sidebarItems = [
  { name: "Home", path: "/dashboard", icon: FaHome },
  { name: "Schools", path: "/dashboard/schools", icon: FaSchool },
  { name: "Profile", path: "/dashboard/profile/background", icon: FaUser },
  { name: "Templates", path: "/dashboard/templates", icon: FaListAlt },
  { name: "Compose", path: "/dashboard/auto-compose", icon: FaEdit },
  { name: "Inbox", path: "/dashboard/inbox", icon: FaInbox },
  { name: "Upgrade", path: "/dashboard/upgrade", icon: FaDollarSign },
];

/**
 * Only highlight "Home" if path === "/dashboard"
 * Otherwise, highlight if `pathname` starts with the link path.
 * Safely handle cases where `pathname` might be null or undefined.
 */
function getIsActive(pathname: string, itemPath: string) {
  if (itemPath === "/dashboard") {
    return pathname === "/dashboard";
  }
  return pathname.startsWith(itemPath);
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const rawPathname = usePathname();
  const pathname = rawPathname ?? ""; // fallback if null
  const router = useRouter();

  const [userEmail, setUserEmail] = useState<string>("");
  const supabase = createClientComponentClient();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fetch the user's email on component mount
  useEffect(() => {
    const fetchUserInfo = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) {
        console.error("Error fetching data:", error.message);
      } else if (user) {
        setUserEmail(user.email ?? "");
      }
    };
    fetchUserInfo();
  }, [supabase]);

  // Handle the sign-out process
  const handleLogout = async () => {
    try {
      await signout(); 
      router.push("/"); 
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  // Sidebar toggle (mobile)
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-700">
      {/* Top Bar */}
      <header className="flex items-center justify-between bg-white border-b border-gray-200 p-4 shadow-sm z-10">
        {/* Left: Logo + hamburger (mobile) */}
        <div className="flex items-center space-x-3">
          <button
            className="md:hidden p-2 rounded hover:bg-gray-100 transition"
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
          >
            {!sidebarOpen ? (
              <svg
                className="h-6 w-6 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            ) : (
              <svg
                className="h-6 w-6 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </button>

          <Link href="/dashboard">
            <img
              src='/inkbound-full-logo.png'
              alt="Inkbound"
              className="h-11 w-auto"
            />
          </Link>
        </div>

        {/* Right: user email, settings, log out */}
        <div className="hidden md:flex items-center space-x-4">
          <span className="text-sm text-gray-600">{userEmail}</span>

          <button className="flex items-center space-x-1 bg-blue-600 text-white px-4 py-2 text-sm rounded-full hover:bg-blue-700 transition">
            <FaCog />
            <span>Settings</span>
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center space-x-1 bg-red-500 text-white px-4 py-2 text-sm rounded-full hover:bg-red-600 transition"
          >
            <FaSignOutAlt />
            <span>Log Out</span>
          </button>
        </div>
      </header>

      {/* Main Layout Wrapper */}
      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR - Desktop */}
        <aside className="hidden md:flex md:flex-col w-64 border-r border-gray-200 bg-white shadow-sm">
          {/* Remove the "Main Menu" header */}
          <nav className="flex-1 overflow-y-auto">
            {sidebarItems.map((item) => {
              const isActive = getIsActive(pathname, item.path);
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`
                    flex items-center px-6 py-3 text-sm transition-colors
                    ${
                      isActive
                        ? "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border-r-4 border-blue-500"
                        : "text-gray-600 hover:bg-gray-50"
                    }
                  `}
                >
                  <item.icon className="mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* SIDEBAR - Mobile (slide in/out) */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside
              key="mobile-sidebar"
              className="
                fixed
                top-0
                left-0
                z-50
                w-64
                h-full
                bg-white
                shadow-2xl
                border-r
                border-gray-200
                flex
                flex-col
                md:hidden
              "
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3 }}
            >
              {/* Close button */}
              <div className="flex items-center justify-end p-4 border-b border-gray-200">
                <button
                  className="p-2 rounded hover:bg-gray-100 transition"
                  onClick={toggleSidebar}
                  aria-label="Close sidebar"
                >
                  <svg
                    className="h-6 w-6 text-gray-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Sidebar Nav */}
              <nav className="flex-1 overflow-y-auto">
                {sidebarItems.map((item) => {
                  const isActive = getIsActive(pathname, item.path);
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`
                        flex items-center px-6 py-3 text-sm transition-colors
                        ${
                          isActive
                            ? "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border-r-4 border-blue-500"
                            : "text-gray-600 hover:bg-gray-50"
                        }
                      `}
                    >
                      <item.icon className="mr-3" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 overflow-x-hidden overflow-y-auto">
          {/* TOP BAR (Mobile only) - user info & signout */}
          <div className="md:hidden bg-white border-b border-gray-200 p-3 flex items-center justify-between shadow-sm">
            <span className="text-sm text-gray-600">{userEmail}</span>
            <div className="flex items-center space-x-2">
              <button className="p-2 rounded-full hover:bg-gray-100 transition text-gray-600">
                <FaCog />
              </button>
              <button
                onClick={handleLogout}
                className="p-2 rounded-full hover:bg-gray-100 transition text-red-500"
              >
                <FaSignOutAlt />
              </button>
            </div>
          </div>

          {/* MAIN CONTENT */}
          <div className="p-4 md:p-6 min-h-[calc(100vh-5rem)]">{children}</div>
        </div>
      </div>

      {/* MOBILE BOTTOM NAVBAR */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-sm">
        <div className="flex justify-around items-center py-2">
          {sidebarItems.map((item) => {
            const isActive = getIsActive(pathname, item.path);
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setSidebarOpen(false)}
              >
                <div
                  className={`
                    flex flex-col items-center text-xs transition-colors px-2
                    ${
                      isActive
                        ? "text-blue-600"
                        : "text-gray-600 hover:text-blue-500"
                    }
                  `}
                >
                  <item.icon className="mb-1" size={20} />
                  <span>{item.name}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
