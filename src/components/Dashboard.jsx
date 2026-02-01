import React, { useState, useMemo } from 'react';
import { MessageSquare } from 'lucide-react';
import PlanView from './PlanView';
import LogView from './LogView';
import ChatInterface from './ChatInterface';
import TabBar from './TabBar';
import ActivityDetailView from './ActivityDetailView';
import { cn } from '../lib/utils';

export default function Dashboard({ userProfile, plan: initialPlan, onPlanUpdate, onBackToHome }) {
  const [plan, setPlan] = useState(initialPlan);
  const [activeTab, setActiveTab] = useState('plan');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isChatClosing, setIsChatClosing] = useState(false);
  const [isChatOpening, setIsChatOpening] = useState(false);
  const [overlayActivity, setOverlayActivity] = useState(null); // { dayId, stepId }

  React.useEffect(() => {
    if (isChatOpen && isChatOpening && !isChatClosing) {
      const t = requestAnimationFrame(() => {
        requestAnimationFrame(() => setIsChatOpening(false));
      });
      return () => cancelAnimationFrame(t);
    }
  }, [isChatOpen, isChatOpening, isChatClosing]);

  const openChat = () => {
    setIsChatOpen(true);
    setIsChatOpening(true);
  };

  const closeChat = () => {
    setIsChatClosing(true);
    setTimeout(() => {
      setIsChatOpen(false);
      setIsChatClosing(false);
    }, 280);
  };

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

  // Determine which step to show in overlay
  const overlayStepContext = overlayActivity ? getStepContext(overlayActivity.stepId) : null;

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
        {activeTab === 'log' && (
          <LogView onBackToHome={onBackToHome} />
        )}
      </div>

      {/* Bottom Tab Bar */}
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* FAB - positioned above tab bar */}
      <button
        onClick={openChat}
        className="fixed bottom-20 right-4 w-14 h-14 bg-blue-600 rounded-full shadow-lg flex items-center justify-center z-[60] hover:bg-blue-500 transition-colors"
      >
        <MessageSquare className="h-6 w-6 text-white" />
      </button>

      {/* Activity overlay (from PlanView step clicks) */}
      {overlayActivity && overlayStepContext && (
        <ActivityDetailView
          step={overlayStepContext.step}
          dayTitle={overlayStepContext.step.dayTitle}
          topic={plan?.topic}
          onClose={() => setOverlayActivity(null)}
          onToggleComplete={() => handleToggleStep(overlayStepContext.step.dayId, overlayStepContext.step.id)}
          onNavigate={handleOverlayNavigate}
          hasPrev={overlayStepContext.hasPrev}
          hasNext={overlayStepContext.hasNext}
          isOverlay={true}
        />
      )}

      {/* Chat panel: slides in from left (standard LLM app pattern) */}
      {isChatOpen && (
        <>
          <button
            aria-label="Close chat"
            onClick={closeChat}
            className="fixed inset-0 z-[55] bg-black/50 transition-opacity duration-300"
          />
          <div
            className={cn(
              'fixed inset-y-0 left-0 z-[60] w-full max-w-md bg-neutral-950 shadow-xl flex flex-col transition-transform duration-300 ease-out',
              isChatClosing ? '-translate-x-full' : isChatOpening ? '-translate-x-full' : 'translate-x-0'
            )}
          >
            <ChatInterface plan={plan} onClose={closeChat} />
          </div>
        </>
      )}
    </div>
  );
}
