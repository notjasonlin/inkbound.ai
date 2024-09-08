'use client';

import React from 'react';
import { useEmails } from '@/app/dashboard/emails/hooks/useEmails';
import ComposeEmail from './components/ComposeEmail';
import Link from 'next/link';

export default function EmailsPage() {
  const { emails, loading, error } = useEmails();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Your Emails</h1>
      <ComposeEmail />
      <h2 className="text-xl font-semibold mt-8 mb-4">Inbox</h2>
      <p className="mb-4">Number of emails: {emails.length}</p>
      <ul className="space-y-4">
        {emails.map((email) => {

          console.log("EMAILID", email.id);
          return (
            <li key={email.id} className="border p-4 rounded-lg shadow">
              <Link
                href={`/dashboard/emails/threads?threadId=${email.id}`}
                className="block p-4 border rounded"
              >
                <p className="font-semibold">{email.subject}</p>
                <p className="text-sm text-gray-600">From: {email.from}</p>
                <p className="text-sm text-gray-500">{new Date(email.date).toLocaleString()}</p>
                <p className="mt-2 text-sm text-gray-700 line-clamp-3">{email.snippet}</p>
              </Link>
            </li>
          )
        }
        )}
      </ul>
    </div>
  );
}
