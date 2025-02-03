"use client";

import { useState, useEffect, useCallback } from 'react';
import { createClient } from "@/utils/supabase/client";
import TemplateItem from './TemplateItem';
import { TemplateData } from '@/types/template';

interface DynamicTemplateListProps {
  initialTemplates: TemplateData[];
  userId: string;
}

export default function DynamicTemplateList({ initialTemplates, userId }: DynamicTemplateListProps) {
  const [templates, setTemplates] = useState<TemplateData[]>(initialTemplates);
  const supabase = createClient();

  const fetchTemplates = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  }, [userId]);

  // Fetch templates periodically
  useEffect(() => {
    fetchTemplates();
    const interval = setInterval(fetchTemplates, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, [fetchTemplates]);

  const handleDelete = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchTemplates(); // Refresh the list after deletion
    } catch (error) {
      console.error('Error deleting template:', error);
    }
  }, [supabase, fetchTemplates]);

  const handleDuplicate = useCallback(async (templateToDuplicate: TemplateData) => {
    try {
      // Get existing templates with similar names
      const { data: existingTemplates, error: fetchError } = await supabase
        .from('templates')
        .select('title')
        .ilike('title', `${templateToDuplicate.title}%`)
        .order('title', { ascending: true });

      if (fetchError) throw fetchError;

      // Find next available copy number
      let copyNumber = 1;
      let newTitle = `${templateToDuplicate.title} (Copy)`;

      if (existingTemplates && existingTemplates.length > 0) {
        const copyRegex = new RegExp(`${templateToDuplicate.title} \\(Copy( (\\d+))?\\)`);
        const usedNumbers = existingTemplates
          .map(template => {
            const match = template.title.match(copyRegex);
            return match ? (match[2] ? parseInt(match[2]) : 1) : 0;
          })
          .filter(num => num > 0);

        if (usedNumbers.length > 0) {
          copyNumber = Math.max(...usedNumbers) + 1;
          newTitle = `${templateToDuplicate.title} (Copy ${copyNumber})`;
        }
      }

      const duplicatedTemplate = {
        ...templateToDuplicate,
        id: undefined,
        title: newTitle,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('templates')
        .insert(duplicatedTemplate);

      if (error) throw error;
      await fetchTemplates(); // Refresh the list after duplication
    } catch (error) {
      console.error('Error duplicating template:', error);
    }
  }, [supabase, fetchTemplates]);

  return (
    <div className="min-h-screen py-8 px-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {templates.map(template => (
          <TemplateItem
            key={template.id}
            template={template}
            onDelete={handleDelete}
            onDuplicate={handleDuplicate}
          />
        ))}
      </div>
    </div>
  );
}
