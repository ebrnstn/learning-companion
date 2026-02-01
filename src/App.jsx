import { useState, useEffect } from 'react';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import PlanReview from './components/PlanReview';
import PlanRevision from './components/PlanRevision';
import PathwaysSelection from './components/PathwaysSelection';
import HomeScreen from './components/HomeScreen';
import { generateLearningPlan, generateLearningPathways, reviseLearningPlan } from './lib/gemini';
import { savePlan, getAllPlans, getPlan, setActivePlan, updatePlan } from './lib/storage';
import LoadingScreen from './components/LoadingScreen';

function App() {
  const [view, setView] = useState(null); // null until initialized
  const [userProfile, setUserProfile] = useState(null);
  const [pathways, setPathways] = useState([]);
  const [selectedPathways, setSelectedPathways] = useState([]);
  const [plan, setPlan] = useState(null);
  const [activePlanId, setActivePlanId] = useState(null);
  const [hasRevised, setHasRevised] = useState(false);
  const [plans, setPlans] = useState([]);

  // Initialize on mount
  useEffect(() => {
    const allPlans = getAllPlans();
    setPlans(allPlans);

    if (allPlans.length === 0) {
      setView('onboarding');
    } else {
      setView('home');
    }
  }, []);

  const refreshPlans = () => {
    setPlans(getAllPlans());
  };

  const handleOnboardingComplete = async (profile) => {
    setUserProfile(profile);
    setView('generating-pathways');

    try {
      const generatedPathways = await generateLearningPathways(profile);
      setPathways(generatedPathways);
      setView('pathways');
    } catch (error) {
      console.error("Failed to generate pathways", error);
      alert("Something went wrong brainstorming pathways. Please check your API key.");
      setView('onboarding');
    }
  };

  const handlePathwaysConfirm = async (selected) => {
    setSelectedPathways(selected);
    setView('generating-plan');

    try {
      const generatedPlan = await generateLearningPlan(userProfile, selected);
      setPlan(generatedPlan);
      setView('review');
    } catch (error) {
      console.error("Failed to generate plan", error);
      alert("Something went wrong generating the plan.");
      setView('pathways');
    }
  };

  const handleReviewConfirm = () => {
    // Save the plan to localStorage
    const planId = savePlan(userProfile, plan);
    setActivePlanId(planId);
    refreshPlans();
    setView('home');
    // Reset state for next plan creation
    setUserProfile(null);
    setPlan(null);
    setHasRevised(false);
  };

  const handleReviewRevise = () => {
    setView('revising');
  };

  const handleRevisionComplete = async (feedback) => {
    setView('revising-loading');

    try {
      const revisedPlan = await reviseLearningPlan(plan, userProfile, feedback);
      setPlan(revisedPlan);
      setHasRevised(true);
      setView('review');
    } catch (error) {
      console.error("Failed to revise plan", error);
      alert("Something went wrong revising the plan. Please try again.");
      setView('revising');
    }
  };

  const handleSelectPlan = (planId) => {
    const planData = getPlan(planId);
    if (planData) {
      setActivePlanId(planId);
      setActivePlan(planId);
      setUserProfile(planData.userProfile);
      setPlan(planData.plan);
      setView('dashboard');
    }
  };

  const handleCreateNewPlan = () => {
    setUserProfile(null);
    setPlan(null);
    setHasRevised(false);
    setView('onboarding');
  };

  const handleBackToHome = () => {
    // Save current plan state before going back
    if (activePlanId && plan) {
      updatePlan(activePlanId, plan);
      refreshPlans();
    }
    setView('home');
  };

  const handlePlanUpdate = (updatedPlan) => {
    setPlan(updatedPlan);
    if (activePlanId) {
      updatePlan(activePlanId, updatedPlan);
    }
  };

  // Show nothing until initialized
  if (view === null) {
    return null;
  }

  if (view === 'home') {
    return (
      <HomeScreen
        plans={plans}
        onSelectPlan={handleSelectPlan}
        onCreateNew={handleCreateNewPlan}
      />
    );
  }

  if (view === 'generating-pathways') {
    return (
      <LoadingScreen topic={userProfile?.topic} />
    );
  }

  if (view === 'pathways') {
    return (
      <PathwaysSelection
        pathways={pathways}
        onConfirm={handlePathwaysConfirm}
      />
    );
  }

  if (view === 'generating-plan') {
    return (
      <LoadingScreen topic={userProfile?.topic} />
    );
  }

  if (view === 'review' && plan) {
    return (
      <PlanReview
        plan={plan}
        userProfile={userProfile}
        onConfirm={handleReviewConfirm}
        onRevise={handleReviewRevise}
        hasRevised={hasRevised}
      />
    );
  }

  if (view === 'revising-loading') {
    return (
      <LoadingScreen topic={userProfile?.topic} isRevising={true} />
    );
  }

  if (view === 'revising' && plan) {
    return (
      <PlanRevision
        plan={plan}
        userProfile={userProfile}
        onRevise={handleRevisionComplete}
        isRevising={false}
      />
    );
  }

  if (view === 'dashboard' && plan) {
    return (
      <Dashboard
        userProfile={userProfile}
        plan={plan}
        onPlanUpdate={handlePlanUpdate}
        onBackToHome={handleBackToHome}
      />
    );
  }

  return (
    <Onboarding onComplete={handleOnboardingComplete} />
  );
}

export default App;
