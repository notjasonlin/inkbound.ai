"use client";

import { useSearchParams } from "next/navigation";
import { useThreads } from "./hooks/useThreads";

export default function Threads() {
    const searchParams = useSearchParams();
    const id = searchParams.get('threadId');
    const { threads, loading, error } = useThreads(id);

    if (loading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p>Error: {error}</p>;
    }

    console.log("THREADS", threads);

    return (
        <>
            {threads && (
                <div className="p-4">
                    <h1 className="text-2xl font-bold mb-4">Your Threads</h1>
                    <ul>
                        {threads.messages.map((message, index) => {
                            const formattedDate = new Date(message.date).toLocaleString();
                            const from = message.from;
                            const snippet = message.snippet || "No content available";

                            console.log("THREAD");

                            return (
                                <li key={index} className="border p-4 rounded-lg shadow mb-4">
                                    <p className="font-semibold">{`From: ${from}`}</p>
                                    <p className="text-sm text-gray-600">{`Date: ${formattedDate}`}</p>
                                    <p className="mt-2 text-sm text-gray-700 line-clamp-3 overflow-hidden text-ellipsis">
                                        {snippet}
                                    </p>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}
        </>
    );
}
