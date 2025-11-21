/**
 * Scenarios List Component
 *
 * Displays all voice scenarios with search and create functionality.
 */

import { useState } from 'react';
import { useAllScenarios } from '@maity/shared';
import { Button } from '@/ui/components/ui/button';
import { Input } from '@/ui/components/ui/input';
import { Badge } from '@/ui/components/ui/badge';
import { ScrollArea } from '@/ui/components/ui/scroll-area';
import { Plus, Search, MessageSquare } from 'lucide-react';
import { cn } from '@maity/shared';

interface ScenariosListProps {
  selectedScenarioId: string | null;
  onSelectScenario: (scenarioId: string | null) => void;
}

export function ScenariosList({ selectedScenarioId, onSelectScenario }: ScenariosListProps) {
  const { data: scenarios, isLoading } = useAllScenarios();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredScenarios = scenarios?.filter(
    (scenario) =>
      scenario.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scenario.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 space-y-3 border-b bg-white">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Escenarios</h2>
          <Button
            size="sm"
            onClick={() => onSelectScenario('new')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-1" />
            Nuevo
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar escenarios..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* List */}
      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="p-8 text-center text-slate-500">Cargando escenarios...</div>
        ) : filteredScenarios && filteredScenarios.length > 0 ? (
          <div className="p-2">
            {filteredScenarios.map((scenario) => (
              <button
                key={scenario.id}
                onClick={() => onSelectScenario(scenario.id)}
                className={cn(
                  'w-full p-4 rounded-lg text-left transition-all hover:bg-slate-100',
                  'flex items-start gap-3 mb-2',
                  selectedScenarioId === scenario.id &&
                    'bg-blue-50 hover:bg-blue-100 ring-2 ring-blue-500'
                )}
              >
                <div className="p-2 bg-purple-100 rounded-lg flex-shrink-0">
                  <MessageSquare className="h-5 w-5 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-slate-900 truncate">{scenario.name}</h3>
                    <Badge variant={scenario.is_active ? 'default' : 'secondary'} className="ml-2">
                      {scenario.is_active ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 mb-1 font-mono">{scenario.code}</p>
                  <p className="text-sm text-slate-600 line-clamp-2">{scenario.context}</p>
                  <div className="flex gap-2 mt-2">
                    {scenario.category && (
                      <Badge variant="outline" className="text-xs">
                        {scenario.category}
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-xs">
                      Orden: {scenario.order_index}
                    </Badge>
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-slate-500">
            {searchQuery ? 'No se encontraron escenarios' : 'No hay escenarios disponibles'}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
