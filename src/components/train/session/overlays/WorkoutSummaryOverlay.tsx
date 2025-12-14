import { X, Dumbbell, Clock, Flame } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { WorkoutInstance } from '@/types/train';

interface WorkoutSummaryOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  workoutInstance: WorkoutInstance | null;
  totalVolume: number; // calculated in parent for now
  durationSeconds: number;
}

export function WorkoutSummaryOverlay({ 
  isOpen, 
  onClose, 
  workoutInstance,
  totalVolume,
  durationSeconds 
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

  return (
    <div 
      className={`absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md transition-all duration-200 ease-out p-4 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={onClose}
    >
      <div 
        className={`w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl transition-all duration-200 ${
          isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
        }`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 pb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Workout Summary</h2>
          <button 
            onClick={onClose}
            className="p-2 -mr-2 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-px bg-zinc-800/50 border-y border-zinc-800">
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
            icon={Flame} 
            label="Calories" 
            value="--" 
            sublabel="(Est)"
          />
          <StatBox 
            label="Sets" 
            value={workoutInstance?.id ? "Check Log" : "--"} 
            className="flex flex-col justify-center items-center p-6 bg-zinc-900"
          />
        </div>

        {/* Footer / Placeholder for future chart */}
        <div className="p-6 bg-zinc-900">
          <div className="h-32 rounded-2xl bg-zinc-800/30 border border-zinc-800 border-dashed flex items-center justify-center text-zinc-500 text-sm">
            Performance Chart Coming Soon
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
  if (className) return <div className={className}><span className="text-zinc-400 text-sm mb-1">{label}</span><span className="text-white font-mono text-xl font-bold">{value}</span></div>;

  return (
    <div className="flex flex-col justify-center items-center p-6 bg-zinc-900 hover:bg-zinc-800/50 transition-colors">
      <div className="flex items-center gap-2 mb-2 text-zinc-400">
        {Icon && <Icon className="w-4 h-4" />}
        <span className="text-sm font-medium">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-white font-mono text-2xl font-bold">{value}</span>
        {sublabel && <span className="text-xs text-zinc-500">{sublabel}</span>}
      </div>
    </div>
  );
}

