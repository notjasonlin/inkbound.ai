import { useState, useEffect } from 'react';
import EmailFilter from './EmailFilter';

interface Email {
  id: string;
  subject: string;
  from: string;
  date: string;
  snippet: string;
}

export default function GmailInbox({ coachEmails }: { coachEmails: Record<string, string> }) {
  const [selectedCoachEmail, setSelectedCoachEmail] = useState<string | null>(null);
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchEmails = async () => {
      if (!selectedCoachEmail) return;

      setLoading(true);
      try {
        const response = await fetch('/api/gmail/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ coachEmail: selectedCoachEmail }),
        });
        const data = await response.json();
        console.log('Fetched email data:', data.messages); // Add this line
        setEmails(data.messages || []);
      } catch (error) {
        console.error('Error fetching emails:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmails();
  }, [selectedCoachEmail]);

  return (
    <div>
      <EmailFilter coachEmails={coachEmails} onSelectCoach={setSelectedCoachEmail} />
      <h2 className="text-xl font-semibold mb-4">Inbox</h2>
      {loading ? (
        <p>Loading emails...</p>
      ) : emails.length > 0 ? (
        <ul className="space-y-4">
          {emails.map((email) => (
            <li key={email.id} className="border p-4 rounded-lg">
              <h3 className="font-semibold">{email.subject}</h3>
              <p className="text-sm text-gray-600">From: {email.from}</p>
              <p className="text-sm text-gray-600">Date: {email.date}</p>
              <p className="mt-2">{email.snippet}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No emails found.</p>
      )}
    </div>
  );
}
