'use client';

import React, { useState } from 'react';

interface SearchBarProps {
  onSearch: (filters: SearchFilters) => void;
}

export interface SearchFilters {
  schoolName: string;
  state: string;
  division: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [filters, setFilters] = useState<SearchFilters>({
    schoolName: '',
    state: '',
    division: '',
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(filters);
    setIsModalOpen(false); // Close modal on search
  };

  const handleReset = () => {
    setFilters({ schoolName: '', state: '', division: '' });
  };

  return (
    <div className="relative">
      {/* Top Bar with Search Input and Filters Button */}
      <div className="flex justify-between items-center bg-white shadow-md p-4 rounded-lg">
        {/* Search Input */}
        <input
          type="text"
          name="schoolName"
          placeholder="Search"
          value={filters.schoolName}
          onChange={handleChange}
          className="flex-1 px-4 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Filters Button */}
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="ml-4 flex items-center px-4 py-2 bg-gray-100 border rounded-lg text-gray-800 hover:bg-gray-200 focus:ring-2 focus:ring-blue-400 focus:outline-none"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-5 h-5 mr-2 text-gray-600"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L15 12.414V20a1 1 0 01-.553.894l-4 2A1 1 0 019 22v-9.586L3.293 6.707A1 1 0 013 6V4z"
            />
          </svg>
          Filters
        </button>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
          {/* Modal Content */}
          <div className="bg-white rounded-lg shadow-lg p-6 w-11/12 max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Filters</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* State */}
              <input
                type="text"
                name="state"
                placeholder="State"
                value={filters.state}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              {/* Division */}
              <select
                name="division"
                value={filters.division}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Divisions</option>
                <option value="I">Division I</option>
                <option value="II">Division II</option>
                <option value="III">Division III</option>
              </select>

              {/* Buttons */}
              <div className="flex justify-between items-center">
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-red-500 hover:underline"
                >
                  Reset
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                >
                  Apply
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
