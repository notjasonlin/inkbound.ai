import { getSchool } from '@/utils/supabase/client';
import { createClient } from "@/utils/supabase/server";
import { SchoolData } from '@/types/school/index';
import FavoritesProvider from './components/FavoritesProvider';
import SchoolContent from './components/SchoolContent';

export default async function SchoolPage({ params }: { params: { school: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const schoolName = decodeURIComponent(params.school).replace(/\b\w/g, l => l.toUpperCase());
  const schoolData: SchoolData | null = await getSchool(schoolName);

  if (!schoolData || !user) {
    return null; // or some loading/error state
  }

  return (
    <FavoritesProvider userId={user.id}>
      <SchoolContent schoolData={schoolData} userID={user.id} />
    </FavoritesProvider>
  );
}
