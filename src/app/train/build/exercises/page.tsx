import React from 'react';
import ExerciseList from '@/components/train/build/exercises/ExerciseList';
import PageLayout from '@/components/layout/PageLayout';

export default function ExercisesPage() {
  return (
    <PageLayout
      breadcrumbHref="/train/build"
      breadcrumbText="Build"
      title="Exercises"
    >
      <ExerciseList />
    </PageLayout>
  );
}
