"use client";

import React, { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Message } from "@/types/message";
import styles from "@/styles/GmailInbox.module.css";

interface ReplyAIButtonProps {
  coachMessage: Message;
  // If your AI logic needs the user's message content, pass it here:
  userMessage?: Message | null;
  // Callback to populate the parent's text editor with the AI result
  onAiGenerated: (text: string) => void;
}

export default function ReplyAIButton({
  coachMessage,
  userMessage,
  onAiGenerated,
}: ReplyAIButtonProps) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  // Matches your original classification labels for predicted_class
  const genuineArray = ["not genuine", "somewhat genuine", "genuine"];

  const handleReplyWithAI = async () => {
    try {
      setLoading(true);

      // 1) Fetch classification from Supabase for this coach's message
      const { data: classification, error } = await supabase
        .from("email_classifications")
        .select("predicted_class, category, score")
        .eq("email_id", coachMessage.id)
        .single();

      if (error || !classification) {
        console.error("Error fetching classification:", error);
        onAiGenerated("Error fetching classification.");
        return;
      }

      // Possibly strip any bracketed format from category if needed
      const category = classification.category.replace(/^\[|\]$/g, "");
      const predictedClassIndex = classification.predicted_class;
      const genuineLabel = genuineArray[predictedClassIndex];

      // 2) If category != "other," attempt to download an example template
      let exampleEmailContent = "";
      if (category !== "other") {
        const bucketPath = `public/replyai-example-emails/${predictedClassIndex}`;
        const filePath = `${category}.txt`;

        const { data: exampleFile, error: downloadError } = await supabase
          .storage
          .from(bucketPath)
          .download(filePath);

        if (!downloadError && exampleFile) {
          exampleEmailContent = await exampleFile.text();
        }
      }

      // 3) Call your /api/replyAI endpoint
      const response = await fetch("/api/replyAI", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coach_email: coachMessage.content,
          classification: genuineLabel,
          genuine_score: classification.score * 100,
          category,
          example_email: exampleEmailContent,
          user_email: userMessage?.content || "",
        }),
      });

      const data = await response.json();
      console.log("AI Response:", data);

      // 4) If valid content is returned, populate the parent's input
      if (data && data.content) {
        onAiGenerated(data.content);
      } else {
        onAiGenerated("No AI response received.");
      }

      // 5) (Optional) usage tracking
      await fetch("/api/user-usage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "ai" }),
      });
    } catch (err) {
      console.error("Error in handleReplyWithAI:", err);
      onAiGenerated("Error generating AI response.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleReplyWithAI}
      disabled={loading}
      className={styles["ai-button"]}
    >
      {loading ? "Generating..." : "Reply with AI"}
    </button>
  );
}
