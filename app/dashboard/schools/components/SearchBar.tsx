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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(filters);
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg rounded-lg p-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4">
        <div>
          <label htmlFor="schoolName" className="block text-sm font-semibold text-blue-800 mb-1">
            School Name
          </label>
          <input
            type="text"
            id="schoolName"
            name="schoolName"
            value={filters.schoolName}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter school name"
          />
        </div>
        <div>
          <label htmlFor="state" className="block text-sm font-semibold text-blue-800 mb-1">
            State
          </label>
          <input
            type="text"
            id="state"
            name="state"
            value={filters.state}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter state"
          />
        </div>
        <div>
          <label htmlFor="division" className="block text-sm font-semibold text-blue-800 mb-1">
            Division
          </label>
          <select
            id="division"
            name="division"
            value={filters.division}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Divisions</option>
            <option value="I">Division I</option>
            <option value="II">Division II</option>
            <option value="III">Division III</option>
          </select>
        </div>
        <div className="flex items-end">
          <button
            type="submit"
            className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-lg shadow-md hover:bg-blue-600 transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            Search
          </button>
        </div>
      </div>
    </form>
  );
};

export default SearchBar;
