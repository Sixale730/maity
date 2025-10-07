import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { SessionResults } from '@/components/roleplay/SessionResults';
import { Button } from '@/components/ui/button';
import { ArrowLeft, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface SessionData {
  id: string;
  profile_name: string;
  scenario_name: string;
  objectives: string | null;
  score: number | null;
  passed: boolean | null;
  duration_seconds: number | null;
  started_at: string;
  ended_at: string | null;
  processed_feedback: any;
  status: string;
  raw_transcript: string | null;
}

export default function SessionResultsPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTranscript, setShowTranscript] = useState(false);

  useEffect(() => {
    if (sessionId) {
      fetchSessionData();
    }
  }, [sessionId]);

  const fetchSessionData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get authenticated user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Usuario no autenticado');
        return;
      }

      // Fetch session data using RPC
      const { data: sessions, error: fetchError } = await supabase
        .rpc('get_user_sessions_history', { p_auth_id: user.id });

      if (fetchError) {
        console.error('Error fetching session:', fetchError);
        setError('No se pudo cargar la sesión');
        return;
      }

      // Find the specific session
      const session = sessions?.find((s: any) => s.id === sessionId);

      if (!session) {
        setError('Sesión no encontrada');
        return;
      }

      setSessionData(session);
    } catch (err) {
      console.error('Error:', err);
      setError('Ocurrió un error al cargar la sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    // Navigate to roleplay page to start a new session with the same profile
    navigate('/roleplay');
  };

  const handleViewTranscript = () => {
    setShowTranscript(true);
  };

  const handleBack = () => {
    navigate('/sessions');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando resultados...</p>
        </div>
      </div>
    );
  }

  if (error || !sessionData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || 'Sesión no encontrada'}</p>
          <Button onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al Historial
          </Button>
        </div>
      </div>
    );
  }

  // Calculate duration
  const duration = sessionData.duration_seconds ||
    (sessionData.started_at && sessionData.ended_at
      ? Math.floor((new Date(sessionData.ended_at).getTime() - new Date(sessionData.started_at).getTime()) / 1000)
      : 0);

  return (
    <div className="min-h-screen bg-black">
      <div className="p-4">
        <Button
          onClick={handleBack}
          variant="ghost"
          className="text-gray-400 hover:text-white"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al Historial
        </Button>
      </div>

      <SessionResults
        sessionId={sessionData.id}
        profile={sessionData.profile_name as 'CEO' | 'CTO' | 'CFO'}
        scenarioName={sessionData.scenario_name}
        objectives={sessionData.objectives || undefined}
        score={sessionData.score}
        passed={sessionData.passed}
        duration={duration}
        isProcessing={sessionData.status === 'evaluating'}
        evaluation={sessionData.processed_feedback}
        error={sessionData.status === 'abandoned' ? 'Sesión abandonada' : undefined}
        transcript={sessionData.raw_transcript}
        onRetry={handleRetry}
        onViewTranscript={handleViewTranscript}
        canProceedNext={false}
      />

      {/* Modal de Transcripción */}
      <Dialog open={showTranscript} onOpenChange={setShowTranscript}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Transcripción de la Sesión</DialogTitle>
            <DialogDescription className="text-gray-400">
              {sessionData.scenario_name} • Perfil {sessionData.profile_name}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            {sessionData.raw_transcript ? (
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <pre className="whitespace-pre-wrap text-sm text-gray-200 font-mono">
                  {sessionData.raw_transcript}
                </pre>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <p>No hay transcripción disponible para esta sesión</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
