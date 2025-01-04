"use client";

import React, { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { PlayerStats, FormField } from "@/types/background/index";
import { initialFormData, formFields } from "../constants";
import InputField from "@/app/dashboard/profile/background/components/InputField";

// 1) Import a modern font from Google Fonts (e.g., Poppins)
import { Poppins } from "next/font/google";
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

interface BackgroundProfile {
  id: string;
  user_id: string;
  stats: PlayerStats;
}

export default function BackgroundEditor({
  profile,
  userId,
}: {
  profile: BackgroundProfile;
  userId: string;
}) {
  const router = useRouter();
  const supabase = createClient();

  // Convert existing stats -> local form
  const transformSupabaseData = (data: any): PlayerStats => {
    const pop = data?.student_body_pop || 0;
    const town = data?.Town || "Medium";
    const bodySizes: string[] = [];

    if (town === "Small" || pop <= 5000) {
      bodySizes.push("Small: Less than 5,000 Students");
    }
    if (town === "Medium" || (pop > 5000 && pop <= 12500)) {
      bodySizes.push("Medium: 5,000 to 12,500 students");
    }
    if (town === "Large" || (pop > 12500 && pop <= 25000)) {
      bodySizes.push("Large: 12,500 to 25,000 students");
    }
    if (town === "Very Large" || pop > 25000) {
      bodySizes.push("Very Large: Over 25,000 students");
    }

    return {
      satScore: data?.SAT ?? 0,
      actScore: data?.ACT ?? 0,
      unweightedGpa: data?.GPA ?? 0,
      intendedMajor: data?.["Intended Major"] ?? "",
      preferredStudentBodySize: bodySizes,
      homeState: data?.State ?? "",
      preferHomeStateSchool: data?.["In-state?"] ?? "",
      financialAidQualification: data?.["Aid Qual."] ?? "",
    };
  };

  // Merge existing stats with initial
  const [formData, setFormData] = useState<PlayerStats>({
    ...initialFormData,
    ...(profile.stats ? transformSupabaseData(profile.stats) : {}),
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Convert local formData -> supabase shape
  const transformDataForSupabase = (data: PlayerStats) => {
    let studentBodyPop = 0;
    let town = "Medium";

    if (data.preferredStudentBodySize.length > 0) {
      const size = data.preferredStudentBodySize[0];
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
      SAT: data.satScore,
      ACT: data.actScore,
      GPA: data.unweightedGpa,
      "Intended Major": data.intendedMajor,
      student_body_pop: studentBodyPop,
      "In-state?": data.preferHomeStateSchool,
      State: data.homeState,
      Town: town,
      "Aid Qual.": data.financialAidQualification,
    };
  };

  const handleSave = async () => {
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    // Cap numeric fields if needed
    const capped = {
      ...formData,
      satScore: Math.min(formData.satScore || 0, 1600),
      actScore: Math.min(formData.actScore || 0, 36),
      unweightedGpa: Math.min(formData.unweightedGpa || 0, 5),
    };

    const transformedData = transformDataForSupabase(capped);

    try {
      const { error: supabaseError } = await supabase
        .from("player_profiles")
        .update({ stats: transformedData })
        .eq("id", profile.id)
        .eq("user_id", userId)
        .single();

      if (supabaseError) throw supabaseError;

      setSuccess("Changes saved successfully.");
      router.refresh();
    } catch (err) {
      console.error("Error details:", err);
      setError("Failed to save. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle any field changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    setFormData((prev) => {
      // For checkboxes (preferredStudentBodySize)
      if (name === "preferredStudentBodySize" && type === "checkbox") {
        const checked = (e.target as HTMLInputElement).checked;
        const existing = Array.isArray(prev.preferredStudentBodySize)
          ? prev.preferredStudentBodySize
          : [];
        let updated: string[] = [];

        if (checked) {
          updated = [...existing, value];
        } else {
          updated = existing.filter((item) => item !== value);
        }
        return { ...prev, preferredStudentBodySize: updated };
      }

      // For numeric fields from text inputs
      if (type === "number") {
        return {
          ...prev,
          [name]: Number(value.replace(/[^\d.]/g, "")) || 0,
        };
      }

      // For range inputs (SAT/ACT sliders)
      if (name === "satScore" || name === "actScore") {
        return {
          ...prev,
          [name]: Number(value),
        };
      }

      // Otherwise text/select field
      return { ...prev, [name]: value };
    });
  };

  return (
    <div
      className={`
          flex items-center justify-center
        ${poppins.className}  /* Apply the custom font globally */
      `}
    >
      {/* Container to reduce wide blank space on desktop */}
      <div className="w-full max-w-4xl bg-white shadow-xl border border-blue-100 rounded-xl p-6 md:p-8">
        <h1 className="text-3xl font-extrabold text-center text-blue-700 mb-6">
          Edit Background Information
        </h1>

        {/* Error/Success */}
        {error && (
          <div className="text-center text-red-600 text-sm mb-2">{error}</div>
        )}
        {success && (
          <div className="text-center text-green-600 text-sm mb-2">{success}</div>
        )}

        {/* Save Button */}
        <div className="w-full flex justify-center mb-6">
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="
              bg-blue-600
              hover:bg-blue-700
              text-white
              font-semibold
              py-3
              px-6
              rounded-md
              transition-transform
              hover:scale-105
              hover:shadow-lg
              disabled:opacity-50
              flex
              items-center
              justify-center
            "
          >
            {isLoading ? (
              <div className="w-5 h-5 border-4 border-t-transparent border-white rounded-full animate-spin"></div>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>

        {/* 
          Two-column grid on desktop, single column on mobile. 
          We'll place SAT/ACT + a few other fields on the left, 
          and the rest on the right to reduce big empty space.
        */}
        <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* SAT Score slider */}
          <div className="flex flex-col">
            <label className="font-semibold text-blue-700 mb-1">
              SAT Score (0 - 1600)
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                name="satScore"
                min={0}
                max={1600}
                step={10}
                value={formData.satScore}
                onChange={handleChange}
                className="
                  rangeSlider
                  flex-1
                  cursor-pointer
                  accent-blue-600
                  h-2
                  rounded-lg
                  bg-gray-200
                  focus:outline-none
                "
              />
              {/* Display numeric value */}
              <span className="text-blue-800 font-medium w-12 text-center">
                {formData.satScore}
              </span>
            </div>
          </div>

          {/* ACT Score slider */}
          <div className="flex flex-col">
            <label className="font-semibold text-blue-700 mb-1">
              ACT Score (0 - 36)
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                name="actScore"
                min={0}
                max={36}
                step={1}
                value={formData.actScore}
                onChange={handleChange}
                className="
                  rangeSlider
                  flex-1
                  cursor-pointer
                  accent-blue-600
                  h-2
                  rounded-lg
                  bg-gray-200
                  focus:outline-none
                "
              />
              {/* Display numeric value */}
              <span className="text-blue-800 font-medium w-12 text-center">
                {formData.actScore}
              </span>
            </div>
          </div>

          {/* Current GPA */}
          <div className="flex flex-col">
            <label className="font-semibold text-blue-700 mb-1">
              Current Unweighted GPA
            </label>
            <input
              type="number"
              name="unweightedGpa"
              value={formData.unweightedGpa || ""}
              onChange={handleChange}
              className="
                p-2.5 text-sm 
                rounded border border-gray-300 
                hover:border-gray-400 focus:outline-none 
                focus:border-blue-500 transition
              "
              placeholder="Enter GPA (0 - 5.0 max)"
            />
          </div>

          {/* Intended Major */}
          <div className="flex flex-col">
            <label className="font-semibold text-blue-700 mb-1">
              Intended Major
            </label>
            <select
              name="intendedMajor"
              value={formData.intendedMajor}
              onChange={handleChange}
              className="
                p-2.5 text-sm
                rounded border border-gray-300 
                hover:border-gray-400 focus:outline-none 
                focus:border-blue-500 transition
              "
            >
              <option value="">Select Intended Major</option>
              {/* Example major list */}
              <option value="Computer Science">Computer Science</option>
              <option value="Business">Business</option>
              <option value="Biology">Biology</option>
              <option value="Engineering">Engineering</option>
              {/* Add more if you want */}
            </select>
          </div>

          {/* Student Body Size checkboxes */}
          <div className="md:col-span-2">
            <label className="font-semibold text-blue-700 mb-2 block">
              What size of student body do you prefer?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {formFields
                .find((f) => f.name === "preferredStudentBodySize")
                ?.options?.map((option) => (
                  <label
                    key={option}
                    className="
                      flex items-center 
                      space-x-2 
                      bg-blue-50 
                      hover:bg-blue-100 
                      rounded-lg 
                      py-2 
                      px-3 
                      cursor-pointer 
                      transition
                    "
                  >
                    <input
                      type="checkbox"
                      name="preferredStudentBodySize"
                      value={option}
                      checked={formData.preferredStudentBodySize.includes(
                        option
                      )}
                      onChange={handleChange}
                      className="form-checkbox text-blue-600 w-5 h-5"
                    />
                    <span className="text-blue-900 text-sm font-medium">
                      {option}
                    </span>
                  </label>
                ))}
            </div>
          </div>

          {/* Home State */}
          <div className="flex flex-col">
            <label className="font-semibold text-blue-700 mb-1">
              What is your home state?
            </label>
            <select
              name="homeState"
              value={formData.homeState}
              onChange={handleChange}
              className="
                p-2.5 text-sm
                rounded border border-gray-300 
                hover:border-gray-400 focus:outline-none 
                focus:border-blue-500 transition
              "
            >
              <option value="">Select your home state?</option>
              {/* Add your list of states */}
              <option value="CA">California</option>
              <option value="NY">New York</option>
              <option value="TX">Texas</option>
              <option value="FL">Florida</option>
              {/* etc. */}
            </select>
          </div>

          {/* In-state? */}
          <div className="flex flex-col">
            <label className="font-semibold text-blue-700 mb-1">
              Do you prefer to attend a school in your home state?
            </label>
            <select
              name="preferHomeStateSchool"
              value={formData.preferHomeStateSchool}
              onChange={handleChange}
              className="
                p-2.5 text-sm
                rounded border border-gray-300 
                hover:border-gray-400 focus:outline-none 
                focus:border-blue-500 transition
              "
            >
              <option value="">Select an option</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>

          {/* Financial Aid */}
          <div className="md:col-span-2 flex flex-col">
            <label className="font-semibold text-blue-700 mb-1">
              Financial Aid Qualification
            </label>
            <input
              type="text"
              name="financialAidQualification"
              value={formData.financialAidQualification}
              onChange={handleChange}
              placeholder="e.g., I qualify for FAFSA or scholarship"
              className="
                p-2.5 text-sm 
                rounded border border-gray-300 
                hover:border-gray-400 focus:outline-none 
                focus:border-blue-500 transition
              "
            />
          </div>
        </form>
      </div>
    </div>
  );
}
