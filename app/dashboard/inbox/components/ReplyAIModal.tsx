import React, { useEffect, useRef } from "react";
import "@/styles/ReplyAIModal.css";
import { Message } from "@/types/message";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  style: { top: number; left: number }; // Add position prop
  coachMessage: Message | null;
  lastMessage: Message | null;
}

export default function ReplyAIModal({
  isOpen,
  onClose,
  style,
  coachMessage,
  lastMessage
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

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

  const replyAI = () => {
    console.log("Reply AI");
    console.log("Coach message", coachMessage);
    if (lastMessage && !lastMessage.isCoachMessage) {
        console.log("Last message", lastMessage);
    } else {
        console.log("Last message is a coach message")
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
