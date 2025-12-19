'use client';

import React, { useEffect, useState } from 'react';
import { UserGoal } from '@/types/user';
import { GoalList } from '@/components/goals/GoalList';
import { GoalForm } from '@/components/goals/GoalForm';
import Button from '@/components/ui/Button';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import { useToast } from '@/components/ui/Toast';
import { Plus, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import BackToLink from '@/components/layout/navigation/BackToLink';
import PageLayout from '@/components/layout/PageLayout';

export default function GoalsPage() {
    const [goals, setGoals] = useState<UserGoal[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [editingGoal, setEditingGoal] = useState<UserGoal | null>(null);
    const [deletingGoal, setDeletingGoal] = useState<UserGoal | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const { showToast } = useToast();

    const fetchGoals = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/me/goals');
            if (!res.ok) throw new Error('Failed to fetch goals');
            const data = await res.json();
            setGoals(data.goals);
        } catch (error) {
            console.error(error);
            showToast({
                title: 'Error',
                description: 'Failed to load goals',
                variant: 'error'
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchGoals();
    }, []);

    const handleCreate = async (data: Partial<UserGoal>) => {
        setIsSubmitting(true);
        try {
            const res = await fetch('/api/me/goals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            
            if (!res.ok) throw new Error('Failed to create goal');
            
            await fetchGoals();
            setIsCreating(false);
            showToast({ title: 'Success', description: 'Goal created successfully', variant: 'success' });
        } catch (error) {
            console.error(error);
             showToast({ title: 'Error', description: 'Failed to create goal', variant: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdate = async (data: Partial<UserGoal>) => {
        if (!editingGoal) return;
        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/me/goals/${editingGoal.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            
            if (!res.ok) throw new Error('Failed to update goal');
            
            await fetchGoals();
            setEditingGoal(null);
            showToast({ title: 'Success', description: 'Goal updated successfully', variant: 'success' });
        } catch (error) {
            console.error(error);
            showToast({ title: 'Error', description: 'Failed to update goal', variant: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!deletingGoal) return;
        try {
            const res = await fetch(`/api/me/goals/${deletingGoal.id}`, {
                method: 'DELETE',
            });
            
            if (!res.ok) throw new Error('Failed to delete goal');
            
            await fetchGoals();
            setDeletingGoal(null);
            showToast({ title: 'Success', description: 'Goal deleted successfully', variant: 'success' });
        } catch (error) {
            console.error(error);
            showToast({ title: 'Error', description: 'Failed to delete goal', variant: 'error' });
        }
    };

    if (isCreating) {
        return (
            <PageLayout
                breadcrumbHref="/me/goals"
                breadcrumbText="Goals"
                title="New Goal"
                subtitle="Create a new goal"
            >
                <GoalForm 
                    onSubmit={handleCreate} 
                    onCancel={() => setIsCreating(false)}
                    isSubmitting={isSubmitting}
                />
            </PageLayout>
        );
    }

    if (editingGoal) {
         return (
            <PageLayout
                breadcrumbHref="/me/goals"
                breadcrumbText="Goals"
                title="Edit Goal"
                subtitle="Edit your goal"
            >
                <GoalForm 
                    initialData={editingGoal}
                    onSubmit={handleUpdate} 
                    onCancel={() => setEditingGoal(null)}
                    isSubmitting={isSubmitting}
                />
            </PageLayout>
        );
    }

    return (
        <PageLayout
            breadcrumbHref="/me"
            breadcrumbText="Me"
            title="Goals"
            subtitle="Manage your goals"
        >
            <Button className="w-full" onClick={() => setIsCreating(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Goal
            </Button>
            {isLoading ? (
                <div className="py-12 text-center text-muted-foreground">Loading goals...</div>
            ) : (
                <GoalList 
                    goals={goals} 
                    onEdit={setEditingGoal} 
                    onDelete={setDeletingGoal} 
                />
            )}

            <ConfirmationModal
                isOpen={!!deletingGoal}
                onClose={() => setDeletingGoal(null)}
                onConfirm={handleDelete}
                title="Delete Goal"
                message="Are you sure you want to delete this goal? This action cannot be undone."
                confirmVariant="danger"
                confirmText="Delete"
            />
        </PageLayout>
    );
}
