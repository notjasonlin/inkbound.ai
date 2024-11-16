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
  
  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <p className="text-gray-600 text-center">Please log in to view school information.</p>
      </div>
    );
  }

  const schoolName = decodeURIComponent(params.school).replace(/\b\w/g, l => l.toUpperCase());
  const schoolData = await getSchool(schoolName);

  if (!schoolData) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <p className="text-gray-600 text-center">School information not found.</p>
      </div>
    );
  }

  const sanitizedSchoolData = {
    ...schoolData,
    biography: null  // Set biography to null by default
  };

  return (
    <FavoritesProvider userId={user.id}>
      <SchoolContent schoolData={sanitizedSchoolData} userID={user.id} />
    </FavoritesProvider>
  );
}
