"use client";
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
  const [found, setFound] = useState<boolean>(true);

  useEffect(() => {
    const newIncluded = new Map<string, number>();
    setFound(true);
    placeholders.forEach((item) => {
      const count = content.split(item).length - 1;
      if (count === 0) setFound(false);
      newIncluded.set(item, count);
    });
    if (setAllMandatory) setAllMandatory(found);
    setIncluded(newIncluded);
  }, [content, found, placeholders, setAllMandatory]);

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
      <h2 className="text-lg font-bold text-gray-900 mb-3">{title}</h2>
      <ul className="space-y-2">
        {placeholders.map((item) => {
          const count = included.get(item) || 0;
          const isFound = count > 0;
          return (
            <li key={item} className="flex items-center space-x-2 text-sm">
              <div className={isFound ? "text-green-600" : "text-blue-600"}>
                {isFound ? "✓" : "•"}
              </div>
              <div className="text-gray-700">
                {item}: <span className="font-semibold">{count}</span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default TemplateChecklist;
