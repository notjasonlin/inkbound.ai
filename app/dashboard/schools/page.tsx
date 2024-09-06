import { getUniqueSchools } from '@/utils/supabase/client';
import SchoolList from './components/SchoolList';

export default async function SchoolsPage() {
  const schools = await getUniqueSchools();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Schools</h1>
      <SchoolList schools={schools} />
    </div>
  );
}
