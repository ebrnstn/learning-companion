import React, { useState, useEffect } from 'react';
import { CheckCircle2, Circle, ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';

export default function PathwaysSelection({ pathways, onConfirm }) {
  const [selectedPathways, setSelectedPathways] = useState(new Set());
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
  }, []);

  const togglePathway = (pathwayId) => {
    setSelectedPathways(prev => {
      const newSet = new Set(prev);
      if (newSet.has(pathwayId)) {
        newSet.delete(pathwayId);
      } else {
        newSet.add(pathwayId);
      }
      return newSet;
    });
  };

  const selectedCount = selectedPathways.size;
  const pathwayTitle = Array.from(selectedPathways).map(id => pathways.find(p => p.id === id)?.title).filter(Boolean);

  return (
    <div className="min-h-screen w-screen bg-neutral-950 text-white flex flex-col items-center p-4 relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-800 via-neutral-950 to-neutral-950 -z-10" />

      <div className="w-full max-w-5xl relative z-10 flex flex-col h-full py-8 md:py-16">
        
        {/* Header */}
        <div className={`text-center mb-12 transition-all duration-1000 transform ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="flex items-center justify-center space-x-2 mb-4">
             <div className="bg-blue-500/10 p-2 rounded-full">
                <Sparkles className="h-6 w-6 text-blue-400" />
             </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-br from-white to-neutral-500 bg-clip-text text-transparent mb-4">
            How should we shape your journey?
          </h1>
          <p className="text-xl text-neutral-400 max-w-2xl mx-auto">
            Select one or more directions you'd like to focus on. We'll tailor the curriculum to these choices.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
          {pathways.map((pathway, index) => {
             const isSelected = selectedPathways.has(pathway.id);
             return (
               <div
                 key={pathway.id}
                 onClick={() => togglePathway(pathway.id)}
                 className={cn(
                    "relative group cursor-pointer rounded-3xl p-6 md:p-8 border-2 transition-all duration-300 transform",
                    "hover:-translate-y-1",
                    visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20",
                    isSelected 
                      ? "bg-blue-900/10 border-blue-500 bg-gradient-to-b from-blue-900/20 to-transparent" 
                      : "bg-neutral-900/50 border-neutral-800 hover:border-neutral-600 hover:bg-neutral-900"
                 )}
                 style={{ transitionDelay: `${index * 150}ms` }}
               >
                 <div className="flex justify-between items-start mb-2">
                    <h3 className={cn("text-xl font-bold", isSelected ? "text-white" : "text-neutral-200")}>
                        {pathway.title}
                    </h3>
                    <div className={cn(
                        "transition-all duration-300",
                        isSelected ? "text-blue-500 scale-110" : "text-neutral-700 group-hover:text-neutral-500"
                    )}>
                        {isSelected ? <CheckCircle2 className="h-6 w-6 fill-current" /> : <Circle className="h-6 w-6" />}
                    </div>
                 </div>
                 
                 <p className="text-neutral-400 text-sm font-medium leading-relaxed">
                    {pathway.learning_goal}
                 </p>
               </div>
             );
          })}
        </div>

        {/* Continue Button */}
        <div className={cn(
            "fixed bottom-10 left-0 right-0 flex justify-center transition-all duration-500 transform",
            selectedCount > 0 ? "translate-y-0 opacity-100" : "translate-y-24 opacity-0"
        )}>
            <button
                onClick={() => onConfirm(pathwayTitle)}
                className="bg-blue-600 text-white px-8 py-4 rounded-full font-bold text-lg shadow-2xl hover:bg-blue-500 hover:scale-105 transition-all flex items-center space-x-3 group"
            >
                <span>Continue with {selectedCount} selection{selectedCount !== 1 && 's'}</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
        </div>

      </div>
    </div>
  );
}
