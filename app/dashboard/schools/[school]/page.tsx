import { getSchool } from '@/utils/supabase/client';
import { createClient } from "@/utils/supabase/server";
import { SchoolData } from '@/types/school/index';
import SchoolContent from './components/SchoolContent';

type SchoolPageProps = {
  params: Promise<{ school: string }>;
};

export default async function SchoolPage({ params }: SchoolPageProps) {
  const { school } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <p className="text-gray-600 text-center">Please log in to view school information.</p>
      </div>
    );
  }

  const schoolName = decodeURIComponent(school).replace(/\b\w/g, l => l.toUpperCase());
  const schoolData = await getSchool(schoolName);

  if (!schoolData) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <p className="text-gray-600 text-center">School information not found.</p>
      </div>
    );
  }

  return (
    <>
      <SchoolContent schoolData={schoolData} userID={user.id} />
    </>
  );
}
