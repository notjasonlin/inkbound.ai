'use client';

import React, { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import SearchBar, { SearchFilters } from './SearchBar';
import { SchoolData } from '@/types/school';
import SchoolPreview from './SchoolPreview';
import FavoriteButton from '../[school]/components/FavoriteButton';
import { createClient } from '@supabase/supabase-js';

interface SchoolListProps {
  schools: SchoolData[];
  userID: string;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function formatSchoolNameForImage(name: string): string {
  // here we change the name for storage bucket "Adelphi University" → "Adelphi-University"
  return name.split(' ').join('-');
}

const SchoolList: React.FC<SchoolListProps> = ({ schools, userID }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [filteredSchools, setFilteredSchools] = useState(schools);
  const [hoveredSchool, setHoveredSchool] = useState<SchoolData | null>(null);
  const [lastHoveredSchool, setLastHoveredSchool] = useState<SchoolData | null>(null);
  const schoolsPerPage = 10;


  useEffect(() => {}, [schools, filteredSchools]);

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

  const indexOfLastSchool = currentPage * schoolsPerPage;
  const indexOfFirstSchool = indexOfLastSchool - schoolsPerPage;
  const currentSchools = filteredSchools.slice(indexOfFirstSchool, indexOfLastSchool);
  const totalPages = Math.ceil(filteredSchools.length / schoolsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const toggleDropdown = (school: string) => {
    setOpenDropdown(openDropdown === school ? null : school);
  };

  const handleSearch = (filters: SearchFilters) => {
    filterSchools(filters);
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    const range = 2;

    buttons.push(
      <button
        key="first"
        onClick={() => handlePageChange(1)}
        className={`px-3 py-1 rounded ${currentPage === 1 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        disabled={currentPage === 1}
      >
        First
      </button>
    );

    if (currentPage > range + 1) {
      buttons.push(<span key="ellipsis1" className="px-3 py-1">...</span>);
    }

    for (let i = Math.max(1, currentPage - range); i <= Math.min(totalPages, currentPage + range); i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 rounded ${currentPage === i ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          {i}
        </button>
      );
    }

    if (currentPage < totalPages - range) {
      buttons.push(<span key="ellipsis2" className="px-3 py-1">...</span>);
    }

    buttons.push(
      <button
        key="last"
        onClick={() => handlePageChange(totalPages)}
        className={`px-3 py-1 rounded ${currentPage === totalPages ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        disabled={currentPage === totalPages}
      >
        Last
      </button>
    );

    return buttons;
  };

  // SchoolLogo component that tries .png, then .jpg, then .jpeg, then fallback
  const SchoolLogo: React.FC<{ schoolName: string }> = ({ schoolName }) => {
    const formattedName = formatSchoolNameForImage(schoolName);

    // We will try extensions in sequence: .png -> .jpg -> .jpeg
    const [attempts, setAttempts] = useState(['png', 'jpg', 'jpeg', '']);
    const [currentExt, setCurrentExt] = useState('png');
    const [imgSrc, setImgSrc] = useState<string>('');

    useEffect(() => {
      // Construct the public URL for the current extension attempt
      if (currentExt !== '') {
        const path = `merged_school_images/${formattedName}.${currentExt}`;
        const { data } = supabase.storage.from('school-logo-images').getPublicUrl(path);
        if (data?.publicUrl) {
          setImgSrc(data.publicUrl);
        } else {
          // If no data returned, try next extension
          handleNextExtension();
        }
      } else {
        // No more extensions to try, fallback
        setImgSrc('/fallback-logo.png');
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentExt]);

    const handleNextExtension = () => {
      // Move to the next extension in the attempts list
      setAttempts((prev) => {
        const newAttempts = [...prev];
        newAttempts.shift(); // remove the first attempt
        return newAttempts;
      });
    };

    useEffect(() => {
      // Each time attempts changes, try the next extension if available
      if (attempts.length > 0) {
        setCurrentExt(attempts[0]);
      } else {
        // If no attempts left, fallback
        setImgSrc('/fallback-logo.png');
      }
    }, [attempts]);

    const handleError = () => {
      // If the current attempt failed, move on to the next extension
      handleNextExtension();
    };

    return (
      <img
        src={imgSrc}
        alt={schoolName}
        onError={handleError}
        className="w-8 h-8 object-contain"
      />
    );
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Search bar fixed at the top */}
      <div className="p-4 bg-blue-75 z-10 w-full">
        <SearchBar onSearch={handleSearch} />
      </div>

      <div className="flex flex-grow">
        {/* Left side: School list */}
        <div className="w-1/2 border-r overflow-hidden">
          <div className="mt-4 flex justify-center space-x-2">
            {renderPaginationButtons()}
          </div>
          <p>Showing {filteredSchools.length} schools</p>
          <div className="p-4 h-80 overflow-y-auto">
            <ul className="space-y-2">
              {currentSchools.map((school, index) => (
                <li
                  key={school.id || index}
                  className="flex justify-between items-center border p-3 rounded-lg text-base font-semibold hover:bg-gray-100 cursor-pointer"
                  onMouseEnter={() => { setHoveredSchool(school); setLastHoveredSchool(school); }}
                  onMouseLeave={() => setHoveredSchool(null)}
                >
                  <div className="flex items-center w-full space-x-4">
                    {/* Dynamically fetch and display the school's logo */}
                    <SchoolLogo schoolName={school.school} />

                    {/* School name with link */}
                    <Link href={`/dashboard/schools/${encodeURIComponent(school.school)}`} className="flex-grow">
                      {school.school}
                    </Link>

                    {/* Favorite button */}
                    <FavoriteButton school={school} userId={userID} />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right side: School preview */}
        <div className="w-1/2 p-4">
          {lastHoveredSchool ? (
            <SchoolPreview school={hoveredSchool || lastHoveredSchool} />
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
