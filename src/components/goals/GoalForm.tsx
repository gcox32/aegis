import React, { useState } from 'react';
import { UserGoal } from '@/types/user';
import { LongTimeMeasurement } from '@/types/measures';
import {
    FormWrapper,
    FormCard,
    FormGroup,
    FormLabel,
    FormInput,
    FormTextarea,
    FormSelect,
    FormActions,
    FormError
} from '@/components/ui/Form';
import Button from '@/components/ui/Button';
import { TogglePill } from '@/components/ui/TogglePill';
import { NumberInput } from '@/components/ui/NumberInput';

interface GoalFormProps {
    initialData?: Partial<UserGoal>;
    onSubmit: (data: Partial<UserGoal>) => Promise<void>;
    onCancel: () => void;
    isSubmitting?: boolean;
}

export function GoalForm({ initialData, onSubmit, onCancel, isSubmitting = false }: GoalFormProps) {
    const [name, setName] = useState(initialData?.name || '');
    const [description, setDescription] = useState(initialData?.description || '');
    const [durationValue, setDurationValue] = useState<number>(initialData?.duration?.value || 1);
    const [durationUnit, setDurationUnit] = useState<LongTimeMeasurement['unit']>(initialData?.duration?.unit || 'weeks');
    const [startDate, setStartDate] = useState(initialData?.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(initialData?.endDate ? new Date(initialData.endDate).toISOString().split('T')[0] : '');
    const [complete, setComplete] = useState(initialData?.complete || false);
    const [notes, setNotes] = useState(initialData?.notes || '');
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        try {
            await onSubmit({
                name,
                description,
                duration: { value: durationValue, unit: durationUnit },
                startDate: new Date(startDate),
                endDate: endDate ? new Date(endDate) : null,
                complete,
                notes
            });
        } catch (err) {
            setError('Failed to save goal. Please try again.');
            console.error(err);
        }
    };

    return (
        <FormWrapper>
            <FormCard>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <FormGroup>
                        <FormLabel htmlFor="name">Goal Name</FormLabel>
                        <FormInput
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Lose 5kg"
                            required
                        />
                    </FormGroup>

                    <FormGroup>
                        <FormLabel htmlFor="description">Description</FormLabel>
                        <FormTextarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe your goal..."
                        />
                    </FormGroup>

                        <FormGroup>
                            <FormLabel htmlFor="startDate">Start Date</FormLabel>
                            <FormInput
                                id="startDate"
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                required
                            />
                        </FormGroup>

                    <FormGroup>
                        <FormLabel>Status</FormLabel>
                        <TogglePill
                            leftLabel="Active"
                            rightLabel="Complete"
                            value={!complete}
                            onChange={(active) => setComplete(!active)}
                        />
                    </FormGroup>

                    <FormGroup>
                        <FormLabel htmlFor="notes">Notes</FormLabel>
                        <FormTextarea
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Any additional notes..."
                        />
                    </FormGroup>

                    {error && <FormError>{error}</FormError>}

                    <FormActions>
                        <Button className="w-full" type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button className="w-full" type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Saving...' : 'Save Goal'}
                        </Button>
                    </FormActions>
                </form>
            </FormCard>
        </FormWrapper>
    );
}
