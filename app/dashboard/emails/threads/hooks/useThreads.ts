import { fetchThreads } from "@/lib/threadService";
import { EmailThread, useThreadResult } from "@/types/threads";
import { useEffect, useState } from "react";

export function useThreads(threadId: string | null): useThreadResult {
    const [threads, setThreads] = useState<EmailThread | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function getThreads() {
            try {
                if (!threadId)
                    throw new Error();
                const fetchedThreads = await fetchThreads(threadId);
                setThreads(fetchedThreads);
            } catch (err) {
                setError('Error fetching threads. Please try again later.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

        getThreads();
    }, []);


    return { threads, loading, error };

}