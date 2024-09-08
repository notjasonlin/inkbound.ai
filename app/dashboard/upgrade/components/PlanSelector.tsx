import React from 'react';
import { Plan } from '../constants';

type PlanSelectorProps = {
  plans: Plan[];
  selectedPlan: Plan | null;
  onSelectPlan: (plan: Plan) => void;
};

export default function PlanSelector({ plans, selectedPlan, onSelectPlan }: PlanSelectorProps) {
  return (
    <div className="grid md:grid-cols-3 gap-6 mb-8">
      {plans.map((plan) => (
        <div 
          key={plan.credits}
          className={`border rounded-lg p-6 cursor-pointer transition-all ${
            selectedPlan === plan ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:shadow-md'
          }`}
          onClick={() => onSelectPlan(plan)}
        >
          <h2 className="text-2xl font-bold mb-2">{plan.credits} Credits</h2>
          <p className="text-3xl font-bold text-blue-600 mb-2">${plan.price}</p>
          {plan.savings > 0 && (
            <p className="text-green-600 mb-2">Save ${plan.savings}</p>
          )}
          <p className="text-gray-600">
            ${(plan.price / plan.credits).toFixed(2)} per credit
          </p>
        </div>
      ))}
    </div>
  );
}
