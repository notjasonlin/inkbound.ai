import React, { useEffect, useState } from "react";
import '@/styles/TemplateChecklist.css';

interface ChecklistProps {
    title: string;
    placeholders: string[];
    content: string;
    setAllMandatory?: (t: boolean) => void;
}

const TemplateChecklist = ({ title, placeholders, content, setAllMandatory }: ChecklistProps) => {
    const [included, setIncluded] = useState<Map<string, number>>(new Map());
    const [found, setFound] = useState<boolean>(true)

    useEffect(() => {
        const newIncluded = new Map<string, number>();
        setFound(true);
        placeholders.forEach((item) => {
            const count = content.split(item).length - 1;
            if (count == 0) setFound(false);
            newIncluded.set(item, count);
        });
        if (setAllMandatory) setAllMandatory(found);
        setIncluded(newIncluded);
    }, [content, placeholders]);

    return (
        <div className="checklist">
            <h2>{title}</h2>
            <ul>
                {placeholders.map((item) => (
                    <li
                        key={item}
                        className={included.get(item) ? "found" : "not-found"}
                    >
                        {item}: {included.get(item) || 0}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default TemplateChecklist;
