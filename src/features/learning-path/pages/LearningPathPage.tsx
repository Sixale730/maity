/**
 * LearningPathPage
 * Main page for the Duolingo-style learning path roadmap
 */

import { useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import { useInitializeLearningPath, useHasLearningPath } from '@maity/shared';
import { LearningPathRoadmap } from '../components/LearningPathRoadmap';
import { Loader2 } from 'lucide-react';

export function LearningPathPage() {
  const { userId, isLoading: userLoading } = useUser();
  const { hasPath, isLoading: checkingPath } = useHasLearningPath(userId);
  const initializePath = useInitializeLearningPath();

  // Auto-initialize path if user doesn't have one
  useEffect(() => {
    if (userId && !checkingPath && !hasPath && !initializePath.isPending) {
      initializePath.mutate(userId);
    }
  }, [userId, checkingPath, hasPath, initializePath]);

  if (userLoading || checkingPath || initializePath.isPending) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-500">Cargando tu ruta de aprendizaje...</p>
        </div>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-500">No se pudo cargar el usuario.</p>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Mi Ruta de Aprendizaje
        </h1>
        <p className="text-gray-500 mt-1">
          Sigue el camino para desarrollar tus habilidades de comunicación
        </p>
      </div>

      <LearningPathRoadmap userId={userId} />
    </div>
  );
}

export default LearningPathPage;
