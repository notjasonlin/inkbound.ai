import { getSchool } from '@/utils/supabase/client';
import { createClient } from "@/utils/supabase/server";
import { SchoolData } from '@/types/school/index';
import FavoritesProvider from './components/FavoritesProvider';
import SchoolContent from './components/SchoolContent';

type SchoolPageProps = {
  params: Promise<{ school: string }>; // CHANGED THIS TO SATISFY NEXT.JS ESLinter
};

export default async function SchoolPage({ params }: SchoolPageProps) {
  const { school } = await params; // Await params to resolve the promise immediately
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const schoolName = decodeURIComponent(school).replace(/\b\w/g, l => l.toUpperCase());
  const schoolData: SchoolData | null = await getSchool(schoolName);

  if (!schoolData || !user) {
    return null; 
  }

  return (
    <FavoritesProvider userId={user.id}>
      <SchoolContent schoolData={schoolData} userID={user.id} />
    </FavoritesProvider>
  );
}
