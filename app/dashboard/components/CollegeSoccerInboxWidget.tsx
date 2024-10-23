"use client";

import { useState, useEffect, useCallback } from 'react';
import { gmail_v1 } from 'googleapis';
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
  const [gmailClient, setGmailClient] = useState<gmail_v1.Gmail | null>(null);

  // Initialize Gmail client
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

  // Fetch emails using the initialized Gmail client
  const fetchEmails = useCallback(async () => {
    if (!gmailClient) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/gmail/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ numEmails: 5 }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error from server:", errorData);
        throw new Error(`Failed to fetch emails: ${errorData.error}`);
      }

      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error("Error fetching emails:", error);
      setError('Failed to load emails.');
    } finally {
      setLoading(false);
    }
  }, [gmailClient]);

  useEffect(() => {
    initializeGmailClient();
  }, [initializeGmailClient]);

  useEffect(() => {
    if (gmailClient) {
      fetchEmails();
    }
  }, [gmailClient, fetchEmails]);

  const openEmail = (message: Message) => {
    setSelectedMessage(message);
  };

  const goBackToInbox = () => {
    setSelectedMessage(null);
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-blue-50 to-blue-100 rounded-lg shadow-lg">
      {selectedMessage === null ? (
        <>
          {/* Email Preview Dashboard */}
          <div className="p-4 border-b rounded-t-lg">
            <h2 className="text-lg font-bold text-gray-800 mb-2">College Recruiting Inbox</h2>
          </div>

          {/* Email Preview Cards */}
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
                  onClick={() => openEmail(message)} // Open the email
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
        </>
      ) : (
        <>
          {/* Full Email View */}
          <div className="p-4 border-b rounded-t-lg flex justify-between items-center">
            <button
              onClick={goBackToInbox} // Go back to email previews
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
            >
              <FiChevronLeft />
              <span>Back to Inbox</span>
            </button>
            <h2 className="text-lg font-bold text-gray-800">{selectedMessage.subject}</h2>
          </div>

          {/* Full Email Content */}
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
