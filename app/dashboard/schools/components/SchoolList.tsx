'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface SchoolListProps {
  schools: string[];
}

const SchoolList: React.FC<SchoolListProps> = ({ schools }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const schoolsPerPage = 10;

  const indexOfLastSchool = currentPage * schoolsPerPage;
  const indexOfFirstSchool = indexOfLastSchool - schoolsPerPage;
  const currentSchools = schools.slice(indexOfFirstSchool, indexOfLastSchool);

  const totalPages = Math.ceil(schools.length / schoolsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const toggleDropdown = (school: string) => {
    setOpenDropdown(openDropdown === school ? null : school);
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
      <ul className="space-y-2">
        {currentSchools.map((school) => (
          <li key={school} className="flex justify-between items-center border p-2 rounded">
            <Link href={`/schools/${encodeURIComponent(school)}`}>
              {school}
            </Link>
            <div className="relative">
              <button
                onClick={() => toggleDropdown(school)}
                className="bg-blue-500 text-white px-2 py-1 rounded"
              >
                ⋮
              </button>
              {openDropdown === school && (
                <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg">
                  <Link href={`/schools/${encodeURIComponent(school)}`} className="block px-4 py-2 hover:bg-gray-100">
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
