import React, { useState, useMemo } from 'react';
import { MessageSquare } from 'lucide-react';
import PlanView from './PlanView';
import LogView from './LogView';
import ChatInterface from './ChatInterface';
import TabBar from './TabBar';
import ActivityDetailView from './ActivityDetailView';

export default function Dashboard({ userProfile, plan: initialPlan, onPlanUpdate, onBackToHome }) {
  const [plan, setPlan] = useState(initialPlan);
  const [activeTab, setActiveTab] = useState('plan');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [overlayActivity, setOverlayActivity] = useState(null); // { dayId, stepId }
  const [currentActivityStepId, setCurrentActivityStepId] = useState(null); // For Activity tab navigation

  React.useEffect(() => {
    setPlan(initialPlan);
  }, [initialPlan]);

  // Flatten all steps for navigation
  const allSteps = useMemo(() => {
    if (!plan?.days) return [];
    return plan.days.flatMap(day =>
      day.steps.map(step => ({ ...step, dayId: day.id, dayTitle: day.title }))
    );
  }, [plan]);

  // First incomplete step (for Activity tab default)
  const firstIncompleteStep = useMemo(() => {
    return allSteps.find(s => !s.completed) || allSteps[allSteps.length - 1] || null;
  }, [allSteps]);

  // Reset currentActivityStepId when switching to Activity tab or when it becomes invalid
  React.useEffect(() => {
    if (activeTab === 'activity' && !currentActivityStepId && firstIncompleteStep) {
      setCurrentActivityStepId(firstIncompleteStep.id);
    }
  }, [activeTab, currentActivityStepId, firstIncompleteStep]);

  // Get step context for navigation
  const getStepContext = (stepId) => {
    const idx = allSteps.findIndex(s => s.id === stepId);
    if (idx === -1) return null;
    return {
      step: allSteps[idx],
      hasPrev: idx > 0,
      hasNext: idx < allSteps.length - 1,
      prevStep: allSteps[idx - 1],
      nextStep: allSteps[idx + 1],
    };
  };

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

  const handleStepClick = (dayId, stepId) => {
    setOverlayActivity({ dayId, stepId });
  };

  const handleOverlayNavigate = (direction) => {
    if (!overlayActivity) return;
    const ctx = getStepContext(overlayActivity.stepId);
    if (!ctx) return;

    const targetStep = direction === 'next' ? ctx.nextStep : ctx.prevStep;
    if (targetStep) {
      setOverlayActivity({ dayId: targetStep.dayId, stepId: targetStep.id });
    }
  };

  const handleActivityTabNavigate = (direction) => {
    const stepId = currentActivityStepId || firstIncompleteStep?.id;
    if (!stepId) return;

    const ctx = getStepContext(stepId);
    if (!ctx) return;

    const targetStep = direction === 'next' ? ctx.nextStep : ctx.prevStep;
    if (targetStep) {
      setCurrentActivityStepId(targetStep.id);
    }
  };

  // Determine which step to show in overlay
  const overlayStepContext = overlayActivity ? getStepContext(overlayActivity.stepId) : null;

  // Determine which step to show in Activity tab
  const activityStepId = currentActivityStepId || firstIncompleteStep?.id;
  const activityTabStepContext = activityStepId ? getStepContext(activityStepId) : null;

  return (
    <div className="h-screen w-screen bg-neutral-950 text-white flex flex-col overflow-hidden">
      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'plan' && (
          <PlanView
            plan={plan}
            onToggleStep={handleToggleStep}
            onStepClick={handleStepClick}
            onBackToHome={onBackToHome}
          />
        )}
        {activeTab === 'activity' && activityTabStepContext && (
          <ActivityDetailView
            step={activityTabStepContext.step}
            dayTitle={activityTabStepContext.step.dayTitle}
            onClose={() => setActiveTab('plan')}
            onToggleComplete={() => handleToggleStep(activityTabStepContext.step.dayId, activityTabStepContext.step.id)}
            onNavigate={handleActivityTabNavigate}
            hasPrev={activityTabStepContext.hasPrev}
            hasNext={activityTabStepContext.hasNext}
            isOverlay={false}
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

      {/* Activity overlay (from PlanView step clicks) */}
      {overlayActivity && overlayStepContext && (
        <ActivityDetailView
          step={overlayStepContext.step}
          dayTitle={overlayStepContext.step.dayTitle}
          onClose={() => setOverlayActivity(null)}
          onToggleComplete={() => handleToggleStep(overlayStepContext.step.dayId, overlayStepContext.step.id)}
          onNavigate={handleOverlayNavigate}
          hasPrev={overlayStepContext.hasPrev}
          hasNext={overlayStepContext.hasNext}
          isOverlay={true}
        />
      )}

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
