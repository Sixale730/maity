import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LearningContentService, CreateLearningContentInput } from '../learning-content.service';

const LEARNING_CONTENT_KEY = ['learning-content'];

export function useLearningContent() {
  return useQuery({
    queryKey: LEARNING_CONTENT_KEY,
    queryFn: () => LearningContentService.getAllContent(),
  });
}

export function useCreateLearningContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateLearningContentInput) => LearningContentService.createContent(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LEARNING_CONTENT_KEY });
    },
  });
}

export function useDeleteLearningContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => LearningContentService.deleteContent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LEARNING_CONTENT_KEY });
    },
  });
}
