"use client";

import React from 'react';
import { useState, useCallback } from 'react';
import debounce from 'lodash/debounce';
import { PlayerStats, FormField } from '@/types/background/index';
import { initialFormData, formFields } from './constants';
import { InputField } from './components/InputField';
import { useSupabaseClient } from '@supabase/auth-helpers-react';

export default function BackgroundPage() {
  const [formData, setFormData] = useState<PlayerStats>(initialFormData);
  const supabase = useSupabaseClient();

  const debouncedUpdate = useCallback(
    debounce(async (updatedData: Partial<PlayerStats>) => {
      try {
        const { data, error } = await supabase
          .from('player_profiles')
          .upsert({ stats: updatedData }, { onConflict: 'user_id' });
        if (error) throw error;
      } catch (error) {
        console.error('Error updating:', error);
      }
    }, 500),
    [supabase]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const updatedData = { ...formData, [name]: value };
    setFormData(updatedData);
    debouncedUpdate(updatedData);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Background Information</h1>
      <form style={styles.form}>
        {formFields.map((field: FormField) => (
          <InputField
            key={field.name}
            label={field.label}
            name={field.name}
            value={formData[field.name]}
            onChange={handleChange}
          />
        ))}
      </form>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
  },
  title: {
    textAlign: 'center',
    marginBottom: '20px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '15px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
  },
  label: {
    marginBottom: '5px',
  },
  input: {
    padding: '10px',
    fontSize: '16px',
    borderRadius: '4px',
    border: '1px solid #ccc',
  },
  button: {
    padding: '10px 20px',
    fontSize: '16px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    alignSelf: 'center',
  },
};
