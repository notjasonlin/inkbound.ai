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

const placeholders = [
  { label: 'School Name', value: '[schoolName]' },
  { label: 'Coach', value: '[coachLastName]' }
];

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
      setPlaceHolder("");
    }
  }, [updateTrigger]);

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
  }, []);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prev => prev + 1);
      setItemContent(history[historyIndex + 1]);
    }
  }, [history, historyIndex]);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateContent(e.target.value);
  };

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
      console.error('Error sending data', error);
      return 'Sorry, there was an error processing your request.';
    }
  };

  return (
    <div className="template-editor-container">
      {loading || !userId ? (
        <div className="flex justify-center items-center h-96">
          <div className="text-2xl font-semibold">Loading template...</div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-blue-100 min-h-screen">
          {selectPlaceHolder && (
            <PlaceHolderModal
              isOpen={true}
              onClose={() => setSelectPlaceHolder(false)}
              setPlaceHolder={setPlaceHolder}
              trigger={() => setUpdateTrigger(!updateTrigger)}
              position={modalPosition} // Pass modal position
            />
          )}
  
          {alert && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
              <Alert
                header={"Mandatory Placeholders Missing!"}
                message={"Are you sure you want to exit without these placeholders?"}
                type={"warning"}
                onClose={() => setAlert(false)}
                onConfirm={() => router.back()}
              />
            </div>
          )}
  
          <div className="template-editor-header">
            <button
              onClick={() => {
                if (!allMandatory) {
                  setAlert(true);
                } else {
                  router.back();
                }
              }}
              className="back-button"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
              Back
            </button>
            <h1 className="template-title">{title}</h1>
            <button onClick={() => setShowAIChat(!showAIChat)} className="ai-chat-toggle">
              {showAIChat ? "Hide AI Chat" : "Show AI Chat"}
            </button>
          </div>
  
          <div className="template-editor-body">
            <div className="checklist-container">
              <TemplateChecklist
                title={"Mandatory"}
                placeholders={["[coachLastName]", "[schoolName]"]}
                content={itemContent}
                setAllMandatory={setAllMandatory}
              />
              <TemplateChecklist
                title={"Optional"}
                placeholders={[
                  "[studentFullName]",
                  "[studentFirstName]",
                  "[studentLastName]",
                ]}
                content={itemContent}
              />
            </div>
  
            <div className="input-container">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="template-title-input"
                placeholder="Template Title"
              />
  
              <div className="input-box">
                <input
                  type="text"
                  value={itemTitle}
                  onChange={(e) => setItemTitle(e.target.value)}
                  placeholder="Item Title"
                  className="item-title-input"
                />
                <div className="action-buttons">
                  <button onClick={undo} className="action-button">
                    Undo
                  </button>
                  <button onClick={redo} className="action-button">
                    Redo
                  </button>
                </div>
                <textarea
                  ref={editorRef}
                  value={itemContent}
                  onChange={handleInput}
                  onSelect={handleTextSelection}
                  className="text-area"
                />
              </div>
  
              {error && <div className="error-message">{error}</div>}
            </div>
  
            {showAIChat && (
              <div className="ai-chat-container">
                <AIChatInterface
                  userCredits={
                    userUsage ? userUsage.ai_call_limit - userUsage.ai_calls_used : 0
                  }
                  onSendMessage={handleSendMessageToAI}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
  
}


