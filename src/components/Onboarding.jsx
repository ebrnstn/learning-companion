import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '../lib/utils';
import { ArrowRight, ArrowLeft, BookOpen, Clock, Target } from 'lucide-react';

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    topic: '',
    timeCommitment: '30min',
    motivation: '',
    level: 'beginner'
  });

  const timeOptions = ['15min', '30min', '1hr', '2hr+'];
  const levelOptions = ['Beginner', 'Intermediate', 'Advanced'];

  const handleNext = () => {
    // Basic validation
    if (step === 1 && !formData.topic) return;
    if (step === 4) {
      onComplete(formData);
    } else {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleKeyboardSelect = useCallback((index) => {
    if (step === 2 && index < timeOptions.length) {
      setFormData(prev => ({...prev, timeCommitment: timeOptions[index]}));
      setTimeout(() => setStep(3), 150); // Small delay for visual feedback
    } else if (step === 3 && index < levelOptions.length) {
      setFormData(prev => ({...prev, level: levelOptions[index].toLowerCase()}));
      setTimeout(() => setStep(4), 150);
    }
  }, [step]);

  // Global keyboard event listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Backspace to go back (only when not focused on input/textarea)
      if (e.key === 'Backspace' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        e.preventDefault();
        handleBack();
        return;
      }

      // Number keys for selection on steps 2 and 3
      if (step === 2 || step === 3) {
        const numKey = parseInt(e.key);
        if (numKey >= 1 && numKey <= 4) {
          handleKeyboardSelect(numKey - 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [step, handleKeyboardSelect]);

  return (
    <div className="min-h-screen w-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-800 via-neutral-950 to-neutral-950 -z-10" />

      <div className="w-full max-w-lg space-y-8 relative z-10">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-br from-white to-neutral-500 bg-clip-text text-transparent">Let's build your plan</h1>
          <p className="text-neutral-400">Step {step} of 4</p>
        </div>

        {/* Form Steps */}
        <div className="bg-neutral-900/80 backdrop-blur-md p-8 rounded-3xl border border-neutral-800 shadow-2xl">
          
          {step === 1 && (
            <div className="space-y-4">
              <label className="block text-sm font-medium text-neutral-300">
                What do you want to learn?
              </label>
              <div className="relative">
                <BookOpen className="absolute left-3 top-3 h-5 w-5 text-neutral-500" />
                <input
                  type="text"
                  value={formData.topic}
                  onChange={(e) => setFormData({...formData, topic: e.target.value})}
                  onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                  placeholder="e.g. Python, Pottery, History of Rome..."
                  className="w-full bg-neutral-800/50 border border-neutral-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-neutral-600"
                  autoFocus
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
               <label className="block text-sm font-medium text-neutral-300">
                How much time do you have daily?
                <span className="text-neutral-500 text-xs ml-2">(Press 1-4 to select)</span>
              </label>
              <div className="grid grid-cols-1 gap-3">
                {timeOptions.map((time, index) => (
                  <button
                    key={time}
                    onClick={() => {
                      setFormData({...formData, timeCommitment: time});
                      setTimeout(() => setStep(3), 150);
                    }}
                    className={cn(
                      "flex items-center p-4 rounded-xl border transition-all text-left group",
                      formData.timeCommitment === time 
                        ? "border-blue-500 bg-blue-500/10 text-blue-200" 
                        : "border-neutral-700 bg-neutral-800/50 hover:bg-neutral-800 text-neutral-300"
                    )}
                  >
                    <span className={cn(
                      "w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold mr-3 transition-all",
                      formData.timeCommitment === time
                        ? "bg-blue-500 text-white"
                        : "bg-neutral-700 text-neutral-400 group-hover:bg-neutral-600"
                    )}>
                      {index + 1}
                    </span>
                    <Clock className="h-5 w-5 mr-3 opacity-70" />
                    <span>{time}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
               <label className="block text-sm font-medium text-neutral-300">
                What is your current level?
                <span className="text-neutral-500 text-xs ml-2">(Press 1-3 to select)</span>
              </label>
              <div className="grid grid-cols-1 gap-3">
                {levelOptions.map((lvl, index) => (
                  <button
                    key={lvl}
                    onClick={() => {
                      setFormData({...formData, level: lvl.toLowerCase()});
                      setTimeout(() => setStep(4), 150);
                    }}
                    className={cn(
                      "flex items-center p-4 rounded-xl border transition-all text-left group",
                      formData.level === lvl.toLowerCase()
                        ? "border-blue-500 bg-blue-500/10 text-blue-200" 
                        : "border-neutral-700 bg-neutral-800/50 hover:bg-neutral-800 text-neutral-300"
                    )}
                  >
                    <span className={cn(
                      "w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold mr-3 transition-all",
                      formData.level === lvl.toLowerCase()
                        ? "bg-blue-500 text-white"
                        : "bg-neutral-700 text-neutral-400 group-hover:bg-neutral-600"
                    )}>
                      {index + 1}
                    </span>
                    <Target className="h-5 w-5 mr-3 opacity-70" />
                    <span>{lvl}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          
           {step === 4 && (
            <div className="space-y-4">
              <label className="block text-sm font-medium text-neutral-300">
                Why are you learning this? (Optional)
              </label>
              <textarea
                value={formData.motivation}
                onChange={(e) => setFormData({...formData, motivation: e.target.value})}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleNext();
                  }
                }}
                placeholder="To get a job, just for fun, etc..."
                className="w-full bg-neutral-800/50 border border-neutral-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-none placeholder:text-neutral-600"
                autoFocus
              />
            </div>
          )}

          <div className="pt-6 mt-6 border-t border-neutral-700 flex justify-between">
            {step > 1 ? (
              <button
                onClick={handleBack}
                className="flex items-center justify-center px-6 py-4 text-neutral-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="mr-2 h-5 w-5" />
                Back
              </button>
            ) : (
              <div /> /* Spacer for flex justify-between */
            )}
            <button
              onClick={handleNext}
              disabled={step === 1 && !formData.topic}
              className="flex items-center justify-center px-8 py-4 bg-white text-black font-semibold rounded-xl hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg"
            >
              {step === 4 ? 'Generate Plan' : 'Next'}
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Keyboard hint */}
        {(step === 2 || step === 3) && (
          <p className="text-center text-neutral-500 text-sm">
            Press <kbd className="px-2 py-1 bg-neutral-800 rounded text-neutral-400">Backspace</kbd> to go back
          </p>
        )}
      </div>
    </div>
  );
}
