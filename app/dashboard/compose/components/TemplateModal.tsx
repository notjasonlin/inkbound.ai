import { TemplateData } from "@/types/template";
import Modal from "../../emails/components/Modal";
import readTemplate from "@/functions/readTemplate";
import TemplateDisplay from "../../profile/templates/components/TemplateDisplay";

interface TemplateModalProps {
    templates: TemplateData[];
    isOpen: boolean;
    setIsOpen: (state: boolean) => void;
    modalButtonsOnClick: (state: TemplateData) => void;
}

const TemplateModal = ({ templates, isOpen, setIsOpen, modalButtonsOnClick }: TemplateModalProps) => {

    const closeModal = (template: TemplateData) => {
        modalButtonsOnClick(template)
        setIsOpen(false);
    }
    return (
        <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)", // 3 items per row
                    gap: "20px", // Space between items
                    padding: "20px"
                }}
            >
                {templates.map((template) => {
                    if (!template.content.content || !template.content.title) return null;

                    return (
                        <>
                            <button onClick={() => closeModal(template)}>
                                <TemplateDisplay key={template.id} template={template} />
                            </button>
                        </>
                    )
                })}
            </div>
        </Modal>
    );
}

export default TemplateModal;
