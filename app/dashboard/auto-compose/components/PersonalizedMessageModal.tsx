import React, { useState, useEffect, useCallback } from 'react';
import { PersonalizedMessage } from "@/types/personalized_messages";
import { createClient } from "@/utils/supabase/client";
import { debounce } from 'lodash';
import "@/styles/PersonalizedMessageModal.css";

interface PMap {
    [key: string]: PersonalizedMessage;
}

interface PMessageModalProps {
    userId: string;
    pMessages: PMap;
    setPMessages: (pMap: PMap) => void;
    needPMessages: PersonalizedMessage[];
    setNeedPMessages: (pMessages: PersonalizedMessage[]) => void;
    onClose: () => void;
}

const PersonalizedMessageModal: React.FC<PMessageModalProps> = ({
    userId,
    pMessages,
    setPMessages,
    needPMessages,
    setNeedPMessages,
    onClose,
}) => {
    const supabase = createClient();
    const [selectedPMessage, setSelectedPMessage] = useState<PersonalizedMessage | null>(null);
    const [message, setMessage] = useState<string>("");
    const [selectedIndex, setSelectedIndex] = useState<number>(-1);
    const [updateItemTrigger, setUpdateItemTrigger] = useState(false);

    const handleSave = useCallback(async () => {
        if (selectedPMessage && message) {
            const pMessage: PersonalizedMessage = {
                id: selectedPMessage.id,
                user_id: selectedPMessage.user_id,
                school_id: selectedPMessage.school_id,
                school_name: selectedPMessage.school_name,
                message: message,
                is_super_fav: selectedPMessage.is_super_fav,
                is_curr_fav: selectedPMessage.is_curr_fav,
                is_generated: false,
                needs_handwritten: false
            }

            try {
                const { error } = await supabase
                    .from('personalized_messages')
                    .update({
                        message: message,
                        is_generated: false,
                        needs_handwritten: false
                    })
                    .eq('id', selectedPMessage.id);

                if (error) throw error;

                needPMessages[selectedIndex] = pMessage;
                setNeedPMessages([...needPMessages]);
                pMessages[pMessage.school_id] = pMessage;
                setPMessages({ ...pMessages });
            } catch (error) {
                console.error('Error saving message:', error);
            }
        }
    }, []);

    const debouncedSave = useCallback(debounce(handleSave, 1000), [handleSave]);

    useEffect(() => {
        if (selectedPMessage) {
            debouncedSave();
        }
    }, [updateItemTrigger]);

    const handleSelectPMessage = (index: number) => {
        if (index === -1) {
            setSelectedPMessage(null);
        } else {
            const pMessage = needPMessages[index];
            setSelectedPMessage(pMessage);
            setSelectedIndex(index);
            setMessage(pMessage.message ? pMessage.message : "");
        }
    };

    const handleModalClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if ((e.target as HTMLElement).classList.contains('modal-container')) {
            onClose();
        }
    };

    useEffect(() => {
        //console.log('Need Messages in Modal:', needPMessages);
    }, [needPMessages]);

    return (
        <div className="modal-container" onClick={handleModalClick}>
            <div className="modal">
                <div className="modal-header">
                    <h2>Personalized Message</h2>
                    <button className="close-button" onClick={onClose}>
                        &times;
                    </button>
                </div>
                <div className="modal-content">
                    <div className="modal-select">
                        <label htmlFor="pMessageSelect">Select a School:</label>
                        {needPMessages.length > 0 ? (
                            <select
                                id="pMessageSelect"
                                onChange={(e) => handleSelectPMessage(Number(e.target.value))}
                                value={selectedIndex !== -1 ? selectedIndex : ""}
                            >
                                <option value="" disabled>
                                    -- Select a school --
                                </option>
                                {needPMessages.map((pMessage, index) => (
                                    <option 
                                        key={pMessage.id} 
                                        value={index}
                                    >
                                        {pMessage.school_name} {pMessage.is_super_fav ? '⭐' : ''}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <div className="text-gray-500 italic">
                                No schools currently need personalized messages
                            </div>
                        )}
                    </div>
                    {selectedPMessage && (
                        <div className="modal-editor">
                            <label htmlFor="messageInput">Edit Message:</label>
                            <textarea
                                id="messageInput"
                                value={message}
                                onChange={(e) => {
                                    setMessage(e.target.value);
                                    setUpdateItemTrigger(!updateItemTrigger);
                                }}
                                rows={10}
                            />
                        </div>
                    )}
                </div>
                <div className="modal-footer">
                    <button className="secondary-button" onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PersonalizedMessageModal;
