/**
 * Scenario Editor Component
 *
 * Form for creating/editing voice scenarios.
 */

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  useScenario,
  useCreateScenario,
  useUpdateScenario,
  useToggleScenarioActive,
  VoiceScenarioSchema,
  UpdateVoiceScenarioSchema,
  type VoiceScenarioFormData,
  type UpdateVoiceScenarioFormData,
} from '@maity/shared';
import { Button } from '@/ui/components/ui/button';
import { Input } from '@/ui/components/ui/input';
import { Textarea } from '@/ui/components/ui/textarea';
import { Label } from '@/ui/components/ui/label';
import { Switch } from '@/ui/components/ui/switch';
import { useToast } from '@/shared/hooks/use-toast';
import { Save, X, Power, MessageSquare } from 'lucide-react';
import { cn } from '@maity/shared';

interface ScenarioEditorProps {
  scenarioId: string | null;
  onClose: () => void;
}

export function ScenarioEditor({ scenarioId, onClose }: ScenarioEditorProps) {
  const { toast } = useToast();
  const scenario = useScenario(scenarioId && scenarioId !== 'new' ? scenarioId : null);
  const isNewScenario = scenarioId === 'new';
  const isEditing = scenarioId !== null;

  const createMutation = useCreateScenario();
  const updateMutation = useUpdateScenario();
  const toggleActiveMutation = useToggleScenarioActive();

  const [objectivesText, setObjectivesText] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    watch,
    setValue,
  } = useForm<UpdateVoiceScenarioFormData>({
    resolver: zodResolver(isNewScenario ? VoiceScenarioSchema : UpdateVoiceScenarioSchema),
    defaultValues: {
      name: '',
      code: '',
      order_index: 1,
      context: '',
      objectives: [],
      skill: '',
      instructions: '',
      rules: '',
      closing: '',
      estimated_duration: 300,
      category: '',
      agent_id: null,
      is_active: true,
    },
  });

  const isActive = watch('is_active');

  // Load scenario data when selected
  useEffect(() => {
    if (scenario) {
      reset({
        id: scenario.id,
        name: scenario.name,
        code: scenario.code,
        order_index: scenario.order_index,
        context: scenario.context,
        objectives: scenario.objectives,
        skill: scenario.skill,
        instructions: scenario.instructions,
        rules: scenario.rules,
        closing: scenario.closing,
        estimated_duration: scenario.estimated_duration,
        category: scenario.category,
        agent_id: scenario.agent_id,
        is_active: scenario.is_active,
      });

      // Convert objectives to text
      if (Array.isArray(scenario.objectives)) {
        setObjectivesText(scenario.objectives.join('\n'));
      } else {
        setObjectivesText(JSON.stringify(scenario.objectives, null, 2));
      }
    } else if (isNewScenario) {
      reset({
        name: '',
        code: '',
        order_index: 1,
        context: '',
        objectives: [],
        skill: '',
        instructions: '',
        rules: '',
        closing: '',
        estimated_duration: 300,
        category: '',
        agent_id: null,
        is_active: true,
      });
      setObjectivesText('');
    }
  }, [scenario, isNewScenario, reset]);

  const onSubmit = async (data: UpdateVoiceScenarioFormData) => {
    try {
      // Parse objectives from text
      let objectives: string[] | Record<string, unknown>;
      try {
        // Try to parse as JSON first
        objectives = JSON.parse(objectivesText);
      } catch {
        // If not valid JSON, split by lines
        objectives = objectivesText
          .split('\n')
          .map((line) => line.trim())
          .filter((line) => line.length > 0);
      }

      const scenarioData = {
        ...data,
        objectives,
      };

      if (isNewScenario) {
        await createMutation.mutateAsync({
          name: scenarioData.name,
          code: scenarioData.code,
          order_index: scenarioData.order_index,
          context: scenarioData.context,
          objectives: scenarioData.objectives,
          skill: scenarioData.skill,
          instructions: scenarioData.instructions,
          rules: scenarioData.rules,
          closing: scenarioData.closing,
          estimated_duration: scenarioData.estimated_duration,
          category: scenarioData.category,
        });

        toast({
          title: 'Escenario creado',
          description: 'El escenario se ha creado exitosamente.',
        });
        onClose();
      } else {
        await updateMutation.mutateAsync(scenarioData);

        toast({
          title: 'Escenario actualizado',
          description: 'Los cambios se han guardado exitosamente.',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo guardar el escenario.',
      });
    }
  };

  const handleToggleActive = async () => {
    if (!scenarioId || scenarioId === 'new') return;

    try {
      const newStatus = await toggleActiveMutation.mutateAsync(scenarioId);

      toast({
        title: newStatus ? 'Escenario activado' : 'Escenario desactivado',
        description: `El escenario ahora está ${newStatus ? 'activo' : 'inactivo'}.`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo cambiar el estado del escenario.',
      });
    }
  };

  if (!isEditing) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center space-y-3">
          <div className="mx-auto w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center">
            <MessageSquare className="h-10 w-10 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">Selecciona un escenario</h3>
          <p className="text-sm text-slate-600">
            Selecciona un escenario de la lista o crea uno nuevo para comenzar a editar.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">
          {isNewScenario ? 'Nuevo Escenario' : 'Editar Escenario'}
        </h2>
        <div className="flex items-center gap-2">
          {!isNewScenario && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleActive}
              disabled={toggleActiveMutation.isPending}
            >
              <Power
                className={cn('h-4 w-4 mr-2', isActive ? 'text-green-600' : 'text-slate-400')}
              />
              {isActive ? 'Desactivar' : 'Activar'}
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Nombre <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Primera visita, Demo de producto..."
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
          </div>

          {/* Code */}
          <div className="space-y-2">
            <Label htmlFor="code">
              Código <span className="text-red-500">*</span>
            </Label>
            <Input
              id="code"
              {...register('code')}
              placeholder="first_visit, product_demo..."
              className={cn('font-mono', errors.code ? 'border-red-500' : '')}
            />
            {errors.code && <p className="text-sm text-red-500">{errors.code.message}</p>}
            <p className="text-xs text-slate-500">Usar snake_case (letras minúsculas y guiones bajos)</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {/* Order Index */}
          <div className="space-y-2">
            <Label htmlFor="order_index">
              Orden <span className="text-red-500">*</span>
            </Label>
            <Input
              id="order_index"
              type="number"
              {...register('order_index', { valueAsNumber: true })}
              placeholder="1"
              className={errors.order_index ? 'border-red-500' : ''}
            />
            {errors.order_index && (
              <p className="text-sm text-red-500">{errors.order_index.message}</p>
            )}
          </div>

          {/* Estimated Duration */}
          <div className="space-y-2">
            <Label htmlFor="estimated_duration">
              Duración (seg) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="estimated_duration"
              type="number"
              {...register('estimated_duration', { valueAsNumber: true })}
              placeholder="300"
              className={errors.estimated_duration ? 'border-red-500' : ''}
            />
            {errors.estimated_duration && (
              <p className="text-sm text-red-500">{errors.estimated_duration.message}</p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">
              Categoría <span className="text-red-500">*</span>
            </Label>
            <Input
              id="category"
              {...register('category')}
              placeholder="discovery, presentation..."
              className={errors.category ? 'border-red-500' : ''}
            />
            {errors.category && <p className="text-sm text-red-500">{errors.category.message}</p>}
          </div>
        </div>

        {/* Agent ID */}
        <div className="space-y-2">
          <Label htmlFor="agent_id">
            Agent ID <span className="text-red-500">*</span>
          </Label>
          <Input
            id="agent_id"
            {...register('agent_id')}
            placeholder="agent_5901kakktagnf739xrp8k320qq6j"
            className={cn('font-mono', errors.agent_id ? 'border-red-500' : '')}
          />
          {errors.agent_id && <p className="text-sm text-red-500">{errors.agent_id.message}</p>}
          <p className="text-xs text-slate-500">
            ElevenLabs Agent ID para este escenario
          </p>
        </div>

        {/* Skill */}
        <div className="space-y-2">
          <Label htmlFor="skill">
            Habilidad <span className="text-red-500">*</span>
          </Label>
          <Input
            id="skill"
            {...register('skill')}
            placeholder="Descubrimiento, Presentación, Negociación..."
            className={errors.skill ? 'border-red-500' : ''}
          />
          {errors.skill && <p className="text-sm text-red-500">{errors.skill.message}</p>}
        </div>

        {/* Context */}
        <div className="space-y-2">
          <Label htmlFor="context">
            Contexto <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="context"
            {...register('context')}
            placeholder="Descripción del contexto del escenario..."
            rows={3}
            className={errors.context ? 'border-red-500' : ''}
          />
          {errors.context && <p className="text-sm text-red-500">{errors.context.message}</p>}
        </div>

        {/* Objectives */}
        <div className="space-y-2">
          <Label htmlFor="objectives">
            Objetivos <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="objectives"
            value={objectivesText}
            onChange={(e) => setObjectivesText(e.target.value)}
            placeholder={'Un objetivo por línea o JSON:\n["Objetivo 1", "Objetivo 2"]'}
            rows={4}
            className={errors.objectives ? 'border-red-500' : ''}
          />
          {errors.objectives && <p className="text-sm text-red-500">{errors.objectives.message}</p>}
          <p className="text-xs text-slate-500">
            Un objetivo por línea o formato JSON
          </p>
        </div>

        {/* Instructions */}
        <div className="space-y-2">
          <Label htmlFor="instructions">
            Instrucciones <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="instructions"
            {...register('instructions')}
            placeholder="Instrucciones para el usuario..."
            rows={4}
            className={errors.instructions ? 'border-red-500' : ''}
          />
          {errors.instructions && (
            <p className="text-sm text-red-500">{errors.instructions.message}</p>
          )}
        </div>

        {/* Rules */}
        <div className="space-y-2">
          <Label htmlFor="rules">
            Reglas <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="rules"
            {...register('rules')}
            placeholder="Reglas del escenario..."
            rows={4}
            className={errors.rules ? 'border-red-500' : ''}
          />
          {errors.rules && <p className="text-sm text-red-500">{errors.rules.message}</p>}
        </div>

        {/* Closing */}
        <div className="space-y-2">
          <Label htmlFor="closing">
            Cierre <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="closing"
            {...register('closing')}
            placeholder="Mensaje de cierre..."
            rows={3}
            className={errors.closing ? 'border-red-500' : ''}
          />
          {errors.closing && <p className="text-sm text-red-500">{errors.closing.message}</p>}
        </div>

        {/* Active Status */}
        {!isNewScenario && (
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div>
              <Label htmlFor="is_active" className="text-base font-medium">
                Estado
              </Label>
              <p className="text-sm text-slate-600">
                {isActive
                  ? 'El escenario está activo y visible para los usuarios'
                  : 'El escenario está inactivo y no visible'}
              </p>
            </div>
            <Switch id="is_active" checked={isActive} {...register('is_active')} />
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={!isDirty || createMutation.isPending || updateMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Save className="h-4 w-4 mr-2" />
            {isNewScenario ? 'Crear Escenario' : 'Guardar Cambios'}
          </Button>
        </div>
      </form>
    </div>
  );
}
