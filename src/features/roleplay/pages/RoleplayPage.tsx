import { useState, useEffect, useCallback } from 'react';
import { SidebarTrigger } from '@/ui/components/ui/sidebar';
import { RoleplayVoiceAssistant } from '../components/RoleplayVoiceAssistant';
import { PrePracticeQuestionnaire } from '../components/PrePracticeQuestionnaire';
import { ScenarioInstructions } from '../components/ScenarioInstructions';
import { SessionResults } from '../components/SessionResults';
import { RoleplayRoadmap } from '../components/RoleplayRoadmap';
import { TranscriptViewer } from '../components/TranscriptViewer';
import { supabase, AuthService, RoleplayService, createEvaluation, useEvaluationRealtime } from '@maity/shared';
import { env } from '@/lib/env';
import { useToast } from '@/ui/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/components/ui/tabs';
import { Map, Mic } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/ui/components/ui/dialog';

// Número mínimo de mensajes del usuario requeridos para enviar a n8n
const MIN_USER_MESSAGES = 5;

export function RoleplayPage() {
  const { toast } = useToast();
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [userId, setUserId] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [forceN8nEvaluation, setForceN8nEvaluation] = useState(false);
  const [testMode, setTestMode] = useState(false);
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
  const [evaluationRequestId, setEvaluationRequestId] = useState<string | null>(null);
  const [_isEvaluating, setIsEvaluating] = useState(false);

  // Callbacks memorizados para evitar re-renders infinitos
  const handleEvaluationComplete = useCallback(async (result: any) => {
    console.log('✅ [RoleplayPage] Evaluación completada:', result);

    // Calcular score si no viene explícito (por si acaso)
    const evaluationScore = result.score ??
      (result.clarity !== undefined && result.structure !== undefined &&
       result.connection !== undefined && result.influence !== undefined
        ? Math.round((result.clarity + result.structure + result.connection + result.influence) / 4)
        : 0);

    console.log('📊 [RoleplayPage] Score calculado:', {
      scoreFromResult: result.score,
      scoreCalculated: evaluationScore,
      clarity: result.clarity,
      structure: result.structure,
      connection: result.connection,
      influence: result.influence
    });

    // Actualizar los resultados con la evaluación real
    setSessionResults((prev: any) => ({
      ...prev,
      score: evaluationScore,
      passed: evaluationScore >= (currentScenario?.minScoreToPass || 70),
      isProcessing: false,
      evaluation: result  // Pasar el result completo con todos los campos
    }));

    // Actualizar voice_session con los resultados
    if (currentSessionId) {
      const { error: updateError } = await supabase
        .schema('maity')
        .from('voice_sessions')
        .update({
          score: evaluationScore,
          processed_feedback: result,
          status: 'completed',
          ended_at: new Date().toISOString()
        })
        .eq('id', currentSessionId);

      if (updateError) {
        console.error('❌ [RoleplayPage] Error actualizando voice_session:', updateError);
      }
    }

    setIsEvaluating(false);
  }, [currentScenario, currentSessionId]);

  const handleEvaluationError = useCallback((errorMessage: string) => {
    console.error('❌ [RoleplayPage] Error en evaluación:', errorMessage);

    // Actualizar resultados con error
    setSessionResults((prev: any) => ({
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
  }, [toast]);

  // Hook para escuchar actualizaciones de evaluación en tiempo real
  const { evaluation: _evaluation, isLoading: _evaluationLoading, error: _evaluationError } = useEvaluationRealtime({
    requestId: evaluationRequestId || '',
    onComplete: handleEvaluationComplete,
    onError: handleEvaluationError
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
    if (!userId || !questionnaireData) return;

    try {
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

      const sessionId = await RoleplayService.createSession(
        userId,
        questionnaireData.practiceStartProfile,
        questionnaireData.questionnaireId
      );

      if (sessionId && typeof sessionId === 'string') {
        console.log('✅ [RoleplayPage] voice_session creada exitosamente:', {
          sessionId,
          sessionIdType: typeof sessionId,
          userId,
          profile: questionnaireData.practiceStartProfile,
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
   * Completa una evaluación directamente sin enviar a n8n
   * Usado para sesiones con muy pocas interacciones del usuario
   */
  const completeEvaluationDirectly = async (requestId: string, userMessageCount: number) => {
    try {
      console.log('⚡ [RoleplayPage] Completando evaluación directamente (sin n8n):', {
        requestId,
        userMessageCount,
        reason: `Menos de ${MIN_USER_MESSAGES} mensajes del usuario`
      });

      // Obtener token de autenticación del usuario
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        console.error('❌ [RoleplayPage] No hay sesión autenticada');
        throw new Error('No hay sesión autenticada');
      }

      const payload = {
        request_id: requestId,
        user_message_count: userMessageCount
      };

      console.log('📤 [RoleplayPage] Enviando a complete-short-evaluation API:', payload);

      const response = await fetch(`${env.apiUrl}/api/complete-short-evaluation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'UNKNOWN_ERROR' }));
        console.error('❌ [RoleplayPage] Error en complete-short-evaluation API:', errorData);
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ [RoleplayPage] Evaluación completada directamente:', result);
      return result;

    } catch (error) {
      console.error('❌ [RoleplayPage] Error al completar evaluación directamente:', error);
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
      if (effectiveSessionId) {
        const { data, error: sessionError } = await supabase
          .schema('maity')
          .from('voice_sessions')
          .select('id, user_id')
          .eq('id', effectiveSessionId)
          .single();

        sessionCheck = data;

        console.log('🔍 [RoleplayPage] Verificación de voice_session:', {
          sessionId: effectiveSessionId,
          found: !!sessionCheck,
          sessionUserId: sessionCheck?.user_id,
          currentUserId: userId,
          match: sessionCheck?.user_id === userId,
          error: sessionError
        });
      }

      // Si la sesión no es válida, crear evaluación sin vincular
      const sessionToLink = effectiveSessionId && sessionCheck ? effectiveSessionId : undefined;

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

      // 3. Guardar duration y transcript en voice_session inmediatamente
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

      // 4. Validar número de mensajes del usuario
      // Si no hay mensajes estructurados pero sí transcripción, contar las líneas del usuario
      let userMessageCount = messages?.filter(m => m.source === 'user').length || 0;
      let userContentLength = 0;

      // Si no hay mensajes pero sí transcripción, contar las líneas del usuario
      if (transcript && transcript.length > 0) {
        const userLines = transcript.split('\n').filter(line =>
          line.trim().startsWith('Usuario:') ||
          line.trim().startsWith('User:')
        );

        // Si no teníamos conteo de mensajes, usar el de la transcripción
        if (userMessageCount === 0) {
          userMessageCount = userLines.length;
        }

        // Calcular el contenido total del usuario
        userContentLength = userLines
          .map(line => line.replace(/^(Usuario:|User:)/, '').trim())
          .join(' ').length;

        console.log('📝 [RoleplayPage] Análisis de transcripción:', {
          userLines: userLines.length,
          userContentLength,
          transcriptLength: transcript.length
        });
      }

      // Considerar que hay suficiente contenido si:
      // 1. Hay al menos MIN_USER_MESSAGES mensajes, O
      // 2. El contenido del usuario tiene al menos 150 caracteres (una conversación sustancial)
      const hasSufficientContent = userMessageCount >= MIN_USER_MESSAGES || userContentLength >= 150;

      console.log('📊 [RoleplayPage] Validando mensajes del usuario:', {
        userMessageCount,
        userContentLength,
        minRequired: MIN_USER_MESSAGES,
        hasSufficientContent,
        isAdmin,
        forceN8nEvaluation,
        willSendToN8n: hasSufficientContent || forceN8nEvaluation
      });

      // Si hay muy poco contenido y NO es modo admin forzado, completar evaluación directamente sin n8n
      if (!hasSufficientContent && !forceN8nEvaluation) {
        console.log('⚠️ [RoleplayPage] Sesión muy corta, completando evaluación directamente');

        try {
          await completeEvaluationDirectly(requestId, userMessageCount);

          // Guardar transcripción para el modal
          setCurrentTranscript(transcript);

          // Mostrar resultados
          setSessionResults({
            sessionId: effectiveSessionId,
            profile: questionnaireData?.practiceStartProfile,
            scenarioName: currentScenario?.scenarioName,
            objectives: currentScenario?.objectives,
            duration,
            score: 0,
            passed: false,
            feedback: 'La interacción fue muy breve y limitada a un saludo inicial. No hay suficiente contenido para evaluar técnicas de ventas ni conocimiento del producto.',
            isProcessing: false,
            transcript: transcript
          });

          setShowResults(true);
          setIsEvaluating(false);

          toast({
            title: "Sesión completada",
            description: userMessageCount < MIN_USER_MESSAGES
              ? `Se requieren al menos ${MIN_USER_MESSAGES} interacciones o más contenido para una evaluación completa.`
              : "La interacción fue muy breve para una evaluación completa.",
            variant: "default"
          });

        } catch (error) {
          console.error('❌ [RoleplayPage] Error al completar evaluación directamente:', error);
          toast({
            title: "Error",
            description: "No se pudo completar la evaluación",
            variant: "destructive"
          });
        }

        return; // Salir sin enviar a n8n
      }

      // 5. Enviar transcript a n8n para procesamiento (solo si hay suficientes mensajes o modo admin)
      const n8nWebhookUrl = env.n8nWebhookUrl;

      console.log('📤 [RoleplayPage] Enviando transcript a n8n para evaluación completa...', {
        url: n8nWebhookUrl,
        requestId,
        sessionId: effectiveSessionId,
        sessionToLink,
        userMessageCount,
        forceN8nEvaluation,
        testMode,
        bypassedValidation: forceN8nEvaluation && !hasSufficientContent,
        transcriptPreview: transcript.substring(0, 100) + '...'
      });

      if (forceN8nEvaluation && !hasSufficientContent) {
        console.warn(`⚠️ [ADMIN MODE] Enviando a n8n sin suficiente contenido (modo admin activado)`);
      }

      if (testMode) {
        console.warn('🧪 [TEST MODE] Webhook enviado en modo de prueba (test: true)');
      }

      // Enviar a n8n webhook si está configurado
      if (n8nWebhookUrl && n8nWebhookUrl.length > 0) {
        const webhookPayload = {
          request_id: requestId,
          session_id: sessionToLink || null,
          transcript: transcript,
          messages: messages || [], // Array de mensajes individuales de la conversación
          test: testMode, // Flag para modo de prueba en n8n
          metadata: {
            user_id: userId,
            profile: questionnaireData?.practiceStartProfile,
            scenario: currentScenario?.scenarioName,
            scenario_code: currentScenario?.scenarioCode,
            objectives: currentScenario?.objectives,
            difficulty: currentScenario?.difficultyLevel,
            duration_seconds: duration,
            message_count: messages?.length || 0,
            user_message_count: messages?.filter(m => m.source === 'user').length || 0,
            ai_message_count: messages?.filter(m => m.source === 'ai').length || 0,
            admin_bypass: forceN8nEvaluation && !hasSufficientContent
          }
        };

        const bodyString = JSON.stringify(webhookPayload);

        console.log('📤 [RoleplayPage] Enviando a n8n webhook:', {
          url: n8nWebhookUrl,
          requestId: webhookPayload.request_id,
          testMode: webhookPayload.test,
          adminBypass: webhookPayload.metadata.admin_bypass,
          messageCount: webhookPayload.metadata.message_count
        });

        // LOG CRÍTICO: Verificar request_id y test flag justo antes de enviar
        console.log('🔴 [CRITICAL] Payload details:', {
          request_id: webhookPayload.request_id,
          test: webhookPayload.test,
          admin_bypass: webhookPayload.metadata.admin_bypass
        });

        fetch(n8nWebhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: bodyString
        }).then(async response => {
          const responseText = await response.text();

          console.log('📨 [RoleplayPage] Respuesta de n8n:', {
            status: response.status,
            statusText: response.statusText,
            ok: response.ok,
            headers: Object.fromEntries(response.headers.entries()),
            bodyText: responseText
          });

          if (response.ok) {
            console.log('✅ [RoleplayPage] Transcript enviado a n8n exitosamente');
          } else {
            console.error('❌ [RoleplayPage] Error al enviar a n8n:', response.status, response.statusText);
          }

          // Intenta parsear la respuesta como JSON
          try {
            const responseJson = JSON.parse(responseText);
            console.log('📝 [RoleplayPage] Respuesta de n8n (JSON):', responseJson);
          } catch (e) {
            console.log('📝 [RoleplayPage] Respuesta de n8n (text):', responseText);
          }
        }).catch(error => {
          console.error('❌ [RoleplayPage] Error de red al enviar a n8n:', error);
          console.log('ℹ️ [RoleplayPage] Continuando sin n8n. La evaluación quedará pendiente.');
        });
      } else {
        console.log('⚠️ [RoleplayPage] n8n webhook no configurado o usando placeholder. La evaluación quedará pendiente.');
      }

      // 6. Por ahora mostrar resultados temporales mientras se procesa
      console.log('⏳ [RoleplayPage] Mostrando resultados temporales mientras n8n procesa...');
      setCurrentTranscript(transcript); // Guardar transcripción para el modal
      setSessionResults({
        sessionId: effectiveSessionId,
        profile: questionnaireData?.practiceStartProfile,
        scenarioName: currentScenario?.scenarioName,
        objectives: currentScenario?.objectives,
        score: null, // Será actualizado cuando llegue la evaluación
        passed: null,
        duration: duration,
        isProcessing: true,
        requestId: requestId,
        transcript: transcript
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
    setShowTranscript(true);
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
      <>
        <SessionResults
          {...sessionResults}
          onRetry={handleRetryScenario}
          onViewTranscript={handleViewTranscript}
          canProceedNext={currentScenario ? currentScenario.scenarioOrder < 5 : false}
          onNextScenario={handleNextScenario}
        />

        {/* Modal de Transcripción */}
        <Dialog open={showTranscript} onOpenChange={setShowTranscript}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-gray-900 border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-white">Transcripción de la Sesión</DialogTitle>
              <DialogDescription className="text-gray-400">
                {currentScenario?.scenarioName} • Perfil {questionnaireData?.practiceStartProfile}
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4">
              {currentTranscript ? (
                <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700 max-h-[60vh] overflow-y-auto">
                  <TranscriptViewer transcript={currentTranscript} />
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <p>No hay transcripción disponible para esta sesión</p>
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
          <div className="p-4 pb-2">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="text-white hover:bg-white/10" />
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-white">Roleplay de Ventas</h1>
                <p className="text-sm text-white/70">
                  {questionnaireData && currentScenario
                    ? `${questionnaireData.practiceStartProfile} - Escenario ${currentScenario.scenarioOrder}: ${currentScenario.scenarioName}`
                    : 'Practica tus habilidades de venta'}
                </p>
              </div>
              {isAdmin && (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setForceN8nEvaluation(!forceN8nEvaluation);
                      toast({
                        title: forceN8nEvaluation ? "Modo Admin Desactivado" : "Modo Admin Activado",
                        description: forceN8nEvaluation
                          ? `Se aplicará validación de ${MIN_USER_MESSAGES} mensajes`
                          : "Se enviará a n8n sin importar el número de mensajes",
                        variant: "default"
                      });
                    }}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      forceN8nEvaluation
                        ? 'bg-yellow-500 hover:bg-yellow-600 text-black'
                        : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                  >
                    {forceN8nEvaluation ? '🔓 Admin: ON' : '🔒 Admin: OFF'}
                  </button>
                  <button
                    onClick={() => {
                      setTestMode(!testMode);
                      toast({
                        title: testMode ? "Modo Test Desactivado" : "Modo Test Activado",
                        description: testMode
                          ? "Webhook normal (test: false)"
                          : "Webhook de prueba (test: true)",
                        variant: "default"
                      });
                    }}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      testMode
                        ? 'bg-purple-500 hover:bg-purple-600 text-white'
                        : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                  >
                    {testMode ? '🧪 TEST: ON' : '🧪 TEST: OFF'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex gap-4 px-4 overflow-hidden">
            {isInitialLoading ? (
              // Loading state during initial check
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                  <p className="text-xl">Cargando...</p>
                </div>
              </div>
            ) : !questionnaireData ? (
              // Show tabs with roadmap and start button when no questionnaire data
              <Tabs defaultValue="start" className="flex-1 flex flex-col">
                <TabsList className="mx-auto mb-4 bg-white/10">
                  <TabsTrigger value="start" className="text-white data-[state=active]:bg-white/20">
                    <Mic className="w-4 h-4 mr-2" />
                    Iniciar Práctica
                  </TabsTrigger>
                  <TabsTrigger value="roadmap" className="text-white data-[state=active]:bg-white/20">
                    <Map className="w-4 h-4 mr-2" />
                    Mi Progreso
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="start" className="flex-1 overflow-auto flex items-center justify-center">
                  <div className="text-center text-white max-w-2xl px-4">
                    <h2 className="text-3xl font-bold mb-4">Bienvenido al Roleplay de Ventas</h2>
                    <p className="text-lg mb-8 text-white/80">
                      Practica tus habilidades de venta con diferentes perfiles ejecutivos.
                      Completa el cuestionario inicial para comenzar tu sesión personalizada.
                    </p>
                    <button
                      onClick={() => setShowQuestionnaire(true)}
                      className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-xl shadow-lg transform transition hover:scale-105"
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
                {/* Left Column - Instructions */}
                <div className="w-1/3 overflow-y-auto">
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
                <div className="flex-1 flex items-center justify-center">
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
                  <p className="text-xl mb-4">Preparando tu sesión de práctica...</p>
                  <p className="text-white/70">Cargando escenario...</p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modal de Transcripción */}
      <Dialog open={showTranscript} onOpenChange={setShowTranscript}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Transcripción de la Sesión</DialogTitle>
            <DialogDescription className="text-gray-400">
              {currentScenario?.scenarioName} • Perfil {questionnaireData?.practiceStartProfile}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            {currentTranscript ? (
              <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700 max-h-[60vh] overflow-y-auto">
                <TranscriptViewer transcript={currentTranscript} />
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <p>No hay transcripción disponible para esta sesión</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}