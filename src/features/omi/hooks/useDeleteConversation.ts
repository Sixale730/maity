import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { deleteConversation } from '../services/omi.service';

export function useDeleteConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) => deleteConversation(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['omi-conversations'] });
      toast.success('Conversación eliminada');
    },
    onError: (error) => {
      toast.error('Error al eliminar conversación');
      console.error('Delete conversation error:', error);
    },
  });
}
