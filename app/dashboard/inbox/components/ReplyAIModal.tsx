import React, { useEffect, useRef, useState } from "react";
import "@/styles/ReplyAIModal.css";
import { Message } from "@/types/message";
import { createClient } from "@/utils/supabase/client";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  style: { top: number; left: number }; // Add position prop
  coachMessage: Message | null;
  firstMessage: Message | null;
}

export default function ReplyAIModal({ isOpen, onClose, style, coachMessage, firstMessage }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();
  const [genuineArray, setGenuineArray] = useState<String[]>(["not genuine", "somewhat genuine", "genuine"])

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // ***REPLY AI FUNCTION***
  const replyAI = async () => {
    const { data: classification, error } = await supabase
      .from('email_classifications')
      .select('predicted_class, category, score')
      .eq("email_id", coachMessage?.id)
      .single();

    // console.log(classification);

    if (error) {
      console.error("Error fetching data");
    } else {

      // Grab example response

      const bucket = "public/replyai-example-emails/" + classification.predicted_class;
      const category = classification.category.substring(2, classification.category.length - 2);
      const path = category + ".txt";

      const { data: example, error } = await supabase
        .storage
        .from(bucket)
        .download(path);

      if (error) {
        console.error('Error loading data');
      } else {
        // **Read File**
        const reader = new FileReader();

        reader.onload = async (event) => {
          const fileContent = event.target?.result as string;
          if (fileContent) {
            // **Query for AI response**
            const response = await fetch('/api/replyAI', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                coach_email: coachMessage?.content,
                classification: genuineArray[classification.predicted_class],
                genuine_score: (classification.score * 100),
                category: category,
                example_email: fileContent,
                user_email: firstMessage?.content,
              }),
            });

            const data = await response.json()
            console.log("RESPONSE", data);
          }
        }

        reader.onerror = (e) => {
          console.error('Error loading data');
        };

        reader.readAsText(example);
      }

      onClose();
    }
  }

  return (
    <div
      ref={modalRef}
      className="modal-container"
      style={{
        top: `${style.top}px`,
        left: `${style.left}px`,
        position: "absolute", // Ensure absolute positioning
      }}
      onClick={replyAI}
    >
      <button type="button" className="modal-button">
        Reply with AI
      </button>
    </div>
  );
}
