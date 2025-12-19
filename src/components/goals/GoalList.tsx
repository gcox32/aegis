import React from 'react';
import { UserGoal } from '@/types/user';
import Button from '@/components/ui/Button';
import { Edit, Trash2, CheckCircle, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GoalListProps {
    goals: UserGoal[];
    onEdit: (goal: UserGoal) => void;
    onDelete: (goal: UserGoal) => void;
}

export function GoalList({ goals, onEdit, onDelete }: GoalListProps) {
    if (goals.length === 0) {
        return (
            <div className="text-center py-12 bg-card rounded-lg border border-dashed border-border">
                <p className="text-muted-foreground">No goals found. Create one to get started!</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {goals.map((goal) => (
                <div key={goal.id} className="bg-card p-4 rounded-lg border border-border flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                         <div className={cn("mt-1", goal.complete ? "text-brand-primary" : "text-muted-foreground")}>
                            {goal.complete ? <CheckCircle size={20} /> : <Circle size={20} />}
                         </div>
                         <div>
                            <h3 className={cn("font-medium", goal.complete && "line-through text-muted-foreground")}>{goal.name}</h3>
                            {goal.description && <p className="text-sm text-muted-foreground mt-1">{goal.description}</p>}
                            <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                                {goal.duration && (
                                    <span>{goal.duration.value} {goal.duration.unit}</span>
                                )}
                                {goal.startDate && (
                                    <span>Started: {new Date(goal.startDate).toLocaleDateString()}</span>
                                )}
                            </div>
                         </div>
                    </div>
                    <div className="flex gap-10 flex-col">
                        <Button variant="ghost" size="sm" onClick={() => onEdit(goal)}>
                            <Edit size={16} />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => onDelete(goal)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                            <Trash2 size={16} />
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    );
}
