import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn, LikertValue, CompetencyColors, CompetencyArea } from '@maity/shared';

interface LikertScaleProps {
  value?: LikertValue | null;
  onChange: (value: LikertValue) => void;
  area: CompetencyArea;
  autoAdvance?: boolean;
  autoAdvanceDelay?: number; // milliseconds
}

export function LikertScale({
  value,
  onChange,
  area,
  autoAdvance = true,
  autoAdvanceDelay = 500,
}: LikertScaleProps) {
  const [selectedValue, setSelectedValue] = useState<LikertValue | null>(value || null);
  const color = CompetencyColors[area];

  const options: { value: LikertValue; label: string }[] = [
    { value: 1, label: 'Nada que ver conmigo 😢' },
    { value: 2, label: 'A veces lo hago, pero me cuesta 😐' },
    { value: 3, label: 'Lo hago con normalidad 😊' },
    { value: 4, label: 'Casi siempre lo aplico bien 😄' },
    { value: 5, label: 'Totalmente, así soy ✨' },
  ];

  useEffect(() => {
    if (value) {
      setSelectedValue(value);
    }
  }, [value]);

  const handleSelect = (val: LikertValue) => {
    setSelectedValue(val);
    onChange(val);
  };

  return (
    <div className="w-full space-y-6">
      {/* Helper Text */}
      <div className="space-y-3">
        <p className="text-sm text-center text-muted-foreground">
          Selecciona el número que describe mejor tu comportamiento en cada afirmación ✨
        </p>
        <p className="text-sm text-center text-muted-foreground">
          💝 Responde con honestidad y deja que Maity te guíe hacia una comunicación más poderosa.
        </p>
      </div>

      {/* Scale Buttons */}
      <div className="flex justify-between gap-2 sm:gap-4">
        {options.map((option) => (
          <motion.button
            key={option.value}
            type="button"
            onClick={() => handleSelect(option.value)}
            className={cn(
              'flex-1 flex flex-col items-center gap-2 p-3 sm:p-4 rounded-xl border-2 transition-all duration-300',
              'hover:scale-105 active:scale-95',
              'focus:outline-none focus:ring-2 focus:ring-offset-2',
              selectedValue === option.value
                ? 'border-current shadow-lg scale-105'
                : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'
            )}
            style={{
              color: selectedValue === option.value ? color : undefined,
              borderColor: selectedValue === option.value ? color : undefined,
              backgroundColor:
                selectedValue === option.value ? `${color}10` : undefined,
            }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: option.value * 0.05 }}
          >
            {/* Number Circle */}
            <div
              className={cn(
                'w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold text-lg sm:text-xl transition-all',
                selectedValue === option.value
                  ? 'text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              )}
              style={{
                backgroundColor:
                  selectedValue === option.value ? color : undefined,
              }}
            >
              {option.value}
            </div>

            {/* Label */}
            <span
              className={cn(
                'text-xs sm:text-sm font-medium text-center transition-colors',
                selectedValue === option.value
                  ? 'font-semibold'
                  : 'text-gray-600 dark:text-gray-400'
              )}
              style={{
                color: selectedValue === option.value ? color : undefined,
              }}
            >
              {option.label}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
