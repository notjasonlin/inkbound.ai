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

  // Debug logging


  // Function to safely check biography data
  // const isBiographyDataValid = (bio: any) => {
  //   try {
  //     return bio && 
  //            typeof bio === 'object' && 
  //            Object.keys(bio).length > 0 &&
  //            (bio.undergraduates || bio.sat || bio.act || bio.cost);
  //   } catch (error) {
  //     console.error('Biography validation error:', error);
  //     return false;
  //   }
  // };

  // console.log('School Biography Data:', {
  //   hasBiography: !!schoolData.biography,
  //   biography: schoolData.biography,
  //   validationResult: isBiographyDataValid(schoolData.biography)
  // });

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* School Header Section */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex items-center justify-center space-x-2 mb-6">
          <h1 className="text-3xl font-bold text-center">{schoolData.school}</h1>
          <FavoriteButton school={schoolData} userId={userID} />
        </div>

        <div className="grid grid-cols-3 gap-6 text-center">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="font-semibold text-gray-700 mb-2">Division</p>
            <p className="text-gray-900">{schoolData.division}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="font-semibold text-gray-700 mb-2">State</p>
            <p className="text-gray-900">{schoolData.state}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="font-semibold text-gray-700 mb-2">Conference</p>
            <p className="text-gray-900">{schoolData.conference}</p>
          </div>
          <FavoriteButton school={schoolData} userId={userID} size="text-2xl" />
        </div>

      {/* Coaches Section */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Coaches</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {schoolData.coaches.map((coach: CoachData) => (
            <div key={coach.email} className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 text-gray-900">{coach.name}</h3>
              <div className="space-y-3">
                <p className="text-gray-700">
                  <span className="font-medium">Position:</span> {coach.position}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Email:</span>{' '}
                  <a href={`mailto:${coach.email}`} className="text-blue-600 hover:underline">
                    {coach.email}
                  </a>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* School Biography Section */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">School Details</h2>
        {(schoolData.biography) ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {schoolData.biography?.undergraduates && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700">
                  <span className="font-medium">Undergraduates:</span>{' '}
                  <span className="text-gray-900">{schoolData.biography.undergraduates}</span>
                </p>
              </div>
            )}
            {schoolData.biography?.early_action && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700">
                  <span className="font-medium">Early Action:</span>{' '}
                  <span className="text-gray-900">{schoolData.biography.early_action}</span>
                </p>
              </div>
            )}
            {schoolData.biography?.early_decision && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700">
                  <span className="font-medium">Early Decision:</span>{' '}
                  <span className="text-gray-900">{schoolData.biography.early_decision}</span>
                </p>
              </div>
            )}
            {schoolData.biography?.reg_admission_deadline && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700">
                  <span className="font-medium">Regular Admission Deadline:</span>{' '}
                  <span className="text-gray-900">{schoolData.biography.reg_admission_deadline}</span>
                </p>
              </div>
            )}
            {schoolData.biography?.sat_math && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700">
                  <span className="font-medium">SAT Math:</span>{' '}
                  <span className="text-gray-900">{schoolData.biography.sat_math}</span>
                </p>
              </div>
            )}
            {schoolData.biography?.sat_ebrw && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700">
                  <span className="font-medium">SAT EBRW:</span>{' '}
                  <span className="text-gray-900">{schoolData.biography.sat_ebrw}</span>
                </p>
              </div>
            )}
            {schoolData.biography?.sat && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700">
                  <span className="font-medium">SAT Total:</span>{' '}
                  <span className="text-gray-900">{schoolData.biography.sat}</span>
                </p>
              </div>
            )}
            {schoolData.biography?.act && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700">
                  <span className="font-medium">ACT:</span>{' '}
                  <span className="text-gray-900">{schoolData.biography.act}</span>
                </p>
              </div>
            )}
            {schoolData.biography?.cost && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700">
                  <span className="font-medium">Cost:</span>{' '}
                  <span className="text-gray-900">${schoolData.biography.cost}</span>
                </p>
              </div>
            )}
            {schoolData.biography?.need_met && schoolData.biography.need_met && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700">
                  <span className="font-medium">Financial Need Met:</span>{' '}
                  <span className="text-gray-900">{parseInt(schoolData.biography.need_met) * 100}%</span>
                </p>
              </div>
            )}
            {schoolData.biography?.academic_calendar && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700">
                  <span className="font-medium">Academic Calendar:</span>{' '}
                  <span className="text-gray-900">{schoolData.biography.academic_calendar}</span>
                </p>
              </div>
            )}
            {schoolData.biography?.gen_ed_req && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700">
                  <span className="font-medium">General Education Requirements:</span>{' '}
                  <span className="text-gray-900">{schoolData.biography.gen_ed_req}</span>
                </p>
              </div>
            )}
            {schoolData.biography?.nearest_metro && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700">
                  <span className="font-medium">Nearest Metro Area:</span>{' '}
                  <span className="text-gray-900">{schoolData.biography.nearest_metro}</span>
                </p>
              </div>
            )}
            {schoolData.biography?.freshman_housing && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700">
                  <span className="font-medium">Freshman Housing:</span>{' '}
                  <span className="text-gray-900">{schoolData.biography.freshman_housing}</span>
                </p>
              </div>
            )}
            {schoolData.biography?.gpa && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700">
                  <span className="font-medium">GPA:</span>{' '}
                  <span className="text-gray-900">{schoolData.biography.gpa}</span>
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <p className="text-gray-600">
              We're currently gathering detailed information about this school.{' '}
              <a href="/support" className="text-blue-600 hover:underline">
                Help us improve our database
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
