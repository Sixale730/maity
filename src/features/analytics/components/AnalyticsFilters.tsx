import { Button } from '@/ui/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/components/ui/select';
import { Calendar } from '@/ui/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/ui/components/ui/popover';
import { CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@maity/shared';
import type { AnalyticsFilters as FiltersType } from '@maity/shared';
import {
  useCompaniesForFilter,
  useProfilesForFilter,
  useScenariosForFilter,
} from '../hooks/useAnalyticsData';

interface AnalyticsFiltersProps {
  filters: FiltersType;
  onFiltersChange: (filters: FiltersType) => void;
}

export function AnalyticsFilters({ filters, onFiltersChange }: AnalyticsFiltersProps) {
  const { data: companies } = useCompaniesForFilter();
  const { data: profiles } = useProfilesForFilter();
  const { data: scenarios } = useScenariosForFilter();

  const hasActiveFilters =
    filters.companyId ||
    filters.type !== 'all' ||
    filters.startDate ||
    filters.endDate ||
    filters.profileId ||
    filters.scenarioId;

  const clearFilters = () => {
    onFiltersChange({
      type: 'all',
    });
  };

  return (
    <div className="flex flex-wrap gap-4 items-end">
      {/* Company filter */}
      <div className="flex flex-col gap-2 min-w-[200px]">
        <label className="text-sm font-medium">Empresa</label>
        <Select
          value={filters.companyId || 'all'}
          onValueChange={(value) =>
            onFiltersChange({
              ...filters,
              companyId: value === 'all' ? undefined : value,
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Todas las empresas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las empresas</SelectItem>
            {companies?.map((company) => (
              <SelectItem key={company.id} value={company.id}>
                {company.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Type filter */}
      <div className="flex flex-col gap-2 min-w-[200px]">
        <label className="text-sm font-medium">Tipo</label>
        <Select
          value={filters.type || 'all'}
          onValueChange={(value) =>
            onFiltersChange({
              ...filters,
              type: value as 'interview' | 'roleplay' | 'all',
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Todos los tipos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tipos</SelectItem>
            <SelectItem value="interview">Entrevistas</SelectItem>
            <SelectItem value="roleplay">Roleplay</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Profile filter (only for roleplay) */}
      {(filters.type === 'roleplay' || filters.type === 'all') && (
        <div className="flex flex-col gap-2 min-w-[200px]">
          <label className="text-sm font-medium">Perfil</label>
          <Select
            value={filters.profileId || 'all'}
            onValueChange={(value) =>
              onFiltersChange({
                ...filters,
                profileId: value === 'all' ? undefined : value,
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Todos los perfiles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los perfiles</SelectItem>
              {profiles?.map((profile) => (
                <SelectItem key={profile.id} value={profile.id}>
                  {profile.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Scenario filter (only for roleplay) */}
      {(filters.type === 'roleplay' || filters.type === 'all') && (
        <div className="flex flex-col gap-2 min-w-[200px]">
          <label className="text-sm font-medium">Escenario</label>
          <Select
            value={filters.scenarioId || 'all'}
            onValueChange={(value) =>
              onFiltersChange({
                ...filters,
                scenarioId: value === 'all' ? undefined : value,
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Todos los escenarios" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los escenarios</SelectItem>
              {scenarios?.map((scenario) => (
                <SelectItem key={scenario.id} value={scenario.id}>
                  {scenario.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Date range filter */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Fecha inicio</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'w-[200px] justify-start text-left font-normal',
                !filters.startDate && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {filters.startDate ? (
                format(new Date(filters.startDate), 'PPP', { locale: es })
              ) : (
                <span>Seleccionar fecha</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={filters.startDate ? new Date(filters.startDate) : undefined}
              onSelect={(date) =>
                onFiltersChange({
                  ...filters,
                  startDate: date?.toISOString(),
                })
              }
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Fecha fin</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'w-[200px] justify-start text-left font-normal',
                !filters.endDate && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {filters.endDate ? (
                format(new Date(filters.endDate), 'PPP', { locale: es })
              ) : (
                <span>Seleccionar fecha</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={filters.endDate ? new Date(filters.endDate) : undefined}
              onSelect={(date) =>
                onFiltersChange({
                  ...filters,
                  endDate: date?.toISOString(),
                })
              }
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Clear filters button */}
      {hasActiveFilters && (
        <Button variant="ghost" onClick={clearFilters} className="gap-2">
          <X className="h-4 w-4" />
          Limpiar filtros
        </Button>
      )}
    </div>
  );
}
