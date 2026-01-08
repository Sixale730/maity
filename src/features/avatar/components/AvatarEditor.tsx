/**
 * AvatarEditor Component
 * Full customization panel for avatar editing with character presets
 */

import { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/components/ui/tabs';
import { Button } from '@/ui/components/ui/button';
import { Loader2, Save, RotateCcw, Palette, User, Sparkles, Users, Shirt, Swords } from 'lucide-react';
import { VoxelAvatar } from './VoxelAvatar';
import { ColorPicker } from './ColorPicker';
import { PartSelector } from './PartSelector';
import { AccessorySelector } from './AccessorySelector';
import { CharacterSelector } from './CharacterSelector';
import { OutfitSelector } from './OutfitSelector';
import { ItemSelector } from './ItemSelector';
import {
  useUpdateAvatar,
  SKIN_COLORS,
  HAIR_COLORS,
  HEAD_TYPE_OPTIONS,
  BODY_TYPE_OPTIONS,
  DEFAULT_AVATAR_CONFIG,
  OUTFIT_PRESETS,
} from '@maity/shared';
import type { AvatarConfiguration, HeadType, BodyType, AccessoryCode, CharacterPreset, OutfitPreset, ItemCode } from '@maity/shared';
import { toast } from '@/shared/hooks/use-toast';

interface AvatarEditorProps {
  userId: string;
  initialConfig: Partial<AvatarConfiguration>;
  onSave?: (config: AvatarConfiguration) => void;
}

export function AvatarEditor({ userId, initialConfig, onSave }: AvatarEditorProps) {
  const [config, setConfig] = useState<Partial<AvatarConfiguration>>(initialConfig);
  const [hasChanges, setHasChanges] = useState(false);
  const updateAvatar = useUpdateAvatar();

  // Check if human is selected (only humans can be customized)
  const isHuman = (config.character_preset || 'human') === 'human';

  // Track changes
  useEffect(() => {
    const configChanged = JSON.stringify(config) !== JSON.stringify(initialConfig);
    setHasChanges(configChanged);
  }, [config, initialConfig]);

  const handleCharacterChange = useCallback((preset: CharacterPreset) => {
    setConfig((prev) => ({ ...prev, character_preset: preset }));
  }, []);

  const handleOutfitChange = useCallback((preset: OutfitPreset) => {
    const outfit = OUTFIT_PRESETS.find(o => o.id === preset);
    if (outfit) {
      setConfig((prev) => ({
        ...prev,
        outfit_preset: preset,
        shirt_color: outfit.shirtColor,
        pants_color: outfit.pantsColor,
      }));
    }
  }, []);

  const handleColorChange = useCallback((key: string, color: string) => {
    setConfig((prev) => ({ ...prev, [key]: color }));
  }, []);

  const handlePartChange = useCallback((key: string, value: string) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleAccessoryChange = useCallback((accessories: AccessoryCode[]) => {
    setConfig((prev) => ({ ...prev, accessories }));
  }, []);

  const handleItemsChange = useCallback((items: ItemCode[]) => {
    setConfig((prev) => ({ ...prev, items }));
  }, []);

  const handleReset = useCallback(() => {
    setConfig({
      ...DEFAULT_AVATAR_CONFIG,
    });
  }, []);

  const handleSave = async () => {
    try {
      const result = await updateAvatar.mutateAsync({
        userId,
        config: {
          character_preset: config.character_preset as CharacterPreset,
          outfit_preset: config.outfit_preset as OutfitPreset,
          head_type: config.head_type as HeadType,
          body_type: config.body_type as BodyType,
          skin_color: config.skin_color,
          hair_color: config.hair_color,
          shirt_color: config.shirt_color,
          pants_color: config.pants_color,
          accessories: config.accessories as AccessoryCode[],
          items: config.items as string[],
        },
      });
      toast({
        title: 'Avatar guardado',
        description: 'Tu avatar ha sido actualizado exitosamente.',
      });
      onSave?.(result);
    } catch (error) {
      console.error('Error saving avatar:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo guardar el avatar. Intenta de nuevo.',
      });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Preview Panel */}
      <Card className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Vista Previa
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center min-h-[400px]">
          <VoxelAvatar
            config={config}
            size="xl"
            enableRotation
            autoRotate
            showPedestal
            animate
          />
        </CardContent>
      </Card>

      {/* Editor Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Personaliza tu Avatar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="character" className="w-full">
            <TabsList className={`grid w-full mb-4 ${isHuman ? 'grid-cols-5' : 'grid-cols-2'}`}>
              <TabsTrigger value="character" className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Personaje</span>
              </TabsTrigger>
              {isHuman && (
                <>
                  <TabsTrigger value="outfit" className="flex items-center gap-1">
                    <Shirt className="w-4 h-4" />
                    <span className="hidden sm:inline">Vestimenta</span>
                  </TabsTrigger>
                  <TabsTrigger value="appearance" className="flex items-center gap-1">
                    <Palette className="w-4 h-4" />
                    <span className="hidden sm:inline">Apariencia</span>
                  </TabsTrigger>
                  <TabsTrigger value="accessories" className="flex items-center gap-1">
                    <Sparkles className="w-4 h-4" />
                    <span className="hidden sm:inline">Accesorios</span>
                  </TabsTrigger>
                </>
              )}
              {/* Items tab available for ALL characters */}
              <TabsTrigger value="items" className="flex items-center gap-1">
                <Swords className="w-4 h-4" />
                <span className="hidden sm:inline">Items</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="character" className="space-y-4">
              <CharacterSelector
                selected={config.character_preset || 'human'}
                onChange={handleCharacterChange}
              />
            </TabsContent>

            {isHuman && (
              <>
                <TabsContent value="outfit" className="space-y-6">
                  <OutfitSelector
                    selected={(config.outfit_preset as OutfitPreset) || 'casual'}
                    onChange={handleOutfitChange}
                  />
                </TabsContent>

                <TabsContent value="appearance" className="space-y-6">
                  <ColorPicker
                    label="Color de Piel"
                    colors={SKIN_COLORS}
                    value={config.skin_color || DEFAULT_AVATAR_CONFIG.skin_color}
                    onChange={(c) => handleColorChange('skin_color', c)}
                  />
                  <ColorPicker
                    label="Color de Cabello"
                    colors={HAIR_COLORS}
                    value={config.hair_color || DEFAULT_AVATAR_CONFIG.hair_color}
                    onChange={(c) => handleColorChange('hair_color', c)}
                  />
                  <PartSelector
                    label="Tipo de Cabeza"
                    options={HEAD_TYPE_OPTIONS}
                    value={config.head_type || DEFAULT_AVATAR_CONFIG.head_type}
                    onChange={(v) => handlePartChange('head_type', v)}
                  />
                  <PartSelector
                    label="Tipo de Cuerpo"
                    options={BODY_TYPE_OPTIONS}
                    value={config.body_type || DEFAULT_AVATAR_CONFIG.body_type}
                    onChange={(v) => handlePartChange('body_type', v)}
                  />
                </TabsContent>

                <TabsContent value="accessories" className="space-y-4">
                  <AccessorySelector
                    selected={(config.accessories as AccessoryCode[]) || []}
                    onChange={handleAccessoryChange}
                  />
                </TabsContent>
              </>
            )}

            {/* Items tab - available for ALL characters */}
            <TabsContent value="items" className="space-y-4">
              <ItemSelector
                selected={(config.items as ItemCode[]) || []}
                onChange={handleItemsChange}
              />
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6 pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleReset}
              className="flex-1"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reiniciar
            </Button>
            <Button
              onClick={handleSave}
              disabled={updateAvatar.isPending || !hasChanges}
              className="flex-1"
            >
              {updateAvatar.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AvatarEditor;
