import { useState, useEffect } from 'react';
import { fetchEmails } from '@/lib/emailService';
import { UseEmailsResult, Email } from '@/types/email/index';

export function useEmails(): UseEmailsResult {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function getEmails() {
      try {
        const fetchedEmails = await fetchEmails();
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
