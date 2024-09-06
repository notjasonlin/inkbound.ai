import { getCoaches, getUniqueSchools } from '@/utils/supabase/client';

export async function generateStaticParams() {
  const schools = await getUniqueSchools();
  return schools.map((school) => ({
    school: encodeURIComponent(school),
  }));
}

export default async function SchoolPage({ params }: { params: { school: string } }) {
  const schoolName = decodeURIComponent(params.school);
  const coaches = await getCoaches();
  const schoolCoaches = coaches.filter(coach => coach.School === schoolName);

  return (
    <div>
      <h1>{schoolName}</h1>
      <ul>
        {schoolCoaches.map((coach) => (
          <li key={coach.id}>
            <p>Name: {coach.Name}</p>
            <p>Position: {coach.Position}</p>
            <p>Email: {coach.Email}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}