/**
 * Profile Editor Component
 *
 * Form for creating/editing voice agent profiles.
 */

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  useProfile,
  useCreateProfile,
  useUpdateProfile,
  useToggleProfileActive,
  VoiceAgentProfileSchema,
  UpdateVoiceAgentProfileSchema,
  type VoiceAgentProfileFormData,
  type UpdateVoiceAgentProfileFormData,
} from '@maity/shared';
import { Button } from '@/ui/components/ui/button';
import { Input } from '@/ui/components/ui/input';
import { Textarea } from '@/ui/components/ui/textarea';
import { Label } from '@/ui/components/ui/label';
import { Switch } from '@/ui/components/ui/switch';
import { useToast } from '@/shared/hooks/use-toast';
import { Save, X, Power, User } from 'lucide-react';
import { cn } from '@maity/shared';

interface ProfileEditorProps {
  profileId: string | null;
  onClose: () => void;
}

export function ProfileEditor({ profileId, onClose }: ProfileEditorProps) {
  const { toast } = useToast();
  const profile = useProfile(profileId && profileId !== 'new' ? profileId : null);
  const isNewProfile = profileId === 'new';
  const isEditing = profileId !== null;

  const createMutation = useCreateProfile();
  const updateMutation = useUpdateProfile();
  const toggleActiveMutation = useToggleProfileActive();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    watch,
  } = useForm<UpdateVoiceAgentProfileFormData>({
    resolver: zodResolver(isNewProfile ? VoiceAgentProfileSchema : UpdateVoiceAgentProfileSchema),
    defaultValues: {
      name: '',
      description: '',
      key_focus: '',
      communication_style: '',
      personality_traits: {},
      area: '',
      impact: '',
      is_active: true,
    },
  });

  const isActive = watch('is_active');

  // Load profile data when selected
  useEffect(() => {
    if (profile) {
      reset({
        id: profile.id,
        name: profile.name,
        description: profile.description,
        key_focus: profile.key_focus,
        communication_style: profile.communication_style,
        personality_traits: profile.personality_traits,
        area: profile.area,
        impact: profile.impact,
        is_active: profile.is_active,
      });
    } else if (isNewProfile) {
      reset({
        name: '',
        description: '',
        key_focus: '',
        communication_style: '',
        personality_traits: {},
        area: '',
        impact: '',
        is_active: true,
      });
    }
  }, [profile, isNewProfile, reset]);

  const onSubmit = async (data: UpdateVoiceAgentProfileFormData) => {
    try {
      if (isNewProfile) {
        await createMutation.mutateAsync({
          name: data.name,
          description: data.description,
          key_focus: data.key_focus,
          communication_style: data.communication_style,
          personality_traits: data.personality_traits,
          area: data.area,
          impact: data.impact,
        });

        toast({
          title: 'Perfil creado',
          description: 'El perfil se ha creado exitosamente.',
        });
        onClose();
      } else {
        await updateMutation.mutateAsync(data);

        toast({
          title: 'Perfil actualizado',
          description: 'Los cambios se han guardado exitosamente.',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo guardar el perfil.',
      });
    }
  };

  const handleToggleActive = async () => {
    if (!profileId || profileId === 'new') return;

    try {
      const newStatus = await toggleActiveMutation.mutateAsync(profileId);

      toast({
        title: newStatus ? 'Perfil activado' : 'Perfil desactivado',
        description: `El perfil ahora está ${newStatus ? 'activo' : 'inactivo'}.`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo cambiar el estado del perfil.',
      });
    }
  };

  if (!isEditing) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center space-y-3">
          <div className="mx-auto w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center">
            <User className="h-10 w-10 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">Selecciona un perfil</h3>
          <p className="text-sm text-slate-600">
            Selecciona un perfil de la lista o crea uno nuevo para comenzar a editar.
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
          {isNewProfile ? 'Nuevo Perfil' : 'Editar Perfil'}
        </h2>
        <div className="flex items-center gap-2">
          {!isNewProfile && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleActive}
              disabled={toggleActiveMutation.isPending}
            >
              <Power className={cn('h-4 w-4 mr-2', isActive ? 'text-green-600' : 'text-slate-400')} />
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
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name">
            Nombre <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            {...register('name')}
            placeholder="CEO, CTO, CFO..."
            className={errors.name ? 'border-red-500' : ''}
          />
          {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
        </div>

        {/* Area */}
        <div className="space-y-2">
          <Label htmlFor="area">
            Área <span className="text-red-500">*</span>
          </Label>
          <Input
            id="area"
            {...register('area')}
            placeholder="Finanzas, Tecnología, Operaciones..."
            className={errors.area ? 'border-red-500' : ''}
          />
          {errors.area && <p className="text-sm text-red-500">{errors.area.message}</p>}
        </div>

        {/* Impact */}
        <div className="space-y-2">
          <Label htmlFor="impact">
            Impacto <span className="text-red-500">*</span>
          </Label>
          <Input
            id="impact"
            {...register('impact')}
            placeholder="Impacto financiero, decisiones técnicas..."
            className={errors.impact ? 'border-red-500' : ''}
          />
          {errors.impact && <p className="text-sm text-red-500">{errors.impact.message}</p>}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">
            Descripción <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="description"
            {...register('description')}
            placeholder="Descripción general del perfil..."
            rows={4}
            className={errors.description ? 'border-red-500' : ''}
          />
          {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
        </div>

        {/* Key Focus */}
        <div className="space-y-2">
          <Label htmlFor="key_focus">
            Enfoque Clave <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="key_focus"
            {...register('key_focus')}
            placeholder="Puntos clave en los que se enfoca este perfil..."
            rows={3}
            className={errors.key_focus ? 'border-red-500' : ''}
          />
          {errors.key_focus && <p className="text-sm text-red-500">{errors.key_focus.message}</p>}
        </div>

        {/* Communication Style */}
        <div className="space-y-2">
          <Label htmlFor="communication_style">
            Estilo de Comunicación <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="communication_style"
            {...register('communication_style')}
            placeholder="Cómo se comunica este perfil..."
            rows={3}
            className={errors.communication_style ? 'border-red-500' : ''}
          />
          {errors.communication_style && (
            <p className="text-sm text-red-500">{errors.communication_style.message}</p>
          )}
        </div>

        {/* Active Status */}
        {!isNewProfile && (
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div>
              <Label htmlFor="is_active" className="text-base font-medium">
                Estado
              </Label>
              <p className="text-sm text-slate-600">
                {isActive ? 'El perfil está activo y visible para los usuarios' : 'El perfil está inactivo y no visible'}
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
            {isNewProfile ? 'Crear Perfil' : 'Guardar Cambios'}
          </Button>
        </div>
      </form>
    </div>
  );
}
