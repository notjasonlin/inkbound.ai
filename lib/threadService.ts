import { EmailThread } from "@/types/threads";

const API_URL = '/api/gmail-threads';

export async function fetchThreads(threadId: string): Promise<EmailThread> {
    const response = await fetch(`${API_URL}?threadId=${encodeURIComponent(threadId)}`);
    
    if (!response.ok) {
        throw new Error('Failed to fetch threads');
    }
    
    return response.json();
}
