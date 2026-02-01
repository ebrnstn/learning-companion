import React from 'react';
import { LayoutList, MessageSquare } from 'lucide-react';
import { cn } from '../lib/utils';

export default function TabBar({ activeTab, onTabChange }) {
  return (
    <div className="flex-shrink-0 bg-neutral-900 border-t border-neutral-800 safe-area-bottom">
      <div className="flex">
        <button
          onClick={() => onTabChange('plan')}
          className={cn(
            "flex-1 flex flex-col items-center py-3 transition-colors",
            activeTab === 'plan'
              ? "text-blue-400"
              : "text-neutral-500 hover:text-neutral-300"
          )}
        >
          <LayoutList className="h-5 w-5" />
          <span className="text-xs mt-1 font-medium">Plan</span>
        </button>
        <button
          onClick={() => onTabChange('chat')}
          className={cn(
            "flex-1 flex flex-col items-center py-3 transition-colors",
            activeTab === 'chat'
              ? "text-blue-400"
              : "text-neutral-500 hover:text-neutral-300"
          )}
        >
          <MessageSquare className="h-5 w-5" />
          <span className="text-xs mt-1 font-medium">Chat</span>
        </button>
      </div>
    </div>
  );
}
