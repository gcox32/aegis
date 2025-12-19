'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { UserGoal } from '@/types/user';
import { GoalForm } from '@/components/goals/GoalForm';
import Button from '@/components/ui/Button';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import { useToast } from '@/components/ui/Toast';
import PageLayout from '@/components/layout/PageLayout';
import { Edit } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CheckCircle, Circle } from 'lucide-react';

export default function GoalDetailPage() {
    const params = useParams();
    const router = useRouter();
    const goalId = params.id as string;

    const [goal, setGoal] = useState<UserGoal | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [togglingComponent, setTogglingComponent] = useState<string | null>(null);

    const { showToast } = useToast();

    const fetchGoal = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/me/goals/${goalId}`);
            if (!res.ok) {
                if (res.status === 404) {
                    showToast({
                        title: 'Error',
                        description: 'Goal not found',
                        variant: 'error'
                    });
                    router.push('/me/goals');
                    return;
                }
                throw new Error('Failed to fetch goal');
            }
            const data = await res.json();
            setGoal(data.goal);
        } catch (error) {
            console.error(error);
            showToast({
                title: 'Error',
                description: 'Failed to load goal',
                variant: 'error'
            });
            router.push('/me/goals');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (goalId) {
            fetchGoal();
        }
    }, [goalId]);

    const handleUpdate = async (data: Partial<UserGoal>) => {
        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/me/goals/${goalId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!res.ok) throw new Error('Failed to update goal');

            await fetchGoal();
            setIsEditing(false);
            showToast({ title: 'Success', description: 'Goal updated successfully', variant: 'success' });
        } catch (error) {
            console.error(error);
            showToast({ title: 'Error', description: 'Failed to update goal', variant: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        try {
            const res = await fetch(`/api/me/goals/${goalId}`, {
                method: 'DELETE',
            });

            if (!res.ok) throw new Error('Failed to delete goal');

            showToast({ title: 'Success', description: 'Goal deleted successfully', variant: 'success' });
            router.push('/me/goals');
        } catch (error) {
            console.error(error);
            showToast({ title: 'Error', description: 'Failed to delete goal', variant: 'error' });
            setIsDeleting(false);
        }
    };

    const handleToggleComponent = async (componentId: string) => {
        if (!goal || !goal.components) return;
        
        setTogglingComponent(componentId);
        
        // Optimistically update the local state
        const updatedComponents = goal.components.map(comp =>
            comp.id === componentId
                ? { ...comp, complete: !comp.complete, updatedAt: new Date() }
                : comp
        );

        // Determine if goal should be complete (all components complete)
        const allComplete = updatedComponents.length > 0 && updatedComponents.every(c => c.complete);

        // Update local state immediately
        setGoal({
            ...goal,
            components: updatedComponents,
            complete: allComplete,
        });

        try {
            const res = await fetch(`/api/me/goals/${goalId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    components: updatedComponents,
                    complete: allComplete,
                }),
            });

            if (!res.ok) throw new Error('Failed to update component');
        } catch (error) {
            console.error(error);
            // Revert the optimistic update on error
            setGoal(goal);
            showToast({ 
                title: 'Error', 
                description: 'Failed to update component', 
                variant: 'error' 
            });
        } finally {
            setTogglingComponent(null);
        }
    };

    if (isLoading) {
        return (
            <PageLayout
                breadcrumbHref="/me/goals"
                breadcrumbText="Goals"
                title="Loading..."
            >
                <div className="py-12 text-muted-foreground text-center">Loading goal...</div>
            </PageLayout>
        );
    }

    if (!goal) {
        return (
            <PageLayout
                breadcrumbHref="/me/goals"
                breadcrumbText="Goals"
                title="Goal Not Found"
            >
                <div className="py-12 text-muted-foreground text-center">Goal not found</div>
            </PageLayout>
        );
    }

    if (isEditing) {
        return (
            <PageLayout
                breadcrumbHref={`/me/goals/${goalId}`}
                breadcrumbText={goal.name || 'Goal'}
                title="Edit Goal"
                subtitle="Edit your goal"
            >
                <GoalForm
                    initialData={goal}
                    onSubmit={handleUpdate}
                    onCancel={() => setIsEditing(false)}
                    onDelete={() => setIsDeleting(true)}
                    isSubmitting={isSubmitting}
                />
                <ConfirmationModal
                    isOpen={isDeleting}
                    onClose={() => setIsDeleting(false)}
                    onConfirm={handleDelete}
                    title="Delete Goal"
                    message="Are you sure you want to delete this goal? This action cannot be undone."
                    confirmVariant="danger"
                    confirmText="Delete"
                />
            </PageLayout>
        );
    }

    const components = goal.components || [];
    const completedComponents = components.filter(c => c.complete).length;
    const totalComponents = components.length;
    const progressPercentage = totalComponents > 0
        ? Math.round((completedComponents / totalComponents) * 100)
        : 0;

    return (
        <PageLayout
            breadcrumbHref="/me/goals"
            breadcrumbText="Goals"
            title={goal.name || 'Goal'}
            subtitle={goal.description}
        >
            <div className="space-y-6">
                {/* Goal Status and Actions */}
                <div className="flex flex-col bg-card p-4 border border-border rounded-lg">
                    <div className="flex justify-between items-center gap-4">
                        <div className="flex flex-1 items-center gap-3">
                            <div className={cn("mt-1", goal.complete ? "text-brand-primary" : "text-muted-foreground")}>
                                {goal.complete ? <CheckCircle size={24} /> : <Circle size={24} />}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <h2 className={cn("font-semibold text-xl", goal.complete && "line-through text-muted-foreground")}>
                                        {goal.name}
                                    </h2>
                                    {goal.complete && (
                                        <span className="bg-brand-primary/20 px-2 py-0.5 rounded font-medium text-brand-primary text-xs">
                                            Complete
                                        </span>
                                    )}
                                </div>
                                {goal.description && (
                                    <p className="mb-3 text-muted-foreground">{goal.description}</p>
                                )}
                                <div className="flex flex-wrap gap-4 text-muted-foreground text-sm">
                                    {goal.duration && (
                                        <span>Duration: {goal.duration.value} {goal.duration.unit}</span>
                                    )}
                                    {goal.startDate && (
                                        <span>Started: {new Date(goal.startDate).toLocaleDateString()}</span>
                                    )}
                                    {goal.endDate && (
                                        <span>Ended: {new Date(goal.endDate).toLocaleDateString()}</span>
                                    )}
                                </div>
                                {totalComponents > 0 && (
                                    <div className="mt-3">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="font-medium text-sm">Progress</span>
                                            <span className="text-muted-foreground text-sm">
                                                {completedComponents}/{totalComponents} components ({progressPercentage}%)
                                            </span>
                                        </div>
                                        <div className="bg-muted rounded-full w-full h-2">
                                            <div
                                                className={cn(
                                                    "rounded-full h-2 transition-all",
                                                    progressPercentage === 100
                                                        ? "bg-brand-primary"
                                                        : "bg-brand-primary/60"
                                                )}
                                                style={{ width: `${progressPercentage}%` }}
                                            />
                                        </div>
                                    </div>
                                )}
                                {goal.notes && (
                                    <div className="bg-muted/30 mt-3 p-3 rounded-lg">
                                        <p className="text-muted-foreground text-sm">{goal.notes}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>

                {/* Components Section */}
                {totalComponents > 0 && (
                    <div className="bg-card p-4 border border-border rounded-lg">
                        <h3 className="mb-4 font-semibold text-lg">Components</h3>
                        <div className="space-y-3">
                            {components
                                .sort((a, b) => a.priority - b.priority)
                                .map((component) => (
                                    <div
                                        key={component.id}
                                        onClick={() => handleToggleComponent(component.id)}
                                        className={cn(
                                            "relative p-3 border border-border rounded-lg transition-colors cursor-pointer",
                                            component.complete && "bg-muted/30",
                                            togglingComponent === component.id && "opacity-50",
                                            "hover:bg-hover"
                                        )}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={cn(
                                                "mt-0.5",
                                                component.complete ? "text-brand-primary" : "text-muted-foreground"
                                            )}>
                                                {component.complete ? (
                                                    <CheckCircle size={20} />
                                                ) : (
                                                    <Circle size={20} />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="mb-1">
                                                    <h4 className={cn(
                                                        "font-medium",
                                                        component.complete && "line-through text-muted-foreground"
                                                    )}>
                                                        {component.name}
                                                    </h4>
                                                </div>
                                                {component.description && (
                                                    <p className="mb-2 text-muted-foreground text-sm">
                                                        {component.description}
                                                    </p>
                                                )}
                                                {component.notes && (
                                                    <p className="text-muted-foreground text-xs italic">
                                                        {component.notes}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <span className="right-3 bottom-3 absolute text-muted-foreground text-xs">
                                            Priority: {component.priority}
                                        </span>
                                    </div>
                                ))}
                        </div>
                    </div>
                )}
                <Button
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                    className="w-full"
                >
                    <Edit size={16} className="mr-2" />
                    Edit
                </Button>
            </div>
        </PageLayout>
    );
}

