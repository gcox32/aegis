import { X, Dumbbell, Clock, RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { WorkoutInstance, WorkoutBlock, WorkoutBlockExercise, WorkoutBlockExerciseInstance } from '@/types/train';
import { MuscleHeatmap } from '@/components/anatomy/MuscleHeatmap';

interface WorkoutSummaryOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  workoutInstance: WorkoutInstance | null;
  totalVolume: number; // calculated in parent for now
  durationSeconds: number;
  totalSets: number; // calculated in parent
  blocks: WorkoutBlock[];
  exercisesMap: Record<string, WorkoutBlockExercise[]>;
  completedExerciseInstances?: WorkoutBlockExerciseInstance[];
}

export function WorkoutSummaryOverlay({
  isOpen,
  onClose,
  workoutInstance,
  totalVolume,
  durationSeconds,
  totalSets,
  blocks,
  exercisesMap,
  completedExerciseInstances
}: WorkoutSummaryOverlayProps) {
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

  if (!shouldRender) return null;

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    return `${mins}m`;
  };

  const formatExerciseDetails = (exercise: WorkoutBlockExercise): string => {
    const parts: string[] = [];
    
    // Sets
    if (exercise.sets > 0) {
      parts.push(`${exercise.sets}x`);
    }
    
    // Reps
    if (exercise.measures.reps) {
      parts.push(`${exercise.measures.reps} reps`);
    }
    
    // Time
    if (exercise.measures.time) {
      const timeValue = exercise.measures.time.value;
      const timeUnit = exercise.measures.time.unit;
      if (timeUnit === 's') {
        parts.push(`${timeValue}s`);
      } else if (timeUnit === 'min') {
        parts.push(`${timeValue}min`);
      } else {
        parts.push(`${timeValue}${timeUnit}`);
      }
    }
    
    return parts.length > 0 ? parts.join(' • ') : '';
  };

  const getBlockTitle = (block: WorkoutBlock, exercises: WorkoutBlockExercise[]): string => {
    if (block.name) return block.name;
    
    // Use block type as fallback
    const blockTypeMap: Record<string, string> = {
      'warm-up': 'Warm Up',
      'prep': 'Prep',
      'main': 'Block',
      'accessory': 'Accessory',
      'finisher': 'Finisher',
      'cooldown': 'Cooldown',
      'other': 'Block'
    };
    
    const baseTitle = blockTypeMap[block.workoutBlockType] || 'Block';
    
    // For main blocks, add number if there are multiple
    if (block.workoutBlockType === 'main') {
      const mainBlocks = blocks.filter(b => b.workoutBlockType === 'main');
      if (mainBlocks.length > 1) {
        const index = mainBlocks.findIndex(b => b.id === block.id);
        return `${baseTitle} ${index + 1}`;
      }
    }
    
    return baseTitle;
  };

  const getCircuitRounds = (block: WorkoutBlock, exercises: WorkoutBlockExercise[]): number | null => {
    if (!block.circuit) return null;
    const maxSets = Math.max(...exercises.map(ex => ex.sets || 1), 1);
    return maxSets;
  };

  const getBlockEquipment = (exercises: WorkoutBlockExercise[]): string[] => {
    const equipmentSet = new Set<string>();
    exercises.forEach(ex => {
      if (ex.exercise.equipment && ex.exercise.equipment.length > 0) {
        ex.exercise.equipment.forEach(eq => {
          // Capitalize first letter of each word
          const formatted = eq.split(' ').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' ');
          equipmentSet.add(formatted);
        });
      }
    });
    return Array.from(equipmentSet);
  };

  return (
    <div
      className={`absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md transition-all duration-200 ease-out p-4 ${isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      onClick={onClose}
    >
      <div
        className={`w-full max-w-sm max-h-[90vh] bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl transition-all duration-200 flex flex-col ${isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
          }`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 pb-4">
          <h2 className="pl-6 w-full font-bold text-white text-xl text-center">Overview</h2>
          <button
            onClick={onClose}
            className="-mr-2 p-2 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Grid */}
        <div className="flex-1 bg-zinc-900 border-zinc-800 border-t overflow-y-auto">
          <div className="gap-px grid grid-cols-2 bg-zinc-800/50 border-y border-zinc-800">
            <StatBox
              icon={Clock}
              label="Duration"
              value={formatDuration(durationSeconds)}
            />
            <StatBox
              icon={Dumbbell}
              label="Volume"
              value={`${totalVolume}kg`}
            />
            <StatBox
              label="Sets"
              value={totalSets.toString()}
              className="flex flex-col justify-center items-center bg-zinc-900 p-6"
            />
          </div>

          {/* Muscle Heatmap */}
          {workoutInstance && (
            <div className="p-4 border-zinc-800 border-t">
              <MuscleHeatmap 
                workoutInstance={workoutInstance}
                exercisesMap={exercisesMap}
                completedExerciseInstances={completedExerciseInstances}
              />
            </div>
          )}

          {/* Workout Outline */}
          <div className="p-6">
            <h3 className="mb-4 font-semibold text-zinc-400 text-sm text-center uppercase tracking-wide">Outline</h3>
            <div className="space-y-6">
              {blocks.map((block) => {
                const exercises = exercisesMap[block.id] || [];
                if (exercises.length === 0) return null;

                const blockTitle = getBlockTitle(block, exercises);
                const circuitRounds = getCircuitRounds(block, exercises);
                const equipment = getBlockEquipment(exercises);

                return (
                  <div key={block.id} className="space-y-3">
                    {/* Block Header */}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-white text-base">{blockTitle}</h4>
                        {circuitRounds && (
                          <div className="flex items-center gap-1.5 text-zinc-400 text-xs">
                            <RotateCcw className="w-3 h-3" />
                            <span>Circuit • {circuitRounds} {circuitRounds === 1 ? 'round' : 'rounds'}</span>
                          </div>
                        )}
                      </div>
                      {equipment.length > 0 && (
                        <div className="text-zinc-400 text-sm">
                          {equipment.join(', ')}
                        </div>
                      )}
                    </div>

                    {/* Exercise List */}
                    <div className="space-y-2">
                      {exercises.map((exercise) => {
                        const details = formatExerciseDetails(exercise);
                        
                        return (
                          <div key={exercise.id} className="flex items-center gap-3">
                            {/* Exercise Thumbnail */}
                            <div className="flex justify-center items-center bg-zinc-800 rounded-lg w-12 h-12 shrink-0 overflow-hidden">
                              {exercise.exercise.imageUrl ? (
                                <img 
                                  src={exercise.exercise.imageUrl}
                                  alt={exercise.exercise.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : exercise.exercise.videoUrl ? (
                                <video 
                                  src={exercise.exercise.videoUrl}
                                  className="w-full h-full object-cover"
                                  muted
                                  playsInline
                                />
                              ) : (
                                <Dumbbell className="w-5 h-5 text-zinc-500" />
                              )}
                            </div>

                            {/* Exercise Info */}
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-white text-sm truncate">
                                {exercise.exercise.name}
                              </div>
                              {details && (
                                <div className="text-zinc-400 text-xs mt-0.5">
                                  {details}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBox({
  icon: Icon,
  label,
  value,
  sublabel,
  className
}: {
  icon?: any,
  label: string,
  value: string,
  sublabel?: string,
  className?: string
}) {
  if (className) return <div className={className}><span className="mb-1 text-zinc-400 text-sm">{label}</span><span className="font-mono font-bold text-white text-xl">{value}</span></div>;

  return (
    <div className="flex flex-col justify-center items-center bg-zinc-900 hover:bg-zinc-800/50 p-6 transition-colors">
      <div className="flex items-center gap-2 mb-2 text-zinc-400">
        {Icon && <Icon className="w-4 h-4" />}
        <span className="font-medium text-sm">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="font-mono font-bold text-white text-2xl">{value}</span>
        {sublabel && <span className="text-zinc-500 text-xs">{sublabel}</span>}
      </div>
    </div>
  );
}

