'use client';

import { useState, useRef, useEffect } from 'react';
import { Activity, ChevronDown, ChevronUp } from 'lucide-react';
import type { MuscleGroupWork } from '@/app/train/actions';

interface MuscleGroupsCardProps {
  muscleGroups: MuscleGroupWork[];
}

function formatMuscleGroupName(name: string): string {
  // Capitalize first letter of each word
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default function MuscleGroupsCard({ muscleGroups }: MuscleGroupsCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | 'auto'>('auto');

  useEffect(() => {
    // Reset to auto first to allow content to render at natural height
    setHeight('auto');
    
    // Then measure and set explicit height for smooth transition
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (contentRef.current) {
          setHeight(contentRef.current.scrollHeight);
        }
      });
    });
  }, [isExpanded, muscleGroups]);

  if (muscleGroups.length === 0) {
    return (
      <div className="bg-card card-gradient p-4 border border-white/5 rounded-(--radius) shadow-lg shadow-black/20">
        <div className="flex justify-between items-start mb-3">
          <div className="bg-white/5 p-2 rounded-lg">
            <Activity className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>
        <div className="mb-1 font-medium text-muted-foreground text-xs uppercase tracking-wide">
          Muscle Focus (30 days)
        </div>
        <div className="font-display font-bold text-foreground text-lg">
          No data yet
        </div>
        <div className="mt-1 text-muted-foreground text-sm">
          Complete workouts to see muscle group breakdown
        </div>
      </div>
    );
  }

  const maxScore = muscleGroups[0]?.score || 1;
  const topGroups = muscleGroups.slice(0, 3);
  const bottomGroups = muscleGroups.length > 3
    ? muscleGroups.slice(-3).reverse()
    : [];

  const displayGroups = isExpanded ? muscleGroups : [...topGroups, ...bottomGroups];

  return (
    <div className="bg-card card-gradient p-4 border border-white/5 rounded-(--radius) shadow-lg shadow-black/20">
      <div className="flex justify-between items-start mb-3">
        <div className="bg-brand-primary/10 p-2 rounded-lg">
          <Activity className="w-4 h-4 text-brand-primary" />
        </div>
        {muscleGroups.length > 6 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground text-xs transition-colors"
          >
            {isExpanded ? (
              <>
                <span>Collapse</span>
                <ChevronUp className="w-3 h-3" />
              </>
            ) : (
              <>
                <span>Expand</span>
                <ChevronDown className="w-3 h-3" />
              </>
            )}
          </button>
        )}
      </div>
      <div className="mb-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">
        Muscle Focus (30 days)
      </div>

      <div 
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ height: typeof height === 'number' ? `${height}px` : height }}
      >
        <div ref={contentRef}>
          {isExpanded ? (
          /* All Groups - Expanded View */
          <div className="space-y-2">
            {muscleGroups.map((mg) => {
              const percentage = (mg.score / maxScore) * 100;
              const isTopGroup = topGroups.some(tg => tg.name === mg.name);
              const isBottomGroup = bottomGroups.some(bg => bg.name === mg.name);
              const barColor = isTopGroup 
                ? 'bg-success' 
                : isBottomGroup 
                  ? 'bg-warning/60' 
                  : 'bg-muted-foreground/40';
              
              return (
                <div key={mg.name}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-foreground text-sm">
                      {formatMuscleGroupName(mg.name)}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {mg.setCount} sets
                    </span>
                  </div>
                  <div className="bg-white/5 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`${barColor} h-full rounded-full transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-2">
            {topGroups.map((mg) => {
              const percentage = (mg.score / maxScore) * 100;
              return (
                <div key={mg.name}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-foreground text-sm">
                      {formatMuscleGroupName(mg.name)}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {mg.setCount} sets
                    </span>
                  </div>
                  <div className="bg-white/5 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-success rounded-full h-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
            
            {bottomGroups.length > 0 && (
              <>
                <div className="my-3 border-white/5 border-t" />
                {bottomGroups.map((mg) => {
                  const percentage = (mg.score / maxScore) * 100;
                  return (
                    <div key={mg.name}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-foreground text-sm">
                          {formatMuscleGroupName(mg.name)}
                        </span>
                        <span className="text-muted-foreground text-xs">
                          {mg.setCount} sets
                        </span>
                      </div>
                      <div className="bg-white/5 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-warning/60 rounded-full h-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
