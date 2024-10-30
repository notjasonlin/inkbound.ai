import { createClient } from "@/utils/supabase/server";
import { notFound } from 'next/navigation';
import Link from 'next/link';
import EnterUrl from "./components/EnterUrl";

interface Player {
  stats: { [key: string]: any },
  highlights: string[],
}

export default async function OutlinePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return notFound();
  }

  let { data: player_profiles, error } = await supabase
    .from('player_profiles')
    .select('*')
    .eq("user_id", user.id)

  if (error) {
    console.error(error.message);
  }


  return (
    <div className="p-6">
      <h1 className="text-3xl font-semibold mb-8">Outline</h1>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }} className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* <Link href="/dashboard/profile/templates" className="block">
          <div className="bg-white dark:bg-white rounded-lg p-6 transition-shadow hover:shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">Templates</h2>
            <ul className="list-disc list-inside mb-4">
              <li>Pre-designed outlines</li>
              <li>Quick start for common topics</li>
              <li>Customizable structures</li>
            </ul>
          </div>
        </Link> */}
        <Link href="/dashboard/profile/background" className="block">
          <div className="bg-white dark:bg-white rounded-lg p-6 transition-shadow hover:shadow-lg">
            <h3 className="text-2xl font-semibold mb-4">Background</h3>
            <ul className="list-disc list-inside mb-4">
              <li>Fill in your stats</li>
              <li>Helps generate smart autofill options</li>
            </ul>
          </div>
        </Link>
      </div>
    </div>
  );
}
