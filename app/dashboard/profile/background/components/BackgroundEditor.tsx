"use client";
import { useState } from 'react';
import { createClient } from "@/utils/supabase/client";
import { useRouter } from 'next/navigation';
import { PlayerStats, FormField } from '@/types/background/index';
import { initialFormData, formFields } from '../constants';
import InputField from '@/app/dashboard/profile/background/components/InputField';

interface BackgroundProfile {
  id: string;
  user_id: string;
  stats: PlayerStats;
}

export default function BackgroundEditor({ profile, userId }: { profile: BackgroundProfile; userId: string }) {
  const [formData, setFormData] = useState<PlayerStats>(profile.stats || initialFormData);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSave = async () => {
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    const cappedFormData = {
      ...formData,
      satScore: Math.min(formData.satScore, 1600),
      actScore: Math.min(formData.actScore, 36),
    };

    try {
      const { error } = await supabase
        .from('player_profiles')
        .update({ stats: cappedFormData })
        .eq('id', profile.id)
        .eq('user_id', userId);

      if (error) throw error;

      setSuccess("Changes saved successfully.");
      router.refresh();
    } catch (error) {
      console.error('Error saving background:', error);
      setError('Failed to save background. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    setFormData(prev => {
      if (type === 'checkbox' && e.target instanceof HTMLInputElement) {
        const checked = e.target.checked;
        const updatedSizes = checked
          ? [...(prev.preferredStudentBodySize || []), value]
          : (prev.preferredStudentBodySize || []).filter(size => size !== value);
        return { ...prev, preferredStudentBodySize: updatedSizes };
      }
      return { ...prev, [name]: type === 'number' ? Number(value) : value };
    });
  };

  return (
    <div className="max-w-lg mx-auto bg-gradient-to-br from-white to-blue-50 shadow-lg rounded-xl p-8 space-y-6">
      <h1 className="text-3xl font-extrabold text-center text-blue-800 mb-6">Edit Background Information</h1>
      {error && <div className="text-red-600 text-center">{error}</div>}
      {success && <div className="text-green-600 text-center">{success}</div>}

      <button
        onClick={handleSave}
        className="w-full bg-blue-700 text-white font-bold py-3 rounded-md mb-4 transition-transform hover:scale-105 hover:shadow-md flex justify-center items-center"
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="w-5 h-5 border-4 border-t-transparent border-white rounded-full animate-spin"></div>
        ) : (
          "Save Changes"
        )}
      </button>

      <form className="space-y-6">
        {formFields.map((field: FormField) => (
          field.name === 'preferredStudentBodySize' ? (
            <div key={field.name} className="flex flex-col">
              <label className="font-semibold text-blue-700">{field.label}</label>
              <div className="grid grid-cols-2 gap-4">
                {field.options?.map(option => (
                  <label key={option} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name={field.name}
                      value={option}
                      checked={(formData.preferredStudentBodySize || []).includes(option)}
                      onChange={handleChange}
                      className="form-checkbox text-blue-600 w-5 h-5"
                    />
                    <span className="text-blue-900">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          ) : (
            <InputField
              key={field.name}
              label={field.label}
              name={field.name}
              value={formData[field.name]}
              onChange={handleChange}
              type={field.type}
              options={field.options}
            />
          )
        ))}
      </form>

      <button
        onClick={handleSave}
        className="w-full bg-blue-700 text-white font-bold py-3 rounded-md mt-4 transition-transform hover:scale-105 hover:shadow-md flex justify-center items-center"
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="w-5 h-5 border-4 border-t-transparent border-white rounded-full animate-spin"></div>
        ) : (
          "Save Changes"
        )}
      </button>
    </div>
  );
}
