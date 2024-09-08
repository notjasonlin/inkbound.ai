import React from 'react';
import { Plan } from '../constants';

type UpgradeButtonProps = {
  isLoading: boolean;
  selectedPlan: Plan | null;
  onUpgrade: () => void;
};

export default function UpgradeButton({ isLoading, selectedPlan, onUpgrade }: UpgradeButtonProps) {
  return (
    <button
      onClick={onUpgrade}
      disabled={isLoading || !selectedPlan}
      className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg text-lg font-semibold hover:bg-blue-600 transition duration-200 disabled:opacity-50"
    >
      {isLoading ? 'Processing...' : selectedPlan ? `Purchase ${selectedPlan.credits} Credits` : 'Select a plan'}
    </button>
  );
}
