import React, { useState } from 'react';

interface AIChatHelperProps {
  selectedText: string;
  onSuggest: (suggestions: string[]) => void;
  placeholders: { label: string; value: string }[];
}

const AIChatHelper: React.FC<AIChatHelperProps> = ({ selectedText, onSuggest, placeholders }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGetSuggestions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: `Provide 3 short suggestions to improve or expand on the following text for a college recruitment letter: "${selectedText}"`,
          placeholders,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI suggestions');
      }

      const data = await response.json();
      const suggestions = data.content.split('\n').filter((s: string) => s.trim() !== '');
      onSuggest(suggestions);
    } catch (err) {
      setError('Failed to get AI suggestions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const generatePersonalizedMessage = async (schoolId: string, userId: string) => {
    const response = await fetch('/api/generatePersonalizedMessage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        schoolId,
        userId,
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to generate message');
    }
    
    return response.json();
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-2 z-10">
      <button
        onClick={handleGetSuggestions}
        className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
        disabled={isLoading}
      >
        Get AI Suggestions
      </button>
      {isLoading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
};

export default AIChatHelper;
