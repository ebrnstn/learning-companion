import React from 'react';
import { cn } from '../lib/utils';
import { Plus, BookOpen, Clock, ChevronRight } from 'lucide-react';

function formatRelativeTime(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

function PlanCard({ plan, onClick }) {
  const { userProfile, plan: planData, updatedAt } = plan;
  const totalSteps = planData.days?.reduce((acc, day) => acc + (day.steps?.length || 0), 0) || 0;
  const completedSteps = planData.days?.reduce((acc, day) =>
    acc + (day.steps?.filter(s => s.completed)?.length || 0), 0) || 0;
  const progress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-neutral-900/80 backdrop-blur-md p-5 rounded-2xl border border-neutral-800 hover:border-neutral-700 hover:bg-neutral-800/80 transition-all group"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white text-lg truncate">
            {planData.topic || userProfile.topic}
          </h3>
          <div className="flex items-center gap-3 mt-1 text-sm text-neutral-400">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {userProfile.timeCommitment}
            </span>
            <span>{planData.days?.length || 0} days</span>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-neutral-500 group-hover:text-neutral-300 transition-colors flex-shrink-0 mt-1" />
      </div>

      {/* Progress bar */}
      <div className="mt-4">
        <div className="flex justify-between text-xs text-neutral-500 mb-1">
          <span>{completedSteps} of {totalSteps} steps</span>
          <span>{progress}%</span>
        </div>
        <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="mt-3 text-xs text-neutral-500">
        Updated {formatRelativeTime(updatedAt)}
      </div>
    </button>
  );
}

export default function HomeScreen({ plans, onSelectPlan, onCreateNew }) {
  const hasPlans = plans && plans.length > 0;

  return (
    <div className="min-h-screen w-screen bg-neutral-950 text-white flex flex-col items-center p-4 relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-800 via-neutral-950 to-neutral-950 -z-10" />

      <div className="w-full max-w-lg pt-12 pb-24 space-y-6 relative z-10">

        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-br from-white to-neutral-500 bg-clip-text text-transparent">
            Learning Companion
          </h1>
          <p className="text-neutral-400">
            {hasPlans ? 'Your learning plans' : 'Start your learning journey'}
          </p>
        </div>

        {/* Plan List or Empty State */}
        {hasPlans ? (
          <div className="space-y-3">
            {plans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                onClick={() => onSelectPlan(plan.id)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-neutral-900/80 backdrop-blur-md p-8 rounded-3xl border border-neutral-800 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-neutral-800 flex items-center justify-center">
              <BookOpen className="h-8 w-8 text-neutral-400" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">No plans yet</h2>
            <p className="text-neutral-400 text-sm">
              Create your first learning plan and start making progress on something new.
            </p>
          </div>
        )}

        {/* Create New Plan Button */}
        <button
          onClick={onCreateNew}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-white text-black font-semibold rounded-xl hover:bg-neutral-200 transition-colors text-lg"
        >
          <Plus className="h-5 w-5" />
          Learn something new
        </button>
      </div>
    </div>
  );
}
