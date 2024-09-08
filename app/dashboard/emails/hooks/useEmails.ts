"use client"

import { useState, useEffect } from 'react';
import { fetchEmails } from '@/lib/emailService';
import { UseEmailsResult, Email } from '@/types/email/index';

export function useEmails(numEmails?: number): UseEmailsResult {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const DEFAULT_NUM = 100;

  useEffect(() => {
    async function getEmails() {
      try {
        const fetchedEmails = await fetchEmails(numEmails ? numEmails : DEFAULT_NUM);
        setEmails(fetchedEmails);
      } catch (err) {
        setError('Error fetching emails. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    getEmails();
  }, []);

  return { emails, loading, error };
}
