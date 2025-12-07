import React, { useState } from 'react';
import PlanView from './PlanView';
import { cn } from '../lib/utils';
import { Loader2, Send } from 'lucide-react';

export default function PlanRevision({ plan, userProfile, onRevise, isRevising = false }) {
  const [feedback, setFeedback] = useState('');

  if (!plan) return <div>No plan loaded</div>;

  const handleSubmit = () => {
    if (feedback.trim() && !isRevising) {
      onRevise(feedback.trim());
    }
  };

  return (
    <div className="min-h-screen w-screen bg-neutral-950 text-white flex flex-col items-center p-4 relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-800 via-neutral-950 to-neutral-950 -z-10" />

      <div className="w-full max-w-4xl relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="text-center mb-6 mt-8">
          <h1 className="text-3xl font-bold tracking-tight">Revising plan</h1>
        </div>

        {/* Current Plan Section */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-neutral-300 mb-4">Current plan</h2>
          <div className="bg-neutral-900/80 backdrop-blur-md rounded-2xl border border-neutral-800 shadow-xl overflow-hidden max-h-64 overflow-y-auto">
            <PlanView plan={plan} readOnly={true} />
          </div>
        </div>

        {/* AI Prompt Bubble */}
        <div className="mb-6">
          <div className="bg-neutral-800 rounded-2xl p-4 border border-neutral-700 relative">
            <div className="absolute left-0 top-4 w-0 h-0 border-t-8 border-t-transparent border-r-8 border-r-neutral-800 border-b-8 border-b-transparent -translate-x-full"></div>
            <p className="text-neutral-200">What would you like to do differently?</p>
          </div>
        </div>

        {/* Feedback Input */}
        <div className="flex-1 flex flex-col mb-6">
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder="What else needs to change?"
            disabled={isRevising}
            className={cn(
              "w-full bg-neutral-900/80 backdrop-blur-md border border-neutral-800 rounded-2xl p-4 text-white placeholder:text-neutral-500 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all",
              isRevising && "opacity-50 cursor-not-allowed"
            )}
            rows={6}
          />
        </div>

        {/* Revise Button */}
        <div className="flex justify-center pb-8">
          <button
            onClick={handleSubmit}
            disabled={!feedback.trim() || isRevising}
            className={cn(
              "px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl transition-colors flex items-center gap-2 text-lg",
              (!feedback.trim() || isRevising) && "opacity-50 cursor-not-allowed",
              !(!feedback.trim() || isRevising) && "hover:bg-blue-700"
            )}
          >
            {isRevising ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Revising plan...
              </>
            ) : (
              <>
                <Send className="h-5 w-5" />
                Revise Plan
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

