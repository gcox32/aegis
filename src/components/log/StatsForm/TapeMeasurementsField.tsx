'use client';

import { X } from 'lucide-react';
import ExpandableField from './ExpandableField';

type TapeMeasurementsFieldProps = {
  isExpanded: boolean;
  onExpand: () => void;
  onCollapse: () => void;
  measurements: Record<string, { value: string; unit: 'cm' | 'in' }>;
  onMeasurementChange: (field: string, value: string, unit: 'cm' | 'in') => void;
};

const TAPE_FIELDS = [
  { key: 'neck', label: 'Neck' },
  { key: 'shoulders', label: 'Shoulders' },
  { key: 'chest', label: 'Chest' },
  { key: 'waist', label: 'Waist' },
  { key: 'hips', label: 'Hips' },
  { key: 'leftArm', label: 'Left arm' },
  { key: 'rightArm', label: 'Right arm' },
  { key: 'leftLeg', label: 'Left leg' },
  { key: 'rightLeg', label: 'Right leg' },
  { key: 'leftForearm', label: 'Left forearm' },
  { key: 'rightForearm', label: 'Right forearm' },
  { key: 'leftCalf', label: 'Left calf' },
  { key: 'rightCalf', label: 'Right calf' },
] as const;

export default function TapeMeasurementsField({
  isExpanded,
  onExpand,
  onCollapse,
  measurements,
  onMeasurementChange,
}: TapeMeasurementsFieldProps) {
  return (
    <ExpandableField
      isExpanded={isExpanded}
      onExpand={onExpand}
      onCollapse={onCollapse}
      label="Tape measurements"
      addLabel="Add tape measurements"
    >
      <div className="gap-3 grid grid-cols-1 sm:grid-cols-2">
        {TAPE_FIELDS.map(({ key, label }) => {
          const data = measurements[key] || { value: '', unit: 'in' as const };
          return (
            <div key={key} className="flex gap-2">
              <input
                type="number"
                inputMode="decimal"
                step="0.1"
                value={data.value}
                onChange={(e) => onMeasurementChange(key, e.target.value, data.unit)}
                className="flex-1 bg-zinc-950/60 focus:bg-zinc-900/80 px-3 py-2 border border-zinc-800 focus:border-brand-primary rounded-lg outline-none ring-0 text-white placeholder:text-zinc-500 text-sm transition-colors"
                placeholder={label}
              />
              <select
                value={data.unit}
                onChange={(e) => onMeasurementChange(key, data.value, e.target.value as 'cm' | 'in')}
                className="bg-zinc-950/60 focus:bg-zinc-900/80 px-2 py-2 border border-zinc-800 focus:border-brand-primary rounded-lg outline-none ring-0 text-white text-xs transition-colors"
              >
                <option value="in">in</option>
                <option value="cm">cm</option>
              </select>
            </div>
          );
        })}
      </div>
    </ExpandableField>
  );
}

