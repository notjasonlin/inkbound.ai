import readTemplate from "@/functions/readTemplate";
import { TemplateData } from "@/types/template";

interface TemplateDisplayProps {
    template: TemplateData;
}

const TemplateDisplay = ({ template }: TemplateDisplayProps) => {
    const formattedContent = template.content.content 
        ? (readTemplate(template) || '').replace(/\n/g, "<br />") + "..." 
        : "";

    return (
        <div
            style={{
                width: "280px", // Approximate width for 8x11 ratio (8.5 x 11 in pixels)
                height: "360px", // Keep the height proportional
                padding: "35px", // Extra padding for more realistic document space
                border: "1px solid #ddd",
                // borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                backgroundColor: "#fff",
                fontFamily: "'Roboto', sans-serif", // Google Docs-like font
                lineHeight: "1.5",
                margin: "0 auto", // Center the document
                overflow: "hidden", // To ensure text doesn't overflow the container
            }}
        >
            <h3
                style={{
                    marginBottom: "20px",
                    fontSize: "24px",
                    fontWeight: "bold",
                    borderBottom: "1px solid #eee",
                    paddingBottom: "10px"
                }}
            >
                {template ? template.content.title : "Create New Template"}
            </h3>
            <p
                style={{ 
                    fontSize: "16px", 
                    color: "#333", 
                    whiteSpace: "pre-wrap", 
                    wordWrap: "break-word", 
                    overflowWrap: "break-word", 
                    textAlign: "left",
                }}
                dangerouslySetInnerHTML={{ __html: formattedContent }} // Set HTML to display line breaks
            />
        </div>
    );
}

export default TemplateDisplay;
