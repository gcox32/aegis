import { FormSelect, FormSelectProps } from '@/components/ui/Form';
import { MuscleGroupName } from '@/types/anatomy';

// Defined in src/types/anatomy.ts
export const MUSCLE_GROUPS: MuscleGroupName[] = [
  'chest', 'anterior delts', 'lateral delts', 'posterior delts',
  'lats', 'rhomboids', 'traps', 'spinal erectors', 'quadratus lumborum',
  'biceps', 'triceps', 'forearms','anterior core', 'obliques', 'deep core',
  'glutes', 'hip flexors', 'quadriceps', 'hamstrings', 'adductors', 'abductors',
  'calves', 'anterior tibialis', 'rotator cuff', 'neck', 'jaw', 'other'
];

interface MuscleGroupSelectProps extends Omit<FormSelectProps, 'children'> {
  value?: string;
  placeholder?: string;
}

export function MuscleGroupSelect({ 
  value, 
  placeholder = "Select muscle group",
  className,
  ...props 
}: MuscleGroupSelectProps) {
  return (
    <FormSelect
      value={value}
      className={className}
      {...props}
    >
      <option value="">{placeholder}</option>
      {MUSCLE_GROUPS.map((group) => (
        <option key={group} value={group}>
          {group.charAt(0).toUpperCase() + group.slice(1)}
        </option>
      ))}
    </FormSelect>
  );
}
