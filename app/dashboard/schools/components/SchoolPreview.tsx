import { SchoolData } from "@/types/school";

interface SchoolPreviewProps {
  school: SchoolData;
}

const SchoolPreview = ({ school }: SchoolPreviewProps) => {
  return (
    <div className="border rounded-lg shadow-md p-4">
      <h2 className="text-xl font-bold mb-2">{school.school}</h2>
      <div className="text-gray-600 mb-2">
        <p>State: {school.state}</p>
        <p>Division: {school.division}</p>
        <p>Conference: {school.conference}</p>
      </div>

      <h3 className="text-lg font-semibold mt-4">Coaches:</h3>
      <ul className="space-y-2">
        {school.coaches.length > 0 ? (
          school.coaches.map((coach, index) => (
            <li key={index} className="p-2 bg-gray-50 rounded-md shadow-sm">
              <p className="font-medium">{coach.name}</p>
              <p>Email: <a href={`mailto:${coach.email}`} className="text-blue-500 hover:underline">{coach.email}</a></p>
              <p>Position: {coach.position}</p>
            </li>
          ))
        ) : (
          <li>No coaches listed for this school.</li>
        )}
      </ul>
    </div>
  );
};

export default SchoolPreview;
