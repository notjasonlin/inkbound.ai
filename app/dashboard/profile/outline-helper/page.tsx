import { createClient } from "@/utils/supabase/server";
import { notFound } from 'next/navigation';

export default async function OutlineHelperPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return notFound();
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-semibold mb-4">Outline Helper</h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <p>Welcome to the Outline Helper! Here you can get assistance in creating your outline.</p>
        {/* Add your outline helper interface here */}
      </div>
    </div>
  );
}
