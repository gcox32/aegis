'use client';

import ExpandableField from './ExpandableField';

type AnthropometryFieldProps = {
  isExpanded: boolean;
  onExpand: () => void;
  onCollapse: () => void;
  height: string;
  heightUnit: 'cm' | 'm' | 'in' | 'ft';
  onHeightChange: (value: string) => void;
  onHeightUnitChange: (unit: 'cm' | 'm' | 'in' | 'ft') => void;
  armLength: string;
  armLengthUnit: 'cm' | 'm' | 'in' | 'ft';
  onArmLengthChange: (value: string) => void;
  onArmLengthUnitChange: (unit: 'cm' | 'm' | 'in' | 'ft') => void;
  legLength: string;
  legLengthUnit: 'cm' | 'm' | 'in' | 'ft';
  onLegLengthChange: (value: string) => void;
  onLegLengthUnitChange: (unit: 'cm' | 'm' | 'in' | 'ft') => void;
};

export default function AnthropometryField({
  isExpanded,
  onExpand,
  onCollapse,
  height,
  heightUnit,
  onHeightChange,
  onHeightUnitChange,
  armLength,
  armLengthUnit,
  onArmLengthChange,
  onArmLengthUnitChange,
  legLength,
  legLengthUnit,
  onLegLengthChange,
  onLegLengthUnitChange,
}: AnthropometryFieldProps) {
  return (
    <ExpandableField
      isExpanded={isExpanded}
      onExpand={onExpand}
      onCollapse={onCollapse}
      label="Anthropometry"
      addLabel="Add anthropometry"
    >
      <div className="space-y-3">
        {/* Height */}
        <div className="space-y-1.5">
          <label className="block font-medium text-muted-foreground text-xs">
            Height
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              inputMode="decimal"
              step="0.1"
              value={height}
              onChange={(e) => onHeightChange(e.target.value)}
              className="flex-1 bg-zinc-950/60 focus:bg-zinc-900/80 px-3 py-2 border border-zinc-800 focus:border-brand-primary rounded-lg outline-none ring-0 text-white placeholder:text-zinc-500 text-sm transition-colors"
              placeholder="72"
            />
            <select
              value={heightUnit}
              onChange={(e) => onHeightUnitChange(e.target.value as 'cm' | 'm' | 'in' | 'ft')}
              className="bg-zinc-950/60 focus:bg-zinc-900/80 px-2 py-2 border border-zinc-800 focus:border-brand-primary rounded-lg outline-none ring-0 text-white text-xs transition-colors"
            >
              <option value="in">in</option>
              <option value="ft">ft</option>
              <option value="cm">cm</option>
              <option value="m">m</option>
            </select>
          </div>
        </div>

        {/* Arm Length */}
        <div className="space-y-1.5">
          <label className="block font-medium text-muted-foreground text-xs">
            Arm Length
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              inputMode="decimal"
              step="0.1"
              value={armLength}
              onChange={(e) => onArmLengthChange(e.target.value)}
              className="flex-1 bg-zinc-950/60 focus:bg-zinc-900/80 px-3 py-2 border border-zinc-800 focus:border-brand-primary rounded-lg outline-none ring-0 text-white placeholder:text-zinc-500 text-sm transition-colors"
              placeholder="28"
            />
            <select
              value={armLengthUnit}
              onChange={(e) => onArmLengthUnitChange(e.target.value as 'cm' | 'm' | 'in' | 'ft')}
              className="bg-zinc-950/60 focus:bg-zinc-900/80 px-2 py-2 border border-zinc-800 focus:border-brand-primary rounded-lg outline-none ring-0 text-white text-xs transition-colors"
            >
              <option value="in">in</option>
              <option value="ft">ft</option>
              <option value="cm">cm</option>
              <option value="m">m</option>
            </select>
          </div>
        </div>

        {/* Leg Length */}
        <div className="space-y-1.5">
          <label className="block font-medium text-muted-foreground text-xs">
            Leg Length
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              inputMode="decimal"
              step="0.1"
              value={legLength}
              onChange={(e) => onLegLengthChange(e.target.value)}
              className="flex-1 bg-zinc-950/60 focus:bg-zinc-900/80 px-3 py-2 border border-zinc-800 focus:border-brand-primary rounded-lg outline-none ring-0 text-white placeholder:text-zinc-500 text-sm transition-colors"
              placeholder="36"
            />
            <select
              value={legLengthUnit}
              onChange={(e) => onLegLengthUnitChange(e.target.value as 'cm' | 'm' | 'in' | 'ft')}
              className="bg-zinc-950/60 focus:bg-zinc-900/80 px-2 py-2 border border-zinc-800 focus:border-brand-primary rounded-lg outline-none ring-0 text-white text-xs transition-colors"
            >
              <option value="in">in</option>
              <option value="ft">ft</option>
              <option value="cm">cm</option>
              <option value="m">m</option>
            </select>
          </div>
        </div>
      </div>
    </ExpandableField>
  );
}

