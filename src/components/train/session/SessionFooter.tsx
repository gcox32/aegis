import { ArrowRight, CheckCircle2, ArrowLeft } from 'lucide-react';

interface SessionFooterProps {
  nextStepName: string | null;
  onNext: () => void;
  onPrevious: () => void;
  canGoBack: boolean;
}

export function SessionFooter({ 
  nextStepName, 
  onNext, 
  onPrevious,
  canGoBack 
}: SessionFooterProps) {
  return (
    <div className="flex gap-4 mt-auto">
      {/* Back Button */}
      <button
        onClick={onPrevious}
        disabled={!canGoBack}
        className={`group relative flex items-center justify-center w-20 bg-zinc-900/90 backdrop-blur-xl border-t border-white/10 pt-5 pb-8 -ml-5 transition-colors ${
          canGoBack ? 'active:bg-zinc-800' : 'opacity-30 cursor-not-allowed'
        }`}
      >
        <div className="w-12 h-12 rounded-full bg-zinc-800 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
          <ArrowLeft className="w-6 h-6" />
        </div>
      </button>

      {/* Next Button */}
      <button
        onClick={onNext}
        className="group relative flex-1 bg-zinc-900/90 backdrop-blur-xl border-t border-white/10 pt-5 pb-8 px-6 -mr-5 active:bg-zinc-800 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex flex-col items-start gap-1">
            <span className="text-brand-primary text-xs font-bold uppercase tracking-widest group-hover:translate-x-1 transition-transform">
              Next
            </span>
            <span className="text-lg font-medium text-white truncate max-w-[180px]">
              {nextStepName || 'Finish Workout'}
            </span>
          </div>
          <div className="w-12 h-12 rounded-full bg-brand-primary text-black flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-brand-primary/20">
            {nextStepName ? (
              <ArrowRight className="w-6 h-6" />
            ) : (
              <CheckCircle2 className="w-6 h-6" />
            )}
          </div>
        </div>
      </button>
    </div>
  );
}

