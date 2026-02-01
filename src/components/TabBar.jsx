import React from 'react';
import { LayoutList, FileText, PlayCircle } from 'lucide-react';
import { cn } from '../lib/utils';

export default function TabBar({ activeTab = 'plan', onTabChange }) {
  return (
    <div className="flex-shrink-0 bg-neutral-900 border-t border-neutral-800 safe-area-bottom">
      <div className="flex">
        <button
          onClick={() => onTabChange?.('plan')}
          className={cn(
            'flex-1 flex flex-col items-center py-3 transition-colors',
            activeTab === 'plan' ? 'text-blue-400' : 'text-neutral-500 hover:text-neutral-300'
          )}
        >
          <LayoutList className="h-5 w-5" />
          <span className="text-xs mt-1 font-medium">Plan</span>
        </button>
        <button
          onClick={() => onTabChange?.('activity')}
          className={cn(
            'flex-1 flex flex-col items-center py-3 transition-colors',
            activeTab === 'activity' ? 'text-blue-400' : 'text-neutral-500 hover:text-neutral-300'
          )}
        >
          <PlayCircle className="h-5 w-5" />
          <span className="text-xs mt-1 font-medium">Activity</span>
        </button>
        <button
          onClick={() => onTabChange?.('log')}
          className={cn(
            'flex-1 flex flex-col items-center py-3 transition-colors',
            activeTab === 'log' ? 'text-blue-400' : 'text-neutral-500 hover:text-neutral-300'
          )}
        >
          <FileText className="h-5 w-5" />
          <span className="text-xs mt-1 font-medium">Log</span>
        </button>
      </div>
    </div>
  );
}
