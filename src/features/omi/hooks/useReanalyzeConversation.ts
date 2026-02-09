import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { reanalyzeConversation } from '../services/omi.service';

export function useReanalyzeConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) => reanalyzeConversation(conversationId),
    onSuccess: (_data, conversationId) => {
      queryClient.invalidateQueries({ queryKey: ['omi-conversations'] });
      queryClient.invalidateQueries({ queryKey: ['omi-conversation', conversationId] });
      toast.success('Análisis regenerado correctamente');
    },
    onError: (error) => {
      toast.error('Error al reanalizar conversación');
      console.error('Reanalyze conversation error:', error);
    },
  });
}
