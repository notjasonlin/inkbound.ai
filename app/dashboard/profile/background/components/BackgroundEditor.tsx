"use client";
import { useState, useEffect, useCallback } from 'react';
import { createClient } from "@/utils/supabase/client";
import { useRouter } from 'next/navigation';
import { debounce } from 'lodash';
import { PlayerStats, FormField } from '@/types/background/index';
import { initialFormData, formFields } from '../constants';
import { InputField } from '@/app/dashboard/profile/background/components/InputField';

interface BackgroundProfile {
  id: string;
  user_id: string;
  stats: PlayerStats;
}

export default function BackgroundEditor({ profile, userId }: { profile: BackgroundProfile; userId: string }) {
  const [formData, setFormData] = useState<PlayerStats>(profile.stats || initialFormData);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const saveBackground = useCallback(async (newData: PlayerStats) => {
    setError(null);
    const supabase = createClient();
    
    try {
      const { error } = await supabase
        .from('player_profiles')
        .update({ stats: newData })
        .eq('id', profile.id)
        .eq('user_id', userId);

      if (error) throw error;

      router.refresh();
    } catch (error) {
      console.error('Error saving data:', error);
      setError('Failed to save background. Please try again.');
    }
  }, [profile.id, userId, router]);

  const debouncedSave = useCallback(debounce(saveBackground, 1000), [saveBackground]);

  useEffect(() => {
    debouncedSave(formData);
  }, [formData, debouncedSave]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold mb-4">Background Information</h1>
      <form className="space-y-4">
        {formFields.map((field: FormField) => (
          <InputField
            key={field.name}
            label={field.label}
            name={field.name}
            value={formData[field.name] || ''}
            onChange={handleChange}
          />
        ))}
      </form>
      {error && <div className="text-red-500">{error}</div>}
    </div>
  );
}
