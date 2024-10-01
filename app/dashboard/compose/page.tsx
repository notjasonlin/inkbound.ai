"use client";

import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import EmailComposer from "./components/EmailComposer";
import { SchoolData } from "@/types/school/index";
import Link from "next/link";

export default function ComposePage() {
  const [selectedSchools, setSelectedSchools] = useState<SchoolData[]>([]);
  const [allSchools, setAllSchools] = useState<SchoolData[]>([]);

  const handleSelectSchool = (school: SchoolData) => {
    if (!selectedSchools.some((s) => s.id === school.id)) {
      setSelectedSchools((prev) => [...prev, school]);
    }
  };

  const handleRemoveSchool = (schoolId: string) => {
    console.log("Removing school:", schoolId);
    setSelectedSchools((prev) => prev.filter((s) => s.id !== schoolId));
  };

  return (
    <div className="flex flex-col md:flex-row h-full min-h-screen">
      {/* Sidebar - Responsive: hidden on mobile, visible on larger screens */}
      <Sidebar onSelectSchool={handleSelectSchool} />

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 bg-white shadow-lg">
        {/* Header with navigation link */}
        <div className="mb-4 sm:mb-6">
          <Link href="/dashboard/auto-compose" className="text-blue-600 hover:underline text-sm sm:text-lg font-medium">
            ← Go to Auto Compose
          </Link>
        </div>

        {/* Responsive email composer area */}
        {selectedSchools.length > 0 ? (
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md space-y-4 sm:space-y-6">
            <EmailComposer
              schools={selectedSchools}
              allSchools={allSchools}
              onAddSchool={handleSelectSchool}
              onRemoveSchool={handleRemoveSchool}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-600 text-center text-base sm:text-lg">
              Select a school from the school selector to compose an email.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
