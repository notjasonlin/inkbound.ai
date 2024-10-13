'use client';

import React, { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import SearchBar, { SearchFilters } from './SearchBar';
import { SchoolData } from '@/types/school';
import SchoolPreview from './SchoolPreview';
import FavoriteButton from '../[school]/components/FavoriteButton';
import { useFavorites } from '../../schools/[school]/components/FavoritesProvider';

interface SchoolListProps {
  schools: SchoolData[];
  userID: string;
}

const SchoolList: React.FC<SchoolListProps> = ({ schools, userID }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [filteredSchools, setFilteredSchools] = useState(schools);
  const [hoveredSchool, setHoveredSchool] = useState<SchoolData | null>(null);
  const [lastHoveredSchool, setLastHoveredSchool] = useState<SchoolData | null>(null);  // Track the last hovered school
  const schoolsPerPage = 10;
  const { favorites, toggleFavorite } = useFavorites();

  useEffect(() => {
    console.log('Total schools:', schools.length);
    console.log('Initial filtered schools:', filteredSchools.length);
  }, [schools, filteredSchools]);

  const filterSchools = useCallback((filters: SearchFilters) => {
    const filtered = schools.filter((school) => {
      return (
        school.school.toLowerCase().includes(filters.schoolName.toLowerCase()) &&
        school.state.toLowerCase().includes(filters.state.toLowerCase()) &&
        (filters.division === '' || school.division === filters.division)
      );
    });
    console.log('Filtered schools:', filtered.length);
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

  return (
    <div className="flex flex-col h-screen">
      {/* Search bar fixed at the top, spanning across */}
      <div className="p-4 bg-blue-75 z-10 w-full">
        <SearchBar onSearch={handleSearch} />
      </div>

      <div className="flex flex-grow">
        {/* Left side: School list with individual scrolling */}
        <div className="w-1/2 border-r overflow-hidden">
          <div className="mt-4 flex justify-center space-x-2">
            {renderPaginationButtons()}
          </div>
          <p>Showing {filteredSchools.length} schools</p>
          <div className="p-4 h-80 overflow-y-auto"> {/* Set height to limit visible items */}
            <ul className="space-y-2">
              {currentSchools.map((school, index) => (
                <li
                  key={school.id || index}
                  className="flex justify-between items-center border p-3 rounded-lg text-base font-semibold hover:bg-gray-100 cursor-pointer"
                  onMouseEnter={() => { setHoveredSchool(school); setLastHoveredSchool(school); }}
                  onMouseLeave={() => setHoveredSchool(null)}
                >
                  <div className="flex items-center w-full space-x-4">
                    {/* School name with link */}
                    <Link href={`/dashboard/schools/${encodeURIComponent(school.school)}`} className="flex-grow">
                      {school.school}
                    </Link>

                    {/* Favorite button with added right margin */}
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
            <SchoolPreview school={hoveredSchool || lastHoveredSchool} />  // Display last hovered school if no new hover
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
