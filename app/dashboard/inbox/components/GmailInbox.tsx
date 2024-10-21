"use client";

import { useState, useEffect } from 'react';
import { createClient } from "@/utils/supabase/client";
import { FiSend, FiChevronDown } from 'react-icons/fi';
import { CoachData } from '@/types/school';

interface Message {
  id: string;
  content: string;
  from: string;
  date: string;
  isCoachMessage: boolean;
  threadId: string;
}

interface GmailInboxProps {
  coachEmails: CoachData[];
}

export default function GmailInbox({ coachEmails }: GmailInboxProps) {
  const [selectedCoachEmail, setSelectedCoachEmail] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null); // Track the thread ID for replying.
  const supabase = createClient();

  // Fetch messages when a coach is selected
  useEffect(() => {
    if (selectedCoachEmail) {
      // console.log("SELECTED", selectedCoachEmail);
      fetchMessages(selectedCoachEmail);
    }
  }, [selectedCoachEmail]);

  const fetchMessages = async (coachEmail: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/gmail/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coachEmail }),
      });
      const data = await response.json();

      const processedMessages = data.messages.map((message: any) => ({
        id: message.id,
        content: message.snippet,
        from: message.from,
        date: message.date,
        isCoachMessage: message.from.includes(coachEmail),
        threadId: message.id, // Store the thread ID
      }));

      setMessages(processedMessages.reverse());
      if (processedMessages.length > 0) {
        console.log(processedMessages[0].threadId);
        setThreadId(processedMessages[0].threadId); // Use the first message's threadId for replying.
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    console.log("ENTER")

    console.log(newMessage.trim());
    console.log(selectedCoachEmail);
    console.log(threadId)


    if (!newMessage.trim() || !selectedCoachEmail || !threadId) return;

    console.log("ENTER2")
  
    setIsSending(true);
    try {
      const response = await fetch('/api/gmail/sendMessage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coachEmail: selectedCoachEmail,
          message: newMessage,
          threadId, // Send as part of the existing thread if needed
        }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
  
      const { id } = await response.json();
      const sentMessage = {
        id: `temp-${Date.now()}`,
        content: newMessage,
        from: 'You',
        date: new Date().toISOString(),
        isCoachMessage: false,
        threadId,
      };
  
      setMessages((prevMessages) => [sentMessage, ...prevMessages]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };
  

  return (
    <div className="flex flex-col h-full bg-gradient-to-b text-black from-blue-50 to-blue-100 rounded-lg shadow-lg">
      <div className="p-4 border-b rounded-t-lg">
        <h2 className="text-lg font-bold text-gray-800 mb-2">Filter by Coach</h2>
        <div className="relative">
          <select
            value={selectedCoachEmail || ''}
            onChange={(e) => {
              // console.log("E", e);
              setSelectedCoachEmail(e.target.value)
            }}
            className="w-full py-2 px-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Coaches</option>
            {coachEmails.map(coach => (
              <option key={coach.email} value={coach.email}>
                {coach.name + " — " + coach.position}
              </option>
            ))}
          </select>
          {/* <FiChevronDown className="absolute top-3 right-3 text-black pointer-events-none" /> */}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="text-center text-black">Loading messages...</div>
        ) : messages.length > 0 ? (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isCoachMessage ? 'justify-start' : 'justify-end'
                }`}
            >
              <div
                className={`max-w-xs p-3 rounded-lg shadow-md ${message.isCoachMessage ? 'bg-gray-300 text-black' : 'bg-blue-500 text-white'
                  }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className="text-xs mt-2 text-black">
                  {new Date(message.date).toLocaleString()}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-black">No messages found.</div>
        )}
      </div>



      <div className="p-4 border-t bg-gradient-to-b from-blue-50 to-blue-100 rounded-b-lg flex items-center space-x-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a new message..."
          className="flex-1 py-2 px-4 border rounded-lg focus:outline-none text-black focus:ring focus:border-blue-500"
        />
        <button
          onClick={handleSendMessage}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          disabled={isSending || !newMessage.trim()}
        >
          {isSending ? 'Sending...' : <FiSend />}
        </button>
      </div>
    </div>
  );
}
