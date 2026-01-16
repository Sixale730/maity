import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/ui/components/ui/card';
import { NavigationCardProps } from '../types/navigation.types';
import { cn } from '@maity/shared';

export function NavigationCard({
  icon: Icon,
  title,
  description,
  href,
  disabled = false,
}: NavigationCardProps) {
  const cardContent = (
    <Card
      className={cn(
        'group border border-border/50 transition-all duration-200',
        !disabled && 'hover:shadow-md hover:scale-[1.02] hover:border-primary/30 cursor-pointer',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <CardContent className="flex items-center gap-4 p-4">
        <div
          className={cn(
            'flex items-center justify-center w-10 h-10 rounded-lg bg-muted/50 transition-colors',
            !disabled && 'group-hover:bg-primary/10'
          )}
        >
          <Icon
            className={cn(
              'h-5 w-5 text-muted-foreground transition-colors',
              !disabled && 'group-hover:text-primary'
            )}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm text-foreground truncate">{title}</h3>
          <p className="text-xs text-muted-foreground truncate">{description}</p>
        </div>
      </CardContent>
    </Card>
  );

  if (disabled) {
    return cardContent;
  }

  return (
    <Link to={href} className="block">
      {cardContent}
    </Link>
  );
}
