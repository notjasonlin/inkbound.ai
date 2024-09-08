import { Email } from '@/types/email';

const API_URL = '/api/gmail';

export async function fetchEmails(numEmails: number): Promise<Email[]> {
  const response = await fetch(`${API_URL}?numEmails=${encodeURIComponent(String(numEmails))}`);
  if (!response.ok) {
    throw new Error('Failed to fetch emails');
  }
  return response.json();
}
