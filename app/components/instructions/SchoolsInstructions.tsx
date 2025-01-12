'use client';

export default function SchoolsInstructions() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Schools Page Instructions</h2>
      <div className="space-y-2">
        <p>Find and manage your target schools:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Search for schools by name, state, or division</li>
          <li>Hover over schools to preview details</li>
          <li>Add schools to your favorites</li>
          <li>View detailed school information</li>
        </ul>
      </div>
    </div>
  );
} 