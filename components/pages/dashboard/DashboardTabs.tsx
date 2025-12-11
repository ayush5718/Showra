"use client";

import { Code } from "lucide-react";

interface DashboardTabsProps {
  activeTab: 'card' | 'readme';
  onTabChange: (tab: 'card' | 'readme') => void;
}

export function DashboardTabs({ activeTab, onTabChange }: DashboardTabsProps) {
  return (
    <div className="flex items-center gap-3 flex-shrink-0">
      <button
        onClick={() => onTabChange('card')}
        className={`px-6 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
          activeTab === 'card'
            ? 'bg-gradient-to-r from-[#00E5FF] via-[#FF00CC] to-[#9D4BFF] text-white shadow-lg shadow-[#00E5FF]/30'
            : 'bg-white/5 backdrop-blur-md border border-white/10 text-white/60 hover:bg-white/10'
        }`}
      >
        Your DevCard
      </button>
      <button
        onClick={() => onTabChange('readme')}
        className={`px-6 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
          activeTab === 'readme'
            ? 'bg-gradient-to-r from-[#00E5FF] via-[#FF00CC] to-[#9D4BFF] text-white shadow-lg shadow-[#00E5FF]/30'
            : 'bg-white/5 backdrop-blur-md border border-white/10 text-white/60 hover:bg-white/10'
        }`}
      >
        <Code className="inline-block h-4 w-4 mr-2" />
        README Code
      </button>
    </div>
  );
}

