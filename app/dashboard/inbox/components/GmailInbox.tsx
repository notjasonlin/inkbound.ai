"use client";

import { useState, useEffect } from 'react';
import { createClient } from "@/utils/supabase/client";
import { FiSend } from 'react-icons/fi';
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
  const [selectedCoachEmail, setSelectedCoachEmail] = useState<string>(coachEmails[0]?.email || '');
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    if (coachEmails.length > 0) {
      setSelectedCoachEmail(coachEmails[0].email);
    }
  }, [coachEmails]);

  useEffect(() => {
    if (selectedCoachEmail) {
      fetchMessages(selectedCoachEmail);
    }
  }, [selectedCoachEmail]);

  const fetchMessages = async (coachEmail: string) => {
    setLoading(true);
    setMessages([]);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error("Error: User not authenticated");
      } else {
        const { data: trackingData } = await supabase
          .from('user_message_tracking')
          .select('last_fetched_message_id, id')
          .eq('user_id', user.id)
          .eq('coach_email', coachEmail)
          .single();

        const response = await fetch('/api/gmail/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ coachEmail }),
        });

        if (!response.ok) throw new Error('Error fetching messages');

        const data = await response.json();

        const processedMessages: Message[] = data.messages.map((message: any) => ({
          id: message.id,
          content: message.content,
          from: message.from,
          date: message.date,
          isCoachMessage: message.from.includes(coachEmail),
          threadId: message.id,
        })).reverse();

        let newMessages = processedMessages;
        if (trackingData) {
          const lastFetchedMessageId = trackingData.last_fetched_message_id;
          const idx = processedMessages.findIndex((m) => m.id === lastFetchedMessageId);
          if (idx >= 0) {
            newMessages = processedMessages.slice(idx + 1);
          }
        }

        // Optionally send new messages to external API if needed
        for (const message of newMessages) {
          if (message.isCoachMessage) {
            await fetch('https://jtf79lf49l.execute-api.us-east-2.amazonaws.com/fetch-email-data', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                emailId: message.id,
                content: message.content,
                from: message.from,
                date: message.date,
                threadId: message.threadId
              }),
            });
          }
        }

        // Update tracking if new messages
        if (newMessages.length > 0) {
          const latestMessageId = newMessages[newMessages.length - 1].id;
          const toTrack: any = {
            user_id: user.id,
            coach_email: coachEmail,
            last_fetched_message_id: latestMessageId
          };
          if (trackingData && trackingData.id) toTrack.id = trackingData.id;

          const { error: upsertError } = await supabase
            .from('user_message_tracking')
            .upsert(toTrack);
          if (upsertError) console.error('Error updating tracking:', upsertError);
        }

        setMessages(processedMessages);

        if (processedMessages.length > 0) {
          setThreadId(processedMessages[0].threadId);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCoachChange = (email: string) => {
    setSelectedCoachEmail(email);
    setNewMessage('');
    setThreadId(null);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedCoachEmail || !threadId) return;

    setIsSending(true);
    try {
      const response = await fetch('/api/gmail/sendMessage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coachEmail: selectedCoachEmail,
          message: newMessage,
          threadId,
        }),
      });

      if (!response.ok) {
        throw new Error('Error sending message.');
      }

      const sentMessage: Message = {
        id: `temp-${Date.now()}`,
        content: newMessage,
        from: 'You',
        date: new Date().toISOString(),
        isCoachMessage: false,
        threadId: threadId!,
      };

      setMessages((prevMessages) => [sentMessage, ...prevMessages]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending data:', error);
    } finally {
      setIsSending(false);
    }
  };

  const currentCoach = coachEmails.find(c => c.email === selectedCoachEmail);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 py-8 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col h-[80vh]">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 rounded-t-lg bg-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Your Inbox</h2>
            {currentCoach && (
              <p className="text-sm text-gray-600 mt-1">
                Conversation with <span className="font-medium">{currentCoach.name}</span> ({currentCoach.position})
              </p>
            )}
          </div>
          <div className="relative w-full sm:w-64">
            <select
              value={selectedCoachEmail}
              onChange={(e) => handleCoachChange(e.target.value)}
              className="w-full py-2 px-3 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              {coachEmails.map(coach => (
                <option key={coach.email} value={coach.email}>
                  {coach.name} — {coach.position}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading ? (
            <div className="text-center text-black">Loading messages...</div>
          ) : messages.length > 0 ? (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isCoachMessage ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-2xl w-fit p-4 rounded-lg shadow-sm border whitespace-pre-wrap break-words leading-relaxed ${
                    message.isCoachMessage
                      ? 'bg-gray-100 border-gray-300 text-gray-900'
                      : 'bg-blue-600 border-blue-700 text-white'
                  }`}
                  style={{ whiteSpace: 'pre-wrap' }}
                >
                  {message.content}
                  <p className={`text-xs mt-3 ${message.isCoachMessage ? 'text-gray-700' : 'text-blue-100'}`}>
                    {new Date(message.date).toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-black">No messages found.</div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-200 bg-white rounded-b-lg flex items-center space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a new message..."
            className="flex-1 py-2 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black text-sm"
          />
          <button
            onClick={handleSendMessage}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center text-sm font-semibold"
            disabled={isSending || !newMessage.trim()}
          >
            {isSending ? 'Sending...' : <FiSend className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
