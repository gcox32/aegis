import { X, Loader2, Search } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import type { Exercise } from '@/types/train';
import { FormInput } from '@/components/ui/Form';
import Button from '@/components/ui/Button';

interface SwapExerciseOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  currentExercise: Exercise;
  onSwap: (newExercise: Exercise) => Promise<void>;
}

export function SwapExerciseOverlay({ 
  isOpen, 
  onClose,
  currentExercise,
  onSwap
}: SwapExerciseOverlayProps) {
  const [shouldRender, setShouldRender] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [options, setOptions] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [swapping, setSwapping] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setOptions([]);
      setSelectedExercise(null);
      setShouldRender(true);
      const timer = setTimeout(() => setIsVisible(true), 10);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => setShouldRender(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Debounced search
  useEffect(() => {
    if (!searchTerm || !currentExercise) {
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
          limit: '20',
        });
        const res = await fetch(`/api/train/exercises?${params.toString()}`, {
          signal: controller.signal,
        });
        if (!res.ok) return;
        const data = await res.json();
        let results: Exercise[] = data.exercises || [];
        // Filter out current exercise
        if (currentExercise) {
          results = results.filter((ex) => ex.id !== currentExercise.id);
        }
        setOptions(results);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Failed to search exercises', err);
        }
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [searchTerm, currentExercise]);

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target as Node)) {
        setOptions([]);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setSearchTerm(exercise.name);
    setOptions([]);
  };

  const handleSwap = async () => {
    if (!selectedExercise) return;
    setSwapping(true);
    try {
      await onSwap(selectedExercise);
      onClose();
    } catch (error) {
      console.error('Failed to swap exercise:', error);
    } finally {
      setSwapping(false);
    }
  };

  if (!shouldRender || !currentExercise) return null;

  return (
    <div 
      className={`absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md transition-all duration-200 ease-out p-6 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={onClose}
    >
      <div 
        className={`w-full max-w-md h-[90vh] bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl transition-all duration-200 flex flex-col ${
          isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
        }`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 pb-4 border-zinc-800 border-b shrink-0">
          <div>
            <h2 className="font-semibold text-white text-xl">Swap Exercise</h2>
            {currentExercise && (
              <p className="mt-1 text-zinc-400 text-sm">Current: {currentExercise.name}</p>
            )}
          </div>
          <button 
            onClick={onClose}
            className="-mr-2 p-2 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 space-y-4 p-6 overflow-y-auto">
          {/* Search */}
          <div ref={containerRef} className="relative">
            <div className="relative">
              <Search className="top-1/2 left-3 absolute w-4 h-4 text-zinc-400 -translate-y-1/2" />
              <FormInput
                type="text"
                placeholder="Search for replacement exercise..."
                value={searchTerm}
                onChange={(e) => {
                  const value = e.target.value;
                  setSearchTerm(value);
                  setSelectedExercise(null);
                  if (!value) {
                    setOptions([]);
                  }
                }}
                className="bg-zinc-800 pl-10 border-zinc-700 text-white placeholder:text-zinc-500"
                autoFocus
              />
            </div>
            {loading && (
              <div className="top-1/2 right-3 absolute -translate-y-1/2">
                <Loader2 className="w-4 h-4 text-zinc-400 animate-spin" />
              </div>
            )}
            
            {/* Search Results */}
            {searchTerm && options.length > 0 && (
              <div className="z-10 absolute bg-zinc-800 shadow-lg mt-2 border border-zinc-700 rounded-xl w-full max-h-64 overflow-auto">
                {options.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    className={`block hover:bg-zinc-700 px-4 py-3 w-full text-left transition-colors ${
                      selectedExercise?.id === option.id ? 'bg-zinc-700' : ''
                    }`}
                    onClick={() => handleSelect(option)}
                  >
                    <div className="font-medium text-white">{option.name}</div>
                    {option.description && (
                      <div className="mt-1 text-zinc-400 text-xs line-clamp-1">{option.description}</div>
                    )}
                  </button>
                ))}
              </div>
            )}

            {searchTerm && !loading && options.length === 0 && (
              <div className="mt-2 py-4 text-zinc-500 text-sm text-center">
                No exercises found
              </div>
            )}
          </div>

          {/* Selected Exercise Preview */}
          {selectedExercise && (
            <div className="bg-zinc-800/50 p-4 border border-zinc-700 rounded-xl">
              <div className="mb-1 text-zinc-400 text-sm">Selected:</div>
              <div className="font-medium text-white">{selectedExercise.name}</div>
              {selectedExercise.description && (
                <div className="mt-1 text-zinc-400 text-sm">{selectedExercise.description}</div>
              )}
            </div>
          )}

        </div>

        {/* Actions - Fixed at bottom */}
        <div className="flex gap-3 p-6 pt-4 border-zinc-800 border-t shrink-0">
          <Button
            onClick={onClose}
            variant="ghost"
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSwap}
            disabled={!selectedExercise || swapping}
            className="flex-1"
          >
            {swapping ? 'Swapping...' : 'Swap'}
          </Button>
        </div>
      </div>
    </div>
  );
}

