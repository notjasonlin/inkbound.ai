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
    <form onSubmit={handleSubmit} className="mb-4 p-4 bg-gray-100 rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label htmlFor="schoolName" className="block mb-1">School Name</label>
          <input
            type="text"
            id="schoolName"
            name="schoolName"
            value={filters.schoolName}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="Enter school name"
          />
        </div>
        <div>
          <label htmlFor="state" className="block mb-1">State</label>
          <input
            type="text"
            id="state"
            name="state"
            value={filters.state}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="Enter state"
          />
        </div>
        <div>
          <label htmlFor="division" className="block mb-1">Division</label>
          <select
            id="division"
            name="division"
            value={filters.division}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="">All Divisions</option>
            <option value="I">Division I</option>
            <option value="II">Division II</option>
            <option value="III">Division III</option>
          </select>
        </div>
        <div className="mt-4">
          <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
            Search
          </button>
        </div>
      </div>
    </form>
  );
};

export default SearchBar;
