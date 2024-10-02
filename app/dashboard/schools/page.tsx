import { getUniqueSchools } from '@/utils/supabase/client';
import SchoolList from './components/SchoolList';
import { createClient } from "@/utils/supabase/server";

export default async function SchoolsPage() {
  const schools = await getUniqueSchools();
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // console.log("SCHOOLS", schools);

  return (
    <div className="container mx-auto p-4">
      {user && <SchoolList schools={schools} userID={user.id}/>}
    </div>
  );
}
