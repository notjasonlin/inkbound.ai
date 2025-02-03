'use client';

export default function ComposeInstructions() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Email Compose Instructions</h2>
      <div className="space-y-2">
        <p>Create personalized emails to coaches:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Choose from email templates</li>
          <li>Customize your message</li>
          <li>Add your athletic information</li>
          <li>Preview before sending</li>
        </ul>
      </div>
    </div>
  );
} 