"use client";

import { useState, useEffect, useCallback } from 'react';
import { createClient } from "@/utils/supabase/client";
import { gmail_v1 } from 'googleapis';
import SchoolSidebar from './components/SchoolSidebar';
import EmailFilter from './components/EmailFilter';
import GmailInbox from './components/GmailInbox';

export default function Inbox() {
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);
  const [coachEmails, setCoachEmails] = useState<Record<string, string>>({});
  const [selectedCoachEmail, setSelectedCoachEmail] = useState<string | null>(null);
  const [gmailClient, setGmailClient] = useState<gmail_v1.Gmail | null>(null);
  const supabase = createClient();

  const initializeGmailClient = useCallback(async () => {
    try {
      const response = await fetch('/api/gmail/init');
      if (!response.ok) {
        throw new Error('Failed to initialize Gmail client');
      }
      const gmail = await response.json();
      setGmailClient(gmail);
    } catch (error) {
      console.error('Error initializing Gmail client:', error);
    }
  }, []);

  const fetchCoachEmails = useCallback(async (schoolId: string) => {
    const { data, error } = await supabase
      .from('school_coach_emails')
      .select('coach_emails')
      .eq('school_id', schoolId)
      .single();

    if (error) {
      console.error('Error fetching coach emails:', error);
      return;
    }

    setCoachEmails(data.coach_emails);
  }, [supabase]);

  useEffect(() => {
    initializeGmailClient();
  }, [initializeGmailClient]);

  useEffect(() => {
    if (selectedSchoolId) {
      fetchCoachEmails(selectedSchoolId);
    }
  }, [selectedSchoolId, fetchCoachEmails]);

  const filteredCoachEmails = selectedCoachEmail
    ? [selectedCoachEmail]
    : Object.values(coachEmails);

  return (
    <div className="flex h-full">
      <SchoolSidebar onSelectSchool={setSelectedSchoolId} />
      <div className="flex-1 p-6">
        <h1 className="text-3xl font-semibold mb-4">Inbox</h1>
        {selectedSchoolId ? (
          <>
            <GmailInbox coachEmails={coachEmails} />
          </>
        ) : (
          <p>Select a school to view emails</p>
        )}
      </div>
    </div>
  );
}
