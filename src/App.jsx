import { useState } from 'react';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import { generatePlan } from './lib/mockService';
import { Loader2 } from 'lucide-react';

function App() {
  const [view, setView] = useState('onboarding'); // 'onboarding' | 'generating' | 'dashboard'
  const [userProfile, setUserProfile] = useState(null);
  const [plan, setPlan] = useState(null);

  const handleOnboardingComplete = async (profile) => {
    setUserProfile(profile);
    setView('generating');
    
    try {
      const generatedPlan = await generatePlan(profile);
      setPlan(generatedPlan);
      setView('dashboard');
    } catch (error) {
      console.error("Failed to generate plan", error);
      // Handle error appropriately
      setView('onboarding');
    }
  };

  if (view === 'generating') {
    return (
      <div className="min-h-screen bg-neutral-900 text-white flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500 mb-4" />
        <h2 className="text-xl font-semibold">Curating your personalized plan...</h2>
        <p className="text-neutral-400 mt-2">Founding best resources for {userProfile?.topic}</p>
      </div>
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
