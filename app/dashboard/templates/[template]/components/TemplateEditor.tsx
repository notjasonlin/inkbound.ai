"use client";
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from "@/utils/supabase/client";
import { useRouter } from 'next/navigation';
import { debounce } from 'lodash';
import PlaceHolderModal from './PlaceHolderModal';
import AIChatInterface from './AIChatInterface';

interface Template {
  id: string;
  user_id: string;
  title: string;
  content: {
    title: string;
    content: string;
  };
}

export default function TemplateEditor({ templateTitle }: { templateTitle: string; }) {
  const [template, setTemplate] = useState<Template | null>(null);
  const [title, setTitle] = useState(templateTitle);
  const [itemTitle, setItemTitle] = useState("");
  const [itemContent, setItemContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [selectPlaceHolder, setSelectPlaceHolder] = useState<boolean>(false);
  const [placeHolder, setPlaceHolder] = useState<string>("");
  const [updateTrigger, setUpdateTrigger] = useState<boolean>(false);
  const [modalPosition, setModalPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [history, setHistory] = useState<string[]>(['']);
  const [historyIndex, setHistoryIndex] = useState(0);
  const router = useRouter();
  const editorRef = useRef<HTMLTextAreaElement>(null);

  const addPlaceHolder = useCallback((event: KeyboardEvent) => {
    if (event.key === ":") {
      setSelectPlaceHolder(true);
      if (editorRef.current) {
        const { top, left, width, height } = editorRef.current.getBoundingClientRect();
        const modalTop = top + window.scrollY + height / 2;
        const modalLeft = left + window.scrollX + width / 2;
        setModalPosition({ top: modalTop, left: modalLeft });
      }
    } else if ([" ", "Enter", "Tab", "Backspace"].includes(event.key)) {
      setSelectPlaceHolder(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", addPlaceHolder);
    return () => {
      document.removeEventListener("keydown", addPlaceHolder);
    };
  }, [addPlaceHolder]);

  useEffect(() => {
    if (placeHolder && editorRef.current) {
      const { selectionStart, selectionEnd } = editorRef.current;
      const newText = itemContent.substring(0, selectionStart - 1) + placeHolder + itemContent.substring(selectionEnd);
      updateContent(newText);
      setPlaceHolder("");
    }
  }, [updateTrigger]);

  const updateContent = (newContent: string) => {
    setItemContent(newContent);
    setHistory(prev => [...prev.slice(0, historyIndex + 1), newContent]);
    setHistoryIndex(prev => prev + 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1);
      setItemContent(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prev => prev + 1);
      setItemContent(history[historyIndex + 1]);
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateContent(e.target.value);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-blue-100 min-h-screen">
      {selectPlaceHolder && (
        <PlaceHolderModal
          isOpen={true}
          onClose={() => setSelectPlaceHolder(false)}
          setPlaceHolder={setPlaceHolder}
          trigger={() => setUpdateTrigger(!updateTrigger)}
          position={modalPosition}
        />
      )}
      <div className="flex justify-between items-center mb-6">
        <button onClick={() => router.back()} className="text-blue-600 hover:text-blue-800 font-semibold">
          &larr; Back
        </button>
        <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
        <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Show AI Chat</button>
      </div>

      <div className="bg-white shadow-lg rounded-lg p-6 space-y-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-2xl font-bold mb-6 p-3 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          placeholder="Template Title"
        />
        <input
          type="text"
          value={itemTitle}
          onChange={(e) => setItemTitle(e.target.value)}
          placeholder="Item Title"
          className="block w-full text-xl font-semibold mb-4 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex space-x-2 mb-2">
          <button onClick={undo} className="px-2 py-1 bg-gray-200 rounded">Undo</button>
          <button onClick={redo} className="px-2 py-1 bg-gray-200 rounded">Redo</button>
        </div>
        <textarea
          ref={editorRef}
          value={itemContent}
          onChange={handleInput}
          className="block w-full p-3 min-h-[16rem] border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 overflow-auto"
          style={{ whiteSpace: 'pre-wrap' }}
        />
      </div>

      {error && <div className="text-red-500 mt-4">{error}</div>}
    </div>
  );
}
