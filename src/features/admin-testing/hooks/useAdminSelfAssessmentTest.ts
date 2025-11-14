import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { RegistrationFormService } from '@maity/shared/src/domain/registration/registration.service';
import { LikertOnlyData, LikertValue } from '@maity/shared/src/domain/registration/registration.types';
import { useUser } from '@/contexts/UserContext';
import { toast } from '@/ui/components/ui/use-toast';

/**
 * Hook for admin self-assessment testing
 * Allows admins to test the self-assessment form by updating only Likert questions (q5-q16)
 */
export function useAdminSelfAssessmentTest() {
  const { userProfile } = useUser();
  const queryClient = useQueryClient();

  // Form state for 12 Likert questions
  const [formData, setFormData] = useState<LikertOnlyData>({
    q5: 3,
    q6: 3,
    q7: 3,
    q8: 3,
    q9: 3,
    q10: 3,
    q11: 3,
    q12: 3,
    q13: 3,
    q14: 3,
    q15: 3,
    q16: 3,
  });

  // Update mutation
  const mutation = useMutation({
    mutationFn: async (data: LikertOnlyData) => {
      if (!userProfile?.id) {
        throw new Error('Usuario no autenticado');
      }
      return RegistrationFormService.updateSelfAssessmentOnly(userProfile.id, data);
    },
    onSuccess: (result) => {
      if (result.success) {
        toast({
          title: 'Autoevaluación actualizada',
          description: 'Tu autoevaluación de prueba se ha guardado exitosamente. Cambia a vista de usuario para ver los resultados en el radar.',
          variant: 'default',
        });
        // Invalidate form responses query to refresh dashboard
        queryClient.invalidateQueries({ queryKey: ['form_responses'] });
        queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
      } else {
        toast({
          title: 'Error',
          description: result.error || 'No se pudo guardar la autoevaluación',
          variant: 'destructive',
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Error inesperado al guardar la autoevaluación',
        variant: 'destructive',
      });
    },
  });

  /**
   * Update a single Likert question value
   */
  const updateQuestion = (questionId: keyof LikertOnlyData, value: LikertValue) => {
    setFormData((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  /**
   * Reset all questions to default value (3)
   */
  const resetForm = () => {
    setFormData({
      q5: 3,
      q6: 3,
      q7: 3,
      q8: 3,
      q9: 3,
      q10: 3,
      q11: 3,
      q12: 3,
      q13: 3,
      q14: 3,
      q15: 3,
      q16: 3,
    });
  };

  /**
   * Set preset values for testing
   */
  const setPreset = (preset: 'low' | 'medium' | 'high' | 'mixed') => {
    switch (preset) {
      case 'low':
        setFormData({
          q5: 1, q6: 2, q7: 1, q8: 2,
          q9: 2, q10: 1, q11: 2, q12: 1,
          q13: 1, q14: 2, q15: 2, q16: 1,
        });
        break;
      case 'high':
        setFormData({
          q5: 5, q6: 5, q7: 5, q8: 4,
          q9: 5, q10: 4, q11: 5, q12: 5,
          q13: 4, q14: 5, q15: 5, q16: 5,
        });
        break;
      case 'mixed':
        setFormData({
          q5: 2, q6: 4, q7: 3, q8: 5,
          q9: 1, q10: 5, q11: 2, q12: 4,
          q13: 3, q14: 2, q15: 5, q16: 3,
        });
        break;
      case 'medium':
      default:
        resetForm();
        break;
    }
  };

  /**
   * Submit the form
   */
  const submitForm = () => {
    mutation.mutate(formData);
  };

  return {
    formData,
    updateQuestion,
    resetForm,
    setPreset,
    submitForm,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
  };
}
