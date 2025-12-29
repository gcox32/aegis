'use client';

import { useState, ReactNode } from 'react';

export interface Tab {
  id: string;
  label: string;
  content: ReactNode;
}

interface TabLayoutProps {
  tabs: Tab[];
  defaultTab?: string;
  className?: string;
}

export default function TabLayout({ tabs, defaultTab, className = '' }: TabLayoutProps) {
  const [activeTab, setActiveTab] = useState<string>(defaultTab || tabs[0]?.id || '');

  if (tabs.length === 0) return null;

  return (
    <div className={`space-y-6 pb-6 ${className}`}>
      {/* Tabs */}
      <div className="flex border-b border-border mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
              activeTab === tab.id
                ? 'border-brand-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tabs.find(tab => tab.id === activeTab)?.content}
    </div>
  );
}

