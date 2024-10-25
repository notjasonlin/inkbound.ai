import readTemplate from "@/functions/readTemplate";
import { TemplateData } from "@/types/template";

interface TemplateDisplayProps {
    template: TemplateData;
}

const TemplateDisplay = ({ template }: TemplateDisplayProps) => {
    const formattedContent = template.content.content 
        ? (readTemplate(template) || '').replace(/\n/g, "<br />")
        : "";

    return (
        <div className="template-display">
            <div className="template-header">{template.title}</div>
            <div className="template-body">
                <p className="template-content" dangerouslySetInnerHTML={{ __html: formattedContent }} />
            </div>
            <style jsx>{`
                .template-display {
                    width: 100%;
                    aspect-ratio: 8.5 / 11;
                    background-color: #fff;
                    font-family: 'Arial', sans-serif;
                    line-height: 1.5;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    border: 1px solid #e0e0e0;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
                }

                .template-header {
                    padding: 8px 15px;
                    font-size: 14px;
                    font-weight: bold;
                    color: #1a73e8;
                    border-bottom: 1px solid #e0e0e0;
                }

                .template-body {
                    padding: 15px;
                    flex-grow: 1;
                    overflow: hidden;
                }

                .template-content {
                    font-size: 11px;
                    color: #202124;
                    white-space: pre-wrap;
                    word-wrap: break-word;
                    overflow-wrap: break-word;
                    text-align: left;
                }

                .template-content :global(br) {
                    display: block;
                    content: "";
                    margin-top: 0.5em;
                }
            `}</style>
        </div>
    );
}

export default TemplateDisplay;
