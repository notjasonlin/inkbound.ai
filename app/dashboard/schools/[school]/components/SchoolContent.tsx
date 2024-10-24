'use client';

import { SchoolData, CoachData } from '@/types/school/index';
import FavoriteButton from './FavoriteButton';

interface SchoolContentProps {
  schoolData: SchoolData;
  userID: string;
}

export default function SchoolContent({ schoolData, userID }: SchoolContentProps) {
  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* School Header with Favorite Button */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <div className="flex items-center justify-center space-x-2">
          <h1 className="text-3xl font-bold mb-4 text-center">{schoolData.school}</h1>
          <FavoriteButton school={schoolData} userId={userID} />
        </div>

        {/* School Info */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="font-semibold">Division</p>
            <p>{schoolData.division}</p>
          </div>
          <div>
            <p className="font-semibold">State</p>
            <p>{schoolData.state}</p>
          </div>
          <div>
            <p className="font-semibold">Conference</p>
            <p>{schoolData.conference}</p>
          </div>
        </div>
      </div>

      {/* Coaches Section */}
      <h2 className="text-2xl font-bold mb-4">Coaches</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {schoolData.coaches.map((coach: CoachData) => (
          <div key={coach.email} className="bg-white shadow-md rounded-lg p-6">
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

      {/* School Biography Section */}
      {schoolData.biography && (
        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">School Details</h2>
          <div className="grid grid-cols-2 gap-4 text-left">
            {schoolData.biography.undergraduates && (
              <p><span className="font-semibold">Undergraduates:</span> {schoolData.biography.undergraduates}</p>
            )}
            {schoolData.biography.early_action && (
              <p><span className="font-semibold">Early Action:</span> {schoolData.biography.early_action}</p>
            )}
            {schoolData.biography.early_decision && (
              <p><span className="font-semibold">Early Decision:</span> {schoolData.biography.early_decision}</p>
            )}
            {schoolData.biography.reg_admission_deadline && (
              <p><span className="font-semibold">Regular Admission Deadline:</span> {schoolData.biography.reg_admission_deadline}</p>
            )}
            {schoolData.biography.sat_math && (
              <p><span className="font-semibold">SAT Math:</span> {schoolData.biography.sat_math}</p>
            )}
            {schoolData.biography.sat_ebrw && (
              <p><span className="font-semibold">SAT EBRW:</span> {schoolData.biography.sat_ebrw}</p>
            )}
            {schoolData.biography.sat && (
              <p><span className="font-semibold">SAT Total:</span> {schoolData.biography.sat}</p>
            )}
            {schoolData.biography.act && (
              <p><span className="font-semibold">ACT:</span> {schoolData.biography.act}</p>
            )}
            {schoolData.biography.cost && (
              <p><span className="font-semibold">Cost:</span> ${schoolData.biography.cost}</p>
            )}
            {schoolData.biography.need_met && (
              <p><span className="font-semibold">Financial Need Met:</span> {parseInt(schoolData.biography.need_met) * 100}%</p>
            )}
            {schoolData.biography.academic_calendar && (
              <p><span className="font-semibold">Academic Calendar:</span> {schoolData.biography.academic_calendar}</p>
            )}
            {schoolData.biography.gen_ed_req && (
              <p><span className="font-semibold">General Education Requirements:</span> {schoolData.biography.gen_ed_req}</p>
            )}
            {schoolData.biography.nearest_metro && (
              <p><span className="font-semibold">Nearest Metro Area:</span> {schoolData.biography.nearest_metro}</p>
            )}
            {schoolData.biography.freshman_housing && (
              <p><span className="font-semibold">Freshman Housing:</span> {schoolData.biography.freshman_housing}</p>
            )}
            {schoolData.biography.gpa && (
              <p><span className="font-semibold">GPA:</span> {schoolData.biography.gpa}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
