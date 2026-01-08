/**
 * ItemSelector Component
 * Grid selector for choosing items organized by category
 * Items are shared across all characters
 */

import { cn } from '@maity/shared';
import { Check } from 'lucide-react';
import { ITEM_CATEGORIES, getItemsByCategory } from '@maity/shared';
import type { ItemCode, ItemCategory } from '@maity/shared';

interface ItemSelectorProps {
  selected: ItemCode[];
  onChange: (items: ItemCode[]) => void;
  className?: string;
}

export function ItemSelector({ selected, onChange, className }: ItemSelectorProps) {
  const toggleItem = (itemId: ItemCode, category: ItemCategory) => {
    const categoryConfig = ITEM_CATEGORIES.find(c => c.id === category);
    const maxItems = categoryConfig?.maxItems || 1;

    // Check if item is already selected
    const isSelected = selected.includes(itemId);

    if (isSelected) {
      // Remove item
      onChange(selected.filter(id => id !== itemId));
    } else {
      // Get items in same category
      const itemsInCategory = getItemsByCategory(category).map(i => i.id);
      const currentCategoryItems = selected.filter(id => itemsInCategory.includes(id as ItemCode));

      if (currentCategoryItems.length >= maxItems) {
        // Replace the existing item in this category
        const newSelected = selected.filter(id => !itemsInCategory.includes(id as ItemCode));
        onChange([...newSelected, itemId]);
      } else {
        // Add the item
        onChange([...selected, itemId]);
      }
    }
  };

  // Only show categories that have new items (hand_right, hand_left, back)
  const displayCategories: ItemCategory[] = ['hand_right', 'hand_left', 'back'];

  return (
    <div className={cn('space-y-4', className)}>
      <label className="text-sm font-medium text-foreground">
        Equipa Items
      </label>

      {displayCategories.map((categoryId) => {
        const categoryConfig = ITEM_CATEGORIES.find(c => c.id === categoryId);
        const items = getItemsByCategory(categoryId);

        if (!categoryConfig || items.length === 0) return null;

        return (
          <div key={categoryId} className="space-y-2">
            {/* Category Header */}
            <div className="flex items-center gap-2">
              <span className="text-lg">{categoryConfig.emoji}</span>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {categoryConfig.name}
              </h3>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Items Grid */}
            <div className="grid grid-cols-4 gap-2">
              {items.map((item) => {
                const isSelected = selected.includes(item.id);

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleItem(item.id, categoryId)}
                    title={item.description || item.name}
                    className={cn(
                      'relative flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all duration-200',
                      'hover:scale-105 hover:shadow-md',
                      'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary',
                      isSelected
                        ? 'border-primary bg-primary/10 shadow-sm'
                        : 'border-gray-200 dark:border-gray-700 bg-background hover:border-primary/50'
                    )}
                  >
                    {/* Selection indicator */}
                    {isSelected && (
                      <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-white" />
                      </div>
                    )}

                    {/* Item emoji */}
                    <span className="text-2xl">{item.emoji}</span>

                    {/* Item name */}
                    <span
                      className={cn(
                        'text-xs font-medium mt-1 text-center',
                        isSelected ? 'text-primary' : 'text-foreground'
                      )}
                    >
                      {item.name}
                    </span>
                  </button>
                );
              })}

              {/* None option */}
              <button
                type="button"
                onClick={() => {
                  // Remove all items from this category
                  const itemsInCategory = items.map(i => i.id);
                  onChange(selected.filter(id => !itemsInCategory.includes(id as ItemCode)));
                }}
                title="Sin item"
                className={cn(
                  'relative flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all duration-200',
                  'hover:scale-105 hover:shadow-md border-dashed',
                  'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary',
                  !items.some(i => selected.includes(i.id))
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-300 dark:border-gray-600 bg-background hover:border-primary/50'
                )}
              >
                <span className="text-2xl opacity-50">-</span>
                <span className="text-xs font-medium mt-1 text-muted-foreground">
                  Ninguno
                </span>
              </button>
            </div>
          </div>
        );
      })}

      {/* Info text */}
      <p className="text-xs text-muted-foreground mt-2">
        Los items funcionan en todos los personajes. Selecciona uno por categoria.
      </p>
    </div>
  );
}

export default ItemSelector;
