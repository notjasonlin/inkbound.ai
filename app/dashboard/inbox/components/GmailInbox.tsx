"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { FiSend } from "react-icons/fi";
import { CoachData } from "@/types/school";
import { Message } from "@/types/message";

import styles from "@/styles/GmailInbox.module.css";
import ReplyAIButton from "./ReplyAIButton";

interface GmailInboxProps {
  coachEmails: CoachData[];
}

export default function GmailInbox({ coachEmails }: GmailInboxProps) {
  const [selectedCoachEmail, setSelectedCoachEmail] = useState<string>(
    coachEmails[0]?.email || ""
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    if (coachEmails.length > 0) {
      setSelectedCoachEmail(coachEmails[0].email);
    }
  }, [coachEmails]);

  useEffect(() => {
    if (selectedCoachEmail) {
      fetchMessages(selectedCoachEmail);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCoachEmail]);

  const fetchMessages = async (coachEmail: string) => {
    setLoading(true);
    setMessages([]); // Clear old messages on coach switch

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error("No user found. Please sign in.");
        setLoading(false);
        return;
      }

      // Check user_message_tracking to see where we left off
      const { data: trackingData, error: trackingError } = await supabase
        .from("user_message_tracking")
        .select("last_fetched_message_id, id")
        .eq("user_id", user.id)
        .eq("coach_email", coachEmail)
        .single();

      if (trackingError) {
        console.error("Error fetching tracking data:", trackingError);
      }

      // Fetch messages from your /api/gmail/messages endpoint
      const response = await fetch("/api/gmail/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coachEmail }),
      });
      const data = await response.json();

      console.log("DATA", data);

      // Create local array of messages
      const processedMessages: Message[] = data.messages.reverse().map(
        (message: any, index: number) => ({
          id: message.id,
          content: message.content,
          from: message.from,
          date: message.date,
          isCoachMessage: message.from.includes(coachEmail),
          threadId: message.id, // Use real thread ID if available
          messageNum: index,
          classification: null,
        })
      );

      // If the tracking table recorded a last_fetched_message_id, only classify new
      let newMessages = processedMessages;
      if (trackingData) {
        const lastFetchedMessageId = trackingData.last_fetched_message_id;
        const idx = processedMessages.findIndex(
          (msg) => msg.id === lastFetchedMessageId
        );
        if (idx >= 0) {
          newMessages = processedMessages.slice(idx + 1);
        }
      }

      // Classify new coach messages
      for (const msg of newMessages) {
        if (msg.isCoachMessage) {
          await fetch(
            "https://191gxash54.execute-api.us-east-2.amazonaws.com/email-classifier",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                emailId: msg.id,
                content: msg.content,
                from: msg.from,
                date: msg.date,
                threadId: msg.threadId,
              }),
            }
          );
        }
      }

      // Update user_message_tracking
      if (newMessages.length > 0) {
        const latestMessageId = newMessages[newMessages.length - 1].id;
        const toTrack: any = {
          user_id: user.id,
          coach_email: coachEmail,
          last_fetched_message_id: latestMessageId,
        };
        if (trackingData && trackingData.id) {
          toTrack.id = trackingData.id;
        }

        const { error: upsertError } = await supabase
          .from("user_message_tracking")
          .upsert(toTrack);

        if (upsertError) {
          console.error("Error updating user_message_tracking:", upsertError);
        }
      }

      setMessages(processedMessages);

      // For demonstration, store the threadId from the first message
      if (processedMessages.length > 0) {
        setThreadId(processedMessages[0].threadId);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCoachChange = (email: string) => {
    setSelectedCoachEmail(email);
    setNewMessage("");
    setThreadId(null);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedCoachEmail || !threadId) return;

    setIsSending(true);
    try {
      // Send user’s new message via your /api/gmail/sendMessage
      const response = await fetch("/api/gmail/sendMessage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coachEmail: selectedCoachEmail,
          message: newMessage,
          threadId,
        }),
      });

      if (!response.ok) {
        throw new Error("Error sending message.");
      }

      // Add it locally to the top of the list
      const sentMessage: Message = {
        id: `temp-${Date.now()}`,
        content: newMessage,
        from: "You",
        date: new Date().toISOString(),
        isCoachMessage: false,
        threadId,
        messageNum: messages.length,
        classification: null,
      };

      setMessages((prev) => [sentMessage, ...prev]);
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSending(false);
    }
  };

  // Reformat text for display
  const formatMessageContent = (content: string) => {
    const normalized = content.replace(/\r\n/g, "\n");
    const paragraphs = normalized.split("\n");
    return paragraphs.map((p) => (p.trim() ? `<p>${p}</p>` : "<br>")).join("");
  };

  const generateHTMLContent = (paragraphs: string) => {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    p { margin: 0 0 70px; line-height: 1.8; }
    body { font-family: Arial, sans-serif; }
  </style>
</head>
<body>
  ${paragraphs}
</body>
</html>`;
  };

  // When the AI reply is generated, place it in `newMessage` so user can edit/send
  const handleAiGenerated = (aiText: string) => {
    setNewMessage(aiText);
  };

  // Renders user-sent messages
  const userMessage = (msg: Message) => (
    <div key={msg.id} className="flex justify-end">
      <div className={`${styles["user-message"]} max-w-xs p-3 rounded-lg shadow-md`}>
        <div
          className="text-sm"
          dangerouslySetInnerHTML={{
            __html: generateHTMLContent(formatMessageContent(msg.content)),
          }}
        />
        <p className="text-xs mt-2 text-black">
          {new Date(msg.date).toLocaleString()}
        </p>
      </div>
    </div>
  );

  // Renders coach messages with a ReplyAIButton
  const coachMessage = (msg: Message) => (
    <div key={msg.id} className={styles["coach-message"]}>
      <div
        className="text-sm"
        dangerouslySetInnerHTML={{
          __html: generateHTMLContent(formatMessageContent(msg.content)),
        }}
      />
      <p className="text-xs mt-2 text-black">{new Date(msg.date).toLocaleString()}</p>

      <ReplyAIButton
        coachMessage={msg}
        onAiGenerated={handleAiGenerated}
        // If needed, pass a userMessage for AI context:
        // userMessage={messages.find((m) => !m.isCoachMessage) || null}
      />
    </div>
  );

  return (
    <div className={styles.container}>
      {/* Coach Selection */}
      <div className={styles.header}>
        <h2 className="text-lg font-bold text-gray-800 mb-2">Filter by Coach</h2>
        <select
          value={selectedCoachEmail}
          onChange={(e) => handleCoachChange(e.target.value)}
          className={styles["select-box"]}
        >
          {coachEmails.map((coach) => (
            <option key={coach.email} value={coach.email}>
              {coach.name + " — " + coach.position}
            </option>
          ))}
        </select>
      </div>

      {/* Messages List */}
      <div className={styles.messages}>
        {loading ? (
          <div className="text-center text-black">Loading messages...</div>
        ) : messages.length > 0 ? (
          messages.map((message) =>
            message.isCoachMessage ? coachMessage(message) : userMessage(message)
          )
        ) : (
          <div className="text-center text-black">No messages found.</div>
        )}
      </div>

      {/* New Message Text Editor + Send Button */}
      <div className={styles["input-area"]}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a new message..."
          className={styles["input-box"]}
        />
        <button
          onClick={handleSendMessage}
          className={styles["send-button"]}
          disabled={isSending || !newMessage.trim()}
        >
          {isSending ? "Sending..." : <FiSend />}
        </button>
      </div>
    </div>
  );
}
