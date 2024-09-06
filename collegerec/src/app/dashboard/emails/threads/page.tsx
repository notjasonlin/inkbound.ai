"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function Threads() {
    const searchParams = useSearchParams();
    const [threadId, setThreadId] = useState<string | null>(null);
    const accessToken = localStorage.getItem('access_token');

    useEffect(() => {
        // Get the 'threadId' from the query parameter
        const id = searchParams.get('threadId');
        setThreadId(id);
    }, [searchParams]);

    useEffect(() => {
        const grabThread = async () => {
            const url = `https://gmail.googleapis.com/gmail/v1/users/me/threads/${threadId}`;

            try {
                const response = await fetch(url, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch the thread');
                }

                const threadData = await response.json();
                console.log('Thread:', threadData);
            } catch (error) {
                console.error('Error fetching thread:', error);
            }
        }
        grabThread();
    }, [threadId]);







    return <h1>Threads</h1>;
}
