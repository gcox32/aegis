'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

function getTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

function getGreeting(timeOfDay: string): string {
  switch (timeOfDay) {
    case 'morning':
      return 'Good morning';
    case 'afternoon':
      return 'Good afternoon';
    case 'evening':
      return 'Good evening';
    case 'night':
      return 'Good night';
    default:
      return 'Hello';
  }
}

function getMotivationalPhrase(timeOfDay: string): string {
  const phrases: Record<string, string[]> = {
    morning: [
      'Go build something great.',
      'Train the will.',
      'Another day to get better.',
      'The work begins again.',
    ],
    afternoon: [
      'Keep the momentum.',
      'Stay locked in.',
      'Train the will.',
      'Push through.',
    ],
    evening: [
      'Finish strong.',
      'Train the will.',
      'Final push.',
      'Bring it home.',
    ],
    night: [
      'Rest and recover.',
      'Tomorrow, we go again.',
      'Recovery is training.',
      'Train the will.',
    ],
  };

  const options = phrases[timeOfDay] || phrases.morning;
  // Use the day of month as a pseudo-random seed for consistency within a day
  const dayOfMonth = new Date().getDate();
  return options[dayOfMonth % options.length];
}

export default function TodayGreeting() {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const timeOfDay = getTimeOfDay();
  const greeting = getGreeting(timeOfDay);
  const phrase = getMotivationalPhrase(timeOfDay);

  const today = new Date();
  const dateString = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  // Get first name
  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || '';

  if (!mounted) {
    return <div className="h-32" />; // Placeholder height
  }

  return (
    <header className="relative mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-8 max-w-7xl overflow-hidden">
      {/* Animated gradient orb */}
      <div
        className="-top-32 -left-32 absolute bg-linear-to-br from-brand-primary/30 to-transparent blur-3xl rounded-full w-64 h-64 animate-pulse pointer-events-none"
        style={{ animationDuration: '4s' }}
      />

      {/* Content */}
      <div className="z-10 relative">
        {/* Date pill */}
        <div
          className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-sm mb-4 px-3 py-1.5 border border-white/10 rounded-full text-muted-foreground text-xs animate-fade-in"
        >
          <span
            className="bg-success shadow-sm shadow-success/50 rounded-full w-1.5 h-1.5"
          />
          {dateString}
        </div>

        {/* Greeting */}
        <h1
          className="mb-1 font-display font-bold text-gradient text-4xl sm:text-5xl tracking-tight animate-fade-in-up"
          style={{ animationDelay: '50ms' }}
        >
          {greeting}
          {firstName && (
            <span className="text-foreground">, {firstName}</span>
          )}
        </h1>

        {/* Motivational phrase */}
        <p
          className="text-muted-foreground text-lg animate-fade-in-up"
          style={{ animationDelay: '100ms' }}
        >
          {phrase}
        </p>
      </div>
    </header>
  );
}
