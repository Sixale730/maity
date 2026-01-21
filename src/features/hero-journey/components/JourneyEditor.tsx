/**
 * JourneyEditor Component
 * Editor for creating and modifying hero journey configurations
 */

import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import type {
  HeroJourneyConfig,
  JourneyNode,
  JourneyNodeType,
  JourneyNodeStatus,
  JourneyTheme,
  SaveHeroJourneyConfigRequest,
} from '@maity/shared';
import { NODE_TYPE_ICONS, DEFAULT_MOUNTAIN_LAYERS } from '@maity/shared';
import { JourneyMap } from './JourneyMap';
import { NodePropertiesPanel } from './NodePropertiesPanel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Pencil,
  Eye,
  Plus,
  Trash2,
  Save,
  RotateCcw,
  Mountain,
} from 'lucide-react';

interface JourneyEditorProps {
  initialConfig?: HeroJourneyConfig | null;
  onSave: (config: SaveHeroJourneyConfigRequest) => Promise<void>;
  isSaving?: boolean;
  className?: string;
}

const THEME_OPTIONS: { value: JourneyTheme; label: string }[] = [
  { value: 'snow', label: '❄️ Nieve' },
  { value: 'forest', label: '🌲 Bosque' },
  { value: 'desert', label: '🏜️ Desierto' },
];

export function JourneyEditor({
  initialConfig,
  onSave,
  isSaving = false,
  className = '',
}: JourneyEditorProps) {
  // Editor state
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(initialConfig?.name || 'Nueva Ruta');
  const [description, setDescription] = useState(initialConfig?.description || '');
  const [theme, setTheme] = useState<JourneyTheme>(initialConfig?.theme || 'snow');
  const [nodes, setNodes] = useState<JourneyNode[]>(
    initialConfig?.nodes || []
  );
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Get selected node
  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || null;

  // Create working config
  const workingConfig: HeroJourneyConfig = {
    id: initialConfig?.id || '',
    name,
    description,
    theme,
    nodes,
    mountainLayers: initialConfig?.mountainLayers || DEFAULT_MOUNTAIN_LAYERS,
    isDefault: initialConfig?.isDefault || false,
    createdAt: initialConfig?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Handle node move (drag)
  const handleNodeMove = useCallback((nodeId: string, x: number, y: number) => {
    setNodes((prev) =>
      prev.map((node) =>
        node.id === nodeId ? { ...node, x: Math.round(x), y: Math.round(y) } : node
      )
    );
  }, []);

  // Handle node update from properties panel
  const handleNodeUpdate = useCallback((updatedNode: JourneyNode) => {
    setNodes((prev) =>
      prev.map((node) => (node.id === updatedNode.id ? updatedNode : node))
    );
  }, []);

  // Add new node
  const handleAddNode = useCallback(() => {
    const newNode: JourneyNode = {
      id: crypto.randomUUID(),
      x: 50,
      y: 50,
      type: 'scenario',
      status: 'locked',
      icon: NODE_TYPE_ICONS.scenario,
      title: 'Nuevo Nodo',
      description: '',
    };
    setNodes((prev) => [...prev, newNode]);
    setSelectedNodeId(newNode.id);
  }, []);

  // Delete selected node
  const handleDeleteNode = useCallback(() => {
    if (!selectedNodeId) return;
    setNodes((prev) => prev.filter((n) => n.id !== selectedNodeId));
    setSelectedNodeId(null);
  }, [selectedNodeId]);

  // Reset to initial config
  const handleReset = useCallback(() => {
    setName(initialConfig?.name || 'Nueva Ruta');
    setDescription(initialConfig?.description || '');
    setTheme(initialConfig?.theme || 'snow');
    setNodes(initialConfig?.nodes || []);
    setSelectedNodeId(null);
  }, [initialConfig]);

  // Save configuration
  const handleSave = async () => {
    const configToSave: SaveHeroJourneyConfigRequest = {
      ...(initialConfig?.id && { id: initialConfig.id }),
      name,
      description: description || undefined,
      theme,
      nodes,
      mountainLayers: initialConfig?.mountainLayers,
      isDefault: initialConfig?.isDefault,
    };
    await onSave(configToSave);
  };

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 p-4 bg-gray-900/50 border-b border-white/10">
        {/* Config name */}
        <div className="flex-1 min-w-[200px]">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre de la ruta"
            className="bg-gray-800/50 border-gray-700 text-white"
          />
        </div>

        {/* Theme selector */}
        <Select value={theme} onValueChange={(v) => setTheme(v as JourneyTheme)}>
          <SelectTrigger className="w-[140px] bg-gray-800/50 border-gray-700 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {THEME_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Toggle edit mode */}
        <Button
          variant={isEditing ? 'default' : 'outline'}
          size="sm"
          onClick={() => setIsEditing(!isEditing)}
          className={cn(
            isEditing && 'bg-pink-500 hover:bg-pink-600'
          )}
        >
          {isEditing ? (
            <>
              <Eye className="w-4 h-4 mr-2" />
              Vista Previa
            </>
          ) : (
            <>
              <Pencil className="w-4 h-4 mr-2" />
              Editar
            </>
          )}
        </Button>

        {/* Add node */}
        {isEditing && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddNode}
          >
            <Plus className="w-4 h-4 mr-2" />
            Agregar Nodo
          </Button>
        )}

        {/* Delete node */}
        {isEditing && selectedNode && (
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDeleteNode}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Eliminar
          </Button>
        )}

        {/* Spacer */}
        <div className="flex-grow" />

        {/* Reset */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReset}
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Restablecer
        </Button>

        {/* Save */}
        <Button
          size="sm"
          onClick={handleSave}
          disabled={isSaving || !name.trim()}
          className="bg-green-600 hover:bg-green-700"
        >
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? 'Guardando...' : 'Guardar'}
        </Button>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex min-h-0">
        {/* Map */}
        <div className="flex-1 relative">
          <JourneyMap
            config={workingConfig}
            isEditing={isEditing}
            selectedNodeId={selectedNodeId}
            onNodeSelect={setSelectedNodeId}
            onNodeMove={handleNodeMove}
          />

          {/* Empty state */}
          {nodes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-gray-400">
                <Mountain className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium">Sin nodos</p>
                <p className="text-sm">
                  Haz clic en "Agregar Nodo" para comenzar
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Properties panel (when editing) */}
        {isEditing && (
          <div className="w-80 border-l border-white/10 bg-gray-900/50 overflow-y-auto">
            {selectedNode ? (
              <NodePropertiesPanel
                node={selectedNode}
                onUpdate={handleNodeUpdate}
              />
            ) : (
              <div className="p-4 text-center text-gray-400">
                <p className="text-sm">
                  Selecciona un nodo para editar sus propiedades
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default JourneyEditor;
