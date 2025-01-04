"use client";
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from "@/utils/supabase/client";
import { useRouter } from 'next/navigation';
import { debounce } from 'lodash';
import PlaceHolderModal from './PlaceHolderModal';
import AIChatInterface from './AIChatInterface';
import { checkUserLimits, incrementUsage, getUserUsage } from '@/utils/checkUserLimits';
import TemplateChecklist from './TemplateChecklist';
import Alert from "@/components/ui/Alert";
import '@/styles/TemplateEditor.css';

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
  const [updateItemTrigger, setUpdateItemTrigger] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectPlaceHolder, setSelectPlaceHolder] = useState<boolean>(false);
  const [placeHolder, setPlaceHolder] = useState<string>("");
  const [updatePHTrigger, setupdatePHTrigger] = useState<boolean>(false);
  const [modalPosition, setModalPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [selectedText, setSelectedText] = useState('');
  const [showAIHelper, setShowAIHelper] = useState(false);
  const [aiHelperPosition, setAIHelperPosition] = useState({ top: 0, left: 0 });
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [history, setHistory] = useState<string[]>(['']);
  const [historyIndex, setHistoryIndex] = useState(0);
  const router = useRouter();
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const isUpdatingRef = useRef(false);
  const supabase = createClient();
  const [userId, setUserId] = useState<string | null>(null);
  const [allMandatory, setAllMandatory] = useState<boolean>(false);
  const [alert, setAlert] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

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
      setUpdateItemTrigger(!updateItemTrigger);
      setPlaceHolder("");
    }
  }, [updatePHTrigger]);

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Error fetching data', error);
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
        console.error('Error fetching data', error);
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


  // **Debounced Save**
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
            content: newItemContent,
            personalizedMessage: newItemContent.includes("[personalizedMessage]"),
          }
        })
        .eq('id', template.id)
        .eq('user_id', userId);

      if (error) throw error;

      setTemplate(prev => prev ? { ...prev, title: newTitle, content: { title: newItemTitle, content: newItemContent } } : null);
      router.refresh();
    } catch (error) {
      console.error('Error saving data', error);
      setError('Failed to save template. Please try again.');
    } finally {
      isUpdatingRef.current = false;
    }
  }, [template, router, userId]);

  const debouncedSave = useCallback(debounce(saveTemplate, 1000), [saveTemplate]);

  useEffect(() => {
    debouncedSave(title, itemTitle, itemContent);
  }, [updateItemTrigger]);

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
  }, [historyIndex, history]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prev => prev + 1);
      setItemContent(history[historyIndex + 1]);
    }
  }, [historyIndex, history]);


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
      return 'You have reached your AI usage limit. Please upgrade to continue using AI features.';
    }

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: message, placeHolder }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      await incrementUsage(userId, { ai_calls_used: 1 });
      setUserUsage(prev => prev ? { ...prev, ai_calls_used: (prev.ai_calls_used || 0) + 1 } : null);
      return data.content;
    } catch (error) {
      console.error('Error sending data', error);
      return 'Sorry, there was an error processing your request.';
    }
  };

return (
    <div className="w-full min-h-screen bg-white">
      {loading || !userId ? (
        <div className="flex justify-center items-center h-96">
          <div className="text-2xl font-semibold text-gray-700">Loading template...</div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {selectPlaceHolder && (
            <PlaceHolderModal
              isOpen={true}
              onClose={() => setSelectPlaceHolder(false)}
              setPlaceHolder={setPlaceHolder}
              trigger={() => setupdatePHTrigger(!updatePHTrigger)}
              position={modalPosition}
            />
          )}

          {alert && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
              <Alert
                header="Mandatory Placeholders Missing!"
                message="Are you sure you want to exit without these placeholders?"
                type="warning"
                onClose={() => setAlert(false)}
                onConfirm={() => router.back()}
              />
            </div>
          )}

          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => {
                if (!allMandatory) {
                  setAlert(true);
                } else {
                  router.back();
                }
              }}
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back
            </button>
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
            <button
              onClick={() => setShowAIChat(!showAIChat)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-md shadow-sm transition-colors"
            >
              {showAIChat ? "Hide AI Chat" : "Show AI Chat"}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
              <TemplateChecklist
                title="Mandatory"
                placeholders={[
                  "[coachLastName]",
                  "[schoolName]",
                  "[personalizedMessage]"
                ]}
                content={itemContent}
                setAllMandatory={setAllMandatory}
              />
            </div>

            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 space-y-4">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-lg font-semibold text-gray-900 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Template Title"
                />

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 sm:space-x-4">
                  <input
                    type="text"
                    value={itemTitle}
                    onChange={(e) => setItemTitle(e.target.value)}
                    placeholder="Item Title"
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="space-x-2 flex-shrink-0">
                    <button
                      onClick={undo}
                      className="px-3 py-1.5 text-sm font-medium bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
                    >
                      Undo
                    </button>
                    <button
                      onClick={redo}
                      className="px-3 py-1.5 text-sm font-medium bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
                    >
                      Redo
                    </button>
                  </div>
                </div>

                <textarea
                  ref={editorRef}
                  value={itemContent}
                  onChange={(e) => {
                    updateContent(e.target.value);
                    setUpdateItemTrigger(!updateItemTrigger);
                  }}
                  onSelect={handleTextSelection}
                  className="w-full h-48 border border-gray-300 rounded-md px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Type your template content here..."
                />

                {error && <div className="text-red-600 text-sm font-medium">{error}</div>}
              </div>
              {showAIChat && (
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 space-y-4">
                  <h2 className="text-xl font-bold text-gray-900">AI Chat</h2>
                  <AIChatInterface
                    userCredits={userUsage ? userUsage.ai_call_limit - userUsage.ai_calls_used : 0}
                    onSendMessage={handleSendMessageToAI}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
