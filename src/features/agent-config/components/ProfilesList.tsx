/**
 * Profiles List Component
 *
 * Displays all voice agent profiles with search and create functionality.
 */

import { useState } from 'react';
import { useAllProfiles } from '@maity/shared';
import { Button } from '@/ui/components/ui/button';
import { Input } from '@/ui/components/ui/input';
import { Badge } from '@/ui/components/ui/badge';
import { ScrollArea } from '@/ui/components/ui/scroll-area';
import { Plus, Search, User } from 'lucide-react';
import { cn } from '@maity/shared';

interface ProfilesListProps {
  selectedProfileId: string | null;
  onSelectProfile: (profileId: string | null) => void;
}

export function ProfilesList({ selectedProfileId, onSelectProfile }: ProfilesListProps) {
  const { data: profiles, isLoading, error } = useAllProfiles();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProfiles = profiles?.filter((profile) =>
    profile.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 space-y-3 border-b bg-white">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Perfiles</h2>
          <Button
            size="sm"
            onClick={() => onSelectProfile('new')}
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
            placeholder="Buscar perfiles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* List */}
      <ScrollArea className="flex-1 bg-white">
        {isLoading ? (
          <div className="p-8 text-center text-slate-500">Cargando perfiles...</div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-sm text-red-500 mb-2">Error al cargar perfiles</p>
            <p className="text-xs text-slate-500">{error.message}</p>
          </div>
        ) : filteredProfiles && filteredProfiles.length > 0 ? (
          <div className="p-2">
            {filteredProfiles.map((profile) => (
              <button
                key={profile.id}
                onClick={() => onSelectProfile(profile.id)}
                className={cn(
                  'w-full p-4 rounded-lg text-left transition-all hover:bg-slate-100',
                  'flex items-start gap-3 mb-2',
                  selectedProfileId === profile.id && 'bg-blue-50 hover:bg-blue-100 ring-2 ring-blue-500'
                )}
              >
                <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-slate-900 truncate">{profile.name}</h3>
                    <Badge variant={profile.is_active ? 'default' : 'secondary'} className="ml-2">
                      {profile.is_active ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600 line-clamp-2">{profile.description}</p>
                  <div className="flex gap-2 mt-2">
                    {profile.area && (
                      <Badge variant="outline" className="text-xs">
                        {profile.area}
                      </Badge>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-slate-500">
            {searchQuery ? 'No se encontraron perfiles' : 'No hay perfiles disponibles'}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
