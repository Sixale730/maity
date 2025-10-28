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
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from '@/ui/components/ui/use-toast';
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

      // Create evaluation request
      // Tech Week: Always evaluate, no minimum thresholds
      const shouldEvaluate = true;

      if (shouldEvaluate && env.n8nWebhookUrl && currentUserId) {
        console.log('📤 Creating evaluation for n8n processing...', {
          sessionId: finalSessionId,
          userId: currentUserId,
          transcriptLength: transcript.length
        });

        // Create Tech Week evaluation (uses tech_week_evaluations table)
        const requestId = await TechWeekService.createEvaluation(
          finalSessionId,
          currentUserId
        );

        // Defensive check: MUST have valid requestId before sending to n8n
        if (!requestId || typeof requestId !== 'string') {
          console.error('❌ CRITICAL: Failed to create Tech Week evaluation', {
            requestId,
            sessionId: finalSessionId,
            userId: currentUserId
          });
          toast({
            variant: 'destructive',
            title: 'Error de Evaluación',
            description: 'No se pudo crear la solicitud de evaluación. La sesión se guardó pero no se evaluará.'
          });
          // DO NOT send to n8n if evaluation creation failed
          return;
        }

        console.log('✅ Tech Week evaluation request created:', requestId);

        // Send to n8n webhook (same as roleplay, but with tech_week identifier)
        const webhookPayload = {
          request_id: requestId,
          session_id: finalSessionId,
          user_id: currentUserId,
          user_name: userProfile?.name || 'Usuario',
          feature: 'tech-week', // Identifier for backend to use tech_week tables
          profile: 'Tech Week',
          scenario_code: scenario.scenario.code || 'tech_week_general',
          scenario_name: scenario.scenario.name || 'Tech Week - General',
          transcript,
          duration_seconds: duration,
          timestamp: new Date().toISOString()
        };

        try {
          await fetch(env.n8nWebhookUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(webhookPayload)
          });
          console.log('✅ Sent to n8n webhook successfully', { requestId });
        } catch (webhookError) {
          console.error('❌ Error sending to n8n webhook:', webhookError);
          toast({
            variant: 'destructive',
            title: 'Error de Red',
            description: 'No se pudo enviar la evaluación. Verifica tu conexión.'
          });
        }
      }

      // Navigate to results
      setTimeout(() => {
        navigate(`/tech-week/sessions/${finalSessionId}`);
      }, 1000);

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
              <div>
                <h1 className="text-2xl font-bold" style={{ color: '#FF69B4' }}>
                  Tech Week
                </h1>
                <p className="text-sm text-gray-400">
                  Práctica de presentaciones técnicas y pitch sessions
                </p>
              </div>
            </div>
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
