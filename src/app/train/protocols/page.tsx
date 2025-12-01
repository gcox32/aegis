'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { ChevronLeft, Calendar, Play, Loader2 } from 'lucide-react';
import type { Protocol } from '@/types/train';
import type { LongTimeMeasurement } from '@/types/measures';

type ProtocolsResponse = { protocols: Protocol[] };

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`);
  }
  return res.json();
}

function formatDuration(duration: LongTimeMeasurement) {
  const { value, unit } = duration;
  if (value === 1) {
    return `1 ${unit.slice(0, -1)}`; // Remove 's' for singular
  }
  return `${value} ${unit}`;
}

export default function ProtocolsPage() {
  const router = useRouter();
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startingProtocolId, setStartingProtocolId] = useState<string | null>(
    null
  );

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetchJson<ProtocolsResponse>('/api/train/protocols');
        setProtocols(res.protocols || []);
      } catch (err: any) {
        console.error(err);
        setError(err?.message || 'Failed to load protocols');
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  async function handleStartProtocol(protocolId: string) {
    if (startingProtocolId) return;
    setStartingProtocolId(protocolId);
    try {
      await fetchJson('/api/train/protocol-instances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          protocolId,
          startDate: new Date().toISOString().split('T')[0], // Today's date as YYYY-MM-DD
          active: true,
          complete: false,
        }),
      });
      // Redirect back to train page to see the active protocol
      router.push('/train');
    } catch (err: any) {
      console.error('Failed to start protocol', err);
      alert('Failed to start protocol. Please try again.');
      setStartingProtocolId(null);
    }
  }

  return (
    <div className="bg-background pb-20 min-h-screen">
      <div className="md:mx-auto md:max-w-4xl">
        {/* Header */}
        <section className="px-4 md:px-6 pt-6 pb-4 border-border border-b">
          <Link
            href="/train"
            className="inline-flex items-center gap-1 mb-2 text-muted-foreground hover:text-foreground text-xs"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Train
          </Link>
          <h1 className="mb-1 font-bold text-2xl">Browse Protocols</h1>
          <p className="text-muted-foreground text-sm">
            Choose a training protocol to start
          </p>
        </section>

        {/* Protocols List */}
        <section className="px-4 md:px-6 py-6">
          {isLoading ? (
            <p className="text-muted-foreground text-sm">Loading protocols...</p>
          ) : error ? (
            <div className="bg-card p-4 border border-border rounded-lg">
              <p className="text-destructive text-sm">{error}</p>
            </div>
          ) : protocols.length === 0 ? (
            <div className="bg-card p-4 border border-border rounded-lg">
              <p className="text-muted-foreground text-sm">
                No protocols available yet. Protocols will appear here once they
                are created.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {protocols.map((protocol) => (
                <div
                  key={protocol.id}
                  className="bg-card p-4 border border-border rounded-lg"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-5 h-5 text-brand-primary" />
                        <h2 className="font-semibold text-lg">
                          {protocol.name}
                        </h2>
                      </div>
                      {protocol.description && (
                        <p className="mb-3 text-muted-foreground text-sm">
                          {protocol.description}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2 mb-2">
                        <span className="bg-muted px-2 py-1 rounded text-[11px] text-muted-foreground">
                          {formatDuration(protocol.duration)}
                        </span>
                        <span className="bg-muted px-2 py-1 rounded text-[11px] text-muted-foreground">
                          {protocol.daysPerWeek} days/week
                        </span>
                        {protocol.includes2ADays && (
                          <span className="bg-muted px-2 py-1 rounded text-[11px] text-muted-foreground">
                            Includes 2A days
                          </span>
                        )}
                      </div>
                      {protocol.objectives?.length ? (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {protocol.objectives.map((obj) => (
                            <span
                              key={obj}
                              className="bg-muted px-2 py-1 rounded-full text-[11px] text-muted-foreground"
                            >
                              {obj}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleStartProtocol(protocol.id)}
                    disabled={startingProtocolId === protocol.id}
                  >
                    
                    {startingProtocolId === protocol.id
                      ? <> <Loader2 className="mr-1 w-4 h-4 animate-spin" /> Initializing...</>
                      : <> <Play className="mr-1 w-4 h-4" />                 Initialize Protocol</>}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

