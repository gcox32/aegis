'use client';

import { useEffect, useState } from 'react';
import { User, Target, Calendar, Sliders, Loader2 } from 'lucide-react';
import Link from 'next/link';
import PageLayout from '@/components/layout/PageLayout';
import type { Protocol, ProtocolInstance } from '@/types/train';

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error || 'Failed to fetch');
  }
  return res.json();
}

export default function MePage() {
  const [loading, setLoading] = useState(true);
  const [activeProtocol, setActiveProtocol] = useState<Protocol | null>(null);

  // Load data
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);

        // Fetch active protocol instance
        const instancesRes = await fetchJson<{ instances: ProtocolInstance[] }>(
          '/api/train/protocols/instances?activeOnly=true'
        );
        
        if (cancelled) return;

        const activeInstance = instancesRes.instances?.[0] || null;
        
        if (activeInstance) {
          // Fetch protocol details
          const protocolRes = await fetchJson<{ protocol: Protocol }>(
            `/api/train/protocols/${activeInstance.protocolId}`
          );
          if (!cancelled) {
            setActiveProtocol(protocolRes.protocol);
          }
        }

      } catch (err: any) {
        if (!cancelled) {
          console.error('Failed to load data', err);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);


  if (loading) {
    return (
      <PageLayout
        title="Me"
        subtitle="Manage your account and settings"
      >
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-6 h-6 text-brand-primary animate-spin" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Me"
      subtitle="Manage your account and settings"
    >
      {/* Stats Overview */}
      <section className="px-4 md:px-6 py-6">
        <h2 className="mb-4 font-semibold text-lg">Overview</h2>
        <div className="flex flex-col gap-4 w-full">
          {activeProtocol ? (
            <div className="bg-card p-4 border border-border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-brand-primary" />
                <span className="text-muted-foreground text-sm">Current Protocol</span>
              </div>
              <p className="font-bold text-xl">{activeProtocol.name}</p>
              <p className="mt-1 text-muted-foreground text-xs">
                {activeProtocol.objectives?.[0] || 'Active'}
              </p>
            </div>
          ) : (
            <div className="bg-card p-4 border border-border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-muted-foreground text-sm">Active Protocol</span>
              </div>
              <p className="font-bold text-muted-foreground text-xl">--</p>
              <p className="mt-1 text-muted-foreground text-xs">No active protocol</p>
            </div>
          )}

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
