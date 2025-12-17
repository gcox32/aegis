'use client';

import ExpandableField from './ExpandableField';

type LimbLengthFieldProps = {
  isExpanded: boolean;
  onExpand: () => void;
  onCollapse: () => void;
  value: string;
  unit: 'cm' | 'm' | 'in' | 'ft';
  onValueChange: (value: string) => void;
  onUnitChange: (unit: 'cm' | 'm' | 'in' | 'ft') => void;
  label: string;
  addLabel: string;
};

export default function LimbLengthField({
  isExpanded,
  onExpand,
  onCollapse,
  value,
  unit,
  onValueChange,
  onUnitChange,
  label,
  addLabel,
}: LimbLengthFieldProps) {
  return (
    <ExpandableField
      isExpanded={isExpanded}
      onExpand={onExpand}
      onCollapse={onCollapse}
      label={label}
      addLabel={addLabel}
    >
      <div className="flex gap-2">
        <input
          type="number"
          inputMode="decimal"
          step="0.1"
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          className="flex-1 bg-zinc-950/60 focus:bg-zinc-900/80 px-3 py-2 border border-zinc-800 focus:border-brand-primary rounded-lg outline-none ring-0 text-white placeholder:text-zinc-500 text-sm transition-colors"
          placeholder="28"
        />
        <select
          value={unit}
          onChange={(e) => onUnitChange(e.target.value as 'cm' | 'm' | 'in' | 'ft')}
          className="bg-zinc-950/60 focus:bg-zinc-900/80 px-2 py-2 border border-zinc-800 focus:border-brand-primary rounded-lg outline-none ring-0 text-white text-xs transition-colors"
        >
          <option value="in">in</option>
          <option value="ft">ft</option>
          <option value="cm">cm</option>
          <option value="m">m</option>
        </select>
      </div>
    </ExpandableField>
  );
}

