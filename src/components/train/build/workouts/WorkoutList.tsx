'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Workout } from '@/types/train';
import Button from '@/components/ui/Button';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import { Plus, Calendar, Clock, Trash2 } from 'lucide-react';

export default function WorkoutList() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [workoutToDelete, setWorkoutToDelete] = useState<Workout | null>(null);

  useEffect(() => {
    fetch('/api/train/workouts')
      .then(res => res.json())
      .then(data => setWorkouts(data.workouts))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleDeleteClick = (e: React.MouseEvent, workout: Workout) => {
    e.preventDefault();
    e.stopPropagation();
    setWorkoutToDelete(workout);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!workoutToDelete) return;

    try {
      const res = await fetch(`/api/train/workouts/${workoutToDelete.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setWorkouts(prev => prev.filter(w => w.id !== workoutToDelete.id));
      } else {
        console.error('Failed to delete workout');
      }
    } catch (err) {
      console.error('Error deleting workout', err);
    }
  };

  return (
    <div className="space-y-6">
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Workout"
        message={`Are you sure you want to delete "${workoutToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmVariant="danger"
      />
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Your Workouts</h2>
        <Link href="/train/build/workouts/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Workout
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {workouts.map(workout => (
            <Link key={workout.id} href={`/train/build/workouts/${workout.id}/edit`} className="block">
              <div className="p-6 rounded-lg shadow-sm border border-gray-200 hover:border-brand-primary transition-colors h-full bg-card">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-gray-300">{workout.name || 'Untitled Workout'}</h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                    {workout.workoutType}
                  </span>
                </div>
                <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                  {workout.description || 'No description provided.'}
                </p>
                <div className="flex items-center text-xs text-gray-400 gap-4 mt-auto">
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {workout.estimatedDuration} min
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {new Date(workout.createdAt).toLocaleDateString()}
                  </div>

                  <button
                    onClick={(e) => handleDeleteClick(e, workout)}
                    className="ml-auto p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                    title="Delete Workout"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </Link>
          ))}
          {workouts.length === 0 && (
            <div className="shadow overflow-hidden sm:rounded-md rounded-lg bg-card">
              <ul className="divide-y divide-gray-200">

                <li className="px-6 py-4 text-center text-gray-500">
                  No workouts found.
                </li>
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

