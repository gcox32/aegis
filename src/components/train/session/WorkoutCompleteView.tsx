import { CheckCircle } from 'lucide-react';
import Button from '@/components/ui/Button';

interface WorkoutCompleteViewProps {
  onContinue: () => void;
}

export function WorkoutCompleteView({ onContinue }: WorkoutCompleteViewProps) {
  return (
    <div className="flex flex-col items-center justify-center bg-black w-full h-dvh text-white p-6">
      <div className="flex flex-col items-center gap-6 mb-12 animate-in fade-in zoom-in duration-500">
        <CheckCircle className="w-24 h-24 text-brand-primary" />
        <h1 className="text-3xl font-bold text-center">Workout Complete!</h1>
        <p className="text-zinc-400 text-center max-w-xs">
          Great job! Your workout has been saved to your history.
        </p>
      </div>

      <div className="w-full max-w-sm fixed bottom-8 px-4 safe-area-inset-bottom">
        <Button 
          onClick={onContinue}
          className="w-full py-6 text-lg"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}

