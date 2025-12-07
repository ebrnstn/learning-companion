import { useState } from 'react';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import PlanReview from './components/PlanReview';
import PlanRevision from './components/PlanRevision';
import { generateLearningPlan, reviseLearningPlan } from './lib/gemini';
import LoadingScreen from './components/LoadingScreen';

function App() {
  const [view, setView] = useState('onboarding'); // 'onboarding' | 'generating' | 'review' | 'revising' | 'revising-loading' | 'dashboard'
  const [userProfile, setUserProfile] = useState(null);
  const [plan, setPlan] = useState(null);
  const [hasRevised, setHasRevised] = useState(false);

  const handleOnboardingComplete = async (profile) => {
    setUserProfile(profile);
    setView('generating');
    
    try {
      const generatedPlan = await generateLearningPlan(profile);
      setPlan(generatedPlan);
      setView('review');
    } catch (error) {
      console.error("Failed to generate plan", error);
      // Optional: Show error state or fallback
      alert("Something went wrong generating the plan. Please check your API key.");
      setView('onboarding');
    }
  };

  const handleReviewConfirm = () => {
    setView('dashboard');
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

  if (view === 'generating') {
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
      />
    );
  }

  return (
    <Onboarding onComplete={handleOnboardingComplete} />
  );
}

export default App;
