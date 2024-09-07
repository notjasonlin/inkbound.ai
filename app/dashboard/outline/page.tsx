import { createClient } from "@/utils/supabase/server";
import { notFound } from 'next/navigation';
import Link from 'next/link';

export default async function OutlinePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return notFound();
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-semibold mb-8">Outline</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Link href="/dashboard/outline/templates" className="block">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 transition-shadow hover:shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">Templates</h2>
            <ul className="list-disc list-inside mb-4">
              <li>Pre-designed outlines</li>
              <li>Quick start for common topics</li>
              <li>Customizable structures</li>
            </ul>
          </div>
        </Link>
        <Link href="/dashboard/outline/outline-helper" className="block">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 transition-shadow hover:shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">Outline Helper</h2>
            <ul className="list-disc list-inside mb-4">
              <li>Step-by-step guidance</li>
              <li>AI-powered suggestions</li>
              <li>Flexible outline creation</li>
            </ul>
          </div>
        </Link>
      </div>
    </div>
  );
}
