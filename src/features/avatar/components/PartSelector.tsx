/**
 * PartSelector Component
 * Radio-style selector for avatar parts (head type, body type)
 */

import { cn } from '@maity/shared';
import { Check } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface PartSelectorProps {
  label: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function PartSelector({ label, options, value, onChange, className }: PartSelectorProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <label className="text-sm font-medium text-foreground">{label}</label>
      <div className="grid grid-cols-2 gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              'flex items-center justify-between px-4 py-3 rounded-lg border-2 transition-all duration-200',
              'hover:bg-accent/50',
              'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary',
              value === option.value
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-gray-200 dark:border-gray-700 bg-background'
            )}
          >
            <span className="font-medium">{option.label}</span>
            {value === option.value && (
              <Check className="w-4 h-4 text-primary" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
