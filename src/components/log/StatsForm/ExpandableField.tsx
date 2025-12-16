'use client';

import { Plus, X } from 'lucide-react';

type ExpandableFieldProps = {
  isExpanded: boolean;
  onExpand: () => void;
  onCollapse: () => void;
  label: string;
  addLabel: string;
  children: React.ReactNode;
};

export default function ExpandableField({
  isExpanded,
  onExpand,
  onCollapse,
  label,
  addLabel,
  children,
}: ExpandableFieldProps) {
  if (!isExpanded) {
    return (
      <button
        type="button"
        onClick={onExpand}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm transition-colors"
      >
        <Plus className="w-4 h-4" />
        <span>{addLabel}</span>
      </button>
    );
  }

  return (
    <div className="space-y-2 bg-zinc-950/40 p-3 border border-zinc-800 rounded-lg">
      <div className="flex justify-between items-center">
        <label className="block font-medium text-muted-foreground text-xs uppercase tracking-[0.18em]">
          {label}
        </label>
        <button
          type="button"
          onClick={onCollapse}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      {children}
    </div>
  );
}

