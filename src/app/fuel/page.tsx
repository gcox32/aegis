'use client';

import Link from 'next/link';
import Button from '@/components/ui/Button';
import PageLayout from '@/components/layout/PageLayout';
import TabLayout, { Tab } from '@/components/ui/TabLayout';
import TargetsTab from '@/components/fuel/TargetsTab';
import HistoryTab from '@/components/fuel/HistoryTab';
import RecordTab from '@/components/fuel/RecordTab';
import { Mic } from 'lucide-react';

export default function FuelPage() {
  const tabs: Tab[] = [
    {
      id: 'targets',
      label: 'Targets',
      content: (
        <div className="md:mx-auto px-4 md:px-6 md:max-w-4xl">
          <TargetsTab />
        </div>
      ),
    },
    {
      id: 'record',
      label: 'Record',
      content: (
        <div className="md:mx-auto px-4 md:px-6 md:max-w-4xl">
          <RecordTab />
        </div>
      ),
    },
    {
      id: 'history',
      label: 'History',
      content: (
        <div className="md:mx-auto px-4 md:px-6 md:max-w-4xl">
          <HistoryTab />
        </div>
      ),
    },
  ];

  return (
    <PageLayout
      title="Fuel"
      subtitle="Plan and track your nutrition"
    >
      <div className="space-y-6">
        {/* Build Button */}
        <div className="flex items-center gap-8 px-4 md:px-6 w-full">
          <Link href="/fuel/build" className="w-full">
            <Button variant="primary" size="lg" className="w-full">
              Build
            </Button>
          </Link>
          <Link href="/fuel/voice-journal">
            <Button variant="secondary" className="w-auto aspect-square">
              <Mic className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {/* Tabs */}
        <TabLayout tabs={tabs} defaultTab="targets" />
      </div>
    </PageLayout>
  );
}
