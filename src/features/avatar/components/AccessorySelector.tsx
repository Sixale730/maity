/**
 * AccessorySelector Component
 * Toggle switches for avatar accessories
 */

import { cn } from '@maity/shared';
import { Check } from 'lucide-react';
import type { AccessoryCode } from '@maity/shared';
import { ACCESSORY_OPTIONS } from '@maity/shared';

interface AccessorySelectorProps {
  selected: AccessoryCode[];
  onChange: (accessories: AccessoryCode[]) => void;
  className?: string;
}

export function AccessorySelector({ selected, onChange, className }: AccessorySelectorProps) {
  const handleToggle = (accessory: AccessoryCode) => {
    if (selected.includes(accessory)) {
      onChange(selected.filter((a) => a !== accessory));
    } else {
      onChange([...selected, accessory]);
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      <label className="text-sm font-medium text-foreground">Accesorios</label>
      <div className="grid grid-cols-1 gap-2">
        {ACCESSORY_OPTIONS.map((option) => {
          const isSelected = selected.includes(option.value);
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => handleToggle(option.value)}
              className={cn(
                'flex items-center justify-between px-4 py-3 rounded-lg border-2 transition-all duration-200',
                'hover:bg-accent/50',
                'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary',
                isSelected
                  ? 'border-primary bg-primary/10'
                  : 'border-gray-200 dark:border-gray-700 bg-background'
              )}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{option.emoji}</span>
                <span className={cn(
                  'font-medium',
                  isSelected ? 'text-primary' : 'text-foreground'
                )}>
                  {option.label}
                </span>
              </div>
              <div
                className={cn(
                  'w-5 h-5 rounded border-2 flex items-center justify-center transition-colors',
                  isSelected
                    ? 'bg-primary border-primary'
                    : 'border-gray-300 dark:border-gray-600'
                )}
              >
                {isSelected && <Check className="w-3 h-3 text-white" />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
