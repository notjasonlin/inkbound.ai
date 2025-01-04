"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { SchoolData } from '@/types/school/index';
import { createClient } from "@/utils/supabase/client";
import { FiSearch } from "react-icons/fi";

interface SchoolSelectorProps {
  onSelectSchool: (school: School) => void;
}

type EmailStatus = 'sent' | 'needs_reply' | null;

interface SchoolEmailStatus {
  [schoolId: string]: EmailStatus;
}

interface CachedData {
  timestamp: number;
  emailStatuses: SchoolEmailStatus;
}

const CACHE_KEY = 'emailStatuses';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

// Add School interface
interface School {
  id: string;
  name: string;
  school: string;
  // Add other required properties from SchoolData
}

const SchoolSelector: React.FC<SchoolSelectorProps> = ({ onSelectSchool }) => {
  const supabase = createClient();
  const [schools, setSchools] = useState<SchoolData[]>([]);
  const [filteredSchools, setFilteredSchools] = useState<SchoolData[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<SchoolData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [emailStatuses, setEmailStatuses] = useState<SchoolEmailStatus>({});

  const getCachedStatuses = useCallback(() => {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { timestamp, emailStatuses: cachedStatuses }: CachedData = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_DURATION) {
        return cachedStatuses;
      }
    }
    return null;
  }, []);

  const cacheStatuses = useCallback((statuses: SchoolEmailStatus) => {
    const cacheData: CachedData = {
      timestamp: Date.now(),
      emailStatuses: statuses
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
  }, []);

  useEffect(() => {
    const fetchFavoriteSchools = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setError("Please log in to view schools");
          setIsLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from("favorite_schools")
          .select("data")
          .eq("uuid", user.id)
          .single();

        if (error) {
          setError("Failed to fetch schools");
          setIsLoading(false);
          return;
        }

        if (data && data.data) {
          const schoolsData = Array.isArray(data.data) ? data.data : [];
          setSchools(schoolsData);
          setFilteredSchools(schoolsData);
        }
      } catch (err) {
        setError("An unexpected error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavoriteSchools();
  }, [supabase]);

  useEffect(() => {
    const sortSchools = (schools: SchoolData[]) => {
      return [...schools].sort((a, b) => {
        const statusA = emailStatuses[a.id];
        const statusB = emailStatuses[b.id];
        
        // Put 'needs_reply' at the top
        if (statusA === 'needs_reply' && statusB !== 'needs_reply') return -1;
        if (statusB === 'needs_reply' && statusA !== 'needs_reply') return 1;
        
        // Sort alphabetically by school name if status is the same
        return a.school.localeCompare(b.school);
      });
    };

    const filtered = searchQuery
      ? schools.filter(school =>
          school.school.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : schools;

    // Sort the filtered schools
    const sortedFiltered = sortSchools(filtered);
    setFilteredSchools(sortedFiltered);
  }, [searchQuery, schools, emailStatuses]);

  useEffect(() => {
    const fetchEmailStatuses = async () => {
      // Try to get cached data first
      const cachedStatuses = getCachedStatuses();
      if (cachedStatuses) {
        setEmailStatuses(cachedStatuses);
      }

      // Fetch fresh data in the background
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: coachEmailsData } = await supabase
          .from('school_coach_emails')
          .select('school_id, coach_emails')
          .eq('user_id', user.id);

        if (!coachEmailsData) return;

        const statusMap: SchoolEmailStatus = {};
        const fetchPromises = coachEmailsData.map(async (schoolData) => {
          if (!schoolData.coach_emails?.length) return;

          const response = await fetch('/api/gmail/widgetMessages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ coachEmails: schoolData.coach_emails })
          });

          const data = await response.json();
          if (data.messages?.length > 0) {
            const sortedMessages = data.messages.sort((a: any, b: any) => 
              new Date(b.date).getTime() - new Date(a.date).getTime()
            );

            const latestMessage = sortedMessages[0];
            const isFromCoach = schoolData.coach_emails.some((email: string) => 
              latestMessage.from.toLowerCase().includes(email.toLowerCase())
            );
            statusMap[schoolData.school_id] = isFromCoach ? 'needs_reply' : 'sent';
          }
        });

        await Promise.all(fetchPromises);
        setEmailStatuses(statusMap);
        cacheStatuses(statusMap);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    if (schools.length > 0) {
      fetchEmailStatuses();
    }
  }, [schools, supabase, getCachedStatuses, cacheStatuses]);

  const handleSchoolClick = (school: SchoolData) => {
    setSelectedSchool(school);
    
    const selectedSchool: School = {
      id: school.id,
      name: school.school,
      school: school.school,
    };
    onSelectSchool(selectedSchool);
  };

  const getStatusText = (schoolId: string): string | null => {
    const status = emailStatuses[schoolId];
    if (!status) return null;
    return status === 'sent' ? 'Email Sent' : 'Needs Reply';
  };

  return (
    <div className="w-75 h-screen bg-white border-r border-gray-200 p-4 flex flex-col">
      <h2 className="text-xl font-bold text-blue-800 mb-4">Schools</h2>
      
      <div className="relative mb-4">
        <FiSearch className="absolute top-3 left-3 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search schools..."
          className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:border-blue-400"
        />
      </div>

      {isLoading ? (
        <div className="text-center text-gray-600">Loading schools...</div>
      ) : error ? (
        <div className="text-center text-red-600">{error}</div>
      ) : filteredSchools.length > 0 ? (
        <ul className="divide-y divide-gray-200 flex-1 overflow-y-auto">
          {filteredSchools.map((school) => (
            <li
              key={school.id}
              className={`p-3 hover:bg-blue-100 cursor-pointer transition-colors duration-300 ${
                selectedSchool?.id === school.id ? 'bg-blue-200' : ''
              }`}
              onClick={() => handleSchoolClick(school)}
            >
              <span className="text-blue-900 font-medium block">{school.school}</span>
              {getStatusText(school.id) && (
                <span className={`text-xs mt-1 block ${
                  emailStatuses[school.id] === 'sent' ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {getStatusText(school.id)}
                </span>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center text-gray-600">No Schools Found.</div>
      )}
    </div>
  );
};

export default SchoolSelector;