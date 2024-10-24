"use client";

import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import EmailComposer from "./components/EmailComposer";
import { SchoolData } from "@/types/school/index";
import Link from "next/link";
import { motion } from "framer-motion";

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
    <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Sidebar */}
      <Sidebar onSelectSchool={handleSelectSchool} />

      {/* Main Content Area */}
      <motion.main
        className="flex-1 p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-5xl mx-auto bg-gradient-to-r from-blue-50 to-babyblue-200 p-8 shadow-xl rounded-2xl">
          <div className="mb-6 flex justify-between items-center">
            {/* Back link to Auto Compose */}
            <Link href="/dashboard/auto-compose" className="text-blue-700 hover:underline text-sm font-medium">
              ← Go to Auto Compose
            </Link>
          </div>

          {/* Email Composer Area */}
          {selectedSchools.length > 0 ? (
            <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
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
        </div>
      </motion.main>
    </div>
  );
}
