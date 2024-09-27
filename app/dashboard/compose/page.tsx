"use client";

import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import EmailComposer from './components/EmailComposer';
import { SchoolData } from '@/types/school/index';
import Link from 'next/link';

export default function ComposePage() {
  const [selectedSchools, setSelectedSchools] = useState<SchoolData[]>([]);
  const [allSchools, setAllSchools] = useState<SchoolData[]>([]);

  const handleSelectSchool = (school: SchoolData) => {
    if (!selectedSchools.some(s => s.id === school.id)) {
      setSelectedSchools(prev => [...prev, school]);
    }
  };

  const handleRemoveSchool = (schoolId: string) => {
    console.log('Removing school:', schoolId);
    setSelectedSchools(prev => prev.filter(s => s.id !== schoolId));
  };

  return (
    <div className="flex h-full">
      <Sidebar onSelectSchool={handleSelectSchool} />
      <main className="flex-1 p-6 bg-gray-100">
        <div className="mb-4">
          <Link href="/dashboard/auto-compose" className="text-blue-500 hover:underline">
            Go to Auto Compose
          </Link>
        </div>
        {selectedSchools.length > 0 ? (
          <EmailComposer 
            schools={selectedSchools} 
            allSchools={allSchools}
            onAddSchool={handleSelectSchool}
            onRemoveSchool={handleRemoveSchool}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-600">Select a school from the sidebar to compose an email.</p>
          </div>
        )}
      </main>
    </div>
  );
}