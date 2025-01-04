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
  const router = useRouter();
  const supabase = createClient();
  
  const transformSupabaseData = (data: any): PlayerStats => {
    // Convert student body population to size range
    let bodySizes: string[] = [];
    const studentBodyPop = data?.student_body_pop || 0;
    const town = data?.Town || "Medium";

    if (town === "Small" || studentBodyPop <= 5000) {
      bodySizes.push("Small: Less than 5,000 Students");
    }
    if (town === "Medium" || (studentBodyPop > 5000 && studentBodyPop <= 12500)) {
      bodySizes.push("Medium: 5,000 to 12,500 students");
    }
    if (town === "Large" || (studentBodyPop > 12500 && studentBodyPop <= 25000)) {
      bodySizes.push("Large: 12,500 to 25,000 students");
    }
    if (town === "Very Large" || studentBodyPop > 25000) {
      bodySizes.push("Very Large: Over 25,000 students");
    }

    return {
      satScore: data?.SAT || 0,
      actScore: data?.ACT || 0,
      unweightedGpa: data?.GPA || 0,
      intendedMajor: data?.["Intended Major"] || '',
      preferredStudentBodySize: bodySizes,
      homeState: data?.State || '',
      preferHomeStateSchool: data?.["In-state?"] || '',
      financialAidQualification: data?.["Aid Qual."] || ''
    };
  };
  
  const [formData, setFormData] = useState<PlayerStats>({
    ...initialFormData,
    ...(profile.stats ? transformSupabaseData(profile.stats) : {})
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const transformDataForSupabase = (formData: PlayerStats) => {
    let studentBodyPop = 0;
    let town = "Medium";
    
    if (formData.preferredStudentBodySize.length > 0) {
      const size = formData.preferredStudentBodySize[0];
      if (size.includes("Small")) {
        studentBodyPop = 5000;
        town = "Small";
      } else if (size.includes("Medium")) {
        studentBodyPop = 12500;
        town = "Medium";
      } else if (size.includes("Large")) {
        studentBodyPop = 25000;
        town = "Large";
      } else if (size.includes("Very Large")) {
        studentBodyPop = 30000;
        town = "Very Large";
      }
    }

    return {
      "SAT": formData.satScore,
      "ACT": formData.actScore,
      "GPA": formData.unweightedGpa,
      "Intended Major": formData.intendedMajor,
      "student_body_pop": studentBodyPop,
      "In-state?": formData.preferHomeStateSchool,
      "State": formData.homeState,
      "Town": town,
      "Aid Qual.": formData.financialAidQualification
    };
  };

  const handleSave = async () => {
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

    const transformedData = transformDataForSupabase(cappedFormData);

    try {
      const { error, data } = await supabase
        .from('player_profiles')
        .update({ stats: transformedData })
        .eq('user_id', userId)
        .select();

      if (error) {
        throw error;
      }

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
    </div>
  );
}
