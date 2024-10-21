import { TemplateData } from "@/types/template";
import Modal from "../../../../components/ui/Modal";
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
    modalButtonsOnClick(template);
    setIsOpen(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
        <div className="relative bg-white rounded-lg shadow-lg p-8 max-w-3xl w-full">
          <h2 className="text-2xl font-semibold mb-6 text-center text-blue-800">Select a Template</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4">
            {templates.map((template) => {
              if (!template.content.content || !template.content.title) return null;

              return (
                <button
                  key={template.id}
                  onClick={() => closeModal(template)}
                  className="w-full bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow hover:bg-blue-200 p-4 transition-transform hover:scale-105"
                >
                  <TemplateDisplay template={template} />
                </button>
              );
            })}
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            &times;
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default TemplateModal;
