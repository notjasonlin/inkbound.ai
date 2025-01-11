"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
import { useEffect, useMemo, useState } from "react";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { signout } from '../../lib/auth-actions';  // Import the signout function from your server actions
import { Tooltip } from "@/app/components/Tooltip";


const shrikhand = Shrikhand({ subsets: ["latin"], weight: "400" });

const sidebarItems = [
  { name: "Home", path: "/dashboard", icon: FaHome },
  { name: "Schools", path: "/dashboard/schools", icon: FaSchool },
  { name: "Profile", path: "/dashboard/profile/background", icon: FaUser },
  { name: "Templates", path: "/dashboard/templates", icon: FaListAlt},
  { name: "Compose", path: "/dashboard/auto-compose", icon: FaEdit },
  { name: "Inbox", path: "/dashboard/inbox", icon: FaInbox },
  { name: "Upgrade", path: "/dashboard/upgrade", icon: FaDollarSign }
];

interface PlanBadgeProps {
  plan: string;
  className?: string;
}

const PlanBadge = ({ plan, className = '' }: PlanBadgeProps) => {
  const badgeStyles = {
    basic: "bg-gray-100 text-gray-800",
    plus: "bg-blue-100 text-blue-800",
    pro: "bg-yellow-100 text-yellow-800",
    admin: "bg-purple-100 text-purple-800",
    'basic_plan': "bg-gray-100 text-gray-800",
    'plus_plan': "bg-blue-100 text-blue-800",
    'pro_plan': "bg-yellow-100 text-yellow-800",
    'Admin': "bg-purple-100 text-purple-800"
  };

  const displayName = plan.toLowerCase().replace('_plan', '');

  return (
    <Tooltip text="Usage resets every Sunday">
      <Link href="/dashboard/upgrade">
        <div className={`${badgeStyles[plan as keyof typeof badgeStyles]} px-3 py-1 rounded-full text-sm font-medium cursor-pointer hover:opacity-80 ${className}`}>
          {displayName.charAt(0).toUpperCase() + displayName.slice(1)}
        </div>
      </Link>
    </Tooltip>
  );
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();  // Use the Next.js router for redirection
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const supabase = createClientComponentClient();  // Initialize Supabase client
  const [plan, setPlan] = useState<string>('basic');

  // Fetch the user's email on component mount
  useEffect(() => {
    const fetchUserInfo = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Error fetching data:', error.message);
      } else if (user) {
        setUserEmail(user.email || '');
        // Fetch user's plan from user_subscriptions
        const { data: subscriptionData } = await supabase
          .from('user_subscriptions')
          .select('plan_id')
          .eq('user_id', user.id)
          .single();
        
        if (subscriptionData) {
          setPlan(subscriptionData.plan_id.toLowerCase());
        } else {
          setPlan('basic'); // Default to basic if no subscription found
        }
      }
    };

    fetchUserInfo();
  }, [supabase]);

  // Determine the active sidebar item based on the pathname
  const activeItemName = useMemo(() => {
    if (!pathname) return "Dashboard";
    
    const activeItem = sidebarItems.find((item) =>
      pathname.startsWith(item.path)
    );
    return activeItem ? activeItem.name : "Dashboard";
  }, [pathname]);

  // Handle the sign-out process
  const handleLogout = async () => {
    try {
      await signout();  // Call the server-side signout function
      router.push("/");  // Redirect to the landing page after logout
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

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
        {/* Top bar with email, settings, and logout */}
        <div className="bg-white shadow-md">
          <div className="container mx-auto px-6 py-2 flex justify-between items-center">
            {/* Left side: Email and Plan Badge */}
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">{userEmail || 'Loading...'}</span>
              <PlanBadge plan={plan} />
            </div>

            {/* Right side: Inbox, Settings, and Logout */}
            <div className="flex items-center space-x-4">
              <Tooltip text="Inbox">
                <Link href="/dashboard/inbox">
                  <button className="p-2 rounded-full bg-gradient-to-r from-blue-100 to-blue-200 hover:from-blue-200 hover:to-blue-300 transition-colors shadow-md">
                    <FaInbox className="text-blue-600" size={20} />
                  </button>
                </Link>
              </Tooltip>

              <Link 
                href="/dashboard/settings"
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition"
              >
                <FaCog />
                <span>Settings</span>
              </Link>

              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600 transition"
              >
                <FaSignOutAlt />
                <span>Log Out</span>
              </button>
            </div>
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
