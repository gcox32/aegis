import { Play, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface PauseOverlayProps {
  isOpen: boolean;
  onResume: () => void;
  onEndSession: () => void;
}

export function PauseOverlay({ isOpen, onResume, onEndSession }: PauseOverlayProps) {
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

  return (
    <div 
      className={`absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md transition-all duration-200 ease-out ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="flex flex-col h-full justify-between gap-6 w-full max-w-xs p-8">
        <div className="h-full flex justify-center items-center">
        <button
          onClick={onResume}
          className="w-full bg-white text-black font-bold text-lg py-4 rounded-full flex items-center justify-center gap-3 active:scale-95 transition-transform shadow-lg shadow-white/10"
        >
          <Play className="w-6 h-6 fill-black" />
        </button>
        </div>
        <button
          onClick={onEndSession}
          className="w-full bg-zinc-800/80 text-red-400 font-medium text-lg py-4 rounded-full flex items-center justify-center gap-3 active:scale-95 transition-transform border border-zinc-700/50"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}

