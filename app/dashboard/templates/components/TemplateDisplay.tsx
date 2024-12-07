import readTemplate from "@/functions/readTemplate";
import { TemplateData } from "@/types/template";
import '@/styles/TemplateDisplay.css';

interface TemplateDisplayProps {
    template: TemplateData;
}

const TemplateDisplay = ({ template }: TemplateDisplayProps) => {
    const formattedContent = template.content.content 
        ? (readTemplate(template) || '').replace(/\n/g, "<br />")
        : "";

    return (
        <div className="template-display ">
            <div className="template-header">{template.title}</div>
            <div className="template-body ">
                <p className="template-content" dangerouslySetInnerHTML={{ __html: formattedContent }} />
            </div>
        </div>
    );
}

export default TemplateDisplay;