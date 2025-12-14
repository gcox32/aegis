'use client';

import Link from 'next/link';
import { ChevronLeft, Dumbbell, ClipboardList, CalendarDays } from 'lucide-react';

export default function BuildPage() {
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
          <h1 className="mb-1 font-bold text-2xl">Build</h1>
          <p className="text-muted-foreground text-sm">
            Manage your training components
          </p>
        </section>

        {/* Build Options */}
        <section className="px-4 md:px-6 py-6 space-y-4">
          
          <Link href="/train/build/exercises" className="block">
            <div className="shadow-lg active:shadow-none bg-card p-6 border border-border rounded-lg hover:border-brand-primary transition-colors flex items-center gap-4">
              <div className="bg-gray-100 p-3 rounded-full text-gray-600">
                <Dumbbell className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-300">Exercises</h2>
                <p className="text-sm text-gray-300 mt-1">
                  Create and manage your library of movements, including muscle groups, movement patterns, and equipment.
                </p>
              </div>
            </div>
          </Link>

          <Link href="/train/build/workouts" className="block">
            <div className="shadow-lg active:shadow-none bg-card p-6 border border-border rounded-lg hover:border-brand-primary transition-colors flex items-center gap-4">
              <div className="bg-gray-100 p-3 rounded-full text-gray-600">
                <ClipboardList className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-300">Workouts</h2>
                <p className="text-sm text-gray-300 mt-1">
                  Design individual training sessions by combining exercises into blocks and circuits.
                </p>
              </div>
            </div>
          </Link>

          <Link href="/train/build/protocols" className="block">
            <div className="shadow-lg active:shadow-none bg-card p-6 border border-border rounded-lg hover:border-brand-primary transition-colors flex items-center gap-4">
              <div className="bg-gray-100 p-3 rounded-full text-gray-600">
                <CalendarDays className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-300">Protocols</h2>
                <p className="text-sm text-gray-300 mt-1">
                  Construct multi-week training programs by scheduling workouts and setting objectives.
                </p>
              </div>
            </div>
          </Link>

        </section>
      </div>
    </div>
  );
}

