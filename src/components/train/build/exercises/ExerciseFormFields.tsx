import React from 'react';
import {
  FormGroup, FormLabel,
  FormInput, FormTextarea, FormSelect
} from '@/components/ui/Form';
import { Exercise, WorkPowerConstants } from '@/types/train';
import { MuscleGroupSelect } from '@/components/anatomy/MuscleGroupSelect';
import { ExerciseAutocomplete } from './ExerciseAutocomplete';
import { MOVEMENT_PATTERNS, PLANES_OF_MOTION, EQUIPMENT_TYPES, DIFFICULTY_LEVELS } from './options';
import { TogglePill } from '@/components/ui/TogglePill';
import { ExerciseFormData } from './types';

interface ExerciseFormFieldsProps {
  formData: ExerciseFormData;
  setFormData: React.Dispatch<React.SetStateAction<ExerciseFormData>>;
  isEditing?: boolean;
  initialData?: Exercise;
}

export function ExerciseFormFields({ 
  formData, 
  setFormData, 
  isEditing = false,
  initialData 
}: ExerciseFormFieldsProps) {

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleEquipmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValues = Array.from(e.target.selectedOptions).map(
      (option) => option.value as NonNullable<Exercise['equipment']>[number],
    );

    setFormData(prev => ({
      ...prev,
      equipment: selectedValues,
    }));
  };

  const applyParentExercise = (parentExercise: Exercise | null, parentId: string | undefined) => {
    setFormData(prev => {
      const updates: Partial<ExerciseFormData> = {
        parentExerciseId: parentId,
      };

      if (parentExercise) {
        updates.muscleGroups = { ...parentExercise.muscleGroups };
        updates.workPowerConstants = {
          ...parentExercise.workPowerConstants,
          defaultDistance: { ...parentExercise.workPowerConstants.defaultDistance },
        };
        if (parentExercise.movementPattern) {
          updates.movementPattern = parentExercise.movementPattern;
        }
        if (parentExercise.planeOfMotion) {
          updates.planeOfMotion = parentExercise.planeOfMotion;
        }
        if (parentExercise.equipment) {
          updates.equipment = [...parentExercise.equipment];
        }
        if (parentExercise.difficulty) {
          updates.difficulty = parentExercise.difficulty;
        }
        if (parentExercise.bilateral !== undefined) {
          updates.bilateral = parentExercise.bilateral;
        }
      }

      return {
        ...prev,
        ...updates,
      };
    });
  };

  const handleMuscleGroupChange = (level: 'primary' | 'secondary' | 'tertiary', value: string) => {
    setFormData(prev => ({
      ...prev,
      muscleGroups: {
        ...prev.muscleGroups,
        [level]: value || undefined,
      },
    }));
  };

  const handleConstantChange = (field: keyof WorkPowerConstants, value: any) => {
    setFormData(prev => ({
      ...prev,
      workPowerConstants: {
        ...prev.workPowerConstants,
        [field]: value,
      },
    }));
  };

  return (
    <>
      {/* Basic Info */}
      <div className="gap-4 grid grid-cols-1">
        <FormGroup>
          <FormLabel>Name</FormLabel>
          <FormInput
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
          />
        </FormGroup>

        <FormGroup>
          <FormLabel>Parent Exercise (Optional)</FormLabel>
          <ExerciseAutocomplete
            initialExerciseId={initialData?.parentExerciseId}
            currentExerciseId={isEditing ? initialData?.id : undefined}
            onChange={(exercise: Exercise | null) => {
              if (!exercise) {
                applyParentExercise(null, undefined);
              } else {
                applyParentExercise(exercise, exercise.id);
              }
            }}
          />
        </FormGroup>

        <FormGroup>
          <FormLabel>Description</FormLabel>
          <FormTextarea
            name="description"
            rows={3}
            value={formData.description}
            onChange={handleChange}
          />
        </FormGroup>
      </div>

      {/* Classification */}
      <div className="gap-4 grid grid-cols-1 md:grid-cols-2 mt-4">
        <FormGroup>
          <FormLabel>Movement Pattern</FormLabel>
          <FormSelect
            name="movementPattern"
            value={formData.movementPattern}
            onChange={handleChange}
          >
            {MOVEMENT_PATTERNS.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </FormSelect>
        </FormGroup>

        <FormGroup>
          <FormLabel>Plane of Motion</FormLabel>
          <FormSelect
            name="planeOfMotion"
            value={formData.planeOfMotion}
            onChange={handleChange}
          >
            {PLANES_OF_MOTION.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </FormSelect>
        </FormGroup>

        <FormGroup>
          <FormLabel>Equipment (select one or more)</FormLabel>
          <FormSelect
            name="equipment"
            multiple
            value={formData.equipment || []}
            onChange={handleEquipmentChange}
            className="min-h-[140px]"
          >
            {EQUIPMENT_TYPES.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </FormSelect>
        </FormGroup>

        <FormGroup>
          <FormLabel>Difficulty</FormLabel>
          <FormSelect
            name="difficulty"
            value={formData.difficulty}
            onChange={handleChange}
          >
            {DIFFICULTY_LEVELS.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </FormSelect>
        </FormGroup>
      </div>

      {/* Bilateral / Unilateral toggle */}
      <div className="flex flex-col items-center space-y-2 w-full mt-4">
        <FormLabel>Bilateral / Unilateral</FormLabel>
        <TogglePill
          leftLabel="Bilateral"
          rightLabel="Unilateral"
          value={formData.bilateral ?? true}
          onChange={(val) =>
            setFormData(prev => ({ ...prev, bilateral: val }))
          }
        />
      </div>

      {/* Muscle Groups */}
      <div className="space-y-3 bg-background/50 p-4 border border-border rounded-md mt-4">
        <h3 className="font-semibold text-foreground text-sm">Muscle Groups</h3>

        <FormGroup>
          <FormLabel>Primary</FormLabel>
          <MuscleGroupSelect
            value={formData.muscleGroups.primary}
            onChange={(e) => handleMuscleGroupChange('primary', e.target.value)}
            required
          />
        </FormGroup>

        <div className="gap-4 grid grid-cols-2">
          <FormGroup>
            <FormLabel>Secondary </FormLabel>
            <MuscleGroupSelect
              value={formData.muscleGroups.secondary || ''}
              onChange={(e) => handleMuscleGroupChange('secondary', e.target.value)}
              placeholder="None"
            />
          </FormGroup>

          <FormGroup>
            <FormLabel>Tertiary</FormLabel>
            <MuscleGroupSelect
              value={formData.muscleGroups.tertiary || ''}
              onChange={(e) => handleMuscleGroupChange('tertiary', e.target.value)}
              placeholder="None"
            />
          </FormGroup>
        </div>
      </div>

      {/* Media */}
      <div className="gap-4 grid grid-cols-1 md:grid-cols-2 mt-4">
        <FormGroup>
          <FormLabel>Image URL</FormLabel>
          <FormInput
            type="url"
            name="imageUrl"
            value={formData.imageUrl || ''}
            onChange={handleChange}
          />
        </FormGroup>
        <FormGroup>
          <FormLabel>Video URL</FormLabel>
          <FormInput
            type="url"
            name="videoUrl"
            value={formData.videoUrl || ''}
            onChange={handleChange}
          />
        </FormGroup>
      </div>

      {/* Work / Power Constants */}
      <div className="space-y-3 bg-background/50 p-4 border border-border rounded-md mt-4">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-foreground text-sm">Work/Power Factors</h3>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="useCalories"
              checked={formData.workPowerConstants.useCalories}
              onChange={(e) => handleConstantChange('useCalories', e.target.checked)}
              className="bg-input border-input rounded focus:ring-brand-primary w-4 h-4 text-brand-primary"
            />
            <label htmlFor="useCalories" className="text-muted-foreground text-xs">Use Calories</label>
          </div>
        </div>

        <div className="gap-4 grid grid-cols-3">
          <FormGroup>
            <FormLabel className="text-xs">Bodyweight (0-1)</FormLabel>
            <FormInput
              type="number"
              step="0.1"
              min="0"
              max="1"
              value={formData.workPowerConstants.bodyweightFactor || ''}
              onChange={(e) => {
                const val = e.target.value === '' ? '' : parseFloat(e.target.value);
                handleConstantChange('bodyweightFactor', (val === '' || isNaN(val as number)) ? 0 : (val as number));
              }}
              onBlur={(e) => {
                if (e.target.value === '') {
                  handleConstantChange('bodyweightFactor', 0);
                }
              }}
              className="px-2 py-1"
            />
          </FormGroup>
          <FormGroup>
            <FormLabel className="text-xs">Arm Length (-1 to 1)</FormLabel>
            <FormInput
              type="number"
              step="0.1"
              min="-1"
              max="1"
              value={formData.workPowerConstants.armLengthFactor || ''}
              onChange={(e) => {
                const val = e.target.value === '' ? '' : parseFloat(e.target.value);
                handleConstantChange('armLengthFactor', (val === '' || isNaN(val as number)) ? 0 : (val as number));
              }}
              onBlur={(e) => {
                if (e.target.value === '') {
                  handleConstantChange('armLengthFactor', 0);
                }
              }}
              className="px-2 py-1"
            />
          </FormGroup>
          <FormGroup>
            <FormLabel className="text-xs">Leg Length (-1 to 1)</FormLabel>
            <FormInput
              type="number"
              step="0.1"
              min="-1"
              max="1"
              value={formData.workPowerConstants.legLengthFactor || ''}
              onChange={(e) => {
                const val = e.target.value === '' ? '' : parseFloat(e.target.value);
                handleConstantChange('legLengthFactor', (val === '' || isNaN(val as number)) ? 0 : (val as number));
              }}
              onBlur={(e) => {
                if (e.target.value === '') {
                  handleConstantChange('legLengthFactor', 0);
                }
              }}
              className="px-2 py-1"
            />
          </FormGroup>
        </div>

        <FormGroup>
          <FormLabel className="text-xs">Default Distance</FormLabel>
          <div className="flex gap-2">
            <FormInput
              type="number"
              className="px-2 py-1 w-full"
              value={formData.workPowerConstants.defaultDistance.value || ''}
              onChange={(e) => {
                const val = e.target.value === '' ? '' : parseFloat(e.target.value);
                handleConstantChange('defaultDistance', {
                  ...formData.workPowerConstants.defaultDistance,
                  value: (val === '' || isNaN(val as number)) ? 0 : (val as number),
                });
              }}
              onBlur={(e) => {
                if (e.target.value === '') {
                  handleConstantChange('defaultDistance', {
                    ...formData.workPowerConstants.defaultDistance,
                    value: 0,
                  });
                }
              }}
            />
            <FormSelect
              value={formData.workPowerConstants.defaultDistance.unit}
              onChange={(e) =>
                handleConstantChange('defaultDistance', {
                  ...formData.workPowerConstants.defaultDistance,
                  unit: e.target.value,
                })
              }
              className="w-24"
            >
              <option value="m">m</option>
              <option value="km">km</option>
              <option value="ft">ft</option>
              <option value="mi">mi</option>
            </FormSelect>
          </div>
        </FormGroup>

      </div>
    </>
  );
}
