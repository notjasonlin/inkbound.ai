/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useState } from 'react';
import { SchoolData } from '@/types/school';

interface SchoolPreviewProps {
  school: SchoolData | null;
  lastHoveredSchool: SchoolData | null;
}

const SUPABASE_IMAGE_BASE_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/school-logo-images/merged_school_images/`;

const SchoolPreview: React.FC<SchoolPreviewProps> = ({ school, lastHoveredSchool }) => {
  const [currentSchool, setCurrentSchool] = useState<SchoolData | null>(school || lastHoveredSchool);
  const [imgSrc, setImgSrc] = useState<string>('');
  const [fallback, setFallback] = useState(false);

  // Update the current school whenever `school` or `lastHoveredSchool` changes
  useEffect(() => {
    setCurrentSchool(school || lastHoveredSchool);
  }, [school, lastHoveredSchool]);

  // Update the image source whenever the current school changes
  useEffect(() => {
    if (currentSchool) {
      setImgSrc(`${SUPABASE_IMAGE_BASE_URL}${currentSchool.school.replaceAll(' ', '-')}.png`);
      setFallback(false); // Reset fallback when school changes
    }
  }, [currentSchool]);

  // Handle image loading errors by falling back to a placeholder
  const handleImageError = () => {
    setImgSrc('/fallback-logo.png');
    setFallback(true);
  };

  if (!currentSchool) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <p>Select a school to view details</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow-lg max-h-[75vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <img
          src={imgSrc}
          onError={handleImageError}
          alt={currentSchool.school}
          className="w-16 h-16 object-contain rounded-full border border-gray-200"
        />
        <h2 className="text-xl font-bold text-gray-800">{currentSchool.school}</h2>
      </div>

      {/* Details */}
      <div className="text-sm space-y-3">
        <p className="text-gray-700">
          <span className="font-semibold text-blue-600">State:</span> {currentSchool.state}
        </p>
        <p className="text-gray-700">
          <span className="font-semibold text-blue-600">Division:</span> {currentSchool.division}
        </p>
        <p className="text-gray-700">
          <span className="font-semibold text-blue-600">Conference:</span> {currentSchool.conference}
        </p>
      </div>

      {/* Biography */}
      {currentSchool.biography && (
        <div className="mt-4">
          <h3 className="text-md font-semibold text-gray-800 mb-2">School Details</h3>
          <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
            {currentSchool.biography.undergraduates && (
              <p>
                <span className="font-semibold text-blue-600">Undergraduates:</span> {currentSchool.biography.undergraduates}
              </p>
            )}
            {currentSchool.biography.cost && (
              <p>
                <span className="font-semibold text-blue-600">Cost:</span> ${currentSchool.biography.cost}
              </p>
            )}
            {currentSchool.biography.sat && (
              <p>
                <span className="font-semibold text-blue-600">SAT Total:</span> {currentSchool.biography.sat}
              </p>
            )}
            {currentSchool.biography.act && (
              <p>
                <span className="font-semibold text-blue-600">ACT:</span> {currentSchool.biography.act}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Coaches Section */}
      <div className="mt-4">
        <h3 className="text-md font-semibold text-gray-800 mb-2">Coaches</h3>
        <div className="grid grid-cols-1 gap-3">
          {currentSchool.coaches.length > 0 ? (
            currentSchool.coaches.map((coach, index) => (
              <div
                key={index}
                className="flex flex-col p-3 bg-gray-50 border border-gray-200 rounded-md shadow-sm hover:shadow-md transition-shadow"
              >
                <p className="text-sm font-medium text-gray-800">{coach.name}</p>
                <p className="text-xs text-gray-700 break-words">
                  <span className="font-semibold text-blue-600">Email:</span>{' '}
                  <a
                    href={`mailto:${coach.email}`}
                    className="text-blue-500 hover:underline"
                  >
                    {coach.email}
                  </a>
                </p>
                <p className="text-xs text-gray-700">
                  <span className="font-semibold text-blue-600">Position:</span> {coach.position}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-600">No coaches listed for this school.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SchoolPreview;
