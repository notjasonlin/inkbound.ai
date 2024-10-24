import React, { useEffect, useRef } from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    setPlaceHolder: (placeHolder: string) => void;
    trigger: () => void;
    position: { top: number; left: number };  // Add this for dynamic positioning
}

const placeHolders = ["[coachLastName]", "[schoolName]"];

const PlaceHolderModal = ({ isOpen, onClose, setPlaceHolder, trigger, position }: ModalProps) => {
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

    const selectPlaceHolder = (placeHolder: string) => {
        setPlaceHolder(placeHolder);
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
                ...styles.modal, // Ensure you use the modal styles here
            }}
        >
            <h2 style={styles.title}>Choose an option:</h2>
            {placeHolders.map((placeHolder) => (
                <button
                    key={placeHolder}
                    onClick={() => selectPlaceHolder(placeHolder)}
                    style={styles.button}
                >
                    {placeHolder}
                </button>
            ))}
        </div>
    );
};

const styles = {
    modal: {
        backgroundColor: 'white',
        padding: '10px',
        borderRadius: '4px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        width: '300px',
        zIndex: 1000, /* Ensure it is above other content */
        textAlign: 'center' as 'center',
    },
    title: {
        marginBottom: '20px',
        fontSize: '18px',
        fontWeight: 'bold' as 'bold',
    },
    button: {
        backgroundColor: '#007bff',
        color: 'white',
        padding: '10px 15px',
        margin: '5px 0',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        width: '100%',
    },
};

export default PlaceHolderModal;

