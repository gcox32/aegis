import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Exercise } from '@/types/train';

interface ExerciseDetailsOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  exercise: Exercise | null;
}

export function ExerciseDetailsOverlay({ 
  isOpen, 
  onClose,
  exercise
}: ExerciseDetailsOverlayProps) {
  const [shouldRender, setShouldRender] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      const timer = setTimeout(() => setIsVisible(true), 10);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => setShouldRender(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!shouldRender || !exercise) return null;

  const formatMovementPattern = (pattern?: string) => {
    if (!pattern) return null;
    return pattern.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const formatEquipment = (equipment?: string[]) => {
    if (!equipment || equipment.length === 0) return null;
    return equipment.map(eq => 
      eq.charAt(0).toUpperCase() + eq.slice(1)
    ).join(', ');
  };

  const formatDifficulty = (difficulty?: string) => {
    if (!difficulty) return null;
    return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
  };

  return (
    <div 
      className={`absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md transition-all duration-200 ease-out p-6 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={onClose}
    >
      <div 
        className={`w-full max-w-lg max-h-[90vh] bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl transition-all duration-200 flex flex-col ${
          isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
        }`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-zinc-800">
          <h2 className="text-xl font-semibold text-white">Exercise Details</h2>
          <button 
            onClick={onClose}
            className="p-2 -mr-2 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Exercise Name */}
          <div>
            <h3 className="text-2xl font-bold text-white mb-2">{exercise.name}</h3>
            {exercise.description && (
              <p className="text-zinc-300 text-sm leading-relaxed">{exercise.description}</p>
            )}
          </div>

          {/* Video/Image */}
          {(exercise.videoUrl || exercise.imageUrl) && (
            <div className="rounded-2xl overflow-hidden bg-zinc-800">
              {exercise.videoUrl ? (
                <video 
                  src={exercise.videoUrl}
                  className="w-full h-auto"
                  controls
                  playsInline
                />
              ) : exercise.imageUrl ? (
                <img 
                  src={exercise.imageUrl}
                  alt={exercise.name}
                  className="w-full h-auto"
                />
              ) : null}
            </div>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Movement Pattern */}
            {exercise.movementPattern && (
              <DetailItem 
                label="Movement Pattern" 
                value={formatMovementPattern(exercise.movementPattern)} 
              />
            )}

            {/* Difficulty */}
            {exercise.difficulty && (
              <DetailItem 
                label="Difficulty" 
                value={formatDifficulty(exercise.difficulty)} 
              />
            )}

            {/* Bilateral */}
            <DetailItem 
              label="Type" 
              value={exercise.bilateral === false ? 'Single Sided' : 'Bilateral'} 
            />

            {/* Plane of Motion */}
            {exercise.planeOfMotion && (
              <DetailItem 
                label="Plane of Motion" 
                value={formatMovementPattern(exercise.planeOfMotion)} 
              />
            )}
          </div>

          {/* Equipment */}
          {exercise.equipment && exercise.equipment.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-zinc-400 mb-2 uppercase tracking-wide">Equipment</h4>
              <p className="text-zinc-300 text-sm">{formatEquipment(exercise.equipment)}</p>
            </div>
          )}

          {/* Muscle Groups */}
          {exercise.muscleGroups && (
            <div>
              <h4 className="text-sm font-semibold text-zinc-400 mb-2 uppercase tracking-wide">Muscle Groups</h4>
              <div className="space-y-1.5">
                {exercise.muscleGroups.primary && (
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-500 text-xs w-20">Primary:</span>
                    <span className="text-zinc-300 text-sm">{exercise.muscleGroups.primary}</span>
                  </div>
                )}
                {exercise.muscleGroups.secondary && (
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-500 text-xs w-20">Secondary:</span>
                    <span className="text-zinc-300 text-sm">{exercise.muscleGroups.secondary}</span>
                  </div>
                )}
                {exercise.muscleGroups.tertiary && (
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-500 text-xs w-20">Tertiary:</span>
                    <span className="text-zinc-300 text-sm">{exercise.muscleGroups.tertiary}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  
  return (
    <div>
      <h4 className="text-xs font-semibold text-zinc-400 mb-1 uppercase tracking-wide">{label}</h4>
      <p className="text-zinc-300 text-sm">{value}</p>
    </div>
  );
}

