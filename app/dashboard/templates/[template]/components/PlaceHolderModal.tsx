import React, { useEffect, useRef } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  setPlaceHolder: (placeHolder: string) => void;
  trigger: () => void;
  position: { top: number; left: number };
}

const placeholders = ["[coachLastName]", "[schoolName]", "[personalizedMessage]"];

const PlaceHolderModal: React.FC<ModalProps> = ({ isOpen, onClose, setPlaceHolder, trigger, position }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const selectPlaceHolder = (placeholder: string) => {
    setPlaceHolder(placeholder);
    trigger();
    onClose();
  };

  return (
    <div
      ref={modalRef}
      style={{
        position: 'absolute',
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: 'translate(-50%, -50%)', // Center the modal within the editor
        ...styles.modal,
      }}
    >
      <h2 style={styles.title}>Choose a Placeholder:</h2>
      {placeholders.map((placeholder) => (
        <button
          key={placeholder}
          onClick={() => selectPlaceHolder(placeholder)}
          style={styles.button}
          className="hover:bg-blue-700 active:scale-95 transition-transform duration-150"
        >
          {placeholder}
        </button>
      ))}
    </div>
  );
};

const styles = {
  modal: {
    backgroundColor: 'white',
    padding: '15px',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    width: '240px',
    zIndex: 1000,
    textAlign: 'center' as const,
  },
  title: {
    marginBottom: '15px',
    fontSize: '16px',
    fontWeight: '600',
    color: '#333',
  },
  button: {
    backgroundColor: '#007bff',
    color: 'white',
    padding: '8px 12px',
    margin: '5px 0',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    width: '100%',
    fontSize: '14px',
  },
};

export default PlaceHolderModal;
