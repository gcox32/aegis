'use client';

import ExpandableField from './ExpandableField';

type MuscleMassFieldProps = {
  isExpanded: boolean;
  onExpand: () => void;
  onCollapse: () => void;
  value: string;
  unit: 'kg' | 'lbs';
  onValueChange: (value: string) => void;
  onUnitChange: (unit: 'kg' | 'lbs') => void;
};

export default function MuscleMassField({
  isExpanded,
  onExpand,
  onCollapse,
  value,
  unit,
  onValueChange,
  onUnitChange,
}: MuscleMassFieldProps) {
  return (
    <ExpandableField
      isExpanded={isExpanded}
      onExpand={onExpand}
      onCollapse={onCollapse}
      label="Muscle mass"
      addLabel="Add muscle mass"
    >
      <div className="flex gap-2">
        <input
          type="number"
          inputMode="decimal"
          step="0.1"
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          className="flex-1 bg-zinc-950/60 focus:bg-zinc-900/80 px-3 py-2 border border-zinc-800 focus:border-brand-primary rounded-lg outline-none ring-0 text-white placeholder:text-zinc-500 text-sm transition-colors"
          placeholder="150"
        />
        <select
          value={unit}
          onChange={(e) => onUnitChange(e.target.value as 'kg' | 'lbs')}
          className="bg-zinc-950/60 focus:bg-zinc-900/80 px-2 py-2 border border-zinc-800 focus:border-brand-primary rounded-lg outline-none ring-0 text-white text-xs transition-colors"
        >
          <option value="lbs">lbs</option>
          <option value="kg">kg</option>
        </select>
      </div>
    </ExpandableField>
  );
}

