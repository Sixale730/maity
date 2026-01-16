import { NavigationCardGroupProps } from '../types/navigation.types';

export function NavigationCardGroup({
  title,
  description,
  icon: Icon,
  children,
}: NavigationCardGroupProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="h-5 w-5 text-muted-foreground" />}
        <div>
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {children}
      </div>
    </section>
  );
}
