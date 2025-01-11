/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useState } from 'react';
import { SchoolData, CoachData } from '@/types/school/index';
import FavoriteButton from './FavoriteButton';
import { FiArrowLeft } from 'react-icons/fi';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

function formatSchoolNameForImage(name: string): string {
  return name.split(' ').join('-');
}

interface SchoolContentProps {
  schoolData: SchoolData;
  userID: string;
}

export default function SchoolContent({ schoolData, userID }: SchoolContentProps) {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogo = async () => {
      if (schoolData) {
        const formattedName = formatSchoolNameForImage(schoolData.school);
        const path = `merged_school_images/${formattedName}.png`;

        try {
          const { data } = supabase.storage.from('school-logo-images').getPublicUrl(path);
          setLogoUrl(data?.publicUrl || '/fallback-logo.png');
        } catch {
          setLogoUrl('/fallback-logo.png');
        }
      }
    };

    fetchLogo();
  }, [schoolData]);

  if (!schoolData) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <p className="text-gray-600 text-center">Loading school information...</p>
      </div>
    );
  }

  const isBiographyDataValid = (bio: any) => {
    try {
      return (
        bio &&
        typeof bio === 'object' &&
        Object.keys(bio).length > 0 &&
        (bio.undergraduates || bio.sat || bio.act || bio.cost)
      );
    } catch (error) {
      return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Back Button */}
        <div className="flex items-center">
          <Link href="/dashboard/schools" className="flex items-center text-blue-600 hover:text-blue-800">
            <FiArrowLeft size={20} />
            <span className="ml-2 font-medium">Back to Schools</span>
          </Link>
        </div>

        {/* School Header */}
        <div className="bg-white shadow-lg rounded-lg p-6 flex flex-col md:flex-row justify-between items-center md:space-x-8">
          <div className="flex items-center space-x-4">
            {logoUrl && (
              <img
                src={logoUrl}
                alt={`${schoolData.school} Logo`}
                className="w-20 h-20 rounded-full object-contain shadow-md"
              />
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{schoolData.school}</h1>
              <div className="mt-2 grid grid-cols-3 gap-4 text-center md:text-left">
                <div>
                  <p className="font-semibold text-gray-600">Division</p>
                  <p className="text-gray-800">{schoolData.division || 'N/A'}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-600">State</p>
                  <p className="text-gray-800">{schoolData.state || 'N/A'}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-600">Conference</p>
                  <p className="text-gray-800">{schoolData.conference || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
          <FavoriteButton school={schoolData} userId={userID} size="text-2xl" />
        </div>

        {/* Coaches Section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-800">Coaches</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {schoolData.coaches.map((coach: CoachData) => (
              <div key={coach.email} className="bg-white shadow-md rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-800">{coach.name}</h3>
                <table className="w-full mt-2">
                  <tbody>
                    <tr>
                      <td className="font-medium text-gray-600 pr-4">Position:</td>
                      <td className="text-gray-800">{coach.position}</td>
                    </tr>
                    <tr>
                      <td className="font-medium text-gray-600 pr-4">Email:</td>
                      <td>
                        <a
                          href={`mailto:${coach.email}`}
                          className="text-blue-600 hover:underline"
                        >
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

        {/* School Biography Section */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">School Details</h2>
          {isBiographyDataValid(schoolData.biography) ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-800">
              {schoolData.biography?.undergraduates && (
                <p>
                  <span className="font-semibold">Undergraduates:</span> {schoolData.biography.undergraduates}
                </p>
              )}
              {schoolData.biography?.early_action && (
                <p>
                  <span className="font-semibold">Early Action:</span> {schoolData.biography.early_action}
                </p>
              )}
              {schoolData.biography?.early_decision && (
                <p>
                  <span className="font-semibold">Early Decision:</span> {schoolData.biography.early_decision}
                </p>
              )}
              {schoolData.biography?.sat && (
                <p>
                  <span className="font-semibold">SAT Total:</span> {schoolData.biography.sat}
                </p>
              )}
              {schoolData.biography?.act && (
                <p>
                  <span className="font-semibold">ACT:</span> {schoolData.biography.act}
                </p>
              )}
              {schoolData.biography?.cost && (
                <p>
                  <span className="font-semibold">Cost:</span> ${schoolData.biography.cost}
                </p>
              )}
            </div>
          ) : (
            <p className="text-gray-600">
              We're currently gathering detailed information about this school.{' '}
              <a href="/support" className="text-blue-600 hover:underline">
                Submit a ticket
              </a>{' '}
              if you'd like to be notified when it's available.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
