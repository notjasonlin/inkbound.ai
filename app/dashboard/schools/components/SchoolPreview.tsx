import { useState, useEffect } from "react";
import { SchoolData } from "@/types/school";

interface SchoolPreviewProps {
  school: SchoolData;
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_IMAGE_BASE_URL = `${SUPABASE_URL}/storage/v1/object/public/school-logo-images/merged_school_images/`;

function formatSchoolNameForImage(name: string): string {
  return name.split(' ').join('-');
}

const SchoolPreview = ({ school }: SchoolPreviewProps) => {
  const formattedName = formatSchoolNameForImage(school.school);

  // Start by trying .png first
  const [imgSrc, setImgSrc] = useState(`${SUPABASE_IMAGE_BASE_URL}${formattedName}.png`);
  const [triedJpg, setTriedJpg] = useState(false);

  const handleImageError = () => {
    if (!triedJpg) {
      // If png fails, try jpg
      setImgSrc(`${SUPABASE_IMAGE_BASE_URL}${formattedName}.jpg`);
      setTriedJpg(true);
    } else {
      // If jpg also fails, fallback to a placeholder
      setImgSrc('/fallback-logo.png');
    }
  };

  useEffect(() => {
    // Update image if the school changes
    setImgSrc(`${SUPABASE_IMAGE_BASE_URL}${formattedName}.png`);
    setTriedJpg(false);
  }, [school, formattedName]);

  return (
    <div className="border rounded-lg shadow-md p-6 bg-white">
      {/* Title row with image and name */}
      <h2 className="text-2xl font-bold mb-4 text-gray-800 flex items-center space-x-2">
        <img
          src={imgSrc}
          alt={school.school}
          onError={handleImageError}
          className="w-8 h-8 object-contain"
        />
        <span>{school.school}</span>
      </h2>

      {/* School Info */}
      <div className="grid grid-cols-2 gap-4 text-gray-700 mb-6">
        <p><span className="font-semibold">State:</span> {school.state}</p>
        <p><span className="font-semibold">Division:</span> {school.division}</p>
        <p><span className="font-semibold">Conference:</span> {school.conference}</p>
      </div>

      {/* School Biography */}
      {school.biography && (
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-3">School Details</h3>
          <div className="grid grid-cols-2 gap-4 text-gray-700">
            {school.biography.undergraduates && <p><span className="font-semibold">Undergraduates:</span> {school.biography.undergraduates}</p>}
            {school.biography.early_action && <p><span className="font-semibold">Early Action:</span> {school.biography.early_action}</p>}
            {school.biography.early_decision && <p><span className="font-semibold">Early Decision:</span> {school.biography.early_decision}</p>}
            {school.biography.sat && <p><span className="font-semibold">SAT Total:</span> {school.biography.sat}</p>}
            {school.biography.act && <p><span className="font-semibold">ACT:</span> {school.biography.act}</p>}
            {school.biography.cost && <p><span className="font-semibold">Cost:</span> ${school.biography.cost}</p>}
            {school.biography.gen_ed_req && <p><span className="font-semibold">General Education Requirements:</span> {school.biography.gen_ed_req}</p>}
            {school.biography.gpa && <p><span className="font-semibold">GPA:</span> {school.biography.gpa}</p>}
          </div>
        </div>
      )}

      {/* Coaches Section */}
      <div className="mt-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-3">Coaches</h3>
        <ul className="space-y-4">
          {school.coaches.length > 0 ? (
            school.coaches.map((coach, index) => (
              <li key={index} className="p-4 bg-gray-50 border rounded-lg shadow-sm">
                <p className="font-medium text-gray-800">{coach.name}</p>
                <p className="text-gray-700">
                  Email:{" "}
                  <a
                    href={`mailto:${coach.email}`}
                    className="text-blue-600 hover:underline"
                  >
                    {coach.email}
                  </a>
                </p>
                <p className="text-gray-700">Position: {coach.position}</p>
              </li>
            ))
          ) : (
            <li className="text-gray-600">No coaches listed for this school.</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default SchoolPreview;
