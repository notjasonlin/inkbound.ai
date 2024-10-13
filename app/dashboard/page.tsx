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
    <div className="relative bg-gradient-to-br from-blue-50 to-blue-100 min-h-screen">
      {/* Top Navigation with Dashboard title */}
        <div className="max-w-7xl mx-auto flex justify-between items-center py-4 px-6">
          <DashboardMenu userEmail={user.email || ''} />
        </div>

      <div className="p-6 max-w-7xl mx-auto mt-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Dashboard cards */}
          <DashboardCard title="Total Schools" value="0" />
          <DashboardCard title="Emails Sent" value="0" />
          <DashboardCard title="Profile Completion" value="0%" />
        </div>
        <div className="mt-8">
          <EmailWidget />
        </div>
      </div>
    </div>
  );
}

function DashboardCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-gradient-to-br from-white to-blue-50 rounded-lg shadow-lg p-6 transition-transform transform hover:scale-105 hover:shadow-2xl">
      <h2 className="text-xl font-semibold text-blue-800">{title}</h2>
      <p className="text-4xl font-bold text-blue-900 mt-2">{value}</p>
    </div>
  );
}
