import { Pause, Settings2, List } from 'lucide-react';

interface SessionHeaderProps {
  elapsedSeconds: number;
  onPauseToggle: () => void;
  formatClock: (seconds: number) => string;
  onSettingsClick: () => void;
  onOverviewClick: () => void;
}

export function SessionHeader({
  elapsedSeconds,
  onPauseToggle,
  formatClock,
  onSettingsClick,
  onOverviewClick,
}: SessionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-4">
        <button
          onClick={onPauseToggle}
          className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center active:scale-95 transition-transform"
        >
          <Pause className="w-6 h-6 fill-white" />
        </button>
        <span className="font-mono text-2xl font-semibold tracking-wider">
          {formatClock(elapsedSeconds)}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <button 
          onClick={onSettingsClick}
          className="p-2 rounded-full hover:bg-white/10 transition-colors"
        >
          <Settings2 className="w-6 h-6 text-white/80" />
        </button>
        <button 
          onClick={onOverviewClick}
          className="p-2 rounded-full hover:bg-white/10 transition-colors"
        >
          <List className="w-6 h-6 text-white/80" />
        </button>
      </div>
    </div>
  );
}

