"use client";

import { useState, useEffect } from 'react';
import SendEmailModal from '../../../components/SendEmailModal';
import { threadId } from 'worker_threads';
import Link from 'next/link';

interface Email {
  id: string;
  snippet: string;
  subject: string;
  from: string;
  to: string;
}

export default function Emails() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [emailContent, setEmailContent] = useState('');
  const [subject, setSubject] = useState('');
  const [to, setTo] = useState('');
  const [apiKey, setApiKey] = useState<string | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchEmails = async () => {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      console.error('No access token found');
      return;
    }

    try {
      const query = 'bcc:collegeathletes9@gmail.com';
      console.log('Fetching emails with query:', query);
      const response = await fetch(`https://www.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}&maxResults=10`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch emails: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Fetched email data:', data);

      if (!data.messages || data.messages.length === 0) {
        console.log('No emails found matching the criteria');
        setEmails([]);
        return;
      }

      const emailPromises = data.messages.map(async (message: { id: string }) => {
        const emailResponse = await fetch(`https://www.googleapis.com/gmail/v1/users/me/messages/${message.id}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        const emailData = await emailResponse.json();
        console.log("EMAILDATA", emailData);
        return {
          id: emailData.id,
          snippet: emailData.snippet,
          subject: emailData.payload.headers.find((header: { name: string }) => header.name === 'Subject')?.value || 'No Subject',
          from: emailData.payload.headers.find((header: { name: string }) => header.name === 'From')?.value || 'Unknown Sender',
          to: emailData.payload.headers.find((header: { name: string }) => header.name === 'To')?.value || 'Unknown Recipient',
          // threadId: emailData.threadId,
        };
      });

      const emailDetails = await Promise.all(emailPromises);
      setEmails(emailDetails);
    } catch (error) {
      console.error('Error fetching emails:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, []);

  useEffect(() => {
    setApiKey(process.env.NEXT_PUBLIC_TINYMCE_API_KEY);
  }, []);

  const handleSendClick = () => {
    setIsModalOpen(true);
    setSubject('');
    setTo('');
    setEmailContent('');
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEmailContent('');
    setSubject('');
    setTo('');
  };

  if (loading) {
    return <div>Loading emails...</div>;
  }

  return (
    <div className="p-4">
      <div className="mb-4">
        <button
          onClick={handleSendClick}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Compose Email
        </button>
      </div>

      {isModalOpen &&
        apiKey &&
        <SendEmailModal closeModal={handleCloseModal} initCont={emailContent} initSubj={subject} initTo={to} apiKey={apiKey} fetchEmails={fetchEmails} />
      }

      <h2 className="text-2xl font-bold mb-4">Emails Sent by You via Gmail</h2>
      {loading ? (
        <div>Loading emails...</div>
      ) : emails.length === 0 ? (
        <p>No emails found sent by you via Gmail.</p>
      ) : (
        <ul>
          {emails.map((email) => {
            console.log("EMAIL", email);
            return (
              <li key={email.id} className="mb-4">
                <Link
                  href={`/dashboard/emails/threads?threadId=${email.id}`}
                  className="block p-4 border rounded"
                >
                  <h2 className="font-bold">{email.subject}</h2>
                  <p className="text-sm text-gray-600">To: {email.to}</p>
                  <p className="mt-2">{email.snippet}</p>
                </Link>
              </li>
            )
          }
          )}
        </ul>
      )}
    </div>
  );
}
