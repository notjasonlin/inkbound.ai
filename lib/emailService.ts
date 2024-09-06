import { Email } from '@/types';

const API_URL = '/api/gmail';

export async function fetchEmails(): Promise<Email[]> {
  const response = await fetch(API_URL);
  if (!response.ok) {
    throw new Error('Failed to fetch emails');
  }
  return response.json();
}
