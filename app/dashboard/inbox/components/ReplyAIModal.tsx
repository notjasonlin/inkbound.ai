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

    console.log(classification);

    if (error) {
      console.error("Error fetching data");
    } else {
      const response = await fetch('/api/replyAI', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          coach_email: coachMessage,
          classification: genuineArray[classification.predicted_class],
          genuine_score: (classification.score * 100),
          category: classification.category[0],
          example_email: "",
          user_email: firstMessage,
        }),
      });
  
      const data = await response.json()
      console.log("RESPONSE", data);
    }
    
    onClose();
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
