import { getUniqueSchools } from '@/utils/supabase/client';
import { createClient } from "@/utils/supabase/server";
import FavoritesProvider from '../schools/[school]/components/FavoritesProvider';
import SchoolList from './components/SchoolList';

export default async function SchoolsPage() {
  const schools = await getUniqueSchools();
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null; // or some loading/error state
  }

  return (
    <FavoritesProvider userId={user.id}>
      <div className="container mx-auto p-4">
        <SchoolList schools={schools} userID={user.id} />
      </div>
    </FavoritesProvider>
  );
}
