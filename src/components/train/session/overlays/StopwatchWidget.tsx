import { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, RotateCcw } from 'lucide-react';

interface StopwatchWidgetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function StopwatchWidget({ isOpen, onClose }: StopwatchWidgetProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const startTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = performance.now() - elapsedTime;
      const update = () => {
        setElapsedTime(performance.now() - startTimeRef.current);
        animationFrameRef.current = requestAnimationFrame(update);
      };
      animationFrameRef.current = requestAnimationFrame(update);
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isRunning]);

  if (!isOpen) return null;

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = Math.floor((ms % 1000) / 10); // Show 2 digits

    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(minutes)}:${pad(seconds)}.${pad(milliseconds)}`;
  };

  const handleReset = () => {
    setIsRunning(false);
    setElapsedTime(0);
  };

  const handleToggle = () => {
    setIsRunning(!isRunning);
  };

  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 flex flex-col items-center bg-zinc-900/50 backdrop-blur-md border border-zinc-800 rounded-2xl shadow-2xl p-4 w-48 transition-all animate-in fade-in zoom-in-95 duration-200">
      <div className="flex justify-between items-start w-full mb-2">
        <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Stopwatch</span>
        <button 
          onClick={onClose}
          className="text-zinc-500 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="font-mono text-3xl font-bold text-white mb-4 tracking-tight tabular-nums">
        {formatTime(elapsedTime)}
      </div>

      <div className="flex gap-2 w-full">
        <button
          onClick={handleToggle}
          className={`flex-1 flex items-center justify-center p-3 rounded-xl transition-colors ${
            isRunning 
              ? 'bg-amber-500/20 text-amber-500 hover:bg-amber-500/30' 
              : 'bg-brand-primary text-black hover:bg-brand-primary-dark'
          }`}
        >
          {isRunning ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
        </button>

        <button
          onClick={handleReset}
          className="flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 p-3 rounded-xl w-12 text-zinc-400 hover:text-white transition-colors"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

