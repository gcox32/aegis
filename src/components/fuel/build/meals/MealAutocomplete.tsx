'use client';

import { useEffect, useState, useRef } from 'react';
import { Meal } from '@/types/fuel';
import { FormInput } from '@/components/ui/Form';
import { Loader2 } from 'lucide-react';

interface MealAutocompleteProps {
  initialMealId?: string;
  /** The meal currently being edited/created, used to exclude from results when editing */
  currentMealId?: string;
  onChange: (meal: Meal | null) => void;
}

export function MealAutocomplete({
  initialMealId,
  currentMealId,
  onChange,
}: MealAutocompleteProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [options, setOptions] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Load initial meal (when editing)
  useEffect(() => {
    if (!initialMealId) return;

    let cancelled = false;

    async function fetchMeal() {
      try {
        const res = await fetch(`/api/fuel/meals/${initialMealId}`);
        if (!res.ok || cancelled) return;
        const data = await res.json();
        if (data && !cancelled) {
          setSearchTerm(data.name);
          onChange(data);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Failed to fetch meal', err);
        }
      }
    }

    fetchMeal();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialMealId]); // Only depend on initialMealId, not onChange

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
        const res = await fetch(`/api/fuel/meals?${params.toString()}`, {
          signal: controller.signal,
        });
        if (!res.ok) return;
        const data = await res.json();
        let results: Meal[] = data.meals || [];
        if (currentMealId) {
          results = results.filter((meal) => meal.id !== currentMealId);
        }
        setOptions(results);
        setIsOpen(true);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Failed to search meals', err);
        }
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [searchTerm, currentMealId]);

  const clearSelection = () => {
    setSearchTerm('');
    setOptions([]);
    setIsOpen(false);
    onChange(null);
  };

  const handleSelect = (meal: Meal | null) => {
    if (!meal) {
      clearSelection();
      return;
    }

    setSearchTerm(meal.name);
    setOptions([]);
    setIsOpen(false);
    onChange(meal);
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
        name="mealSearch"
        placeholder="Search meals by name..."
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
              {option.name}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

