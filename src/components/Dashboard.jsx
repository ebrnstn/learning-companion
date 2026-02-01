import React, { useState } from 'react';
import PlanView from './PlanView';
import ChatInterface from './ChatInterface';
import TabBar from './TabBar';

export default function Dashboard({ userProfile, plan: initialPlan, onPlanUpdate, onBackToHome }) {
  const [plan, setPlan] = useState(initialPlan);
  const [activeTab, setActiveTab] = useState('plan');

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
        {activeTab === 'chat' && (
          <ChatInterface
            plan={plan}
            onBackToHome={onBackToHome}
          />
        )}
      </div>

      {/* Bottom Tab Bar */}
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
