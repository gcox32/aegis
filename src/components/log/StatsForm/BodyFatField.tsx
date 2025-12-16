'use client';

import ExpandableField from './ExpandableField';

type BodyFatFieldProps = {
  isExpanded: boolean;
  onExpand: () => void;
  onCollapse: () => void;
  value: string;
  onValueChange: (value: string) => void;
};

export default function BodyFatField({
  isExpanded,
  onExpand,
  onCollapse,
  value,
  onValueChange,
}: BodyFatFieldProps) {
  return (
    <ExpandableField
      isExpanded={isExpanded}
      onExpand={onExpand}
      onCollapse={onCollapse}
      label="Body fat %"
      addLabel="Add body fat %"
    >
      <input
        type="number"
        inputMode="decimal"
        step="0.1"
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        className="bg-zinc-950/60 focus:bg-zinc-900/80 px-3 py-2 border border-zinc-800 focus:border-brand-primary rounded-lg outline-none ring-0 w-full text-white placeholder:text-zinc-500 text-sm transition-colors"
        placeholder="15.0"
      />
    </ExpandableField>
  );
}

