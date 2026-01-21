/**
 * HeroJourneyPage
 * Main page for viewing and editing hero journey configurations
 */

import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  useHeroJourneyConfigs,
  useDefaultHeroJourneyConfig,
  useSaveHeroJourneyConfig,
  useDeleteHeroJourneyConfig,
  HeroJourneyService,
} from '@maity/shared';
import type { HeroJourneyConfig, SaveHeroJourneyConfigRequest } from '@maity/shared';
import { JourneyEditor } from '../components/JourneyEditor';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Mountain,
  Plus,
  ChevronDown,
  Copy,
  Trash2,
  Loader2,
  RefreshCw,
} from 'lucide-react';

export function HeroJourneyPage() {
  const { t } = useTranslation();
  const [selectedConfigId, setSelectedConfigId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Queries
  const {
    data: configs,
    isLoading: isLoadingConfigs,
    refetch: refetchConfigs,
  } = useHeroJourneyConfigs();
  const { data: defaultConfig, isLoading: isLoadingDefault } = useDefaultHeroJourneyConfig();

  // Mutations
  const saveMutation = useSaveHeroJourneyConfig();
  const deleteMutation = useDeleteHeroJourneyConfig();

  // Get selected or default config
  const selectedConfig = selectedConfigId
    ? configs?.find((c) => c.id === selectedConfigId) || null
    : defaultConfig || (configs && configs.length > 0 ? configs[0] : null);

  // Auto-select first config when loaded
  if (!selectedConfigId && selectedConfig && configs?.length) {
    setSelectedConfigId(selectedConfig.id);
  }

  // Handle save
  const handleSave = useCallback(
    async (config: SaveHeroJourneyConfigRequest) => {
      try {
        const saved = await saveMutation.mutateAsync(config);
        setSelectedConfigId(saved.id);
        toast.success(t('hero_journey.save_success', 'Configuración guardada'));
      } catch (error) {
        console.error('Error saving config:', error);
        toast.error(t('hero_journey.save_error', 'Error al guardar'));
      }
    },
    [saveMutation, t]
  );

  // Handle create new
  const handleCreateNew = useCallback(() => {
    const newConfig = HeroJourneyService.createEmptyConfig('Nueva Ruta');
    // Save immediately to get an ID
    handleSave(newConfig);
  }, [handleSave]);

  // Handle clone
  const handleClone = useCallback(async () => {
    if (!selectedConfig) return;
    try {
      const clonedConfig: SaveHeroJourneyConfigRequest = {
        name: `${selectedConfig.name} (copia)`,
        description: selectedConfig.description,
        theme: selectedConfig.theme,
        nodes: selectedConfig.nodes.map((n) => ({
          ...n,
          id: crypto.randomUUID(),
        })),
        mountainLayers: selectedConfig.mountainLayers,
        isDefault: false,
      };
      const saved = await saveMutation.mutateAsync(clonedConfig);
      setSelectedConfigId(saved.id);
      toast.success(t('hero_journey.clone_success', 'Configuración clonada'));
    } catch (error) {
      console.error('Error cloning config:', error);
      toast.error(t('hero_journey.clone_error', 'Error al clonar'));
    }
  }, [selectedConfig, saveMutation, t]);

  // Handle delete
  const handleDelete = useCallback(async () => {
    if (!selectedConfig) return;
    try {
      await deleteMutation.mutateAsync(selectedConfig.id);
      setSelectedConfigId(null);
      setDeleteDialogOpen(false);
      toast.success(t('hero_journey.delete_success', 'Configuración eliminada'));
    } catch (error) {
      console.error('Error deleting config:', error);
      toast.error(t('hero_journey.delete_error', 'Error al eliminar'));
    }
  }, [selectedConfig, deleteMutation, t]);

  // Loading state
  if (isLoadingConfigs || isLoadingDefault) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-950">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-pink-500 mx-auto mb-4" />
          <p className="text-gray-400">{t('common.loading', 'Cargando...')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-950">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <Mountain className="w-6 h-6 text-pink-500" />
          <h1 className="text-xl font-bold text-white">
            {t('hero_journey.title', "Hero's Journey")}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Config selector */}
          {configs && configs.length > 0 && (
            <Select
              value={selectedConfigId || undefined}
              onValueChange={setSelectedConfigId}
            >
              <SelectTrigger className="w-[250px] bg-gray-800/50 border-gray-700 text-white">
                <SelectValue placeholder={t('hero_journey.select_config', 'Seleccionar configuración')} />
              </SelectTrigger>
              <SelectContent>
                {configs.map((config) => (
                  <SelectItem key={config.id} value={config.id}>
                    <span className="flex items-center gap-2">
                      {config.isDefault && (
                        <span className="text-xs bg-pink-500/20 text-pink-400 px-1.5 py-0.5 rounded">
                          Default
                        </span>
                      )}
                      {config.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Actions dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                {t('common.actions', 'Acciones')}
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleCreateNew}>
                <Plus className="w-4 h-4 mr-2" />
                {t('hero_journey.new_config', 'Nueva Configuración')}
              </DropdownMenuItem>
              {selectedConfig && (
                <>
                  <DropdownMenuItem onClick={handleClone}>
                    <Copy className="w-4 h-4 mr-2" />
                    {t('hero_journey.clone_config', 'Clonar')}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setDeleteDialogOpen(true)}
                    className="text-red-400 focus:text-red-400"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {t('hero_journey.delete_config', 'Eliminar')}
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => refetchConfigs()}>
                <RefreshCw className="w-4 h-4 mr-2" />
                {t('common.refresh', 'Actualizar')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 min-h-0">
        {selectedConfig ? (
          <JourneyEditor
            key={selectedConfig.id}
            initialConfig={selectedConfig}
            onSave={handleSave}
            isSaving={saveMutation.isPending}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Mountain className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">
                {t('hero_journey.no_configs', 'No hay configuraciones')}
              </h2>
              <p className="text-gray-400 mb-4">
                {t('hero_journey.create_first', 'Crea tu primera ruta del héroe')}
              </p>
              <Button onClick={handleCreateNew}>
                <Plus className="w-4 h-4 mr-2" />
                {t('hero_journey.new_config', 'Nueva Configuración')}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('hero_journey.delete_confirm_title', '¿Eliminar configuración?')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                'hero_journey.delete_confirm_desc',
                'Esta acción no se puede deshacer. Se eliminará permanentemente la configuración "{name}".',
                { name: selectedConfig?.name }
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {t('common.cancel', 'Cancelar')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              {t('common.delete', 'Eliminar')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default HeroJourneyPage;
