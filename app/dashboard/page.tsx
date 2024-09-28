import { createClient } from "@/utils/supabase/server";
import { redirect } from 'next/navigation';
import DashboardMenu from './components/DashboardMenu';
import EmailWidget from "./components/EmailWidget";

export default async function Dashboard() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="relative">
      <DashboardMenu userEmail={user.email || ''} />
      <div className="p-6">
        <h1 className="text-3xl font-semibold text-black dark:text:black">Dashboard</h1>
        <div className="mt-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Dashboard cards */}
            <DashboardCard title="Total Schools" value="0" />
            <DashboardCard title="Emails Sent" value="0" />
            <DashboardCard title="Profile Completion" value="0%" />
          </div>
        </div>
        <EmailWidget />
      </div>
    </div>
  );
}

function DashboardCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-white dark:bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-black dark:text-black">{title}</h2>
      <p className="text-3xl font-bold text-black dark:text-black mt-2">{value}</p>
    </div>
  );
}
