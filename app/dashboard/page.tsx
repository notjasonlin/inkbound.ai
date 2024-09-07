import { createClient } from "@/utils/supabase/server";
import { redirect } from 'next/navigation';
import DashboardMenu from './components/DashboardMenu';

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
        <h1 className="text-3xl font-semibold text-gray-800 dark:text-gray-200">Dashboard</h1>
        <div className="mt-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Dashboard cards */}
            <DashboardCard title="Total Schools" value="0" />
            <DashboardCard title="Emails Sent" value="0" />
            <DashboardCard title="Profile Completion" value="0%" />
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">{title}</h2>
      <p className="text-3xl font-bold text-gray-800 dark:text-gray-100 mt-2">{value}</p>
    </div>
  );
}
