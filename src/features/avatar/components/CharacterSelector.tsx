/**
 * CharacterSelector Component
 * Grid selector for choosing between preset characters (human, chicken, dog, etc.)
 */

import { cn, PRESET_CHARACTERS } from '@maity/shared';
import { Check } from 'lucide-react';
import type { CharacterPreset } from '@maity/shared';

interface CharacterSelectorProps {
  selected: CharacterPreset;
  onChange: (preset: CharacterPreset) => void;
  className?: string;
}

export function CharacterSelector({ selected, onChange, className }: CharacterSelectorProps) {
  return (
    <div className={cn('space-y-3', className)}>
      <label className="text-sm font-medium text-foreground">
        Elige tu Personaje
      </label>
      <div className="grid grid-cols-3 gap-3">
        {PRESET_CHARACTERS.map((character) => {
          const isSelected = selected === character.id;
          return (
            <button
              key={character.id}
              type="button"
              onClick={() => onChange(character.id)}
              className={cn(
                'relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200',
                'hover:scale-105 hover:shadow-lg',
                'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary',
                isSelected
                  ? 'border-primary bg-primary/10 shadow-md'
                  : 'border-gray-200 dark:border-gray-700 bg-background hover:border-primary/50'
              )}
            >
              {/* Selection indicator */}
              {isSelected && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}

              {/* Character emoji */}
              <span className="text-4xl mb-2">{character.emoji}</span>

              {/* Character name */}
              <span
                className={cn(
                  'text-sm font-medium',
                  isSelected ? 'text-primary' : 'text-foreground'
                )}
              >
                {character.name}
              </span>

              {/* Customizable indicator for human */}
              {character.id === 'human' && (
                <span className="text-xs text-muted-foreground mt-1">
                  Personalizable
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Info text */}
      <p className="text-xs text-muted-foreground mt-2">
        {selected === 'human'
          ? 'Personaliza tu humano con colores, accesorios y tipos de cuerpo.'
          : 'Los personajes predefinidos tienen un estilo fijo.'}
      </p>
    </div>
  );
}

export default CharacterSelector;
