import { X, Volume2, Monitor, Bell } from 'lucide-react';
import { useEffect, useState } from 'react';

interface SettingsOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  timerSoundsEnabled: boolean;
  onTimerSoundsChange: (value: boolean) => void;
}

export function SettingsOverlay({ 
  isOpen, 
  onClose,
  timerSoundsEnabled,
  onTimerSoundsChange,
}: SettingsOverlayProps) {
  const [shouldRender, setShouldRender] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Local-only mock state for future toggles
  const [screenAlwaysOn, setScreenAlwaysOn] = useState(true);
  const [notifications, setNotifications] = useState(false);

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
      className={`absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md transition-all duration-200 ease-out p-6 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={onClose}
    >
      <div 
        className={`w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl transition-all duration-200 ${
          isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
        }`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Workout Settings</h2>
          <button 
            onClick={onClose}
            className="p-2 -mr-2 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <ToggleRow 
            icon={Volume2} 
            label="Timer Sounds" 
            isActive={timerSoundsEnabled} 
            onToggle={() => onTimerSoundsChange(!timerSoundsEnabled)} 
          />
          <ToggleRow 
            icon={Monitor} 
            label="Screen Always On" 
            isActive={screenAlwaysOn} 
            onToggle={() => setScreenAlwaysOn(!screenAlwaysOn)} 
          />
          <ToggleRow 
            icon={Bell} 
            label="Notifications" 
            isActive={notifications} 
            onToggle={() => setNotifications(!notifications)} 
          />
        </div>
      </div>
    </div>
  );
}

function ToggleRow({ 
  icon: Icon, 
  label, 
  isActive, 
  onToggle 
}: { 
  icon: any, 
  label: string, 
  isActive: boolean, 
  onToggle: () => void 
}) {
  return (
    <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-2xl">
      <div className="flex items-center gap-3 text-zinc-200">
        <Icon className="w-5 h-5" />
        <span className="font-medium">{label}</span>
      </div>
      <button 
        onClick={onToggle}
        className={`w-12 h-7 rounded-full p-1 transition-colors duration-200 ${
          isActive ? 'bg-brand-primary' : 'bg-zinc-700'
        }`}
      >
        <div 
          className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
            isActive ? 'translate-x-5' : 'translate-x-0'
          }`} 
        />
      </button>
    </div>
  );
}

