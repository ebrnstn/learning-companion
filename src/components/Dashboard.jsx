import React, { useState } from 'react';
import PlanView from './PlanView';
import ChatInterface from './ChatInterface';
import { LayoutList, MessageSquare, X } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Dashboard({ userProfile, plan: initialPlan }) {
  const [plan, setPlan] = useState(initialPlan);
  const [isPlanExpanded, setIsPlanExpanded] = useState(false);

  React.useEffect(() => {
    setPlan(initialPlan);
  }, [initialPlan]);

  const handleToggleStep = (dayId, stepId) => {
    setPlan(prevPlan => ({
      ...prevPlan,
      days: prevPlan.days.map(day => {
        if (day.id !== dayId) return day;
        return {
          ...day,
          steps: day.steps.map(step => {
            if (step.id !== stepId) return step;
            return { ...step, completed: !step.completed };
          })
        };
      })
    }));
  };

  return (
    <div className="h-screen w-screen bg-neutral-950 text-white flex flex-col items-center relative overflow-hidden">
      {/* Texture Background (Desktop only) */}
      <div className="hidden md:block absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-800 via-neutral-950 to-neutral-950 -z-10" />

      {/* Main Layout Container */}
      <div className="w-full h-full md:max-w-6xl md:p-8 flex z-10 relative overflow-hidden">
        
        {/* Left Panel / Rail Container */}
        <div className={cn(
             "h-full transition-all duration-300 ease-in-out relative z-30",
             // Mobile/Tablet: Always collapsed rail (expanded via overlay)
             // Desktop: Always expanded
             "w-[60px] md:w-[60px] lg:w-[40%]",
             // Styling
             "bg-neutral-900 border-r md:border border-neutral-800 md:rounded-3xl md:shadow-2xl overflow-hidden flex-shrink-0"
        )}>
             {/* Large Screen: Full View */}
             <div className="hidden lg:block h-full w-full">
                  <PlanView plan={plan} onToggleStep={handleToggleStep} />
             </div>

             {/* Small/Medium Screen: Collapsed Rail View */}
             <div className="lg:hidden h-full w-full">
                  <PlanView plan={plan} onToggleStep={handleToggleStep} collapsed={true} onExpand={() => setIsPlanExpanded(true)} />
             </div>
        </div>
        
        {/* Mobile/Tablet Overlay for Expanded Plan */}
        <div className={cn(
            "lg:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-sm transition-opacity duration-300",
            isPlanExpanded ? "opacity-100" : "opacity-0 pointer-events-none"
        )} onClick={() => setIsPlanExpanded(false)}>
             <div className={cn(
                 "absolute left-0 top-0 bottom-0 w-[85%] max-w-sm bg-neutral-900 shadow-2xl transition-transform duration-300",
                 isPlanExpanded ? "translate-x-0" : "-translate-x-full"
             )} onClick={e => e.stopPropagation()}>
                 {/* Close Button Mobile */}
                 <button onClick={() => setIsPlanExpanded(false)} className="absolute top-4 right-4 p-2 bg-neutral-800 rounded-full z-20">
                     <X className="h-5 w-5 text-neutral-400" />
                 </button>
                 <PlanView plan={plan} onToggleStep={handleToggleStep} />
             </div>
        </div>

        {/* Right Panel: Chat Interface */}
        <div 
           className={cn(
            "flex-1 h-full min-w-0 bg-neutral-900 relative z-20",
            "md:bg-neutral-900/80 md:backdrop-blur-sm md:rounded-3xl md:border md:border-neutral-800 md:shadow-2xl md:ml-6"
          )}
        >
          <ChatInterface plan={plan} />
        </div>

      </div>
    </div>
  );
}
