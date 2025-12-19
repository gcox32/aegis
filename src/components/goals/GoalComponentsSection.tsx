import React, { useState } from 'react';
import { UserGoalComponent } from '@/types/user';
import { FormGroup, FormLabel, FormInput, FormTextarea } from '@/components/ui/Form';
import Button from '@/components/ui/Button';
import { TogglePill } from '@/components/ui/TogglePill';
import { NumberInput } from '@/components/ui/NumberInput';
import { Plus, X, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GoalComponentsSectionProps {
    components: UserGoalComponent[];
    onChange: (components: UserGoalComponent[]) => void;
}

export function GoalComponentsSection({ components, onChange }: GoalComponentsSectionProps) {
    const [expandedComponents, setExpandedComponents] = useState<Set<string>>(
        new Set(components.map(c => c.id))
    );

    const addComponent = () => {
        const newComponent: UserGoalComponent = {
            id: `temp-${Date.now()}-${Math.random()}`,
            name: '',
            description: '',
            priority: components.length + 1,
            complete: false,
            notes: '',
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        onChange([...components, newComponent]);
        setExpandedComponents(prev => new Set([...prev, newComponent.id]));
    };

    const removeComponent = (id: string) => {
        onChange(components.filter(c => c.id !== id));
        setExpandedComponents(prev => {
            const next = new Set(prev);
            next.delete(id);
            return next;
        });
    };

    const updateComponent = (id: string, updates: Partial<UserGoalComponent>) => {
        onChange(
            components.map(c =>
                c.id === id
                    ? { ...c, ...updates, updatedAt: new Date() }
                    : c
            )
        );
    };

    const toggleExpanded = (id: string) => {
        setExpandedComponents(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    // Sort components by priority
    const sortedComponents = [...components].sort((a, b) => a.priority - b.priority);

    const completedCount = components.filter(c => c.complete).length;
    const totalCount = components.length;
    const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    return (
        <FormGroup>
            <div className="flex justify-between items-center mb-2">
                <FormLabel>Goal Components</FormLabel>
                {totalCount > 0 && (
                    <span className="text-muted-foreground text-xs">
                        {completedCount}/{totalCount} complete ({progressPercentage}%)
                    </span>
                )}
            </div>

            {components.length === 0 ? (
                <div className="p-4 border border-border border-dashed rounded-lg text-center">
                    <p className="mb-3 text-muted-foreground text-sm">
                        Add components to break down your goal into trackable elements
                    </p>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addComponent}
                        className="w-full"
                    >
                        <Plus className="mr-2 w-4 h-4" />
                        Add Component
                    </Button>
                </div>
            ) : (
                <div className="space-y-3">
                    {sortedComponents.map((component, index) => {
                        const isExpanded = expandedComponents.has(component.id);
                        return (
                            <div
                                key={component.id}
                                className={cn(
                                    "border border-border rounded-lg overflow-hidden transition-all",
                                    component.complete && "bg-muted/30"
                                )}
                            >
                                {!isExpanded ? (
                                    <button
                                        type="button"
                                        onClick={() => toggleExpanded(component.id)}
                                        className="flex justify-between items-center hover:bg-hover p-3 w-full transition-colors"
                                    >
                                        <div className="flex flex-1 items-center gap-3">
                                            <GripVertical className="w-4 h-4 text-muted-foreground" />
                                            <span className="font-medium text-sm">
                                                {component.name || `Component ${index + 1}`}
                                            </span>
                                            {component.complete && (
                                                <span className="bg-brand-primary/20 px-2 py-0.5 rounded text-brand-primary text-xs">
                                                    Complete
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-muted-foreground text-xs">
                                            Prio: {component.priority}
                                        </span>
                                    </button>
                                ) : (
                                    <div className="space-y-4 bg-card p-4">
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                <GripVertical className="w-4 h-4 text-muted-foreground" />
                                                <span className="font-medium text-muted-foreground text-sm">
                                                    Component {index + 1}
                                                </span>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeComponent(component.id)}
                                                className="hover:bg-red-50 text-red-600 hover:text-red-700"
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>

                                        <FormGroup>
                                            <FormLabel htmlFor={`component-name-${component.id}`}>
                                                Component Name *
                                            </FormLabel>
                                            <FormInput
                                                id={`component-name-${component.id}`}
                                                value={component.name}
                                                onChange={(e) =>
                                                    updateComponent(component.id, { name: e.target.value })
                                                }
                                                placeholder="e.g. Lose 2kg per month"
                                                required
                                            />
                                        </FormGroup>

                                        <FormGroup>
                                            <FormLabel htmlFor={`component-description-${component.id}`}>
                                                Description
                                            </FormLabel>
                                            <FormTextarea
                                                id={`component-description-${component.id}`}
                                                value={component.description || ''}
                                                onChange={(e) =>
                                                    updateComponent(component.id, {
                                                        description: e.target.value,
                                                    })
                                                }
                                                placeholder="Describe this component..."
                                                rows={2}
                                            />
                                        </FormGroup>

                                        <div className="flex flex-col gap-4">
                                            <FormGroup className="flex flex-row justify-end items-center gap-4 w-full">
                                                <FormLabel htmlFor={`component-priority-${component.id}`}>
                                                    Priority
                                                </FormLabel>
                                                <NumberInput
                                                    id={`component-priority-${component.id}`}
                                                    value={component.priority}
                                                    className="w-16"
                                                    onValueChange={(value) =>
                                                        updateComponent(component.id, { priority: value ?? 1 })
                                                    }
                                                />
                                            </FormGroup>

                                            <FormGroup>
                                                <FormLabel>Status</FormLabel>
                                                <TogglePill
                                                    leftLabel="In Progress"
                                                    rightLabel="Complete"
                                                    value={!component.complete}
                                                    onChange={(active) =>
                                                        updateComponent(component.id, { complete: !active })
                                                    }
                                                />
                                            </FormGroup>
                                        </div>

                                        <FormGroup>
                                            <FormLabel htmlFor={`component-notes-${component.id}`}>
                                                Notes
                                            </FormLabel>
                                            <FormTextarea
                                                id={`component-notes-${component.id}`}
                                                value={component.notes || ''}
                                                onChange={(e) =>
                                                    updateComponent(component.id, { notes: e.target.value })
                                                }
                                                placeholder="Any additional notes..."
                                                rows={2}
                                            />
                                        </FormGroup>

                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => toggleExpanded(component.id)}
                                            className="w-full"
                                        >
                                            Collapse
                                        </Button>
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addComponent}
                        className="w-full"
                    >
                        <Plus className="mr-2 w-4 h-4" />
                        Add Component
                    </Button>
                </div>
            )}
        </FormGroup>
    );
}

