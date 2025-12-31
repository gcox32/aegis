'use client';

import { useEffect, useState, useRef } from 'react';
import { Workout } from '@/types/train';
import { FormInput } from '@/components/ui/Form';
import { Loader2 } from 'lucide-react';

interface WorkoutAutocompleteProps {
  initialWorkoutId?: string;
  /** The workout currently being edited/created, used to exclude from results when editing */
  currentWorkoutId?: string;
  onChange: (workout: Workout | null) => void;
}

export function WorkoutAutocomplete({
  initialWorkoutId,
  currentWorkoutId,
  onChange,
}: WorkoutAutocompleteProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [options, setOptions] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Load initial workout (when editing)
  useEffect(() => {
    if (!initialWorkoutId) return;

    let cancelled = false;

    async function fetchWorkout() {
      try {
        const res = await fetch(`/api/train/workouts/${initialWorkoutId}`);
        if (!res.ok || cancelled) return;
        const data = await res.json();
        if (data.workout && !cancelled) {
          setSearchTerm(data.workout.name || '');
          onChange(data.workout);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Failed to fetch workout', err);
        }
      }
    }

    fetchWorkout();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialWorkoutId]); // Only depend on initialWorkoutId, not onChange

  // Debounced search
  useEffect(() => {
    if (!searchTerm) {
      setOptions([]);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          q: searchTerm,
          page: '1',
          limit: '10',
        });
        const res = await fetch(`/api/train/workouts?${params.toString()}`, {
          signal: controller.signal,
        });
        if (!res.ok) return;
        const data = await res.json();
        let results: Workout[] = data.workouts || [];
        if (currentWorkoutId) {
          results = results.filter((workout) => workout.id !== currentWorkoutId);
        }
        setOptions(results);
        setIsOpen(true);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Failed to search workouts', err);
        }
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [searchTerm, currentWorkoutId]);

  const clearSelection = () => {
    setSearchTerm('');
    setOptions([]);
    setIsOpen(false);
    onChange(null);
  };

  const handleSelect = (workout: Workout | null) => {
    if (!workout) {
      clearSelection();
      return;
    }

    setSearchTerm(workout.name || '');
    setOptions([]);
    setIsOpen(false);
    onChange(workout);
  };

  function handleClickOutside(event: MouseEvent) {
    if (!containerRef.current) return;
    if (!containerRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  }

  // Close suggestions when clicking outside
  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const showDropdown = isOpen && searchTerm && options.length > 0;

  return (
    <div ref={containerRef} className="relative">
      <FormInput
        type="text"
        name="workoutSearch"
        placeholder="Search workouts by name..."
        value={searchTerm}
        onChange={(e) => {
          const value = e.target.value;
          setSearchTerm(value);
          if (!value) {
            handleSelect(null);
          } else {
            setIsOpen(true);
          }
        }}
        onFocus={() => {
          if (searchTerm) setIsOpen(true);
        }}
        autoComplete="off"
      />
      {loading && (
        <div className="top-1/2 right-3 absolute text-muted-foreground text-xs -translate-y-1/2">
          <Loader2 className="w-4 h-4 animate-spin" />
        </div>
      )}
      {showDropdown ? (
        <div className="z-10 absolute bg-card shadow-lg mt-1 border border-border rounded-md w-full max-h-56 overflow-auto">
          {options.map((option) => (
            <button
              key={option.id}
              type="button"
              className="block hover:bg-muted px-3 py-2 w-full text-sm text-left"
              onClick={() => handleSelect(option)}
            >
              {option.name || 'Unnamed Workout'}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

