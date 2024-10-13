import React from 'react';

interface Subscription {
  plan_name: string;
  status: string;
  ai_call_limit: number;
  schools_sent_limit: number;
  template_limit: number;
  current_period_end: string;
}

interface Usage {
  ai_calls_used: number;
  schools_sent: number;
  templates_used: number;
}

const UsageDisplay = ({ subscription, usage }: { subscription: Subscription; usage: Usage }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Your Subscription and Usage</h2>
      <div className="space-y-2">
        <p>Plan: {subscription.plan_name}</p>
        <p>Status: {subscription.status}</p>
        <p>AI Calls: {usage.ai_calls_used} / {subscription.ai_call_limit}</p>
        <p>Schools Sent: {usage.schools_sent} / {subscription.schools_sent_limit}</p>
        <p>Templates Used: {usage.templates_used} / {subscription.template_limit}</p>
        <p>Current Period Ends: {new Date(subscription.current_period_end).toLocaleDateString()}</p>
      </div>
    </div>
  );
};

export default UsageDisplay;

