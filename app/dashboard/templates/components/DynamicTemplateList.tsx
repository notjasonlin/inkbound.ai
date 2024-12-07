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

  useEffect(() => {
    const channel = supabase
      .channel('table-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'templates' }, payload => {
        if (payload.eventType === 'INSERT' && payload.new.user_id === userId) {
          setTemplates(prev => [payload.new as TemplateData, ...prev]);
        } else if (payload.eventType === 'DELETE' && payload.old.user_id === userId) {
          setTemplates(prev => prev.filter(template => template.id !== payload.old.id));
        } else if (payload.eventType === 'UPDATE' && payload.new.user_id === userId) {
          setTemplates(prev => prev.map(template =>
            template.id === payload.new.id ? payload.new as TemplateData : template
          ));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, userId]);

  const handleDelete = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setTemplates(prev => prev.filter(template => template.id !== id));
    } catch (error) {
      console.error('Error deleting data:', error);
    }
  }, [supabase]);

  const handleDuplicate = useCallback(async (templateToDuplicate: TemplateData) => {
    try {
      const duplicatedTemplate = {
        ...templateToDuplicate,
        id: undefined,
        title: `${templateToDuplicate.title} (Copy)`,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('templates')
        .insert(duplicatedTemplate)
        .select()
        .single();

      if (error) throw error;
      setTemplates(prev => [data as TemplateData, ...prev]);
    } catch (error) {
      console.error('Error duplicating data:', error);
    }
  }, [supabase]);

  return (
    <div className="min-h-screen text-white py-8 px-6">
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
