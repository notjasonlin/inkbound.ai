import React from 'react';

interface UsageProps {
  plan: string;
  status: string;
  aiCalls: { used: number; total: number };
  schools: { used: number; total: number };
  templates: { used: number; total: number };
  periodEnd: string;
}

export default function SubscriptionUsage({
  plan,
  status,
  aiCalls,
  schools,
  templates,
  periodEnd,
}: UsageProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const UsageBar = ({ used, total }: { used: number; total: number }) => (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div
        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
        style={{ width: `${Math.min((used / total) * 100, 100)}%` }}
      />
    </div>
  );

  return (
    <div className="w-full max-w-2xl bg-white rounded-xl shadow-sm p-6 space-y-6">
      <div className="flex justify-between items-center border-b border-gray-100 pb-4">
        <h2 className="text-2xl font-semibold text-gray-800">Your Subscription and Usage</h2>
        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
          }`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
          <span className="text-sm font-medium text-gray-600">{plan}</span>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium text-gray-700">AI Calls</span>
            <span className="text-sm text-gray-600">{aiCalls.used} / {aiCalls.total}</span>
          </div>
          <UsageBar used={aiCalls.used} total={aiCalls.total} />
        </div>

        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium text-gray-700">Schools Sent</span>
            <span className="text-sm text-gray-600">{schools.used} / {schools.total}</span>
          </div>
          <UsageBar used={schools.used} total={schools.total} />
        </div>

        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium text-gray-700">Templates Used</span>
            <span className="text-sm text-gray-600">{templates.used} / {templates.total}</span>
          </div>
          <UsageBar used={templates.used} total={templates.total} />
        </div>
      </div>

      <div className="pt-4 border-t border-gray-100">
        <p className="text-sm text-gray-600">
          Current Period Ends: <span className="font-medium">{formatDate(periodEnd)}</span>
        </p>
      </div>
    </div>
  );
} 