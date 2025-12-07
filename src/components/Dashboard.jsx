import React, { useState } from 'react';
import PlanView from './PlanView';
import ChatInterface from './ChatInterface';
import { LayoutList, MessageSquare } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Dashboard({ userProfile, plan: initialPlan }) {
  const [plan, setPlan] = useState(initialPlan);
  const [activeTab, setActiveTab] = useState('plan'); // 'plan' | 'chat'

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
    <div className="h-screen w-screen bg-neutral-900 text-white flex flex-col md:flex-row overflow-hidden">
      {/* Mobile Tab Navigation (Bottom) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-neutral-900 border-t border-neutral-800 flex z-50">
        <button 
          onClick={() => setActiveTab('plan')}
          className={cn(
            "flex-1 flex flex-col items-center justify-center space-y-1 transition-colors",
            activeTab === 'plan' ? "text-blue-500" : "text-neutral-500 hover:text-neutral-300"
          )}
        >
          <LayoutList className="h-5 w-5" />
          <span className="text-xs font-medium">Plan</span>
        </button>
        <button 
          onClick={() => setActiveTab('chat')}
          className={cn(
            "flex-1 flex flex-col items-center justify-center space-y-1 transition-colors",
            activeTab === 'chat' ? "text-blue-500" : "text-neutral-500 hover:text-neutral-300"
          )}
        >
          <MessageSquare className="h-5 w-5" />
          <span className="text-xs font-medium">Companion</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden pb-16 md:pb-0 relative">
        {/* Left Panel: Plan View */}
        <div 
          className={cn(
            "w-full md:w-[60%] lg:w-1/2 flex-shrink-0 border-r border-neutral-800 bg-neutral-900 transition-transform absolute inset-0 md:relative md:transform-none z-10",
            activeTab === 'plan' ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          )}
        >
          <PlanView plan={plan} onToggleStep={handleToggleStep} />
        </div>

        {/* Right Panel: Chat Interface */}
        <div 
           className={cn(
            "w-full flex-1 min-w-0 bg-neutral-900 transition-transform absolute inset-0 md:relative md:transform-none z-10",
            activeTab === 'chat' ? "translate-x-0" : "translate-x-full md:translate-x-0"
          )}
        >
          <ChatInterface />
        </div>
      </div>
    </div>
  );
}
