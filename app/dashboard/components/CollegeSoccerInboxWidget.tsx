"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from "@/utils/supabase/client";
import { FiChevronLeft } from 'react-icons/fi';

interface Message {
  id: string;
  subject: string;
  content: string;
  from: string;
  date: string;
  isCoachMessage: boolean;
  threadId: string;
}

export default function CollegeSoccerInbox() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coachEmails, setCoachEmails] = useState<string[]>([]);
  const supabase = createClient();

  useEffect(() => {
    fetchCoachEmails();
  }, []);

  useEffect(() => {
    if (coachEmails.length > 0) {
      fetchRecentEmails();
    }
  }, [coachEmails]);

  const fetchCoachEmails = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("User not authenticated");
        return;
      }

      const { data, error } = await supabase
        .from("school_coach_emails")
        .select("coach_emails")
        .eq("user_id", user.id);

      if (error) {
        throw error;
      }

      const allCoachEmails = data.flatMap(item => item.coach_emails);
      setCoachEmails(allCoachEmails);
    } catch (error) {
      console.error('Error fetching coach emails:', error);
      setError('Failed to load coach emails. Please try again later.');
    }
  };

  const fetchRecentEmails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/gmail/widgetMessages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coachEmails }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const processedMessages = data.messages.map((message: any) => ({
        id: message.id,
        subject: message.subject || 'No Subject',
        content: message.snippet,
        from: message.from,
        date: message.date,
        isCoachMessage: coachEmails.some(email => message.from.includes(email)),
        threadId: message.id,
      }));

      setMessages(processedMessages.reverse().slice(0, 5));
    } catch (error) {
      console.error('Error fetching emails:', error);
      setError('Failed to load emails. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const openEmail = (message: Message) => {
    setSelectedMessage(message);
  };

  const goBackToInbox = () => {
    setSelectedMessage(null);
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-blue-50 to-blue-100 rounded-lg shadow-lg">
      <div className="p-4 border-b rounded-t-lg">
        <h2 className="text-lg font-bold text-gray-800 mb-2">College Recruiting Inbox</h2>
      </div>

      {selectedMessage === null ? (
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="text-center text-black">Loading emails...</div>
          ) : error ? (
            <div className="text-center text-red-500">{error}</div>
          ) : messages.length > 0 ? (
            messages.map((message) => (
              <div
                key={message.id}
                className="bg-white shadow rounded-lg p-4 cursor-pointer hover:bg-gray-100 transition"
                onClick={() => openEmail(message)}
              >
                <h3 className="font-semibold text-blue-600">{message.subject}</h3>
                <p className="text-sm text-gray-600">{message.from}</p>
                <p className="text-xs text-gray-400">{new Date(message.date).toLocaleDateString()}</p>
                <p className="text-sm mt-2 text-gray-700 truncate">{message.content}</p>
              </div>
            ))
          ) : (
            <div className="text-center text-black">No messages found.</div>
          )}
        </div>
      ) : (
        <>
          <div className="p-4 border-b rounded-t-lg flex justify-between items-center">
            <button
              onClick={goBackToInbox}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
            >
              <FiChevronLeft />
              <span>Back to Inbox</span>
            </button>
            <h2 className="text-lg font-bold text-gray-800">{selectedMessage.subject}</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <div className="bg-white shadow rounded-lg p-6">
              <p className="text-sm text-gray-600 mb-2">From: {selectedMessage.from}</p>
              <p className="text-xs text-gray-400 mb-4">{new Date(selectedMessage.date).toLocaleString()}</p>
              <div className="text-gray-800 whitespace-pre-wrap">{selectedMessage.content}</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
