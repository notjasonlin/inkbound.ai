import { getUniqueSchools } from '@/utils/supabase/client';
import { createClient } from "@/utils/supabase/server";
import SchoolList from './components/SchoolList';
import Navbar from './components/Navbar';

export default async function SchoolsPage() {
  const schools = await getUniqueSchools();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null; // or render a loading/error state
  }

  return (
    <>
      {/* Navbar */}
      <Navbar />

      {/* Content */}
      <div className="container mx-auto p-4">
        <SchoolList schools={schools} userID={user.id}/>
      </div>
    </>
  );
}

