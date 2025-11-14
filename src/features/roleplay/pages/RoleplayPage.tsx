import { useState, useEffect, useCallback } from 'react';
import { SidebarTrigger } from '@/ui/components/ui/sidebar';
import { RoleplayVoiceAssistant } from '../components/RoleplayVoiceAssistant';
import { PrePracticeQuestionnaire } from '../components/PrePracticeQuestionnaire';
import { ScenarioInstructions } from '../components/ScenarioInstructions';
import { SessionResults } from '../components/SessionResults';
import { RoleplayRoadmap } from '../components/RoleplayRoadmap';
import { TranscriptViewer } from '../components/TranscriptViewer';
import { AdminRoleplaySelector } from '../components/AdminRoleplaySelector';
import { supabase, AuthService, RoleplayService } from '@maity/shared';
import { useToast } from '@/shared/hooks/use-toast';
import { env } from '@/lib/env';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/components/ui/tabs';
import { Map, Mic } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/ui/components/ui/dialog';

export function RoleplayPage() {
  const { toast } = useToast();
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [userId, setUserId] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [instructionsOpen, setInstructionsOpen] = useState(false);
  const [questionnaireData, setQuestionnaireData] = useState<{
    mostDifficultProfile: 'CEO' | 'CTO' | 'CFO';
    practiceStartProfile: 'CEO' | 'CTO' | 'CFO';
    questionnaireId: string;
  } | null>(null);

  // Estado para admin override (selección manual de perfil y escenario)
  const [adminOverride, setAdminOverride] = useState<{
    profile: 'CEO' | 'CTO' | 'CFO';
    scenarioCode: string;
    scenarioName: string;
  } | null>(null);

  // Estado para el escenario actual con información completa
  const [currentScenario, setCurrentScenario] = useState<{
    scenarioName: string;
    scenarioCode: string;
    scenarioOrder: number;
    minScoreToPass: number;
    isLocked: boolean;
    progressId: string;
    userInstructions: string | null;
    objectives: string;
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
  const [showTranscript, setShowTranscript] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState<string>('');

  // Estado para la evaluación
  const [_isEvaluating, setIsEvaluating] = useState(false);
  const [isReEvaluating, setIsReEvaluating] = useState(false);

  useEffect(() => {
    checkUserAndQuestionnaire();
  }, []);

  // Efecto combinado para detectar cambios en questionnaireData o adminOverride
  useEffect(() => {
    // Admin mode: solo necesitamos adminOverride y userId
    if (isAdmin && adminOverride && userId) {
      console.log('🔐 [useEffect] Admin override detectado, cargando escenario...');
      fetchCurrentScenario();
      return;
    }

    // Normal mode: necesitamos questionnaireData y userId
    if (!isAdmin && questionnaireData && userId) {
      console.log('👤 [useEffect] Modo normal, cargando escenario...');
      fetchCurrentScenario();
    }
  }, [questionnaireData, userId, isAdmin, adminOverride]);

  // Helper function para obtener el perfil actual (admin override o questionnaire)
  const getCurrentProfile = (): 'CEO' | 'CTO' | 'CFO' | null => {
    if (isAdmin && adminOverride) {
      return adminOverride.profile;
    }
    return questionnaireData?.practiceStartProfile || null;
  };

  const checkUserAndQuestionnaire = async () => {
    try {
      // Obtener usuario actual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsInitialLoading(false);
        return;
      }

      // Obtener el ID, nombre, nickname y email del usuario
      const { data: userData } = await supabase
        .from('users')
        .select('id, name, nickname, email')
        .eq('auth_id', user.id)
        .single();

      if (!userData) {
        setIsInitialLoading(false);
        return;
      }

      setUserId(userData.id as string);
      // Usar email o nickname si name está vacío
      const displayName = userData.name?.trim() ||
                         userData.nickname?.trim() ||
                         userData.email?.split('@')[0] ||
                         'Usuario';
      setUserName(displayName);

      // Verificar si es admin
      const roles = await AuthService.getMyRoles();
      const isUserAdmin = roles?.includes('admin') || false;
      setIsAdmin(isUserAdmin);

      console.log('📝 Usuario obtenido:', {
        id: userData.id,
        name: userData.name,
        nickname: userData.nickname,
        email: userData.email,
        displayNameSet: displayName,
        isAdmin: isUserAdmin
      });

      // Verificar si ya respondió el cuestionario alguna vez
      const { data: existingQuestionnaire, error: questionnaireError } = await supabase
        .from('voice_pre_practice_questionnaire')
        .select('*')
        .eq('user_id', userData.id as string)
        .order('answered_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (questionnaireError) {
        console.error('Error fetching questionnaire:', questionnaireError);
        setShowQuestionnaire(true);
      } else if (!existingQuestionnaire) {
        // Nunca ha respondido, mostrar cuestionario
        setShowQuestionnaire(true);
      } else {
        // Ya respondió alguna vez, usar esos datos del más reciente
        console.log('📋 Cuestionario encontrado:', {
          id: existingQuestionnaire.id,
          answered_at: existingQuestionnaire.answered_at,
          practice_start_profile: existingQuestionnaire.practice_start_profile
        });

        if (existingQuestionnaire.most_difficult_profile &&
            existingQuestionnaire.practice_start_profile &&
            existingQuestionnaire.id) {
          setQuestionnaireData({
            mostDifficultProfile: existingQuestionnaire.most_difficult_profile as 'CEO' | 'CTO' | 'CFO',
            practiceStartProfile: existingQuestionnaire.practice_start_profile as 'CEO' | 'CTO' | 'CFO',
            questionnaireId: existingQuestionnaire.id
          });
        } else {
          console.warn('📋 Cuestionario incompleto, mostrando cuestionario nuevo');
          setShowQuestionnaire(true);
        }
      }
    } catch (error) {
      console.error('Error checking questionnaire:', error);
    } finally {
      setIsInitialLoading(false);
    }
  };

  const fetchCurrentScenario = async () => {
    if (!userId) return;

    try {
      // Si hay adminOverride, usar esa configuración en lugar del progreso
      if (isAdmin && adminOverride) {
        console.log('🔐 [ADMIN MODE] Usando configuración manual:', {
          profile: adminOverride.profile,
          scenarioCode: adminOverride.scenarioCode,
          scenarioName: adminOverride.scenarioName
        });

        const config = await RoleplayService.getProfileScenarioConfig(
          adminOverride.profile,
          adminOverride.scenarioCode
        );

        if (config && Array.isArray(config) && config.length > 0) {
          const scenarioInfo = config[0];

          setCurrentScenario({
            scenarioName: scenarioInfo.scenario_name,
            scenarioCode: scenarioInfo.scenario_code,
            scenarioOrder: scenarioInfo.scenario_order,
            minScoreToPass: parseFloat(scenarioInfo.min_score_to_pass),
            isLocked: false, // Admin nunca tiene escenarios bloqueados
            progressId: '', // No usar progreso en modo admin
            userInstructions: scenarioInfo.scenario_instructions || null,
            objectives: scenarioInfo.objectives || '',
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

          // NO actualizar questionnaireData aquí para evitar ciclo infinito
          // El perfil en adminOverride es suficiente para el modo admin

          console.log('✅ [ADMIN MODE] Escenario configurado:', scenarioInfo.scenario_name);
          return;
        }
      }

      // Flujo normal para usuarios no-admin o sin override
      if (!questionnaireData) return;

      // Obtener o crear progreso del usuario
      const progress = await RoleplayService.getOrCreateProgress(userId, questionnaireData.practiceStartProfile);

      if (progress && Array.isArray(progress) && progress.length > 0) {
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
          userInstructions: scenarioInfo.user_instructions || null,
          objectives: scenarioInfo.objectives || '',
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

    // En modo admin, usar adminOverride.profile; en modo normal, usar questionnaireData
    const profileToUse = (isAdmin && adminOverride)
      ? adminOverride.profile
      : questionnaireData?.practiceStartProfile;

    if (!userId || !profileToUse) {
      console.error('❌ [RoleplayPage] No se puede iniciar sesión sin userId o perfil', {
        userId,
        profileToUse,
        isAdmin,
        hasAdminOverride: !!adminOverride,
        hasQuestionnaireData: !!questionnaireData
      });
      return null;
    }

    try {
      console.log('🎯 [RoleplayPage] Creando voice_session con:', {
        p_user_id: userId,
        p_profile_name: profileToUse,
        p_questionnaire_id: questionnaireData?.questionnaireId || '',
        isAdminMode: isAdmin && !!adminOverride,
        timestamp: new Date().toISOString()
      });

      const sessionId = await RoleplayService.createSession(
        userId,
        profileToUse,
        questionnaireData?.questionnaireId || ''
      );

      if (sessionId && typeof sessionId === 'string') {
        console.log('✅ [RoleplayPage] voice_session creada exitosamente:', {
          sessionId,
          sessionIdType: typeof sessionId,
          userId,
          profile: profileToUse,
          timestamp: new Date().toISOString()
        });

        setCurrentSessionId(sessionId);
        console.log('📝 [RoleplayPage] currentSessionId actualizado:', sessionId);

        return sessionId;
      } else {
        console.warn('⚠️ [RoleplayPage] create_voice_session no retornó sessionId');
        return null;
      }
    } catch (error) {
      console.error('❌ [RoleplayPage] Error al crear sesión:', error);
      return null;
    }
  };

  /**
   * Evalúa una sesión usando OpenAI API directamente (sincrónico)
   */
  const evaluateSession = async (sessionId: string) => {
    try {
      console.log('🤖 [RoleplayPage] Evaluando sesión con OpenAI:', { sessionId });

      // Obtener token de autenticación del usuario
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('No hay sesión autenticada');
      }

      const payload = { session_id: sessionId };

      console.log('📤 [RoleplayPage] Llamando a API de evaluación...');

      const response = await fetch(`${env.apiUrl}/api/evaluate-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ [RoleplayPage] Error en evaluate-session:', {
          status: response.status,
          statusText: response.statusText,
          errorData
        });

        // Mensajes de error específicos según código de estado
        let errorMessage = 'Error al evaluar la sesión';
        if (response.status === 400) {
          errorMessage = errorData.error || 'La sesión no es válida para evaluación.';
        } else if (response.status === 401) {
          errorMessage = 'Tu sesión ha expirado. Por favor, inicia sesión de nuevo.';
        } else if (response.status === 429) {
          errorMessage = 'Has alcanzado el límite de evaluaciones. Por favor, intenta más tarde.';
        } else if (response.status === 500) {
          errorMessage = 'Error del servidor. Por favor, intenta de nuevo en unos momentos.';
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }

        throw new Error(errorMessage);
      }

      const { evaluation } = await response.json();
      console.log('✅ [RoleplayPage] Evaluación recibida:', evaluation);

      // Validar que se recibió data válida
      if (!evaluation || !evaluation.result) {
        console.error('❌ [RoleplayPage] Respuesta inválida del API:', evaluation);
        throw new Error('La evaluación no contiene los datos esperados. Por favor, intenta de nuevo.');
      }

      // Calcular score desde el resultado
      const result = evaluation.result;
      const evaluationScore = evaluation.score ??
        (result.dimension_scores?.clarity !== undefined
          ? Math.round((result.dimension_scores.clarity + result.dimension_scores.structure +
                       result.dimension_scores.connection + result.dimension_scores.influence) / 4)
          : 0);

      console.log('📊 [RoleplayPage] Score calculado:', {
        scoreFromAPI: evaluation.score,
        scoreCalculated: evaluationScore
      });

      // Actualizar resultados con la evaluación real
      setSessionResults((prev: any) => ({
        ...prev,
        score: evaluationScore,
        passed: evaluationScore >= (currentScenario?.minScoreToPass || 70),
        isProcessing: false,
        evaluation: result
      }));

      setIsEvaluating(false);

    } catch (error) {
      console.error('❌ [RoleplayPage] Error al evaluar sesión:', error);

      // Actualizar resultados con error
      setSessionResults((prev: any) => ({
        ...prev,
        isProcessing: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      }));

      toast({
        title: "Error en evaluación",
        description: error instanceof Error ? error.message : 'No se pudo procesar la evaluación',
        variant: "destructive"
      });

      setIsEvaluating(false);
      throw error;
    }
  };

  const handleSessionEnd = async (transcript: string, duration: number, voiceAssistantSessionId?: string, messages?: Array<{
    id: string;
    timestamp: Date;
    source: 'user' | 'ai';
    message: string;
  }>) => {
    console.log('🎯 [RoleplayPage] handleSessionEnd iniciado:', {
      transcriptLength: transcript.length,
      duration,
      sessionId: currentSessionId,
      voiceAssistantSessionId,
      messagesCount: messages?.length || 0,
      userMessages: messages?.filter(m => m.source === 'user').length || 0,
      aiMessages: messages?.filter(m => m.source === 'ai').length || 0,
      userId
    });

    // Usar el sessionId de RoleplayPage o el que viene de RoleplayVoiceAssistant
    let effectiveSessionId = currentSessionId || voiceAssistantSessionId;

    // Si no hay userId, no podemos continuar
    if (!userId) {
      console.error('❌ [RoleplayPage] No se puede evaluar sin userId');
      toast({
        title: "Error",
        description: "Usuario no identificado",
        variant: "destructive"
      });
      return;
    }

    // Si no hay sessionId, crear una nueva sesión antes de continuar
    if (!effectiveSessionId) {
      console.log('⚠️ [RoleplayPage] No hay sessionId, creando nueva sesión...');

      // Verificar que tenemos los datos necesarios para crear la sesión
      if (!questionnaireData) {
        console.error('❌ [RoleplayPage] No se puede crear sesión sin questionnaireData');
        toast({
          title: "Error",
          description: "Datos de configuración incompletos",
          variant: "destructive"
        });
        return;
      }

      try {
        console.log('🎯 [RoleplayPage] Creando voice_session de emergencia con:', {
          p_user_id: userId,
          p_profile_name: questionnaireData.practiceStartProfile,
          p_questionnaire_id: questionnaireData.questionnaireId,
          timestamp: new Date().toISOString()
        });

        const newSessionId = await RoleplayService.createSession(
          userId,
          questionnaireData.practiceStartProfile,
          questionnaireData.questionnaireId
        );

        console.log('✅ [RoleplayPage] Voice session creada de emergencia exitosamente:', newSessionId);
        effectiveSessionId = newSessionId || undefined;
        setCurrentSessionId(newSessionId); // Actualizar el estado para futuras referencias
      } catch (error) {
        console.error('❌ [RoleplayPage] Error inesperado al crear sesión de emergencia:', error);
        toast({
          title: "Error",
          description: "Error al crear la sesión",
          variant: "destructive"
        });
        return;
      }
    }

    console.log('✅ [RoleplayPage] Usando sessionId:', effectiveSessionId);

    setIsEvaluating(true);

    try {
      // 1. Guardar duration y transcript en voice_session
      if (effectiveSessionId) {
        console.log('💾 [RoleplayPage] Guardando duration y transcript en voice_session...', {
          sessionId: effectiveSessionId,
          duration,
          transcriptLength: transcript.length
        });

        const { error: updateSessionError } = await supabase
          .rpc('update_voice_session_transcript', {
            p_session_id: effectiveSessionId,
            p_duration_seconds: duration,
            p_raw_transcript: transcript
          });

        if (updateSessionError) {
          console.error('❌ [RoleplayPage] Error guardando duration y transcript:', updateSessionError);
        } else {
          console.log('✅ [RoleplayPage] Duration y transcript guardados exitosamente');
        }
      }

      // 2. Mostrar resultados temporales mientras se evalúa
      console.log('⏳ [RoleplayPage] Mostrando resultados temporales mientras OpenAI procesa...');
      setCurrentTranscript(transcript);
      setSessionResults({
        sessionId: effectiveSessionId,
        profile: questionnaireData?.practiceStartProfile,
        scenarioName: currentScenario?.scenarioName,
        objectives: currentScenario?.objectives,
        score: null,
        passed: null,
        duration: duration,
        isProcessing: true,
        transcript: transcript
      });
      setShowResults(true);

      // 3. Evaluar sesión con OpenAI (sincrónico)
      console.log('🤖 [RoleplayPage] Evaluando sesión con OpenAI...');
      await evaluateSession(effectiveSessionId);

    } catch (error) {
      console.error('❌ [RoleplayPage] Error en handleSessionEnd:', error);
      // evaluateSession ya maneja los errores y muestra toasts
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
    setShowTranscript(true);
  };

  const handleReEvaluate = async () => {
    if (!sessionResults?.sessionId) {
      toast({
        title: "Error",
        description: "No hay sesión para reevaluar",
        variant: "destructive"
      });
      return;
    }

    setIsReEvaluating(true);

    // Update UI to show processing state
    setSessionResults((prev: any) => ({
      ...prev,
      isProcessing: true,
      error: undefined
    }));

    try {
      console.log('🔄 [RoleplayPage] Reevaluando sesión:', sessionResults.sessionId);
      await evaluateSession(sessionResults.sessionId);

      toast({
        title: "Reevaluación completa",
        description: "La sesión ha sido reevaluada exitosamente",
      });
    } catch (error) {
      console.error('❌ Error en reevaluación:', error);
      // evaluateSession already handles error UI
    } finally {
      setIsReEvaluating(false);
    }
  };

  const handleQuestionnaireComplete = (data: {
    mostDifficultProfile: 'CEO' | 'CTO' | 'CFO';
    practiceStartProfile: 'CEO' | 'CTO' | 'CFO';
    questionnaireId: string;
  }) => {
    setQuestionnaireData(data);
    setShowQuestionnaire(false);

    // En móviles, abrir automáticamente las instrucciones
    const isMobile = window.innerWidth < 1024; // lg breakpoint
    if (isMobile) {
      setInstructionsOpen(true);
    }

    toast({
      title: "Configuración guardada",
      description: `Comenzando práctica con ${data.practiceStartProfile}`,
    });
  };

  // Handler para cambios de perfil/escenario en modo admin
  const handleAdminProfileScenarioChange = (
    profile: 'CEO' | 'CTO' | 'CFO',
    scenarioCode: string,
    scenarioName: string
  ) => {
    console.log('🔐 [ADMIN] Cambio de perfil/escenario:', { profile, scenarioCode, scenarioName });

    setAdminOverride({
      profile,
      scenarioCode,
      scenarioName
    });

    // Resetear sesión cuando cambia el escenario
    setCurrentSessionId(null);
    setShowResults(false);
    setSessionResults(null);

    toast({
      title: "Configuración de Admin",
      description: `${profile} - ${scenarioName}`,
      variant: "default"
    });
  };

  // Si estamos mostrando resultados, mostrar esa pantalla
  if (showResults && sessionResults) {
    return (
      <>
        <SessionResults
          {...sessionResults}
          onRetry={handleRetryScenario}
          onViewTranscript={handleViewTranscript}
          canProceedNext={currentScenario ? currentScenario.scenarioOrder < 5 : false}
          onNextScenario={handleNextScenario}
          onReEvaluate={handleReEvaluate}
          isReEvaluating={isReEvaluating}
        />

        {/* Modal de Transcripción */}
        <Dialog open={showTranscript} onOpenChange={setShowTranscript}>
          <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-white text-base sm:text-lg">Transcripción de la Sesión</DialogTitle>
              <DialogDescription className="text-gray-400 text-sm">
                {currentScenario?.scenarioName} • Perfil {questionnaireData?.practiceStartProfile}
              </DialogDescription>
            </DialogHeader>
            <div className="mt-3 sm:mt-4">
              {currentTranscript ? (
                <div className="bg-gray-800/50 rounded-lg p-3 sm:p-6 border border-gray-700 max-h-[60vh] overflow-y-auto">
                  <TranscriptViewer transcript={currentTranscript} />
                </div>
              ) : (
                <div className="text-center py-6 sm:py-8 text-gray-400">
                  <p className="text-sm sm:text-base">No hay transcripción disponible para esta sesión</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </>
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
      <div className="flex-1 h-screen bg-black overflow-hidden flex flex-col">
        <main className="w-full h-full flex flex-col">
          {/* Header */}
          <div className="p-3 sm:p-4 pb-2">
            <div className="flex items-center gap-2 sm:gap-3">
              <SidebarTrigger className="text-white hover:bg-white/10 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h1 className="text-lg sm:text-2xl font-bold text-white truncate">Roleplay de Ventas</h1>
                <p className="text-xs sm:text-sm text-white/70 truncate">
                  {questionnaireData && currentScenario
                    ? `${questionnaireData.practiceStartProfile} - Escenario ${currentScenario.scenarioOrder}: ${currentScenario.scenarioName}`
                    : 'Practica tus habilidades de venta'}
                </p>
              </div>
              {isAdmin && questionnaireData && (
                <div className="flex flex-shrink-0">
                  <AdminRoleplaySelector
                    onProfileScenarioChange={handleAdminProfileScenarioChange}
                    defaultProfile={questionnaireData.practiceStartProfile}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col lg:flex-row gap-3 sm:gap-4 px-3 sm:px-4 overflow-hidden">
            {isInitialLoading ? (
              // Loading state during initial check
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                  <p className="text-base sm:text-xl">Cargando...</p>
                </div>
              </div>
            ) : !questionnaireData ? (
              // Show tabs with roadmap and start button when no questionnaire data
              <Tabs defaultValue="start" className="flex-1 flex flex-col">
                <TabsList className="mx-auto mb-4 bg-white/10">
                  <TabsTrigger value="start" className="text-white data-[state=active]:bg-white/20">
                    <Mic className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Iniciar Práctica</span>
                    <span className="sm:hidden">Iniciar</span>
                  </TabsTrigger>
                  <TabsTrigger value="roadmap" className="text-white data-[state=active]:bg-white/20">
                    <Map className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Mi Progreso</span>
                    <span className="sm:hidden">Progreso</span>
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="start" className="flex-1 overflow-auto flex items-center justify-center">
                  <div className="text-center text-white max-w-2xl px-4">
                    <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Bienvenido al Roleplay de Ventas</h2>
                    <p className="text-base sm:text-lg mb-6 sm:mb-8 text-white/80">
                      Practica tus habilidades de venta con diferentes perfiles ejecutivos.
                      Completa el cuestionario inicial para comenzar tu sesión personalizada.
                    </p>
                    <button
                      onClick={() => setShowQuestionnaire(true)}
                      className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-xl shadow-lg transform transition hover:scale-105"
                    >
                      Comenzar Práctica
                    </button>
                  </div>
                </TabsContent>
                <TabsContent value="roadmap" className="flex-1 overflow-auto">
                  <div className="max-w-6xl mx-auto pb-8">
                    <RoleplayRoadmap userId={userId} />
                  </div>
                </TabsContent>
              </Tabs>
            ) : questionnaireData && currentScenario ? (
              <>
                {/* Left Column - Instructions (Hidden on mobile, show in tabs or accordion) */}
                <div className="hidden lg:block lg:w-1/3 overflow-y-auto">
                  <ScenarioInstructions
                    scenarioName={currentScenario.scenarioName}
                    scenarioCode={currentScenario.scenarioCode}
                    profile={questionnaireData.practiceStartProfile}
                    scenarioOrder={currentScenario.scenarioOrder}
                    minScoreToPass={currentScenario.minScoreToPass}
                    userInstructions={currentScenario.userInstructions}
                  />
                </div>

                {/* Right Column - Voice Assistant */}
                <div className="flex-1 flex flex-col lg:items-center lg:justify-center overflow-y-auto lg:overflow-visible">
                  {/* Mobile Instructions - Collapsible */}
                  <div className="lg:hidden mb-4">
                    <details
                      className="bg-white/5 rounded-lg overflow-hidden"
                      open={instructionsOpen}
                      onToggle={(e) => setInstructionsOpen((e.target as HTMLDetailsElement).open)}
                    >
                      <summary className="px-4 py-3 cursor-pointer text-white font-medium text-sm flex items-center justify-between">
                        <span>📋 Instrucciones del Escenario</span>
                        <span className="text-xs">{instructionsOpen ? '▲' : '▼'}</span>
                      </summary>
                      <div className="px-4 pb-4">
                        <ScenarioInstructions
                          scenarioName={currentScenario.scenarioName}
                          scenarioCode={currentScenario.scenarioCode}
                          profile={questionnaireData.practiceStartProfile}
                          scenarioOrder={currentScenario.scenarioOrder}
                          minScoreToPass={currentScenario.minScoreToPass}
                          userInstructions={currentScenario.userInstructions}
                        />
                      </div>
                    </details>
                  </div>

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
                    // Objetivos del escenario
                    objectives={currentScenario.objectives}
                  />
                </div>
              </>
            ) : (
              // Loading state when questionnaire data exists but scenario is not ready
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-white">
                  <p className="text-base sm:text-xl mb-4">Preparando tu sesión de práctica...</p>
                  <p className="text-sm sm:text-base text-white/70">Cargando escenario...</p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modal de Transcripción */}
      <Dialog open={showTranscript} onOpenChange={setShowTranscript}>
        <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white text-base sm:text-lg">Transcripción de la Sesión</DialogTitle>
            <DialogDescription className="text-gray-400 text-sm">
              {currentScenario?.scenarioName} • Perfil {questionnaireData?.practiceStartProfile}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-3 sm:mt-4">
            {currentTranscript ? (
              <div className="bg-gray-800/50 rounded-lg p-3 sm:p-6 border border-gray-700 max-h-[60vh] overflow-y-auto">
                <TranscriptViewer transcript={currentTranscript} />
              </div>
            ) : (
              <div className="text-center py-6 sm:py-8 text-gray-400">
                <p className="text-sm sm:text-base">No hay transcripción disponible para esta sesión</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}