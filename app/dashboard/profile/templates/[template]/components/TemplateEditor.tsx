"use client";
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from "@/utils/supabase/client";
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { debounce } from 'lodash';

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

export default function TemplateEditor({ template, userId }: { template: Template; userId: string }) {
  const [title, setTitle] = useState(template.title);
  const [itemTitle, setItemTitle] = useState(template.content?.title || '');
  const [itemContent, setItemContent] = useState(template.content?.content || '');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const editorRef = useRef<HTMLDivElement>(null);

  const saveTemplate = useCallback(async (newTitle: string, newItemTitle: string, newItemContent: string) => {
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
    }
  }, [template.id, userId, router]);

  const debouncedSave = useCallback(debounce(saveTemplate, 1000), [saveTemplate]);

  useEffect(() => {
    debouncedSave(title, itemTitle, itemContent);
  }, [title, itemTitle, itemContent, debouncedSave]);

  const handleDragStart = (e: React.DragEvent, placeholder: string) => {
    e.dataTransfer.setData('text/plain', placeholder);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const placeholder = e.dataTransfer.getData('text');
    insertPlaceholder(placeholder);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const insertPlaceholder = (placeholder: string) => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const placeholderSpan = createPlaceholderSpan(placeholder);
      range.deleteContents();
      range.insertNode(placeholderSpan);
      range.setStartAfter(placeholderSpan);
      range.setEndAfter(placeholderSpan);
      selection.removeAllRanges();
      selection.addRange(range);
      updateContent();
    }
  };

  const createPlaceholderSpan = (placeholder: string) => {
    const span = document.createElement('span');
    span.className = 'bg-blue-100 text-blue-800 px-2 py-1 rounded-full inline-block';
    span.contentEditable = 'false';
    span.setAttribute('data-placeholder', placeholder);
    span.textContent = placeholders.find(p => p.value === placeholder)?.label || placeholder;
    return span;
  };

  const updateContent = () => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML;
      setItemContent(content);
    }
  };

  const handleInput = () => {
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const node = range.startContainer;
    
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || '';
      const cursorPosition = range.startOffset;

      for (const placeholder of placeholders) {
        const placeholderIndex = text.lastIndexOf(placeholder.value, cursorPosition);
        if (placeholderIndex !== -1 && placeholderIndex + placeholder.value.length === cursorPosition) {
          const placeholderSpan = createPlaceholderSpan(placeholder.value);
          const textBefore = text.substring(0, placeholderIndex);
          const textAfter = text.substring(cursorPosition);

          const newTextNode = document.createTextNode(textBefore + textAfter);
          node.parentNode?.replaceChild(newTextNode, node);
          newTextNode.parentNode?.insertBefore(placeholderSpan, newTextNode.nextSibling);

          range.setStartAfter(placeholderSpan);
          range.setEndAfter(placeholderSpan);
          selection.removeAllRanges();
          selection.addRange(range);

          updateContent();
          return; // Exit the function instead of using break
        }
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      document.execCommand('insertLineBreak');
    }
  };

  const escapeRegExp = (string: string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <Link href="/dashboard/profile/templates" className="text-blue-600 hover:text-blue-800 font-semibold">
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
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2 text-gray-700">Placeholders</h3>
          <div className="flex flex-wrap gap-2">
            {placeholders.map((placeholder) => (
              <div
                key={placeholder.value}
                draggable
                onDragStart={(e) => handleDragStart(e, placeholder.value)}
                className="bg-blue-100 text-blue-800 px-3 py-2 rounded-full cursor-move hover:bg-blue-200 transition-colors duration-200"
              >
                {placeholder.label}
              </div>
            ))}
          </div>
        </div>
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          dangerouslySetInnerHTML={{ __html: itemContent }}
          className="block w-full p-3 min-h-[16rem] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 overflow-auto"
          style={{ whiteSpace: 'pre-wrap' }}
        />
      </div>
      {error && <div className="text-red-500 mt-4">{error}</div>}
    </div>
  );
}
