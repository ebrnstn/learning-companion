import React from 'react';
import { LayoutList } from 'lucide-react';

export default function TabBar() {
  return (
    <div className="flex-shrink-0 bg-neutral-900 border-t border-neutral-800 safe-area-bottom">
      <div className="flex">
        <button
          className="flex-1 flex flex-col items-center py-3 text-blue-400"
        >
          <LayoutList className="h-5 w-5" />
          <span className="text-xs mt-1 font-medium">Plan</span>
        </button>
      </div>
    </div>
  );
}
