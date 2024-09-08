'use client';

import React, { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import SearchBar, { SearchFilters } from './SearchBar';

interface School {
  school: string;
  state: string;
  division: string;
}

interface SchoolListProps {
  schools: School[];
}

const SchoolList: React.FC<SchoolListProps> = ({ schools }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [filteredSchools, setFilteredSchools] = useState(schools);
  const schoolsPerPage = 10;

  useEffect(() => {
    console.log('Total schools:', schools.length);
    console.log('Initial filtered schools:', filteredSchools.length);
  }, [schools, filteredSchools]);

  const filterSchools = useCallback((filters: SearchFilters) => {
    const filtered = schools.filter(school => 
      school.school.toLowerCase().includes(filters.schoolName.toLowerCase()) &&
      school.state.toLowerCase().includes(filters.state.toLowerCase()) &&
      (filters.division === '' || school.division === filters.division)
    );
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
    const range = 2; // Number of pages to show before and after current page

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
    <div>
      <SearchBar onSearch={handleSearch} />
      <p>Showing {filteredSchools.length} schools</p>
      <ul className="space-y-2">
        {currentSchools.map((school) => (
          <li key={school.school} className="flex justify-between items-center border p-2 rounded">
            <Link href={`/dashboard/schools/${encodeURIComponent(school.school)}`}>
              {school.school} - {school.state}, Division {school.division}
            </Link>
            <div className="relative">
              <button
                onClick={() => toggleDropdown(school.school)}
                className="bg-blue-500 text-white px-2 py-1 rounded"
              >
                ⋮
              </button>
              {openDropdown === school.school && (
                <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg">
                  <Link href={`/dashboard/schools/${encodeURIComponent(school.school)}`} className="block px-4 py-2 hover:bg-gray-100">
                    View Details
                  </Link>
                  {/* Add more dropdown options here */}
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex justify-center space-x-2">
        {renderPaginationButtons()}
      </div>
    </div>
  );
};

export default SchoolList;
