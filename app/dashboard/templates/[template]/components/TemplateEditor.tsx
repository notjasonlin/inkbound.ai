"use client";
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from "@/utils/supabase/client";
import { useRouter } from 'next/navigation';
import { debounce } from 'lodash';
import PlaceHolderModal from './PlaceHolderModal';
import AIChatInterface from './AIChatInterface';
import { checkUserLimits, incrementUsage, getUserUsage } from '@/utils/checkUserLimits';

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
  const [userId, setUserId] = useState<string | null>(null);

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
      const newText = itemContent.substring(0, selectionStart - 1) + placeHolder + itemContent.substring(selectionEnd);

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
    const fetchUser = async () => {
      const supabase = createClient();
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Error fetching user:', error);
        setError('User not authenticated');
      } else if (user) {
        setUserId(user.id);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const fetchTemplate = async () => {
      if (!userId) return;

      setLoading(true);
      const supabase = createClient();

      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .eq('title', templateTitle)
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching template:', error);
        setError('Failed to load template');
      } else if (data) {
        setTemplate({
          id: data.id,
          user_id: userId,
          title: data.title,
          content: data.content
        });
        setItemTitle(data.content?.title || '');
        setItemContent(data.content?.content || '');
      }
      setLoading(false);
    };

    if (userId) {
      fetchTemplate();
    }
  }, [templateTitle, userId]);


  const [showAIChat, setShowAIChat] = useState(false);
  const [userUsage, setUserUsage] = useState<{
    ai_calls_used: number;
    ai_call_limit: number;
  } | null>(null);

  const saveTemplate = useCallback(async (newTitle: string, newItemTitle: string, newItemContent: string) => {
    if (isUpdatingRef.current || !userId || !template?.id) return;
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
        .eq('id', template.id)
        .eq('user_id', userId);

      if (error) throw error;

      setTemplate(prev => prev ? {...prev, title: newTitle, content: { title: newItemTitle, content: newItemContent }} : null);
      router.refresh();
    } catch (error) {
      console.error('Error saving template:', error);
      setError('Failed to save template. Please try again.');
    } finally {
      isUpdatingRef.current = false;
    }
  }, [template, router, userId]);

  const debouncedSave = useCallback(debounce(saveTemplate, 1000), [saveTemplate]);

  useEffect(() => {
    debouncedSave(title, itemTitle, itemContent);
  }, [title, itemTitle, itemContent, debouncedSave]);

  useEffect(() => {
    const fetchUsage = async () => {
      if (userId) {
        const usage = await getUserUsage();
        if (usage) {
          setUserUsage({
            ai_calls_used: usage.ai_calls_used,
            ai_call_limit: usage.ai_call_limit,
          });
        }
      }
    };

    fetchUsage();
  }, [userId]);

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

  const handleSendMessageToAI = async (message: string) => {
    if (!userId) return 'User not authenticated';

    const canUseAI = await checkUserLimits(userId, 'aiCall');
    if (!canUseAI) {
      return 'You have reached your AI usage limit. Please upgrade your plan to continue using AI features.';
    }

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: message,
          placeholders,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      await incrementUsage(userId, { ai_calls_used: 1 });
      setUserUsage(prev => prev ? {
        ...prev,
        ai_calls_used: (prev.ai_calls_used || 0) + 1
      } : null);
      return data.content;
    } catch (error) {
      console.error('Error sending message to AI:', error);
      return 'Sorry, there was an error processing your request.';
    }
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto p-6">
      {loading || !userId ? (
        <div className="flex justify-center items-center h-96">
          <div className="text-2xl font-semibold">Loading template...</div>
        </div>
      ) : (
        <>
          {selectPlaceHolder && (
            <PlaceHolderModal
              isOpen={true}
              onClose={() => setSelectPlaceHolder(false)}
              setPlaceHolder={setPlaceHolder}
              trigger={() => setUpdateTrigger(!updateTrigger)}
              position={modalPosition}  // Pass modal position
            />
          )}

          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => router.back()}
              className="text-blue-600 hover:text-blue-800 font-semibold flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back
            </button>
            <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
            <button
              onClick={() => setShowAIChat(!showAIChat)}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              {showAIChat ? 'Hide AI Chat' : 'Show AI Chat'}
            </button>
          </div>

          <div className="flex">
            <div className={`space-y-4 bg-white shadow-md rounded-lg p-6 ${showAIChat ? 'w-2/3' : 'w-full'}`}>
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

              {error && <div className="text-red-500 mt-4">{error}</div>}
            </div>

            {showAIChat && (
              <div className="w-1/3 ml-4">
                <AIChatInterface
                  userCredits={userUsage ? userUsage.ai_call_limit - userUsage.ai_calls_used : 0}
                  onSendMessage={handleSendMessageToAI}
                />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
