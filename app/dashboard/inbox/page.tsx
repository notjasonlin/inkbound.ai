"use client";

import { useState, useEffect, useCallback } from 'react';
import { createClient, getCoaches } from "@/utils/supabase/client";
import { gmail_v1 } from 'googleapis';
import SchoolSidebar from './components/SchoolSidebar';
import GmailInbox from './components/GmailInbox';
import { CoachData } from '@/types/school';

interface School {
  id: string;
  name: string;
}

export default function Inbox() {
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [coachEmails, setCoachEmails] = useState<CoachData[]>([]);
  const [selectedCoachEmail, setSelectedCoachEmail] = useState<string | null>(null);
  const [gmailClient, setGmailClient] = useState<gmail_v1.Gmail | null>(null);
  const supabase = createClient();

  const fetchCoachEmails = useCallback(async (schoolId: string) => {
    if (schoolId && schoolId !== "") {
      const coaches = await getCoaches(schoolId)
      setCoachEmails(coaches);
    }
  }, [supabase]);

  useEffect(() => {
    if (selectedSchool) {
      fetchCoachEmails(selectedSchool.id);
    }
  }, [selectedSchool, fetchCoachEmails]);

  const filteredCoachEmails = selectedCoachEmail
    ? [selectedCoachEmail]
    : Object.values(coachEmails);

  return (

    <div className="flex flex-col md:flex-row h-full bg-blue-50">
      <div className="w-full md:w-1/4 p-4">
        <SchoolSidebar onSelectSchool={setSelectedSchool} />
      </div>
      <div className="flex-1 p-6">
        <div className="bg-blue-50 rounded-lg shadow-md p-6 h-full flex flex-col">
          <h1 className="text-3xl font-semibold mb-4">Inbox</h1>
          {selectedSchool?.id ? (
            <GmailInbox coachEmails={coachEmails} />
          ) : (
            <p className="text-gray-500">Select a school to view emails.</p>
          )}
        </div>
      </div>
    </div>
  );
}
