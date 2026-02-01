import React, { useState, useEffect } from 'react';
import { CheckCircle2, Circle, PlayCircle, FileText, ChevronDown, ChevronRight, Check, Home, Loader2, ExternalLink } from 'lucide-react';
import { cn } from '../lib/utils';
import { searchStepResources } from '../lib/gemini';

// Generate placeholder content for steps that don't have detailed info
const getPlaceholderContent = (step) => ({
  description: `Learn about ${step.title.toLowerCase()} through hands-on practice.`,
  objectives: `Understand core concepts. Complete the ${step.type} activity.`,
  resources: step.type === 'video' ? 'Video tutorial' : 'Reading material'
});

export default function PlanView({ plan, onToggleStep, onBackToHome, readOnly = false }) {
  // Track expanded days
  const [expandedDays, setExpandedDays] = useState(() => {
    if (readOnly && plan?.days?.length > 0) {
      return new Set([plan.days[0].id]);
    }
    return new Set(['day-1']);
  });

  // Track expanded steps
  const [expandedSteps, setExpandedSteps] = useState(new Set());

  // Cache searched resources by step ID
  const [stepResources, setStepResources] = useState({});

  // Track steps currently loading resources
  const [loadingSteps, setLoadingSteps] = useState(new Set());

  // Auto-expand first day in read-only mode
  useEffect(() => {
    if (readOnly && plan?.days?.length > 0 && expandedDays.size === 0) {
      setExpandedDays(new Set([plan.days[0].id]));
    }
  }, [readOnly, plan, expandedDays.size]);

  const toggleDay = (dayId) => {
    setExpandedDays(prev => {
      const newSet = new Set(prev);
      if (newSet.has(dayId)) {
        newSet.delete(dayId);
      } else {
        newSet.add(dayId);
      }
      return newSet;
    });
  };

  const toggleStep = async (stepId, step) => {
    const isCurrentlyExpanded = expandedSteps.has(stepId);

    // Toggle expansion state
    setExpandedSteps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stepId)) {
        newSet.delete(stepId);
      } else {
        newSet.add(stepId);
      }
      return newSet;
    });

    // If expanding and no cached resources, trigger search
    if (!isCurrentlyExpanded && !stepResources[stepId] && !loadingSteps.has(stepId)) {
      setLoadingSteps(prev => new Set(prev).add(stepId));
      try {
        const resources = await searchStepResources(step.title, step.type, plan.topic);
        setStepResources(prev => ({ ...prev, [stepId]: resources }));
      } catch (error) {
        console.error("Failed to fetch resources for step:", error);
        setStepResources(prev => ({ ...prev, [stepId]: [] }));
      } finally {
        setLoadingSteps(prev => {
          const newSet = new Set(prev);
          newSet.delete(stepId);
          return newSet;
        });
      }
    }
  };

  const handleCheckboxClick = (e, dayId, stepId) => {
    e.stopPropagation();
    if (!readOnly && onToggleStep) {
      onToggleStep(dayId, stepId);
    }
  };

  if (!plan) return <div>No plan loaded</div>;

  const progress = plan.days.reduce((acc, day) => acc + day.steps.filter(s => s.completed).length, 0) / plan.days.reduce((acc, day) => acc + day.steps.length, 0);

  return (
    <div className="h-full flex flex-col bg-neutral-950">
      {/* Header with back navigation */}
      {onBackToHome && (
        <div className="flex-shrink-0 px-6 pt-6">
          <button
            onClick={onBackToHome}
            className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors text-sm"
          >
            <Home className="h-4 w-4" />
            <span>All Plans</span>
          </button>
        </div>
      )}

      {/* Plan header with topic and progress */}
      <div className="p-6 md:p-8 flex-shrink-0">
        <div className="flex items-end justify-between mb-6">
          <div>
            <span className="text-blue-400 font-mono text-xs tracking-wider uppercase">Current Track</span>
            <h2 className="text-2xl font-bold tracking-tight text-white mt-1">{plan.topic}</h2>
          </div>
          <div className="text-right">
            <span className="text-3xl font-bold text-white">
              {Math.round(progress * 100)}%
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-all duration-500 ease-out"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>

      {/* Days and steps list */}
      <div className="flex-1 overflow-y-auto px-6 md:px-8 pb-8 space-y-6">
        {plan.days.map((day, dayIndex) => {
          const isDayExpanded = expandedDays.has(day.id);
          const completedSteps = day.steps.filter(s => s.completed).length;
          const totalSteps = day.steps.length;
          const isComplete = completedSteps === totalSteps;
          const isLastDay = dayIndex === plan.days.length - 1;

          return (
            <div key={day.id} className="relative pl-4">
              {/* Timeline Line */}
              {!isLastDay && (
                <div className="absolute left-[21px] top-8 bottom-[-24px] w-0.5 bg-neutral-800" />
              )}

              <div className="relative group">
                {/* Timeline Dot */}
                <div className={cn(
                  "absolute left-0 top-1.5 w-11 h-11 rounded-full flex items-center justify-center border-4 transition-colors z-10",
                  isComplete
                    ? "bg-neutral-900 border-green-500/20 text-green-500"
                    : isDayExpanded ? "bg-neutral-900 border-blue-500/20 text-blue-500" : "bg-neutral-900 border-neutral-800 text-neutral-500"
                )}>
                  {isComplete ? <Check className="h-5 w-5" /> : <span className="text-sm font-bold">{dayIndex + 1}</span>}
                </div>

                <div className="ml-16">
                  <button
                    onClick={() => toggleDay(day.id)}
                    className={cn(
                      "w-full flex items-center justify-between py-3 px-4 rounded-xl transition-all text-left",
                      "hover:bg-neutral-800/30 group-hover:pl-5"
                    )}
                  >
                    <div>
                      <h3 className={cn("font-semibold text-lg transition-colors", isComplete ? "text-neutral-400" : "text-white")}>
                        {day.title}
                      </h3>
                      <p className="text-xs text-neutral-500 mt-0.5 font-medium">
                        {completedSteps}/{totalSteps} Steps Completed
                      </p>
                    </div>
                    {isDayExpanded ? <ChevronDown className="h-5 w-5 text-neutral-500" /> : <ChevronRight className="h-5 w-5 text-neutral-500 opacity-0 group-hover:opacity-100 transition-opacity" />}
                  </button>

                  {isDayExpanded && (
                    <div className="mt-2 space-y-1 animate-in fade-in slide-in-from-top-2 duration-200">
                      {day.steps.map((step) => {
                        const isStepExpanded = expandedSteps.has(step.id);
                        const placeholders = getPlaceholderContent(step);
                        const description = step.description || placeholders.description;
                        const objectives = step.objectives || placeholders.objectives;
                        const resources = step.resources || placeholders.resources;

                        return (
                          <div key={step.id} className="overflow-hidden">
                            <div
                              onClick={() => toggleStep(step.id, step)}
                              className={cn(
                                "flex items-center p-3 rounded-xl border transition-all cursor-pointer",
                                step.completed
                                  ? "bg-green-900/10 border-green-500/10"
                                  : "bg-neutral-800/20 border-transparent",
                                !step.completed && "hover:bg-neutral-800/40"
                              )}
                            >
                              {/* Checkbox */}
                              <div
                                onClick={(e) => handleCheckboxClick(e, day.id, step.id)}
                                className={cn(
                                  "w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 transition-colors flex-shrink-0",
                                  step.completed ? "border-green-500 bg-green-500" : "border-neutral-600 hover:border-neutral-400",
                                  !readOnly && "cursor-pointer"
                                )}
                              >
                                {step.completed && <Check className="h-3 w-3 text-black stroke-[3]" />}
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <span className={cn("text-sm font-medium transition-colors", step.completed ? "text-neutral-500 line-through" : "text-neutral-200")}>
                                    {step.title}
                                  </span>
                                  {isStepExpanded ? (
                                    <ChevronDown className="h-4 w-4 text-neutral-500 flex-shrink-0 ml-2" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4 text-neutral-500 flex-shrink-0 ml-2" />
                                  )}
                                </div>
                                <div className="flex items-center mt-1 space-x-3">
                                  <span className="text-xs text-neutral-500">{step.duration}</span>
                                  {step.type === 'video' && <PlayCircle className="h-3 w-3 text-blue-400" />}
                                  {step.type === 'article' && <FileText className="h-3 w-3 text-yellow-400" />}
                                </div>
                              </div>
                            </div>

                            {/* Expanded step content */}
                            {isStepExpanded && (
                              <div className="mt-2 ml-8 pl-4 border-l-2 border-neutral-800 space-y-3 animate-in fade-in slide-in-from-top-1 duration-150">
                                <p className="text-sm text-neutral-400">{description}</p>
                                <div className="text-xs text-neutral-500">
                                  <span className="font-medium text-neutral-400">Objectives:</span> {objectives}
                                </div>

                                {/* Dynamic Resources Section */}
                                <div className="pt-2">
                                  <span className="font-medium text-neutral-400 text-xs">Resources:</span>
                                  {loadingSteps.has(step.id) ? (
                                    <div className="flex items-center gap-2 mt-2 text-neutral-500 text-sm">
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                      <span>Searching for resources...</span>
                                    </div>
                                  ) : stepResources[step.id] && stepResources[step.id].length > 0 ? (
                                    <div className="mt-2 space-y-2">
                                      {stepResources[step.id].map((resource, i) => (
                                        <a
                                          key={i}
                                          href={resource.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="flex items-start gap-2 text-sm text-blue-400 hover:text-blue-300 hover:underline group"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <ExternalLink className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 opacity-60 group-hover:opacity-100" />
                                          <div>
                                            <span className="block">{resource.title}</span>
                                            {resource.description && (
                                              <span className="block text-xs text-neutral-500 mt-0.5">{resource.description}</span>
                                            )}
                                          </div>
                                        </a>
                                      ))}
                                    </div>
                                  ) : stepResources[step.id] ? (
                                    <div className="mt-2 text-neutral-500 text-sm">No resources found.</div>
                                  ) : null}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
