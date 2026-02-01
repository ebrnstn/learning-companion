import React, { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import PlanView from './PlanView';
import LogView from './LogView';
import ChatInterface from './ChatInterface';
import TabBar from './TabBar';

export default function Dashboard({ userProfile, plan: initialPlan, onPlanUpdate, onBackToHome }) {
  const [plan, setPlan] = useState(initialPlan);
  const [activeTab, setActiveTab] = useState('plan');
  const [isChatOpen, setIsChatOpen] = useState(false);

  React.useEffect(() => {
    setPlan(initialPlan);
  }, [initialPlan]);

  const handleToggleStep = (dayId, stepId) => {
    const updatedPlan = {
      ...plan,
      days: plan.days.map(day => {
        if (day.id !== dayId) return day;
        return {
          ...day,
          steps: day.steps.map(step => {
            if (step.id !== stepId) return step;
            return { ...step, completed: !step.completed };
          })
        };
      })
    };
    setPlan(updatedPlan);
    if (onPlanUpdate) {
      onPlanUpdate(updatedPlan);
    }
  };

  return (
    <div className="h-screen w-screen bg-neutral-950 text-white flex flex-col overflow-hidden">
      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'plan' && (
          <PlanView
            plan={plan}
            onToggleStep={handleToggleStep}
            onBackToHome={onBackToHome}
          />
        )}
        {activeTab === 'log' && (
          <LogView onBackToHome={onBackToHome} />
        )}
      </div>

      {/* Bottom Tab Bar */}
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* FAB - positioned above tab bar */}
      <button
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-20 right-4 w-14 h-14 bg-blue-600 rounded-full shadow-lg flex items-center justify-center z-40 hover:bg-blue-500 transition-colors"
      >
        <MessageSquare className="h-6 w-6 text-white" />
      </button>

      {/* Full-screen chat overlay */}
      {isChatOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-950">
          <ChatInterface
            plan={plan}
            onClose={() => setIsChatOpen(false)}
          />
        </div>
      )}
    </div>
  );
}
