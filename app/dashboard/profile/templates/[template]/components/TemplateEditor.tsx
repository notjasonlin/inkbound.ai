"use client";
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from "@/utils/supabase/client";
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { debounce } from 'lodash';
import AIChatInterface from './AIChatInterface';
import { checkUserLimits, incrementUsage, getUserUsage } from '@/utils/checkUserLimits';

interface Template {
  id: string;
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

const handleDragStart = (e: React.DragEvent, value: string) => {
  e.dataTransfer.setData('text/plain', value);
};

export default function TemplateEditor({ template, userId }: { template: Template; userId: string }) {
  const [title, setTitle] = useState(template.title);
  const [itemTitle, setItemTitle] = useState(template.content?.title || '');
  const [itemContent, setItemContent] = useState(template.content?.content || '');
  const [error, setError] = useState<string | null>(null);
  const [selectedText, setSelectedText] = useState('');
  const [showAIHelper, setShowAIHelper] = useState(false);
  const [aiHelperPosition, setAIHelperPosition] = useState({ top: 0, left: 0 });
  const [history, setHistory] = useState<string[]>([template.content?.content || '']);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const router = useRouter();
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const isUpdatingRef = useRef(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [userUsage, setUserUsage] = useState<{
    ai_calls_used: number;
    ai_call_limit: number;
  } | null>(null);

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
        .eq('id', template.id)
        .eq('user_id', userId);

      if (error) throw error;

      router.refresh();
    } catch (error) {
      console.error('Error saving template:', error);
      setError('Failed to save template. Please try again.');
    } finally {
      isUpdatingRef.current = false;
    }
  }, [template.id, userId, router]);

  const debouncedSave = useCallback(debounce(saveTemplate, 1000), [saveTemplate]);

  useEffect(() => {
    debouncedSave(title, itemTitle, itemContent);
  }, [title, itemTitle, itemContent, debouncedSave]);

  useEffect(() => {
    const fetchUsage = async () => {
      const usage = await getUserUsage(userId);
      if (usage) {
        setUserUsage({
          ai_calls_used: usage.ai_calls_used,
          ai_call_limit: usage.ai_call_limit,
        });
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

  const insertPlaceholder = (placeholder: string) => {
    if (editorRef.current) {
      const start = editorRef.current.selectionStart;
      const end = editorRef.current.selectionEnd;
      const newContent = itemContent.substring(0, start) + placeholder + itemContent.substring(end);
      updateContent(newContent);
      
      // Set cursor position after the inserted placeholder
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.selectionStart = editorRef.current.selectionEnd = start + placeholder.length;
          editorRef.current.focus();
        }
      }, 0);
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
      await incrementUsage(userId, 'aiCall');
      setUserUsage(prev => prev ? {
        ...prev,
        ai_calls_used: prev.ai_calls_used + 1
      } : null);
      return data.content;
    } catch (error) {
      console.error('Error sending message to AI:', error);
      return 'Sorry, there was an error processing your request.';
    }
  };

  return (
    <div className="space-y-4 max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <Link href="/dashboard/profile/templates" className="text-blue-600 hover:text-blue-800 font-semibold">
          ← Back to Templates
        </Link>
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
          <input
            type="text"
            value={itemTitle}
            onChange={(e) => setItemTitle(e.target.value)}
            placeholder="Item Title"
            className="block w-full text-xl font-semibold mb-4 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2 text-gray-700">Placeholders</h3>
            <div className="flex flex-wrap gap-2">
              {placeholders.map((placeholder) => (
                <div
                  key={placeholder.value}
                  draggable
                  onDragStart={(e) => handleDragStart(e, placeholder.value)}
                  onClick={() => insertPlaceholder(placeholder.value)}
                  className="bg-blue-100 text-blue-800 px-3 py-2 rounded-full cursor-pointer hover:bg-blue-200 transition-colors duration-200"
                >
                  {placeholder.label}
                </div>
              ))}
            </div>
          </div>
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
        {showAIChat && (
          <div className="w-1/3 ml-4">
            <AIChatInterface 
              userCredits={userUsage ? userUsage.ai_call_limit - userUsage.ai_calls_used : 0} 
              onSendMessage={handleSendMessageToAI} 
            />
          </div>
        )}
      </div>
      {error && <div className="text-red-500 mt-4">{error}</div>}
    </div>
  );
}
