"use client";

import { useState } from 'react';

const sports = ['Soccer', 'Basketball', 'Football', 'Baseball'];

export default function Background() {
  const [activeSport, setActiveSport] = useState(sports[0]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Background</h1>
      
      {/* Sports top bar */}
      <div className="flex mb-4 border-b">
        {sports.map((sport) => (
          <button
            key={sport}
            className={`px-4 py-2 font-semibold ${
              activeSport === sport
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-blue-600'
            }`}
            onClick={() => setActiveSport(sport)}
          >
            {sport}
          </button>
        ))}
      </div>

      {/* Content area */}
      <div className="mt-4">
        <h2 className="text-xl font-semibold mb-2">{activeSport}</h2>
        {/* Add content for each sport here */}
        <p>Content for {activeSport} goes here.</p>
      </div>
    </div>
  );
}
