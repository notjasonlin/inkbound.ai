"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/utils/supabase/client";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

interface Message {
  id: string;
  subject: string;
  content: string; // full email content (potentially HTML encoded)
  from: string;
  date: string;
  isCoachMessage: boolean;
  threadId: string;
}

// A small helper to decode HTML entities
function decodeHtml(html: string): string {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}

export default function CollegeSoccerInbox() {
  const supabase = createClient();
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coachEmails, setCoachEmails] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(0);

  const messagesPerPage = 3;

  // Fetch coach emails on mount
  useEffect(() => {
    fetchCoachEmails();
  }, []);

  // Once coach emails are fetched, grab recent emails
  useEffect(() => {
    if (coachEmails.length > 0) {
      fetchRecentEmails();
    }
  }, [coachEmails]);

  // Get the user's coachEmails from Supabase
  const fetchCoachEmails = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError("User not authenticated");
        return;
      }

      const { data, error } = await supabase
        .from("school_coach_emails")
        .select("coach_emails")
        .eq("user_id", user.id);

      if (error) {
        throw error;
      }

      // Flatten the arrays in "coach_emails"
      const allCoachEmails = data.flatMap((item) => item.coach_emails);
      setCoachEmails(allCoachEmails);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load coach emails. Please try again later.");
    }
  };

  // Fetch emails from /api/gmail/widgetMessages
  const fetchRecentEmails = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/gmail/widgetMessages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coachEmails }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const processedMessages = data.messages.map((message: any) => ({
        id: message.id,
        subject: message.subject || "No Subject",
        content: message.fullContent || message.snippet,
        from: message.from,
        date: message.date,
        isCoachMessage: coachEmails.some((email) =>
          message.from.includes(email)
        ),
        threadId: message.id,
      }));

      // Sort messages newest to oldest
      const sortedMessages = processedMessages.sort(
        (a: Message, b: Message) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      setMessages(sortedMessages);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load emails. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Opens a single email view
  const openEmail = (message: Message) => {
    setSelectedMessage(message);
  };

  // Return to inbox list
  const goBackToInbox = () => {
    setSelectedMessage(null);
  };

  // Pagination handlers
  const handleNextPage = () => {
    if (currentPage < Math.ceil(messages.length / messagesPerPage) - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const paginatedMessages = messages.slice(
    currentPage * messagesPerPage,
    (currentPage + 1) * messagesPerPage
  );

  return (
    <motion.div
      // Animate the container in
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="
        w-full
        bg-white
        border
        border-gray-200
        rounded-lg
        shadow-sm
        overflow-hidden
        text-gray-700
        flex
        flex-col
      "
      style={{ minHeight: "400px" }}
    >
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        {selectedMessage ? (
          <>
            <button
              onClick={goBackToInbox}
              className="
                flex
                items-center
                justify-center
                w-10
                h-10
                rounded-full
                bg-blue-600
                text-white
                hover:bg-blue-700
                transition
                focus:outline-none
              "
            >
              <FiChevronLeft size={24} />
            </button>
            <h2 className="text-lg font-bold text-gray-800 flex-1 ml-4 truncate">
              {selectedMessage.subject}
            </h2>
            <div className="w-10" />
          </>
        ) : (
          <h2 className="text-lg font-bold text-gray-800">
            College Recruiting Inbox
          </h2>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Inbox View */}
        {!selectedMessage && (
          <>
            {loading ? (
              // Loading State
              <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-200 border-t-transparent" />
              </div>
            ) : error ? (
              // Error State
              <div className="text-center text-red-500">{error}</div>
            ) : paginatedMessages.length > 0 ? (
              // Message List
              <AnimatePresence>
                {paginatedMessages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    transition={{ duration: 0.3 }}
                    className="
                      bg-white
                      rounded-lg
                      p-4
                      mb-3
                      shadow
                      hover:bg-gray-50
                      transition
                      cursor-pointer
                      relative
                    "
                    onClick={() => openEmail(message)}
                  >
                    <h3 className="font-semibold text-blue-600 truncate">
                      {message.subject}
                    </h3>
                    <p className="text-sm text-gray-600">{message.from}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(message.date).toLocaleDateString()}
                    </p>
                    <p className="text-sm mt-2 text-gray-700 line-clamp-2">
                      {decodeHtml(message.content)}
                    </p>
                  </motion.div>
                ))}
              </AnimatePresence>
            ) : (
              // No Messages
              <div className="text-center text-sm text-gray-500">
                No messages found.
              </div>
            )}

            {/* Pagination Controls */}
            {messages.length > messagesPerPage && (
              <div className="mt-4 flex items-center justify-between">
                <button
                  onClick={handlePreviousPage}
                  disabled={currentPage === 0}
                  className={`
                    p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition
                    ${currentPage === 0 ? "cursor-not-allowed opacity-50" : ""}
                  `}
                >
                  <FiChevronLeft className="text-blue-600" />
                </button>
                <span className="text-sm text-gray-600">
                  Page {currentPage + 1} of{" "}
                  {Math.ceil(messages.length / messagesPerPage)}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={
                    currentPage >=
                    Math.ceil(messages.length / messagesPerPage) - 1
                  }
                  className={`
                    p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition
                    ${
                      currentPage >=
                      Math.ceil(messages.length / messagesPerPage) - 1
                        ? "cursor-not-allowed opacity-50"
                        : ""
                    }
                  `}
                >
                  <FiChevronRight className="text-blue-600" />
                </button>
              </div>
            )}
          </>
        )}

        {/* Single Email View */}
        {selectedMessage && (
          <motion.div
            key={selectedMessage.id}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-lg shadow p-4"
            style={{ minHeight: "300px" }}
          >
            <p className="text-sm text-gray-600 font-medium mb-1">
              From: {selectedMessage.from}
            </p>
            <p className="text-xs text-gray-400 mb-4">
              {new Date(selectedMessage.date).toLocaleString()}
            </p>
            <div className="text-gray-800 whitespace-pre-wrap break-words">
              {decodeHtml(selectedMessage.content)}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
