'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { WorkoutInstance } from '@/types/train';
import { ChevronRight, Loader2, Dumbbell, Clock, Weight } from 'lucide-react';
import { format } from 'date-fns';

export default function WorkoutInstanceList() {
  const [instances, setInstances] = useState<WorkoutInstance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInstances() {
      try {
        const res = await fetch('/api/train/workouts/instances');
        if (res.ok) {
          const data = await res.json();
          // Sort by date desc
          const sorted = (data.workoutInstances as WorkoutInstance[]).sort((a, b) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          setInstances(sorted);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchInstances();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center bg-card px-4 py-8 border border-border rounded-(--radius) text-muted-foreground text-sm">
        <Loader2 className="mr-2 w-4 h-4 animate-spin" />
        Loading workouts...
      </div>
    );
  }

  if (instances.length === 0) {
    return (
      <div className="bg-card/40 px-4 py-4 border border-border border-dashed rounded-(--radius) text-muted-foreground text-sm text-center">
        No workouts logged yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {instances.map((instance) => {
        const workoutDate = new Date(instance.date);
        
        const durationText = instance.duration?.value 
          ? `${instance.duration.unit === 's' ? Math.round(instance.duration.value / 60) : instance.duration.value}m`
          : null;
        
        const volumeText = instance.volume?.value
          ? `${instance.volume.value.toFixed(1)}${instance.volume.unit}`
          : null;

        return (
          <Link
            key={instance.id}
            href={`/log/workouts/${instance.id}`}
            className="flex justify-between items-center bg-card px-4 py-3 border border-border rounded-(--radius) hover:border-white/20 transition-all duration-200 group"
          >
            <div className="flex flex-1 items-center gap-4 min-w-0">
              <div className={`p-2 rounded-lg shrink-0 ${
                instance.complete 
                  ? 'bg-success/10 text-success' 
                  : 'bg-brand-accent/10 text-brand-accent'
              }`}>
                <Dumbbell className="w-5 h-5" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-foreground text-sm truncate">
                    {instance.workout?.name || 'Untitled Workout'}
                  </h4>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full shrink-0 ${
                    instance.complete 
                      ? 'bg-success/20 text-success' 
                      : 'bg-brand-accent/20 text-brand-accent'
                  }`}>
                    {instance.complete ? 'Completed' : 'In Progress'}
                  </span>
                </div>
                
                <div className="flex flex-wrap items-center gap-3 text-muted-foreground text-xs">
                  <span>
                    {format(workoutDate, 'MMM d, yyyy')} • {format(workoutDate, 'h:mm a')}
                  </span>
                  {(durationText || volumeText) && (
                    <span className="flex items-center gap-2">
                      {durationText && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {durationText}
                        </span>
                      )}
                      {volumeText && (
                        <span className="flex items-center gap-1">
                          <Weight className="w-3 h-3" />
                          {volumeText}
                        </span>
                      )}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <ChevronRight className="ml-4 w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
          </Link>
        );
      })}
    </div>
  );
}
