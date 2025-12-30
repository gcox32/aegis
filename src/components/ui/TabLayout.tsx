'use client';

import { useState, useEffect, ReactNode } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

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
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  // Get tab from URL parameter, or fall back to defaultTab or first tab
  const getInitialTab = (): string => {
    const tabParam = searchParams.get('tab');
    if (tabParam && tabs.some(tab => tab.id === tabParam)) {
      return tabParam;
    }
    return defaultTab || tabs[0]?.id || '';
  };

  const [activeTab, setActiveTab] = useState<string>(getInitialTab);

  // Update active tab when URL parameter changes (e.g., browser back/forward)
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && tabs.some(tab => tab.id === tabParam)) {
      setActiveTab(tabParam);
    } else if (!tabParam && defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [searchParams, tabs, defaultTab]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    // Update URL with tab parameter
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tabId);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  if (tabs.length === 0) return null;

  return (
    <div className={`space-y-6 pb-6 ${className}`}>
      {/* Tabs */}
      <div className="flex border-b border-border mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
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

