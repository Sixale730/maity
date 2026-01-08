import { ShowcaseCard } from './ShowcaseCard';
import type { ShowcaseItem } from '../types/showcase.types';

interface ShowcaseGridProps {
  items: ShowcaseItem[];
  className?: string;
}

/**
 * Responsive grid layout for showcase cards
 * 2x2 on desktop, 1 column on mobile
 */
export function ShowcaseGrid({ items, className = '' }: ShowcaseGridProps) {
  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 ${className}`}
    >
      {items.map((item) => (
        <ShowcaseCard key={item.id} item={item} />
      ))}
    </div>
  );
}

export default ShowcaseGrid;
