import { getCoaches, getUniqueSchools } from '@/utils/supabase/client';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
  const schools = await getUniqueSchools();
  return schools.map((school) => ({
    school: school.school,
  }));
}

async function SchoolPage({ params }: { params: { school: string } }) {
  const schoolName = decodeURIComponent(params.school).replace(/\b\w/g, l => l.toUpperCase());
  const coaches = await getCoaches();
  const schoolCoaches = coaches.filter(coach => coach.school.toLowerCase() === schoolName.toLowerCase());

  if (schoolCoaches.length === 0) {
    notFound();
  }

  // Assuming all coaches have the same school info
  const schoolInfo = schoolCoaches[0];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h1 className="text-3xl font-bold mb-4 text-center">{schoolName}</h1>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="font-semibold">Division</p>
            <p>{schoolInfo.division}</p>
          </div>
          <div>
            <p className="font-semibold">State</p>
            <p>{schoolInfo.state}</p>
          </div>
          <div>
            <p className="font-semibold">Conference</p>
            <p>{schoolInfo.conference}</p>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-4">Coaches</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {schoolCoaches.map((coach) => (
          <div key={coach.id} className="bg-white shadow-md rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">{coach.name}</h3>
            <table className="w-full">
              <tbody>
                <tr>
                  <td className="font-medium pr-4">Position:</td>
                  <td>{coach.position}</td>
                </tr>
                <tr>
                  <td className="font-medium pr-4">Email:</td>
                  <td>
                    <a href={`mailto:${coach.email}`} className="text-blue-600 hover:underline">
                      {coach.email}
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SchoolPage;