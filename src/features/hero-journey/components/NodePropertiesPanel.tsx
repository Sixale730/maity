/**
 * NodePropertiesPanel Component
 * Panel for editing node properties in the journey editor
 */

import { useCallback } from 'react';
import type {
  JourneyNode,
  JourneyNodeType,
  JourneyNodeStatus,
} from '@maity/shared';
import { NODE_TYPE_ICONS } from '@maity/shared';
import { Input } from '@/ui/components/ui/input';
import { Label } from '@/ui/components/ui/label';
import { Textarea } from '@/ui/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/components/ui/select';

interface NodePropertiesPanelProps {
  node: JourneyNode;
  onUpdate: (node: JourneyNode) => void;
}

const NODE_TYPES: { value: JourneyNodeType; label: string; icon: string }[] = [
  { value: 'checkpoint', label: 'Punto de Control', icon: '⛺' },
  { value: 'scenario', label: 'Escenario', icon: '🎭' },
  { value: 'resource', label: 'Recurso', icon: '📚' },
  { value: 'boss', label: 'Desafío Boss', icon: '👑' },
];

const NODE_STATUSES: { value: JourneyNodeStatus; label: string }[] = [
  { value: 'locked', label: '🔒 Bloqueado' },
  { value: 'available', label: '🟡 Disponible' },
  { value: 'current', label: '🔴 Actual' },
  { value: 'completed', label: '✅ Completado' },
];

const EMOJI_SUGGESTIONS = [
  '🏕️', '⛺', '🏔️', '🗻', '🌄',
  '💬', '🗣️', '🎭', '🎯', '🎪',
  '📚', '📖', '📝', '✏️', '📋',
  '👑', '🏆', '⭐', '🌟', '💎',
  '🚀', '🔥', '💪', '🎓', '🧠',
];

export function NodePropertiesPanel({
  node,
  onUpdate,
}: NodePropertiesPanelProps) {
  const handleChange = useCallback(
    <K extends keyof JourneyNode>(field: K, value: JourneyNode[K]) => {
      onUpdate({ ...node, [field]: value });
    },
    [node, onUpdate]
  );

  const handleTypeChange = useCallback(
    (type: JourneyNodeType) => {
      onUpdate({
        ...node,
        type,
        icon: NODE_TYPE_ICONS[type],
      });
    },
    [node, onUpdate]
  );

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2">
        Propiedades del Nodo
      </h3>

      {/* Title */}
      <div className="space-y-2">
        <Label className="text-gray-300">Título</Label>
        <Input
          value={node.title}
          onChange={(e) => handleChange('title', e.target.value)}
          placeholder="Título del nodo"
          className="bg-gray-800/50 border-gray-700 text-white"
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label className="text-gray-300">Descripción</Label>
        <Textarea
          value={node.description || ''}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Descripción opcional"
          rows={3}
          className="bg-gray-800/50 border-gray-700 text-white resize-none"
        />
      </div>

      {/* Type */}
      <div className="space-y-2">
        <Label className="text-gray-300">Tipo</Label>
        <Select
          value={node.type}
          onValueChange={(v) => handleTypeChange(v as JourneyNodeType)}
        >
          <SelectTrigger className="bg-gray-800/50 border-gray-700 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {NODE_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                <span className="flex items-center gap-2">
                  <span>{t.icon}</span>
                  <span>{t.label}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Status */}
      <div className="space-y-2">
        <Label className="text-gray-300">Estado</Label>
        <Select
          value={node.status}
          onValueChange={(v) => handleChange('status', v as JourneyNodeStatus)}
        >
          <SelectTrigger className="bg-gray-800/50 border-gray-700 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {NODE_STATUSES.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Icon */}
      <div className="space-y-2">
        <Label className="text-gray-300">Icono</Label>
        <div className="flex items-center gap-2">
          <div className="w-12 h-12 bg-gray-800/50 border border-gray-700 rounded-lg flex items-center justify-center text-2xl">
            {node.icon}
          </div>
          <Input
            value={node.icon}
            onChange={(e) => handleChange('icon', e.target.value)}
            placeholder="Emoji"
            className="flex-1 bg-gray-800/50 border-gray-700 text-white"
            maxLength={4}
          />
        </div>
        <div className="flex flex-wrap gap-1 mt-2">
          {EMOJI_SUGGESTIONS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleChange('icon', emoji)}
              className="w-8 h-8 rounded hover:bg-gray-700 transition-colors"
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Position */}
      <div className="space-y-2">
        <Label className="text-gray-300">Posición</Label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs text-gray-400">X (%)</Label>
            <Input
              type="number"
              value={node.x}
              onChange={(e) => handleChange('x', Number(e.target.value))}
              min={0}
              max={100}
              className="bg-gray-800/50 border-gray-700 text-white"
            />
          </div>
          <div>
            <Label className="text-xs text-gray-400">Y (%)</Label>
            <Input
              type="number"
              value={node.y}
              onChange={(e) => handleChange('y', Number(e.target.value))}
              min={0}
              max={100}
              className="bg-gray-800/50 border-gray-700 text-white"
            />
          </div>
        </div>
        <p className="text-xs text-gray-500">
          Tip: Arrastra el nodo en el mapa para posicionarlo visualmente
        </p>
      </div>

      {/* Node ID (read-only) */}
      <div className="space-y-2 pt-4 border-t border-white/10">
        <Label className="text-gray-400 text-xs">ID del Nodo</Label>
        <code className="block text-xs text-gray-500 bg-gray-800/30 p-2 rounded font-mono break-all">
          {node.id}
        </code>
      </div>
    </div>
  );
}

export default NodePropertiesPanel;
