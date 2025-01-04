/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import SearchBar, { SearchFilters } from './SearchBar';
import { SchoolData } from '@/types/school';
import SchoolPreview from './SchoolPreview';
import FavoriteButton from '../[school]/components/FavoriteButton';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';

interface SchoolListProps {
  schools: SchoolData[];
  userID: string;
}

const supabase = createClient();

function formatSchoolNameForImage(name: string): string {
  return name.split(' ').join('-');
}

const SchoolList: React.FC<SchoolListProps> = ({ schools, userID }) => {
  const [logoUrls, setLogoUrls] = useState<Record<string, string>>({});
  const [hoveredSchool, setHoveredSchool] = useState<SchoolData | null>(null);
  const [lastHoveredSchool, setLastHoveredSchool] = useState<SchoolData | null>(schools[0] || null);
  const [filteredSchools, setFilteredSchools] = useState(schools);
  const [currentPage, setCurrentPage] = useState(1);
  const schoolsPerPage = 12;

  const indexOfLastSchool = currentPage * schoolsPerPage;
  const indexOfFirstSchool = indexOfLastSchool - schoolsPerPage;
  const currentSchools = filteredSchools.slice(indexOfFirstSchool, indexOfLastSchool);
  const totalPages = Math.ceil(filteredSchools.length / schoolsPerPage);

  useEffect(() => {
    const fetchLogosForCurrentPage = async () => {
      const urls = { ...logoUrls };
      let hasNewUrls = false;

      await Promise.all(
        currentSchools.map(async (school) => {
          if (!urls[school.school]) {
            const formattedName = formatSchoolNameForImage(school.school);
            const path = `merged_school_images/${formattedName}.png`;

            try {
              const { data } = supabase.storage.from('school-logo-images').getPublicUrl(path);
              if (data?.publicUrl) {
                urls[school.school] = data.publicUrl;
                hasNewUrls = true;
              } else {
                urls[school.school] = '/fallback-logo.png';
              }
            } catch {
              urls[school.school] = '/fallback-logo.png';
            }
          }
        })
      );

      if (hasNewUrls) {
        setLogoUrls(urls);
      }
    };

    fetchLogosForCurrentPage();
  }, [currentSchools, logoUrls]);

  const filterSchools = useCallback((filters: SearchFilters) => {
    const filtered = schools.filter((school) => {
      return (
        school.school.toLowerCase().includes(filters.schoolName.toLowerCase()) &&
        school.state.toLowerCase().includes(filters.state.toLowerCase()) &&
        (filters.division === '' || school.division === filters.division)
      );
    });
    setFilteredSchools(filtered);
    setCurrentPage(1);
  }, [schools]);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    const range = 2;

    if (totalPages > 1) {
      if (currentPage > 1) {
        buttons.push(
          <button
            key="prev"
            onClick={() => handlePageChange(currentPage - 1)}
            className="px-3 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-blue-500 hover:text-white transition"
          >
            Previous
          </button>
        );
      }

      for (let i = Math.max(1, currentPage - range); i <= Math.min(totalPages, currentPage + range); i++) {
        buttons.push(
          <button
            key={i}
            onClick={() => handlePageChange(i)}
            className={`px-3 py-2 rounded-lg ${
              currentPage === i
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-800'
            } hover:bg-blue-500 hover:text-white transition`}
          >
            {i}
          </button>
        );
      }

      if (currentPage < totalPages) {
        buttons.push(
          <button
            key="next"
            onClick={() => handlePageChange(currentPage + 1)}
            className="px-3 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-blue-500 hover:text-white transition"
          >
            Next
          </button>
        );
      }
    }

    return buttons;
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top Row: Search, Filters, Browse Title, and Pagination */}
      <div className="p-6 bg-white shadow-sm sticky top-0 z-10 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-800">Browse Schools</h2>
        <div className="flex space-x-2">{renderPaginationButtons()}</div>
        <SearchBar onSearch={filterSchools} />
      </div>

      {/* Main Content */}
      <div className="flex-grow flex flex-col md:flex-row md:space-x-6 px-6 py-4 items-stretch">
        {/* Left: School List */}
        <div className="flex flex-col w-full md:w-2/3">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 flex-grow">
            {currentSchools.map((school, index) => (
              <div
                key={school.id || index}
                className="group bg-white rounded-lg shadow-lg hover:shadow-xl transition overflow-hidden cursor-pointer border border-gray-200 hover:border-blue-400 relative"
                onMouseEnter={() => {
                  setHoveredSchool(school);
                  setLastHoveredSchool(school);
                }}
                onMouseLeave={() => setHoveredSchool(null)}
              >
                {/* Logo */}
                <div className="relative flex justify-center items-center bg-gradient-to-b from-white to-blue-50 h-32">
                  {logoUrls[school.school] ? (
                    <img
                      src={logoUrls[school.school]}
                      alt={school.school}
                      className="w-16 h-16 object-contain rounded-full shadow-md group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-300 animate-pulse rounded-full" />
                  )}
                </div>

                {/* School Info */}
                <div className="p-4">
                  <Link
                    href={`/dashboard/schools/${encodeURIComponent(school.school)}`}
                    className="text-lg font-semibold text-blue-600 hover:text-blue-800 transition"
                  >
                    {school.school}
                  </Link>
                  <p className="text-sm text-gray-500">{school.state}</p>
                </div>

                {/* Favorite Button */}
                <div className="absolute top-2 right-2">
                  <FavoriteButton school={school} userId={userID} size="text-2xl" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: School Preview */}
        <div className="w-full md:w-1/3 bg-white rounded-lg shadow-md border border-gray-200 p-6 flex-grow">
          {lastHoveredSchool ? (
            <SchoolPreview school={hoveredSchool || lastHoveredSchool} lastHoveredSchool={null} />
          ) : (
            <div className="h-full flex justify-center items-center text-gray-500">
              <p>Hover over a school to preview details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SchoolList;
