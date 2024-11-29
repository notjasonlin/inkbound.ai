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
    setMessages([]); // Clear existing messages when switching coaches



    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error("Error fetching data");
      } else {
        const { data: trackingData, error: trackingError } = await supabase
          .from('user_message_tracking')
          .select('last_fetched_message_id, id')
          .eq('user_id', user.id)
          .eq('coach_email', coachEmail)
          .single();

        // if (trackingError) {
        //   console.error('Error fetching tracking data:', trackingError);
        // }

        // Grab messages
        const response = await fetch('/api/gmail/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ coachEmail, }),
        });
        const data = await response.json();

        const processedMessages: Message[] = data.messages.map((message: any) => ({
          id: message.id,
          content: message.content,
          from: message.from,
          date: message.date,
          isCoachMessage: message.from.includes(coachEmail),
          threadId: message.id, // Should be separate id???
        })).reverse();
        // End grab messages


        let newMessages = processedMessages;
        if (trackingData) {
          const lastFetchedMessageId = trackingData ? trackingData.last_fetched_message_id : null;
          const idx = processedMessages.findIndex((message) => message.id === lastFetchedMessageId);
          if (idx >= 0) {
            newMessages = processedMessages.slice(idx + 1);
          }
        }


        console.log("MESSAGES", newMessages);
        // Send each new message to the AWS API endpoint
        for (const message of newMessages) {
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

        if (newMessages.length > 0) {
          // Update the last fetched message ID with the most recent message
          const latestMessageId = newMessages[newMessages.length - 1].id;
          console.log("LATEST", latestMessageId);

          const toTrack: any = {
            user_id: user.id,
            coach_email: coachEmail,
            last_fetched_message_id: latestMessageId
          }
          if (trackingData && trackingData.id) toTrack.id = trackingData.id;

          const { error: upsertError } = await supabase
            .from('user_message_tracking')
            .upsert(toTrack);

          if (upsertError) {
            console.error('Error updating tracking data:', upsertError);
          }
        }

        setMessages(processedMessages);

        if (processedMessages.length > 0) {
          setThreadId(processedMessages[0].threadId); // THREAD ID MAY NOT BE ACCURATE
          // Fetch messages from the API
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
        throw new Error('Failed to send message');
      }

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
      console.error('Error sending data:', error);
    } finally {
      setIsSending(false);
    }
  };

  const formatMessageContent = (content: string) => {
    // Normalize line endings
    const normalizedContent = content.replace(/\r\n/g, '\n'); // Replace all \r\n with \n

    // Split into paragraphs by two consecutive newlines
    const paragraphs = normalizedContent.split('\n');

    // Wrap paragraphs with <p> and preserve single newlines as <br>
    return paragraphs.map((p: string) => (p.trim() ? `<p>${p}</p>` : "<br>")).join("");
  }


  const generateHTMLContent = (paragraphs: string) => {
    return `<!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <style>
      p { margin: 0 0 70px; line-height: 1.8; }
      body { font-family: Arial, sans-serif; }
    </style>
  </head>
  <body>
    ${paragraphs}
  </body>
  </html>`;
  }


  return (
    <div className="flex flex-col h-full bg-gradient-to-b text-black from-blue-50 to-blue-100 rounded-lg shadow-lg">
      <div className="p-4 border-b rounded-t-lg">
        <h2 className="text-lg font-bold text-gray-800 mb-2">Filter by Coach</h2>
        <div className="relative">
          <select
            value={selectedCoachEmail}
            onChange={(e) => handleCoachChange(e.target.value)}
            className="w-full py-2 px-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {coachEmails.map(coach => (
              <option key={coach.email} value={coach.email}>
                {coach.name + " — " + coach.position}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="text-center text-black">Loading messages...</div>
        ) : messages.length > 0 ? (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isCoachMessage ? 'justify-start' : 'justify-end'}`}
            >
              <div
                className={`max-w-xs p-3 rounded-lg shadow-md ${message.isCoachMessage ? 'bg-gray-300 text-black' : 'bg-blue-500 text-white'
                  }`}
              >
                <div
                  className="text-sm"
                  dangerouslySetInnerHTML={{
                    __html: generateHTMLContent(formatMessageContent(message.content)),
                  }}
                />
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