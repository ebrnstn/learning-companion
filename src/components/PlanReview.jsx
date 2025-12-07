import React from 'react';
import PlanView from './PlanView';
import { cn } from '../lib/utils';
import { CheckCircle2 } from 'lucide-react';

export default function PlanReview({ plan, userProfile, onConfirm, onRevise, hasRevised = false }) {
  if (!plan) return <div>No plan loaded</div>;

  return (
    <div className="min-h-screen w-screen bg-neutral-950 text-white flex flex-col items-center p-4 relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-800 via-neutral-950 to-neutral-950 -z-10" />

      <div className="w-full max-w-4xl relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="text-center mb-8 mt-8">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-br from-white to-neutral-500 bg-clip-text text-transparent mb-2">
            Your personalized learning plan
          </h1>
          <p className="text-neutral-400">
            Optimized for your {userProfile?.level || 'learning'} level
          </p>
        </div>

        {/* Plan Display */}
        <div className="flex-1 bg-neutral-900/80 backdrop-blur-md rounded-3xl border border-neutral-800 shadow-2xl overflow-hidden mb-6">
          <div className="h-full overflow-y-auto">
            <PlanView plan={plan} readOnly={true} />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center pb-8">
          <button
            onClick={onConfirm}
            className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 text-lg"
          >
            <CheckCircle2 className="h-5 w-5" />
            Looks good!
          </button>
          {!hasRevised && (
            <button
              onClick={onRevise}
              className="px-8 py-4 bg-transparent border-2 border-neutral-700 text-neutral-300 font-semibold rounded-xl hover:bg-neutral-800 hover:border-neutral-600 transition-colors text-lg"
            >
              Revise
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

