import { SchoolData } from "@/types/school";

interface SchoolPreviewProps {
  school: SchoolData;
}

const SchoolPreview = ({ school }: SchoolPreviewProps) => {
  return (
    <div className="border rounded-lg shadow-md p-6 bg-white">
      {/* School Name */}
      <h2 className="text-2xl font-bold mb-4 text-gray-800">{school.school}</h2>
      
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
            {/* {school.biography.reg_admission_deadline && <p><span className="font-semibold">Regular Admission Deadline:</span> {school.biography.reg_admission_deadline}</p>} */}
            {/* {school.biography.sat_math && <p><span className="font-semibold">SAT Math:</span> {school.biography.sat_math}</p>} */}
            {/* {school.biography.sat_ebrw && <p><span className="font-semibold">SAT EBRW:</span> {school.biography.sat_ebrw}</p>} */}
            {school.biography.sat && <p><span className="font-semibold">SAT Total:</span> {school.biography.sat}</p>}
            {school.biography.act && <p><span className="font-semibold">ACT:</span> {school.biography.act}</p>}
            {school.biography.cost && <p><span className="font-semibold">Cost:</span> ${school.biography.cost}</p>}
            {/* {school.biography.need_met && <p><span className="font-semibold">Need Met:</span> {parseInt(school.biography.need_met) * 100}%</p>} */}
            {/* {school.biography.academic_calendar && <p><span className="font-semibold">Academic Calendar:</span> {school.biography.academic_calendar}</p>} */}
            {school.biography.gen_ed_req && <p><span className="font-semibold">General Education Requirements:</span> {school.biography.gen_ed_req}</p>}
            {/* {school.biography.nearest_metro && <p><span className="font-semibold">Nearest Metro:</span> {school.biography.nearest_metro}</p>} */}
            {/* {school.biography.freshman_housing && <p><span className="font-semibold">Freshman Housing:</span> {school.biography.freshman_housing}</p>} */}
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
