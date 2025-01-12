'use client';

export default function DashboardInstructions() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Dashboard Instructions</h2>
      <div className="space-y-2">
        <p>Welcome to your dashboard! Here you can:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>View your profile completion status</li>
          <li>Check your favorite schools</li>
          <li>Access your college soccer inbox</li>
          <li>See helpful recruiting tips</li>
        </ul>
      </div>
    </div>
  );
} 