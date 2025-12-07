import React, { useState } from 'react';
import { CheckCircle2, Circle, PlayCircle, FileText, ChevronDown, ChevronRight, Lock } from 'lucide-react';
import { cn } from '../lib/utils';

export default function PlanView({ plan, onToggleStep }) {
  const [expandedDay, setExpandedDay] = useState('day-1');

  if (!plan) return <div>No plan loaded</div>;

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-neutral-800">
        <div className="flex items-end justify-between mb-4">
             <div>
                <h2 className="text-2xl font-bold tracking-tight">{plan.topic}</h2>
                <p className="text-neutral-400 text-sm mt-1">1 Week Learning Plan</p>
             </div>
             <div className="text-right">
                <span className="text-2xl font-bold text-blue-500">
                    {Math.round((plan.days.reduce((acc, day) => acc + day.steps.filter(s => s.completed).length, 0) / plan.days.reduce((acc, day) => acc + day.steps.length, 0)) * 100)}%
                </span>
             </div>
        </div>
        
        {/* Progress Bar */}
        <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
            <div 
                className="h-full bg-blue-600 transition-all duration-500 ease-out"
                style={{ 
                    width: `${(plan.days.reduce((acc, day) => acc + day.steps.filter(s => s.completed).length, 0) / plan.days.reduce((acc, day) => acc + day.steps.length, 0)) * 100}%` 
                }}
            />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {plan.days.map((day) => {
          const isExpanded = expandedDay === day.id;
          const completedSteps = day.steps.filter(s => s.completed).length;
          const totalSteps = day.steps.length;
          const isComplete = completedSteps === totalSteps;

          return (
            <div key={day.id} className="border border-neutral-800 rounded-xl overflow-hidden bg-neutral-900">
              <button 
                onClick={() => setExpandedDay(isExpanded ? null : day.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-neutral-800/50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  {isExpanded ? <ChevronDown className="h-4 w-4 text-neutral-500" /> : <ChevronRight className="h-4 w-4 text-neutral-500" />}
                  <span className={cn("font-medium", isComplete ? "text-green-500" : "text-white")}>
                    {day.title}
                  </span>
                </div>
                <span className="text-xs text-neutral-500 font-mono">
                  {completedSteps}/{totalSteps}
                </span>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 space-y-2">
                  {day.steps.map((step) => (
                    <div 
                      key={step.id} 
                      className={cn(
                        "flex items-start p-3 rounded-lg border transition-all group",
                        step.completed 
                          ? "bg-green-500/5 border-green-500/20" 
                          : "bg-neutral-800/30 border-neutral-800 hover:border-neutral-700"
                      )}
                    >
                      <button 
                        onClick={() => onToggleStep(day.id, step.id)}
                        className="mt-0.5 mr-3 flex-shrink-0"
                      >
                         {step.completed ? (
                           <CheckCircle2 className="h-5 w-5 text-green-500" />
                         ) : (
                           <Circle className="h-5 w-5 text-neutral-600 group-hover:text-neutral-400" />
                         )}
                      </button>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                            <h4 className={cn("text-sm font-medium truncate", step.completed && "text-neutral-500 line-through")}>
                                {step.title}
                            </h4>
                            <span className="text-xs text-neutral-600 ml-2">{step.duration}</span>
                        </div>
                        <div className="flex items-center mt-1 space-x-3">
                             {step.type === 'video' && <span className="flex items-center text-xs text-blue-400"><PlayCircle className="h-3 w-3 mr-1"/> Video</span>}
                             {step.type === 'article' && <span className="flex items-center text-xs text-yellow-400"><FileText className="h-3 w-3 mr-1"/> Article</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
