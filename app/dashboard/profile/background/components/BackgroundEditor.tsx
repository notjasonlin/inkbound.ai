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
  const [formData, setFormData] = useState<PlayerStats>(() => {
    const validFields: PlayerStats = {
      satScore: profile.stats?.satScore || 0,
      actScore: profile.stats?.actScore || 0,
      unweightedGpa: profile.stats?.unweightedGpa || 0,
      intendedMajor: profile.stats?.intendedMajor || '',
      preferredStudentBodySize: profile.stats?.preferredStudentBodySize || [],
      homeState: profile.stats?.homeState || '',
      preferHomeStateSchool: profile.stats?.preferHomeStateSchool || '',
      financialAidQualification: profile.stats?.financialAidQualification || ''
    };
    return validFields;
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSave = async () => {
    console.log('Save initiated with form data:', formData);
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    const cappedFormData = {
      ...formData,
      satScore: Math.min(formData.satScore, 1600),
      actScore: Math.min(formData.actScore, 36),
      unweightedGpa: formData.unweightedGpa || 0,
      intendedMajor: formData.intendedMajor || '',
      preferredStudentBodySize: formData.preferredStudentBodySize || [],
      homeState: formData.homeState || '',
      preferHomeStateSchool: formData.preferHomeStateSchool || '',
      financialAidQualification: formData.financialAidQualification || ''
    };

    console.log('Capped form data prepared:', cappedFormData);

    try {
      console.log('Attempting to update profile with ID:', profile.id);
      const { error, data } = await supabase
        .from('player_profiles')
        .update({ stats: cappedFormData })
        .eq('id', profile.id)
        .eq('user_id', userId)
        .select();

      if (error) {
        console.error('Supabase error during save:', error);
        throw error;
      }

      console.log('Save successful, updated data:', data);
      setSuccess("Changes saved successfully.");
      router.refresh();
    } catch (error) {
      console.error('Error details:', {
        error,
        profileId: profile.id,
        userId,
        formDataKeys: Object.keys(cappedFormData)
      });
      setError('Failed to save background. Please try again.');
    } finally {
      setIsLoading(false);
      console.log('Save operation completed');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    console.log('Form field change:', { name, value, type });
    
    setFormData(prev => {
      if (name === 'preferredStudentBodySize') {
        console.log('Handling preferredStudentBodySize change');
        const currentValues = Array.isArray(prev.preferredStudentBodySize) 
          ? prev.preferredStudentBodySize 
          : [];
        
        if (type === 'checkbox') {
          const newValues = (e.target as HTMLInputElement).checked
            ? [...currentValues, value]
            : currentValues.filter(size => size !== value);
          console.log('New preferredStudentBodySize values:', newValues);
          return {
            ...prev,
            preferredStudentBodySize: newValues
          };
        }
      }
      
      if (type === 'number') {
        console.log('Handling numeric field:', name);
        return { ...prev, [name]: Number(value) || 0 };
      }
      
      console.log('Handling standard field change:', name);
      return { ...prev, [name]: value };
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
