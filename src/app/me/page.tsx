import { User, Target, Calendar, Sliders } from 'lucide-react';
import Link from 'next/link';
import PageLayout from '@/components/layout/PageLayout';

export default function MePage() {
  return (
    <PageLayout
      title="Me"
      subtitle="Manage your account and settings"
    >
        {/* Stats Overview */}
        <section className="px-4 md:px-6 py-6">
          <h2 className="mb-4 font-semibold text-lg">Overview</h2>
          <div className="gap-3 grid grid-cols-2">
            <div className="bg-card p-4 border border-border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-brand-primary" />
                <span className="text-muted-foreground text-sm">Current Phase</span>
              </div>
              <p className="font-bold text-xl">Phase 1</p>
              <p className="mt-1 text-muted-foreground text-xs">Week 2 of 4</p>
            </div>
            <div className="bg-card p-4 border border-border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-brand-primary" />
                <span className="text-muted-foreground text-sm">Days Active</span>
              </div>
              <p className="font-bold text-xl">14</p>
              <p className="mt-1 text-muted-foreground text-xs">This month</p>
            </div>
          </div>
        </section>

        {/* Settings */}
        <section className="px-4 md:px-6 py-6 border-border border-t">
          <h2 className="mb-4 font-semibold text-lg">Settings</h2>
          <div className="space-y-2">
            <Link href="/me/preferences" className="flex justify-between items-center bg-card hover:bg-hover p-4 border border-border rounded-lg w-full transition-colors">
              <div className="flex items-center gap-3">
                <Sliders className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium">Preferences</span>
              </div>
            </Link>
            <Link href="/me/goals" className="flex justify-between items-center bg-card hover:bg-hover p-4 border border-border rounded-lg w-full transition-colors">
              <div className="flex items-center gap-3">
                <Target className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium">Goals</span>
              </div>
            </Link>
            <Link href="/me/profile" className="flex justify-between items-center bg-card hover:bg-hover p-4 border border-border rounded-lg w-full transition-colors">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium">Profile</span>
              </div>
            </Link>
          </div>
        </section>

    </PageLayout>
  );
}
