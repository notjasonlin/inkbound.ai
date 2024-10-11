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
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <div className="flex items-center justify-center space-x-2">
          <h1 className="text-3xl font-bold mb-4 text-center">{schoolData.school}</h1>
          <FavoriteButton school={schoolData} userId={userID} />
        </div>

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
    </div>
  );
}
