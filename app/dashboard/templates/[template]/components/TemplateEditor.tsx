"use client";
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from "@/utils/supabase/client";
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { debounce } from 'lodash';
import AIChatHelper from './AIChatHelper';
import PlaceHolderModal from './PlaceHolderModal';

interface Template {
  id: string;
  user_id: string;
  title: string;
  content: {
    title: string;
    content: string;
  };
}

const placeholders = [
  { label: 'School Name', value: '[schoolName]' },
  { label: 'Coach', value: '[coachLastName]' }
];

export default function TemplateEditor({ templateTitle }: { templateTitle: string; }) {
  const [template, setTemplate] = useState<Template | null>(null)
  const [title, setTitle] = useState(templateTitle);
  const [itemTitle, setItemTitle] = useState("");
  const [itemContent, setItemContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [selectedText, setSelectedText] = useState('');
  const [showAIHelper, setShowAIHelper] = useState(false);
  const [aiHelperPosition, setAIHelperPosition] = useState({ top: 0, left: 0 });
  const [history, setHistory] = useState<string[]>(['']);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectPlaceHolder, setSelectPlaceHolder] = useState<boolean>(false)
  const [placeHolder, setPlaceHolder] = useState<string>("");
  const [updateTrigger, setUpdateTrigger] = useState<boolean>(false);
  const [modalPosition, setModalPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const router = useRouter();
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const isUpdatingRef = useRef(false);
  const supabase = createClient();

  const addPlaceHolder = useCallback((event: KeyboardEvent) => {
    if (event.key === ":") {
      setSelectPlaceHolder(true);
  
      if (editorRef.current) {
        const { top, left } = editorRef.current.getBoundingClientRect();
        const { selectionStart } = editorRef.current;
  
        const textBeforeCursor = editorRef.current.value.substring(0, selectionStart);
        const textAreaStyle = window.getComputedStyle(editorRef.current);
        const lineHeight = parseInt(textAreaStyle.lineHeight, 10);
        const paddingLeft = parseInt(textAreaStyle.paddingLeft, 10);
        const paddingTop = parseInt(textAreaStyle.paddingTop, 10);
        
        // Get the line and column where the cursor is
        const cursorLine = textBeforeCursor.split('\n').length - 1;
        const cursorColumn = textBeforeCursor.split('\n').pop()?.length || 0;
  
        // Correct calculation of top position
        const topPosition = top + window.scrollY + paddingTop + (cursorLine * lineHeight) + lineHeight + 30;
        
        // Correct calculation of left position (ensure no progressive shift)
        const charWidth = textAreaStyle.fontSize ? parseInt(textAreaStyle.fontSize, 10) * 0.6 : 7; // Adjust this multiplier based on font size
        const leftPosition = left + window.scrollX + paddingLeft + (cursorColumn * charWidth);
  
        setModalPosition({ top: topPosition, left: leftPosition });
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
        const newText = itemContent.substring(0, selectionStart-1) + placeHolder + itemContent.substring(selectionEnd);
        
        updateContent(newText);

        // Move cursor to the end of the newly inserted placeholder
        setTimeout(() => {
            editorRef.current!.selectionStart = editorRef.current!.selectionEnd = selectionStart + placeHolder.length;
            editorRef.current!.focus();
        }, 0);

        setPlaceHolder(""); 
    }
}, [updateTrigger]);


  useEffect(() => {
    const grabTemplate = async () => {
      let { data, error } = await supabase
        .from('templates')
        .select('*')
        .eq("title", templateTitle);

      if (error) {
        console.error(error);
      } else if (data) {
        setTemplate({
          id: data[0].id,
          user_id: data[0].user_id,
          title: templateTitle,
          content: {
            title: data[0].content?.title,
            content: data[0].content?.content,
          }
        });
        setItemTitle(data[0].content?.title);
        setItemContent(data[0].content?.content);
        setHistory([data[0].content?.content])
      }

      setLoading(false);

    }
    grabTemplate();
  }, [])



  const saveTemplate = useCallback(async (newTitle: string, newItemTitle: string, newItemContent: string) => {
    if (isUpdatingRef.current) return;
    isUpdatingRef.current = true;
    setError(null);
    const supabase = createClient();
    try {
      const { error } = await supabase
        .from('templates')
        .update({
          title: newTitle,
          content: {
            title: newItemTitle,
            content: newItemContent
          }
        })
        .eq('id', template?.id)
        .eq('user_id', template?.user_id);

      if (error) throw error;

      router.refresh();
    } catch (error) {
      console.error('Error saving template:', error);
      setError('Failed to save template. Please try again.');
    } finally {
      isUpdatingRef.current = false;
    }
  }, [template, template?.id, template?.user_id, router]);

  const debouncedSave = useCallback(debounce(saveTemplate, 1000), [saveTemplate]);

  useEffect(() => {
    debouncedSave(title, itemTitle, itemContent);
  }, [title, itemTitle, itemContent, debouncedSave]);

  const updateContent = useCallback((newContent: string) => {
    if (newContent !== itemContent) {
      setItemContent(newContent);
      setHistory(prev => [...prev.slice(0, historyIndex + 1), newContent]);
      setHistoryIndex(prev => prev + 1);
    }
  }, [itemContent, historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1);
      setItemContent(history[historyIndex - 1]);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prev => prev + 1);
      setItemContent(history[historyIndex + 1]);
    }
  }, [history, historyIndex]);

  const handleInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateContent(e.target.value);
  }, [updateContent]);

  const handleTextSelection = () => {
    if (editorRef.current) {
      const start = editorRef.current.selectionStart;
      const end = editorRef.current.selectionEnd;
      setSelectedText(itemContent.substring(start, end));

      if (start !== end) {
        const rect = editorRef.current.getBoundingClientRect();
        setAIHelperPosition({
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX,
        });
        setShowAIHelper(true);
      } else {
        setShowAIHelper(false);
      }
    }
  };

  const applySuggestion = (suggestion: string) => {
    if (editorRef.current) {
      const start = editorRef.current.selectionStart;
      const end = editorRef.current.selectionEnd;
      const newContent = itemContent.substring(0, start) + suggestion + itemContent.substring(end);
      updateContent(newContent);

      // Set cursor position after the inserted suggestion
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.selectionStart = editorRef.current.selectionEnd = start + suggestion.length;
          editorRef.current.focus();
        }
      }, 0);
    }
    setSuggestions([]);
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto p-6">
      {loading ? (  // NEW: Display loading state
        <div className="flex justify-center items-center h-96">
          <div className="text-2xl font-semibold">Loading template...</div>
        </div>
      ) : (
        <>
          {selectPlaceHolder && <PlaceHolderModal
            isOpen={true}
            onClose={() => setSelectPlaceHolder(false)}
            setPlaceHolder={setPlaceHolder}
            trigger={() => setUpdateTrigger(!updateTrigger)}
            position={modalPosition}  // Pass modal position
          />}

          <div className="flex justify-between items-center mb-6">
            <Link href="/dashboard/templates" className="text-blue-600 hover:text-blue-800 font-semibold">
              ← Back to Templates
            </Link>
            <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
          </div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-2xl font-bold mb-6 p-3 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Template Title"
          />
          <div className="space-y-4 bg-white shadow-md rounded-lg p-6">
            <input
              type="text"
              value={itemTitle}
              onChange={(e) => setItemTitle(e.target.value)}
              placeholder="Item Title"
              className="block w-full text-xl font-semibold mb-4 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex space-x-2 mb-2">
              <button onClick={undo} className="px-2 py-1 bg-gray-200 rounded">Undo</button>
              <button onClick={redo} className="px-2 py-1 bg-gray-200 rounded">Redo</button>
            </div>
            <textarea
              ref={editorRef}
              value={itemContent}
              onChange={handleInput}
              onSelect={handleTextSelection}
              className="block w-full p-3 min-h-[16rem] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 overflow-auto"
              style={{ whiteSpace: 'pre-wrap' }}
            />
          </div>
          {showAIHelper && (
            <div style={{ position: 'absolute', top: aiHelperPosition.top, left: aiHelperPosition.left }}>
              <AIChatHelper
                selectedText={selectedText}
                onSuggest={setSuggestions}
                placeholders={placeholders}
              />
            </div>
          )}
          {suggestions.length > 0 && (
            <ul className="absolute bg-white border border-gray-300 rounded shadow-md mt-2">
              {suggestions.map((suggestion, index) => (
                <li
                  key={index}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => applySuggestion(suggestion)}
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
