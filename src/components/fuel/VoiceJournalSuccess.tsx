'use client';

import { useRouter } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import type { MealInstance, Meal } from '@/types/fuel';

interface VoiceJournalSuccessProps {
  mealInstance: MealInstance;
  meal: Meal;
  onClose: () => void;
}

export default function VoiceJournalSuccess({ mealInstance, meal, onClose }: VoiceJournalSuccessProps) {
  const router = useRouter();

  const handleReturn = () => {
    router.push('/');
  };

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (timestamp: Date | string | null) => {
    if (!timestamp) return null;
    const t = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    return t.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="z-50 fixed inset-0 flex flex-col bg-black">
      {/* Content */}
      <div className="flex flex-1 justify-center items-center px-6 py-8">
        <div className="space-y-6 max-w-md text-center">
          {/* Success Icon */}
          <div className="flex justify-center">
            <div className="bg-green-500/20 p-6 rounded-full">
              <CheckCircle2 className="w-16 h-16 text-green-400" />
            </div>
          </div>

          {/* Success Message */}
          <div className="space-y-2">
            <h2 className="font-semibold text-white text-2xl">Meal Logged!</h2>
            <p className="text-zinc-400">
              Your meal has been successfully saved.
            </p>
          </div>

          {/* Meal Summary */}
          <div className="bg-zinc-900/50 p-6 border border-zinc-800 rounded-2xl text-left">
            <h3 className="mb-3 font-semibold text-white text-lg">{meal.name}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-400">Date:</span>
                <span className="text-white">{formatDate(mealInstance.date)}</span>
              </div>
              {mealInstance.timestamp && formatTime(mealInstance.timestamp) && (
                <div className="flex justify-between">
                  <span className="text-zinc-400">Time:</span>
                  <span className="text-white">{formatTime(mealInstance.timestamp)}</span>
                </div>
              )}
              {mealInstance.calories && (
                <div className="flex justify-between">
                  <span className="text-zinc-400">Calories:</span>
                  <span className="text-white">{Math.round(mealInstance.calories)}</span>
                </div>
              )}
              {mealInstance.macros && (
                <div className="flex justify-between">
                  <span className="text-zinc-400">Macros:</span>
                  <span className="text-white">{mealInstance.macros.protein}g P, {mealInstance.macros.carbs}g C, {mealInstance.macros.fat}g F</span>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Footer */}
      <div className="safe-area-inset-bottom bg-zinc-900/80 backdrop-blur-sm border-zinc-800 border-t">
        <div className="flex justify-center items-center mx-auto px-6 py-4 max-w-2xl">
          <Button
            onClick={handleReturn}
            variant="primary"
            size="lg"
            className="w-full min-h-[60px]"
          >
            Return
          </Button>
        </div>
      </div>
    </div>
  );
}

