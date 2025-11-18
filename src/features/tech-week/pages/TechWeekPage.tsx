/**
 * TechWeekPage - Simplified page for Tech Week voice practice
 *
 * This is a streamlined version of RoleplayPage focused on Tech Week scenarios.
 * Admin-only access for testing and demonstration purposes.
 *
 * NOTE: This component could be further refactored by extracting business logic
 * into custom hooks (e.g., useTechWeekSession, useTechWeekEvaluation).
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { TechWeekService, supabase } from '@maity/shared';
import { TechWeekVoiceAssistant } from '../components/TechWeekVoiceAssistant';
import { TechWeekInstructions } from '../components/TechWeekInstructions';
import { Button } from '@/ui/components/ui/button';
import { ArrowLeft, Loader2, History } from 'lucide-react';
import { toast } from '@/shared/hooks/use-toast';
import { env } from '@/lib/env';

export function TechWeekPage() {
  const navigate = useNavigate();
  const { userProfile } = useUser();

  // State
  const [isLoading, setIsLoading] = useState(true);
  const [scenario, setScenario] = useState<any>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showPractice, setShowPractice] = useState(false);

  // Load Tech Week scenario
  useEffect(() => {
    const loadScenario = async () => {
      try {
        setIsLoading(true);

        // Get Tech Week scenario from database
        const { data: profileData, error: profileError } = await supabase
          .schema('maity')
          .from('voice_agent_profiles')
          .select('id, name, description')
          .eq('name', 'Tech Week')
          .single();

        if (profileError) {
          console.error('Error loading Tech Week profile:', profileError);
          toast({
            variant: 'destructive',
            title: 'Error',
            description: 'No se pudo cargar el perfil de Tech Week'
          });
          return;
        }

        // Get Tech Week scenario
        const { data: scenarioData, error: scenarioError } = await supabase
          .schema('maity')
          .from('voice_scenarios')
          .select('*')
          .eq('code', 'tech_week_general')
          .single();

        if (scenarioError) {
          console.error('Error loading Tech Week scenario:', scenarioError);
          toast({
            variant: 'destructive',
            title: 'Error',
            description: 'No se pudo cargar el escenario de Tech Week'
          });
          return;
        }

        // Get profile_scenario config
        const { data: configData } = await supabase
          .schema('maity')
          .from('voice_profile_scenarios')
          .select('*')
          .eq('profile_id', profileData.id)
          .eq('scenario_id', scenarioData.id)
          .single();

        setScenario({
          profile: profileData,
          scenario: scenarioData,
          config: configData
        });

      } catch (error) {
        console.error('Error in loadScenario:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Error inesperado al cargar Tech Week'
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadScenario();
  }, []);

  // Handle session start
  const handleSessionStart = async () => {
    try {
      if (!userProfile?.auth_id || !scenario) {
        throw new Error('Usuario o escenario no disponible');
      }

      // Obtener maity.users.id (igual que RoleplayPage)
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', userProfile.auth_id)
        .single();

      if (!userData?.id) {
        throw new Error('No se pudo obtener el ID del usuario');
      }

      console.log('🎯 Creating Tech Week session...');

      // Create Tech Week session (uses isolated tech_week_sessions table)
      const sessionId = await TechWeekService.createSession(userData.id);

      if (!sessionId || typeof sessionId !== 'string') {
        throw new Error('No se pudo crear la sesión');
      }

      console.log('✅ Tech Week session created:', sessionId);
      setCurrentSessionId(sessionId);
      setCurrentUserId(userData.id); // Guardar para usar en handleSessionEnd

      return sessionId;
    } catch (error) {
      console.error('Error creating Tech Week session:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo crear la sesión de práctica'
      });
      return null;
    }
  };

  // Handle session end
  const handleSessionEnd = async (
    transcript: string,
    duration: number,
    sessionId?: string,
    messages?: Array<{ id: string; timestamp: Date; source: 'user' | 'ai'; message: string }>
  ) => {
    try {
      const finalSessionId = sessionId || currentSessionId;

      if (!finalSessionId) {
        console.error('No session ID available');
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'No se pudo finalizar la sesión'
        });
        return;
      }

      console.log('📝 Ending Tech Week session:', {
        sessionId: finalSessionId,
        transcriptLength: transcript.length,
        duration,
        messagesCount: messages?.length || 0
      });

      // Update Tech Week session with transcript and duration
      await TechWeekService.updateSession(finalSessionId, {
        transcript,
        duration_seconds: duration,
        ended_at: new Date().toISOString(),
        status: 'completed'
      });

      // Create evaluation request via OpenAI API
      // Tech Week: Always evaluate, no minimum thresholds
      const shouldEvaluate = true;

      if (shouldEvaluate && currentUserId) {
        console.log('📤 Calling Tech Week evaluation API...', {
          sessionId: finalSessionId,
          userId: currentUserId,
          transcriptLength: transcript.length
        });

        try {
          // Get access token for API authentication
          const { data: { session: authSession } } = await supabase.auth.getSession();
          if (!authSession?.access_token) {
            throw new Error('No authentication session');
          }

          // Call Tech Week evaluation API (OpenAI direct)
          const response = await fetch(`${env.apiUrl}/api/evaluate-tech-week`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authSession.access_token}`,
            },
            body: JSON.stringify({
              session_id: finalSessionId,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Evaluation failed');
          }

          const result = await response.json();
          console.log('✅ Tech Week evaluation completed:', {
            sessionId: finalSessionId,
            score: result.evaluation?.score,
            passed: result.evaluation?.passed
          });

          // Navigate immediately since evaluation is synchronous
          navigate(`/tech-week/sessions/${finalSessionId}`);
          return;

        } catch (apiError) {
          console.error('❌ Error calling evaluation API:', apiError);
          toast({
            variant: 'destructive',
            title: 'Error de Evaluación',
            description: 'No se pudo completar la evaluación. La sesión se guardó.'
          });
        }
      }

      // Fallback navigation if evaluation didn't redirect
      navigate(`/tech-week/sessions/${finalSessionId}`);

    } catch (error) {
      console.error('Error handling session end:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Error al finalizar la sesión'
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: '#FF69B4' }} />
          <p className="text-gray-400">Cargando Tech Week...</p>
        </div>
      </div>
    );
  }

  if (!scenario) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <p className="text-red-400">No se pudo cargar el escenario de Tech Week</p>
          <Button
            onClick={() => navigate('/dashboard')}
            variant="outline"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="hover:bg-gray-800"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
              <h1 className="text-2xl font-bold" style={{ color: '#FF69B4' }}>
                Tech Week
              </h1>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/tech-week/sessions')}
              className="border-[#FF69B4]/40 hover:bg-[#FF69B4]/20 text-[#FF69B4]"
            >
              <History className="h-4 w-4 mr-2" />
              Historial
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {!showPractice ? (
          /* Instructions View */
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <TechWeekInstructions
                scenarioName={scenario.scenario.name}
                userInstructions={scenario.config?.user_instructions}
                minScoreToPass={scenario.config?.min_score_to_pass || 70}
              />

              <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 space-y-4">
                <h2 className="text-xl font-semibold" style={{ color: '#FF69B4' }}>
                  ¿Listo para practicar?
                </h2>

                <div className="space-y-3 text-sm text-gray-400">
                  <p>
                    Esta sesión de Tech Week te permitirá practicar presentaciones técnicas,
                    pitch sessions, y conversaciones profesionales del ecosistema tecnológico.
                  </p>

                  <div className="space-y-2">
                    <p className="font-medium text-gray-300">Antes de comenzar:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Asegúrate de tener tu micrófono funcionando</li>
                      <li>Busca un lugar tranquilo sin distracciones</li>
                      <li>Prepara tu elevator pitch mental</li>
                      <li>Relájate y habla con naturalidad</li>
                    </ul>
                  </div>
                </div>

                <Button
                  onClick={() => setShowPractice(true)}
                  className="w-full py-6 text-lg font-semibold hover:scale-105 transition-transform"
                  style={{
                    backgroundColor: '#FF69B4',
                    color: 'white'
                  }}
                >
                  Iniciar Práctica
                </Button>
              </div>
            </div>
          </div>
        ) : (
          /* Practice View */
          <div className="max-w-7xl mx-auto">
            <TechWeekVoiceAssistant
              userName={userProfile?.name}
              userId={userProfile?.id}
              sessionId={currentSessionId || undefined}
              onSessionStart={handleSessionStart}
              onSessionEnd={handleSessionEnd}
              scenarioName={scenario.scenario.name}
              scenarioDescription={scenario.scenario.context}
              objectives={JSON.stringify(scenario.scenario.objectives)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
