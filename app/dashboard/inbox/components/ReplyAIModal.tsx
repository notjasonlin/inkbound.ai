import React, { useEffect, useRef } from "react";
import "@/styles/ReplyAIModal.css";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClick: () => void;
  style: { top: number; left: number }; // Add position prop
}

export default function ReplyAIModal({
  isOpen,
  onClose,
  onClick,
  style,
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

  return (
    <div
      ref={modalRef}
      className="modal-container"
      style={{
        top: `${style.top}px`,
        left: `${style.left}px`,
        position: "absolute", // Ensure absolute positioning
      }}
      onClick={onClick}
    >
      <button type="button" className="modal-button">
        Reply with AI
      </button>
    </div>
  );
}
