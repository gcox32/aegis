import { useRouter } from 'next/navigation';
import { UserGoal } from '@/types/user';
import { cn } from '@/lib/utils';

interface GoalListProps {
    goals: UserGoal[];
}

export function GoalList({ goals }: GoalListProps) {
    const router = useRouter();

    if (goals.length === 0) {
        return (
            <div className="bg-card py-12 border border-border border-dashed rounded-lg text-center">
                <p className="text-muted-foreground">No goals found. Create one to get started!</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {goals.map((goal) => {
                const components = goal.components || [];
                const completedComponents = components.filter(c => c.complete).length;
                const totalComponents = components.length;
                const progressPercentage = totalComponents > 0 
                    ? Math.round((completedComponents / totalComponents) * 100) 
                    : 0;
                const hasComponents = totalComponents > 0;

                return (
                    <div 
                        key={goal.id} 
                        className="bg-card hover:bg-hover border border-border rounded-(--radius) p-2 overflow-hidden transition-colors cursor-pointer"
                        onClick={() => router.push(`/me/goals/${goal.id}`)}
                    >
                        <div className="flex justify-between items-start gap-4 p-4">
                            <div className="flex flex-1 items-start gap-3">
                                <div className="flex-1">
                                    <h3 className={cn("font-medium", goal.complete && "line-through text-muted-foreground")}>
                                        {goal.name}
                                    </h3>
                                    {goal.description && (
                                        <p className="mt-1 text-muted-foreground text-sm">{goal.description}</p>
                                    )}
                                    <div className="flex flex-wrap gap-3 mt-2 text-muted-foreground text-xs">
                                        {goal.duration && (
                                            <span>{goal.duration.value} {goal.duration.unit}</span>
                                        )}
                                        {goal.startDate && (
                                            <span>Started: {new Date(goal.startDate).toLocaleDateString()}</span>
                                        )}
                                        {hasComponents && (
                                            <span className="font-medium">
                                                {completedComponents}/{totalComponents} components ({progressPercentage}%)
                                            </span>
                                        )}
                                    </div>
                                    {hasComponents && (
                                        <div className="mt-2">
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
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
