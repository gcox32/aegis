'use client';

import type { ExerciseMeasures, WorkoutBlockExercise, WorkoutBlockExerciseInstance, WorkoutBlockInstance } from "@/types/train";
import Link from "next/link";
import { FileText, Plus, X } from "lucide-react";
import { NumberInput } from "@/components/ui/NumberInput";
import { useParams } from "next/navigation";
import Button from "@/components/ui/Button";

interface WorkoutInstanceBlockProps {
    blockInstance: WorkoutBlockInstance;
    handleUpdateSetLocal: (setId: string, updates: Partial<WorkoutBlockExerciseInstance>) => void;
    handleAddSet: (blockInstanceId: string, exerciseId: string) => Promise<void>;
    handleDeleteSet: (setId: string, blockInstanceId: string) => Promise<void>;
}

const getGroupedExercises = (blockInstance: any) => {
    if (!blockInstance.exerciseInstances) return [];

    const groups: Record<string, { definition: WorkoutBlockExercise, sets: WorkoutBlockExerciseInstance[] }> = {};

    blockInstance.exerciseInstances.forEach((inst: WorkoutBlockExerciseInstance) => {
        const defId = inst.workoutBlockExerciseId;
        if (inst.workoutBlockExercise) {
            if (!groups[defId]) {
                groups[defId] = {
                    definition: inst.workoutBlockExercise,
                    sets: []
                };
            }
            groups[defId].sets.push(inst);
        }
    });

    // Sort sets within each group by created_at (completion time), then sort groups by exercise order
    Object.values(groups).forEach(group => {
        group.sets.sort((a, b) => {
            const createdA = new Date(a.created_at as any).getTime();
            const createdB = new Date(b.created_at as any).getTime();
            return createdA - createdB;
        });
    });

    return Object.values(groups).sort((a, b) => a.definition.order - b.definition.order);
};

export default function WorkoutInstanceBlock({ blockInstance, handleUpdateSetLocal, handleAddSet, handleDeleteSet }: WorkoutInstanceBlockProps) {
    const { instanceId } = useParams();
    
    const updateMeasure = (setId: string, currentMeasures: ExerciseMeasures, key: keyof ExerciseMeasures, value: any) => {
        const newMeasures = { ...currentMeasures, [key]: value };
        handleUpdateSetLocal(setId, { measures: newMeasures });
    };

    const updateLoad = (setId: string, currentMeasures: ExerciseMeasures, value: number | undefined) => {
        const currentLoad = currentMeasures.externalLoad || { value: 0, unit: 'lbs' };
        const newLoad = { ...currentLoad, value: value ?? 0 };
        const newMeasures = { ...currentMeasures, externalLoad: newLoad };
        handleUpdateSetLocal(setId, { measures: newMeasures });
    };

    console.log(blockInstance);

    return (
            <div key={blockInstance.id} className="bg-card border border-border rounded-lg overflow-hidden">
                <div className="flex justify-between items-center bg-zinc-800/50 px-4 py-3 border-border border-b">
                    <h3 className="font-semibold text-lg">
                        {blockInstance.workoutBlock?.name || 'Block'}
                    </h3>
                    <span className="text-muted-foreground text-xs">
                        {blockInstance.workoutBlock?.circuit ? 'Circuit' : ''}
                    </span>
                    <span className="bg-zinc-800 px-2 py-1 border border-zinc-700 rounded text-muted-foreground text-xs uppercase tracking-wider">
                        {blockInstance.workoutBlock?.workoutBlockType}
                    </span>
                </div>
                <div className="space-y-6 p-4">
                    {getGroupedExercises(blockInstance).map((group) => (
                        <div key={group.definition.id} className="space-y-3">
                            <div className="flex flex-col justify-between items-center gap-2">
                                <h4 className="font-medium text-brand-primary text-lg">
                                    {group.definition.exercise.name}
                                </h4>
                                <div className="flex justify-between items-center gap-3 w-full">
                                    <span className="text-muted-foreground text-xs">
                                        {group.definition.restTime ? `Rest: ${group.definition.restTime}s` : ''}
                                    </span>
                                    <Link href={`/log/workouts/${instanceId}/notes/${group.definition.id}`} className="text-muted-foreground hover:text-brand-primary transition-colors">
                                        <FileText className="w-4 h-4" />
                                    </Link>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-zinc-900/50 text-muted-foreground text-xs uppercase">
                                        <tr>
                                            <th className="px-3 py-2 rounded-l-md w-12 text-center">Set</th>
                                            <th className="px-3 py-2 w-24">Reps</th>
                                            <th className="px-3 py-2 w-32">Load</th>
                                            <th className="px-3 py-2 w-10"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-800/50">
                                        {group.sets.map((set, index) => (
                                            <tr key={set.id} className="group/row hover:bg-zinc-800/30">
                                                <td className="px-3 py-2 font-medium text-muted-foreground text-center">
                                                    {index + 1}
                                                </td>
                                                <td className="px-3 py-2">
                                                    <NumberInput
                                                        className="bg-transparent px-2 py-1 border border-zinc-700 focus:border-brand-primary rounded outline-none focus:ring-1 focus:ring-brand-primary w-16 text-center"
                                                        value={set.measures.reps}
                                                        onValueChange={(val) => updateMeasure(set.id, set.measures, 'reps', val)}
                                                    />
                                                </td>
                                                <td className="px-3 py-2">
                                                    <div className="flex items-center gap-1">
                                                        <NumberInput
                                                            className="bg-transparent px-2 py-1 border border-zinc-700 focus:border-brand-primary rounded outline-none focus:ring-1 focus:ring-brand-primary w-20 text-center"
                                                            value={set.measures.externalLoad?.value}
                                                            onValueChange={(val) => updateLoad(set.id, set.measures, val)}
                                                            allowFloat
                                                            treatZeroAsEmpty
                                                        />
                                                        <span className="text-muted-foreground text-xs">
                                                            {set.measures.externalLoad?.unit || ''}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-3 py-2 pr-0">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDeleteSet(set.id, blockInstance.id)}
                                                        className="px-2 h-7 text-muted-foreground hover:text-brand-primary text-xs"
                                                        title="Delete Set"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <div className="mt-2 px-3">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleAddSet(blockInstance.id, group.definition.id)}
                                        className="px-2 h-7 text-muted-foreground hover:text-brand-primary text-xs"
                                    >
                                        <Plus className="mr-1 w-3 h-3" /> Add Set
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
    )
}