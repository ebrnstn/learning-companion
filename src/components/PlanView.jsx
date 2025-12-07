import React, { useState, useEffect } from 'react';
import { CheckCircle2, Circle, PlayCircle, FileText, ChevronDown, ChevronRight, Check } from 'lucide-react';
import { cn } from '../lib/utils';

export default function PlanView({ plan, onToggleStep, collapsed = false, onExpand, readOnly = false }) {
  // In read-only mode, expand all days by default for better review experience
  // Using a Set to track multiple expanded days
  const [expandedDays, setExpandedDays] = useState(() => {
    if (readOnly && plan?.days?.length > 0) {
      return new Set([plan.days[0].id]);
    }
    return new Set(['day-1']);
  });
  
  // Auto-expand first day in read-only mode for better review experience if nothing is expanded
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

  if (!plan) return <div>No plan loaded</div>;

  const progress = plan.days.reduce((acc, day) => acc + day.steps.filter(s => s.completed).length, 0) / plan.days.reduce((acc, day) => acc + day.steps.length, 0);

  if (collapsed) {
    return (
      <div className="h-full flex flex-col items-center py-6 cursor-pointer hover:bg-white/5 transition-colors group" onClick={onExpand}>
         {/* Minimal Header */}
         <div className="mb-6 flex flex-col items-center space-y-2">
            <span className="text-[10px] font-mono text-neutral-500 uppercase writing-mode-vertical">Plan</span>
            <div className="w-1 h-8 bg-neutral-800 rounded-full overflow-hidden">
                 <div className="w-full bg-blue-500 transition-all duration-500" style={{ height: `${progress * 100}%` }} />
            </div>
         </div>
         
         {/* Vertical Timeline */}
         <div className="flex-1 flex flex-col items-center space-y-2 w-full relative">
            <div className="absolute top-0 bottom-0 w-0.5 bg-neutral-800" />
            
            {plan.days.map((day, i) => {
                const completedSteps = day.steps.filter(s => s.completed).length;
                const totalSteps = day.steps.length;
                const isComplete = completedSteps === totalSteps;
                
                return (
                    <div key={day.id} className="relative z-10 w-4 h-4 rounded-full border-2 bg-neutral-900 border-neutral-700 flex items-center justify-center transition-colors">
                        {isComplete && <div className="w-2 h-2 bg-green-500 rounded-full" />}
                        {!isComplete && completedSteps > 0 && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
                    </div>
                )
            })}
         </div>

         <ChevronRight className="h-4 w-4 text-neutral-500 opacity-50 group-hover:opacity-100 transition-opacity mt-4" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
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
                style={{ 
                    width: `${progress * 100}%` 
                }}
            />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto px-6 md:px-8 pb-8 space-y-6">
        {plan.days.map((day, dayIndex) => {
          const isExpanded = expandedDays.has(day.id);
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
                      : isExpanded ? "bg-neutral-900 border-blue-500/20 text-blue-500" : "bg-neutral-900 border-neutral-800 text-neutral-500"
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
                    {isExpanded ? <ChevronDown className="h-5 w-5 text-neutral-500" /> : <ChevronRight className="h-5 w-5 text-neutral-500 opacity-0 group-hover:opacity-100 transition-opacity" />}
                  </button>

                  {isExpanded && (
                    <div className="mt-2 space-y-1 animate-in fade-in slide-in-from-top-2 duration-200">
                      {day.steps.map((step) => (
                        <div 
                          key={step.id} 
                          onClick={() => !readOnly && onToggleStep && onToggleStep(day.id, step.id)}
                          className={cn(
                            "flex items-center p-3 rounded-xl border transition-all",
                            readOnly ? "cursor-default" : "cursor-pointer",
                            step.completed 
                              ? "bg-green-900/10 border-green-500/10" 
                              : "bg-neutral-800/20 border-transparent",
                            !readOnly && !step.completed && "hover:bg-neutral-800/40"
                          )}
                        >
                          <div className={cn(
                             "w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 transition-colors flex-shrink-0",
                             step.completed ? "border-green-500 bg-green-500" : "border-neutral-600 group-hover:border-neutral-500"
                          )}>
                             {step.completed && <Check className="h-3 w-3 text-black stroke-[3]" />}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                                <span className={cn("text-sm font-medium transition-colors", step.completed ? "text-neutral-500 line-through" : "text-neutral-200")}>
                                    {step.title}
                                </span>
                            </div>
                            <div className="flex items-center mt-1 space-x-3">
                                <span className="text-xs text-neutral-500">{step.duration}</span>
                                {step.type === 'video' && <PlayCircle className="h-3 w-3 text-blue-400" />}
                                {step.type === 'article' && <FileText className="h-3 w-3 text-yellow-400" />}
                            </div>
                          </div>
                        </div>
                      ))}
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
