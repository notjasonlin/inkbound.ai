"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from "@/utils/supabase/client";
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

interface Message {
  id: string;
  subject: string;
  content: string; // Full email content (potentially HTML encoded)
  from: string;
  date: string;
  isCoachMessage: boolean;
  threadId: string;
}

function decodeHtml(html: string): string {
  const txt = document.createElement('textarea');
  txt.innerHTML = html;
  return txt.value;
}

export default function CollegeSoccerInbox() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coachEmails, setCoachEmails] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const messagesPerPage = 3;
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
      console.error('Error fetching data:', error);
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
        content: message.fullContent || message.snippet,
        from: message.from,
        date: message.date,
        isCoachMessage: coachEmails.some(email => message.from.includes(email)),
        threadId: message.id,
      }));

      const sortedMessages = processedMessages.sort((a: Message, b: Message) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      setMessages(sortedMessages);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load emails. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const openEmail = async (message: Message) => {
    // If content is a snippet, you might fetch full message here. 
    // Assume content is already full or returned as is.
    setSelectedMessage(message);
  };

  const goBackToInbox = () => {
    setSelectedMessage(null);
  };

  const handleNextPage = () => {
    if (currentPage < Math.ceil(messages.length / messagesPerPage) - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const paginatedMessages = messages.slice(
    currentPage * messagesPerPage,
    (currentPage + 1) * messagesPerPage
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col h-[80vh]">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 rounded-t-lg bg-white flex items-center justify-between">
          {selectedMessage ? (
            <>
              <button
                onClick={goBackToInbox}
                className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-full text-white hover:bg-blue-700 transition-transform transform hover:scale-110"
              >
                <FiChevronLeft size={24} />
              </button>
              <h2 className="text-lg font-bold text-gray-800 flex-1 ml-4 truncate">
                {selectedMessage.subject}
              </h2>
              <div className="w-10" />
            </>
          ) : (
            <h2 className="text-lg font-bold text-gray-800">College Recruiting Inbox</h2>
          )}
        </div>

        {selectedMessage === null ? (
          // Inbox View
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-200 border-t-transparent"></div>
                </div>
              ) : error ? (
                <div className="text-center text-red-500">{error}</div>
              ) : paginatedMessages.length > 0 ? (
                paginatedMessages.map((message) => (
                  <div
                    key={message.id}
                    className="bg-white shadow rounded-lg p-4 cursor-pointer hover:bg-gray-100 transition relative"
                    onClick={() => openEmail(message)}
                  >
                    <h3 className="font-semibold text-blue-600 truncate">{message.subject}</h3>
                    <p className="text-sm text-gray-600">{message.from}</p>
                    <p className="text-xs text-gray-400">{new Date(message.date).toLocaleDateString()}</p>
                    <p className="text-sm mt-2 text-gray-700 truncate">
                      {decodeHtml(message.content)}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center text-black">No messages found.</div>
              )}
            </div>

            {messages.length > messagesPerPage && (
              <div className="p-4 flex justify-between items-center">
                <button
                  onClick={handlePreviousPage}
                  disabled={currentPage === 0}
                  className={`p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition ${currentPage === 0 ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                >
                  <FiChevronLeft className="text-blue-600" />
                </button>
                <span className="text-sm text-gray-600">
                  Page {currentPage + 1} of {Math.ceil(messages.length / messagesPerPage)}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage >= Math.ceil(messages.length / messagesPerPage) - 1}
                  className={`p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition ${currentPage >= Math.ceil(messages.length / messagesPerPage) - 1 ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                >
                  <FiChevronRight className="text-blue-600" />
                </button>
              </div>
            )}
          </>
        ) : (
        // Single Email View
        <div className="flex-1 overflow-y-auto p-4">
          <div className="bg-white shadow rounded-lg p-6 h-[80vh] overflow-auto">
            <p className="text-sm text-gray-600 mb-1 font-medium">From: {selectedMessage.from}</p>
            <p className="text-xs text-gray-400 mb-4">
              {new Date(selectedMessage.date).toLocaleString()}
            </p>

            <div className="text-gray-800 whitespace-pre-wrap break-words">
              {decodeHtml(selectedMessage.content)}
            </div>
          </div>
        </div>

        )}
      </div>
    </div>
  );
}
