import { useState } from 'react';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import PlanReview from './components/PlanReview';
import PlanRevision from './components/PlanRevision';
import { generateLearningPlan, reviseLearningPlan } from './lib/gemini';
import { Loader2 } from 'lucide-react';

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
      <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center relative overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-800 via-neutral-950 to-neutral-950 -z-10" />
        
        <div className="relative z-10 flex flex-col items-center text-center p-4">
          <div className="relative">
             <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full" />
             <Loader2 className="h-16 w-16 animate-spin text-blue-500 mb-6 relative z-10" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Curating your personalized plan...</h2>
          <p className="text-neutral-400 mt-2">Founding best resources for <span className="text-white font-medium">{userProfile?.topic}</span></p>
        </div>
      </div>
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
      <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center relative overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-800 via-neutral-950 to-neutral-950 -z-10" />
        
        <div className="relative z-10 flex flex-col items-center text-center p-4">
          <div className="relative">
             <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full" />
             <Loader2 className="h-16 w-16 animate-spin text-blue-500 mb-6 relative z-10" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Revising your plan...</h2>
          <p className="text-neutral-400 mt-2">Incorporating your feedback</p>
        </div>
      </div>
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
