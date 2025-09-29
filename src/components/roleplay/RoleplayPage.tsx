import React, { useState, useEffect } from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { RoleplayVoiceAssistant } from './RoleplayVoiceAssistant';
import { PrePracticeQuestionnaire } from './PrePracticeQuestionnaire';
import { ScenarioInstructions } from './ScenarioInstructions';
import { SessionResults } from './SessionResults';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { createEvaluation, useEvaluationRealtime } from '@/hooks/useEvaluationRealtime';
import { env } from '@/lib/env';

export function RoleplayPage() {
  const { toast } = useToast();
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [userId, setUserId] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [questionnaireData, setQuestionnaireData] = useState<{
    mostDifficultProfile: 'CEO' | 'CTO' | 'CFO';
    practiceStartProfile: 'CEO' | 'CTO' | 'CFO';
    questionnaireId: string;
  } | null>(null);

  // Estado para el escenario actual con información completa
  const [currentScenario, setCurrentScenario] = useState<{
    scenarioName: string;
    scenarioCode: string;
    scenarioOrder: number;
    minScoreToPass: number;
    isLocked: boolean;
    progressId: string;
    // Información del perfil
    profileDescription: string;
    profileKeyFocus: string;
    profileCommunicationStyle: string;
    profilePersonalityTraits: any;
    // Información de dificultad
    difficultyLevel: number;
    difficultyName: string;
    difficultyMood: string;
    difficultyObjectionFrequency: number;
    difficultyTimePressure: boolean;
    difficultyInterruptionTendency: number;
  } | null>(null);

  // Estado para la sesión actual
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [sessionResults, setSessionResults] = useState<any>(null);

  // Estado para la evaluación
  const [evaluationRequestId, setEvaluationRequestId] = useState<string | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  // Hook para escuchar actualizaciones de evaluación en tiempo real
  const { evaluation, isLoading: evaluationLoading, error: evaluationError } = useEvaluationRealtime({
    requestId: evaluationRequestId || '',
    onComplete: async (result) => {
      console.log('✅ [RoleplayPage] Evaluación completada en tiempo real:', result);

      // Actualizar los resultados con la evaluación real
      setSessionResults(prev => ({
        ...prev,
        score: result.score,
        passed: result.score >= (currentScenario?.minScoreToPass || 70),
        isProcessing: false,
        evaluation: result
      }));

      // Actualizar voice_session con los resultados
      if (currentSessionId) {
        const { error: updateError } = await supabase
          .schema('maity')
          .from('voice_sessions')
          .update({
            score: result.score,
            processed_feedback: result,
            status: 'completed',
            ended_at: new Date().toISOString()
          })
          .eq('id', currentSessionId);

        if (updateError) {
          console.error('❌ [RoleplayPage] Error actualizando voice_session:', updateError);
        } else {
          console.log('✅ [RoleplayPage] voice_session actualizada con resultados');
        }
      }

      setIsEvaluating(false);
    },
    onError: (errorMessage) => {
      console.error('❌ [RoleplayPage] Error en evaluación:', errorMessage);

      // Actualizar resultados con error
      setSessionResults(prev => ({
        ...prev,
        isProcessing: false,
        error: errorMessage
      }));

      toast({
        title: "Error en evaluación",
        description: errorMessage,
        variant: "destructive"
      });

      setIsEvaluating(false);
    }
  });

  useEffect(() => {
    checkUserAndQuestionnaire();
  }, []);

  useEffect(() => {
    if (questionnaireData && userId) {
      fetchCurrentScenario();
    }
  }, [questionnaireData, userId]);

  const checkUserAndQuestionnaire = async () => {
    try {
      // Obtener usuario actual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Obtener el ID, nombre, nickname y email del usuario
      const { data: userData } = await supabase
        .from('users')
        .select('id, name, nickname, email')
        .eq('auth_id', user.id)
        .single();

      if (!userData) return;

      setUserId(userData.id);
      // Usar email o nickname si name está vacío
      const displayName = userData.name?.trim() ||
                         userData.nickname?.trim() ||
                         userData.email?.split('@')[0] ||
                         'Usuario';
      setUserName(displayName);

      console.log('📝 Usuario obtenido:', {
        id: userData.id,
        name: userData.name,
        nickname: userData.nickname,
        email: userData.email,
        displayNameSet: displayName
      });

      // Verificar si ya respondió el cuestionario alguna vez
      const { data: existingQuestionnaire } = await supabase
        .from('voice_pre_practice_questionnaire')
        .select('*')
        .eq('user_id', userData.id)
        .order('answered_at', { ascending: false })
        .limit(1)
        .single();

      if (!existingQuestionnaire) {
        // Nunca ha respondido, mostrar cuestionario
        setShowQuestionnaire(true);
      } else {
        // Ya respondió alguna vez, usar esos datos
        setQuestionnaireData({
          mostDifficultProfile: existingQuestionnaire.most_difficult_profile,
          practiceStartProfile: existingQuestionnaire.practice_start_profile,
          questionnaireId: existingQuestionnaire.id
        });
      }
    } catch (error) {
      console.error('Error checking questionnaire:', error);
    }
  };

  const fetchCurrentScenario = async () => {
    if (!userId || !questionnaireData) return;

    try {
      // Obtener o crear progreso del usuario
      const { data: progress, error } = await supabase.rpc('get_or_create_user_progress', {
        p_user_id: userId,
        p_profile_name: questionnaireData.practiceStartProfile
      });

      if (error) throw error;

      if (progress && progress.length > 0) {
        const scenarioInfo = progress[0];

        console.log('🎮 Información del escenario obtenida:', {
          profile: questionnaireData.practiceStartProfile,
          scenario: scenarioInfo.current_scenario_name,
          scenarioCode: scenarioInfo.current_scenario_code,
          difficultyLevel: scenarioInfo.difficulty_level,
          difficultyName: scenarioInfo.difficulty_name,
          difficultyMood: scenarioInfo.difficulty_mood,
          profileDescription: scenarioInfo.profile_description,
          profileKeyFocus: scenarioInfo.profile_key_focus,
          profileCommunicationStyle: scenarioInfo.profile_communication_style
        });

        setCurrentScenario({
          scenarioName: scenarioInfo.current_scenario_name,
          scenarioCode: scenarioInfo.current_scenario_code,
          scenarioOrder: scenarioInfo.current_scenario_order,
          minScoreToPass: parseFloat(scenarioInfo.min_score_to_pass),
          isLocked: scenarioInfo.is_locked,
          progressId: scenarioInfo.progress_id,
          // Información del perfil
          profileDescription: scenarioInfo.profile_description,
          profileKeyFocus: scenarioInfo.profile_key_focus,
          profileCommunicationStyle: scenarioInfo.profile_communication_style,
          profilePersonalityTraits: scenarioInfo.profile_personality_traits,
          // Información de dificultad
          difficultyLevel: scenarioInfo.difficulty_level,
          difficultyName: scenarioInfo.difficulty_name,
          difficultyMood: scenarioInfo.difficulty_mood,
          difficultyObjectionFrequency: scenarioInfo.difficulty_objection_frequency,
          difficultyTimePressure: scenarioInfo.difficulty_time_pressure,
          difficultyInterruptionTendency: scenarioInfo.difficulty_interruption_tendency
        });

        // NO crear sesión aquí - se creará cuando el usuario inicie la práctica
        console.log('ℹ️ [RoleplayPage] Escenario listo. La sesión se creará cuando el usuario inicie la práctica.');
      }
    } catch (error) {
      console.error('Error fetching scenario:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar el escenario actual",
        variant: "destructive"
      });
    }
  };

  const handleSessionStart = async () => {
    console.log('🎯 [RoleplayPage] Iniciando sesión de práctica...');

    if (!userId || !questionnaireData) {
      console.error('❌ [RoleplayPage] No se puede iniciar sesión sin userId o questionnaireData');
      return null;
    }

    try {
      console.log('🎯 [RoleplayPage] Creando voice_session con:', {
        p_user_id: userId,
        p_profile_name: questionnaireData.practiceStartProfile,
        p_questionnaire_id: questionnaireData.questionnaireId,
        timestamp: new Date().toISOString()
      });

      const { data: sessionId, error: sessionError } = await supabase.rpc('create_voice_session', {
        p_user_id: userId,
        p_profile_name: questionnaireData.practiceStartProfile,
        p_questionnaire_id: questionnaireData.questionnaireId
      });

      if (sessionError) {
        console.error('❌ [RoleplayPage] Error al crear voice_session:', sessionError);
        toast({
          title: "Error",
          description: "No se pudo crear la sesión de práctica",
          variant: "destructive"
        });
        return null;
      }

      if (sessionId) {
        console.log('✅ [RoleplayPage] voice_session creada exitosamente:', {
          sessionId,
          sessionIdType: typeof sessionId,
          userId,
          profile: questionnaireData.practiceStartProfile,
          timestamp: new Date().toISOString()
        });

        // Asegurarnos de que sessionId es un string
        const sessionIdString = typeof sessionId === 'string' ? sessionId : sessionId.toString();
        setCurrentSessionId(sessionIdString);
        console.log('📝 [RoleplayPage] currentSessionId actualizado:', sessionIdString);

        return sessionIdString;
      } else {
        console.warn('⚠️ [RoleplayPage] create_voice_session no retornó sessionId');
        return null;
      }
    } catch (error) {
      console.error('❌ [RoleplayPage] Error al crear sesión:', error);
      return null;
    }
  };

  const handleSessionEnd = async (transcript: string, duration: number) => {
    console.log('🎯 [RoleplayPage] handleSessionEnd iniciado:', {
      transcriptLength: transcript.length,
      duration,
      sessionId: currentSessionId,
      userId
    });

    if (!currentSessionId || !userId) {
      console.error('❌ [RoleplayPage] No se puede evaluar sin sessionId o userId');
      toast({
        title: "Error",
        description: "Información de sesión incompleta",
        variant: "destructive"
      });
      return;
    }

    setIsEvaluating(true);

    try {
      // 1. Generar request_id único
      const requestId = crypto.randomUUID();
      console.log('📝 [RoleplayPage] Request ID generado:', requestId);

      // 2. Crear registro en evaluations
      console.log('💾 [RoleplayPage] Creando registro en evaluations...', {
        requestId,
        userId,
        currentSessionId,
        hasSessionId: !!currentSessionId
      });

      // Verificar que la sesión existe y pertenece al usuario
      let sessionCheck = null;
      if (currentSessionId) {
        const { data, error: sessionError } = await supabase
          .schema('maity')
          .from('voice_sessions')
          .select('id, user_id')
          .eq('id', currentSessionId)
          .single();

        sessionCheck = data;

        console.log('🔍 [RoleplayPage] Verificación de voice_session:', {
          sessionId: currentSessionId,
          found: !!sessionCheck,
          sessionUserId: sessionCheck?.user_id,
          currentUserId: userId,
          match: sessionCheck?.user_id === userId,
          error: sessionError
        });
      }

      // Si la sesión no es válida, crear evaluación sin vincular
      const sessionToLink = currentSessionId && sessionCheck ? currentSessionId : undefined;

      const { data: evaluationData, error: createError } = await createEvaluation(
        requestId,
        userId, // Este es el maity.users.id
        sessionToLink // Vincular solo si es válida
      );

      if (createError) {
        console.error('❌ [RoleplayPage] Error al crear evaluation:', createError);
        toast({
          title: "Error",
          description: "No se pudo iniciar la evaluación",
          variant: "destructive"
        });
        setIsEvaluating(false);
        return;
      }

      console.log('✅ [RoleplayPage] Evaluation creada:', evaluationData);
      setEvaluationRequestId(requestId);

      // 3. Enviar transcript a n8n para procesamiento
      const n8nWebhookUrl = env.n8nWebhookUrl;

      console.log('📤 [RoleplayPage] Enviando transcript a n8n...', {
        url: n8nWebhookUrl,
        requestId,
        sessionId: currentSessionId,
        transcriptPreview: transcript.substring(0, 100) + '...'
      });

      // Solo intentar enviar a n8n si tenemos una URL válida
      if (n8nWebhookUrl && !n8nWebhookUrl.includes('webhook.site')) {
        fetch(n8nWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            request_id: requestId,
            session_id: currentSessionId,
            transcript: transcript,
            metadata: {
              user_id: userId,
              profile: questionnaireData?.practiceStartProfile,
              scenario: currentScenario?.scenarioName,
              difficulty: currentScenario?.difficultyLevel,
              duration_seconds: duration
            }
          })
        }).then(response => {
          if (response.ok) {
            console.log('✅ [RoleplayPage] Transcript enviado a n8n exitosamente');
          } else {
            console.error('❌ [RoleplayPage] Error al enviar a n8n:', response.status);
          }
        }).catch(error => {
          console.error('❌ [RoleplayPage] Error de red al enviar a n8n:', error);
          console.log('ℹ️ [RoleplayPage] Continuando sin n8n. La evaluación quedará pendiente.');
        });
      } else {
        console.log('⚠️ [RoleplayPage] n8n webhook no configurado. La evaluación quedará pendiente hasta que n8n la procese.');
      }

      // 4. Por ahora mostrar resultados temporales mientras se procesa
      console.log('⏳ [RoleplayPage] Mostrando resultados temporales mientras n8n procesa...');
      setSessionResults({
        sessionId: currentSessionId,
        profile: questionnaireData?.practiceStartProfile,
        scenarioName: currentScenario?.scenarioName,
        score: null, // Será actualizado cuando llegue la evaluación
        passed: null,
        duration: duration,
        isProcessing: true,
        requestId: requestId
      });
      setShowResults(true);

      // La evaluación real llegará por Realtime y actualizará los resultados

    } catch (error) {
      console.error('❌ [RoleplayPage] Error en handleSessionEnd:', error);
      toast({
        title: "Error",
        description: "Ocurrió un error al procesar la sesión",
        variant: "destructive"
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleRetryScenario = () => {
    setShowResults(false);
    setSessionResults(null);
    fetchCurrentScenario();
  };

  const handleNextScenario = () => {
    setShowResults(false);
    setSessionResults(null);
    fetchCurrentScenario();
  };

  const handleViewTranscript = () => {
    toast({
      title: "Transcripción",
      description: "La transcripción completa estará disponible pronto",
    });
  };

  const handleQuestionnaireComplete = (data: {
    mostDifficultProfile: 'CEO' | 'CTO' | 'CFO';
    practiceStartProfile: 'CEO' | 'CTO' | 'CFO';
    questionnaireId: string;
  }) => {
    setQuestionnaireData(data);
    setShowQuestionnaire(false);

    toast({
      title: "Configuración guardada",
      description: `Comenzando práctica con ${data.practiceStartProfile}`,
    });
  };

  // Si estamos mostrando resultados, mostrar esa pantalla
  if (showResults && sessionResults) {
    return (
      <SessionResults
        {...sessionResults}
        onRetry={handleRetryScenario}
        onViewTranscript={handleViewTranscript}
        canProceedNext={currentScenario ? currentScenario.scenarioOrder < 5 : false}
        onNextScenario={handleNextScenario}
      />
    );
  }

  return (
    <>
      {/* Cuestionario modal */}
      <PrePracticeQuestionnaire
        isOpen={showQuestionnaire}
        onClose={() => {
          // No permitir cerrar sin responder
          toast({
            title: "Completa el cuestionario",
            description: "Necesitas responder las preguntas para continuar",
            variant: "destructive"
          });
        }}
        onComplete={handleQuestionnaireComplete}
        userId={userId}
      />

      {/* Contenido principal */}
      <div className="flex-1 min-h-screen bg-black">
        <main className="w-full">
          {/* Header */}
          <div className="p-6">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="text-white hover:bg-white/10" />
              <div>
                <h1 className="text-3xl font-bold text-white">Roleplay de Ventas</h1>
                <p className="text-white/70">
                  {questionnaireData && currentScenario
                    ? `${questionnaireData.practiceStartProfile} - Escenario ${currentScenario.scenarioOrder}: ${currentScenario.scenarioName}`
                    : 'Practica tus habilidades de venta'}
                </p>
              </div>
            </div>
          </div>

          {/* Scenario Instructions */}
          {currentScenario && questionnaireData && (
            <div className="px-6 max-w-4xl mx-auto">
              <ScenarioInstructions
                scenarioName={currentScenario.scenarioName}
                scenarioCode={currentScenario.scenarioCode}
                profile={questionnaireData.practiceStartProfile}
                scenarioOrder={currentScenario.scenarioOrder}
                minScoreToPass={currentScenario.minScoreToPass}
              />
            </div>
          )}

          {/* Main Content - Voice Roleplay */}
          <div className="flex items-center justify-center min-h-[calc(100vh-350px)]">
            {questionnaireData && currentScenario ? (
              <>
                {console.log('📤 Pasando props a RoleplayVoiceAssistant:', {
                  userName,
                  userId,
                  selectedProfile: questionnaireData.practiceStartProfile,
                  scenarioName: currentScenario.scenarioName,
                  difficultyLevel: currentScenario.difficultyLevel
                })}
              <RoleplayVoiceAssistant
                selectedProfile={questionnaireData.practiceStartProfile}
                questionnaireId={questionnaireData.questionnaireId}
                userName={userName}
                userId={userId}
                scenarioCode={currentScenario.scenarioCode}
                scenarioName={currentScenario.scenarioName}
                sessionId={currentSessionId || undefined}
                onSessionStart={handleSessionStart}
                onSessionEnd={handleSessionEnd}
                // Información adicional del perfil y dificultad
                profileDescription={currentScenario.profileDescription}
                profileKeyFocus={currentScenario.profileKeyFocus}
                profileCommunicationStyle={currentScenario.profileCommunicationStyle}
                difficultyLevel={currentScenario.difficultyLevel}
                difficultyName={currentScenario.difficultyName}
                difficultyMood={currentScenario.difficultyMood}
              />
              </>
            ) : (
              <div className="text-center text-white">
                <p className="text-xl mb-4">Preparando tu sesión de práctica...</p>
                <p className="text-white/70">
                  {!questionnaireData
                    ? 'Por favor completa el cuestionario inicial'
                    : 'Cargando escenario...'}
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}