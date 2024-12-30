import React, { useCallback, useState } from 'react';
import { PersonalizedMessage } from "@/types/personalized_messages";
import { createClient } from "@/utils/supabase/client";
import { debounce } from 'lodash';
import "@/styles/PersonalizedMessageModal.css";
import { generatePersonalizedMessage } from '@/utils/generateMessage';
import { showToast } from '@/utils/toast';

interface PMap {
    [key: string]: PersonalizedMessage;
}

interface PMessageModalProps {
    userId: string;
    pMessages: PMap;
    onClose: () => void;
    template: string;
    onMessagesUpdated?: () => void;
}

const PersonalizedMessageModal: React.FC<PMessageModalProps> = ({
    userId,
    pMessages,
    onClose,
    template,
    onMessagesUpdated
}) => {
    const supabase = createClient();
    const [selectedSchoolId, setSelectedSchoolId] = useState<string>("");
    const [currentMessage, setCurrentMessage] = useState<string>("");
    const [isGenerating, setIsGenerating] = useState(false);

    const superFavSchools = Object.values(pMessages).filter(
        msg => msg.is_super_fav && msg.is_curr_fav
    );

    const handleSchoolSelect = (schoolId: string) => {
        setSelectedSchoolId(schoolId);
        const school = pMessages[schoolId];
        setCurrentMessage(school?.message || "");
    };

    const handleSaveMessage = async (message: string) => {
        if (!selectedSchoolId) return;

        try {
            const { error } = await supabase
                .from('personalized_messages')
                .update({
                    message: message,
                    is_generated: false,
                    needs_handwritten: false
                })
                .eq('school_id', selectedSchoolId)
                .eq('user_id', userId);

            if (error) throw error;
            onMessagesUpdated?.();
        } catch (error) {
            console.error('Error saving message:', error);
        }
    };

    const debouncedSave = useCallback(debounce(handleSaveMessage, 1000), [selectedSchoolId]);

    const handleGenerateOthers = async () => {
        try {
            setIsGenerating(true);
            showToast('Generating personalized messages...', 'loading');

            const { data: currentFavs, error: fetchError } = await supabase
                .from('personalized_messages')
                .select('*')
                .eq('user_id', userId)
                .eq('is_curr_fav', true)
                .eq('is_super_fav', false);

            if (fetchError) throw fetchError;
            if (!currentFavs?.length) {
                showToast('No schools found to generate messages for', 'error');
                return;
            }

            for (const message of currentFavs) {
                const response = await generatePersonalizedMessage(
                    message.school_id, 
                    userId,
                    template
                );
                
                if (!response.generatedMessage) continue;

                await supabase
                    .from('personalized_messages')
                    .update({
                        message: response.generatedMessage,
                        is_generated: true,
                        needs_handwritten: false
                    })
                    .eq('id', message.id);
            }

            onMessagesUpdated?.();
            showToast('Successfully generated messages!', 'success');
        } catch (error) {
            console.error('Error generating messages:', error);
            showToast('Failed to generate messages', 'error');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="modal-container" onClick={(e) => {
            if ((e.target as HTMLElement).classList.contains('modal-container')) {
                onClose();
            }
        }}>
            <div className="modal">
                <div className="modal-header">
                    <h2>Personalized Messages</h2>
                    <button className="close-button" onClick={onClose}>&times;</button>
                </div>
                <div className="modal-content">
                    <div className="mb-4">
                        <label htmlFor="schoolSelect" className="block text-sm font-medium text-gray-700 mb-2">
                            Select Super Favorite School:
                        </label>
                        <select
                            id="schoolSelect"
                            value={selectedSchoolId}
                            onChange={(e) => handleSchoolSelect(e.target.value)}
                            className="w-full p-2 border rounded"
                        >
                            <option value="">-- Select a school --</option>
                            {superFavSchools.map((school) => (
                                <option key={school.id} value={school.school_id}>
                                    {school.school_name} ⭐
                                </option>
                            ))}
                        </select>
                    </div>

                    {selectedSchoolId && (
                        <div className="mb-4">
                            <label htmlFor="messageInput" className="block text-sm font-medium text-gray-700 mb-2">
                                Write Personalized Message:
                            </label>
                            <textarea
                                id="messageInput"
                                value={currentMessage}
                                onChange={(e) => {
                                    setCurrentMessage(e.target.value);
                                    debouncedSave(e.target.value);
                                }}
                                rows={5}
                                className="w-full p-2 border rounded"
                                placeholder="Write your personalized message here..."
                            />
                        </div>
                    )}

                    {superFavSchools.length === 0 && (
                        <div className="text-gray-500 italic">
                            No super favorite schools to write messages for
                        </div>
                    )}
                </div>
                <div className="modal-footer">
                    <button 
                        className="primary-button mr-2"
                        onClick={handleGenerateOthers}
                        disabled={isGenerating}
                    >
                        {isGenerating ? 'Generating...' : 'Generate Other Messages'}
                    </button>
                    <button className="secondary-button" onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PersonalizedMessageModal;
