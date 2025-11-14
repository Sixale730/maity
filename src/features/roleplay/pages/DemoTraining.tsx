import { useState, useEffect } from 'react';
import { SidebarTrigger } from '@/ui/components/ui/sidebar';
import { RoleplayVoiceAssistant } from '@/features/roleplay/components/RoleplayVoiceAssistant';
import { SessionResults } from '@/features/roleplay/components/SessionResults';
import { TranscriptViewer } from '@/features/roleplay/components/TranscriptViewer';
import { AdminTextChat } from '@/features/roleplay/components/AdminTextChat';
import { supabase } from '@maity/shared';
import { useToast } from '@/shared/hooks/use-toast';
import { useUserRole } from '@/hooks/useUserRole';
import { env } from '@/lib/env';
import { Card } from '@/ui/components/ui/card';
import { Label } from '@/ui/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/components/ui/select';
import { Input } from '@/ui/components/ui/input';
import { Button } from '@/ui/components/ui/button';
import { Settings, Play } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/ui/components/ui/dialog';

const MIN_USER_MESSAGES = 5;

// Opciones de configuración
const MOODS = [
  { value: 'neutral', label: 'Neutral' },
  { value: 'positive', label: 'Positivo/Amigable' },
  { value: 'negative', label: 'Negativo/Escéptico' },
  { value: 'challenging', label: 'Retador/Difícil' },
  { value: 'rushed', label: 'Apurado/Con prisa' },
  { value: 'interested', label: 'Interesado' },
  { value: 'skeptical', label: 'Escéptico' },
];

const PROFILES = [
  { value: 'CEO', label: 'CEO - Visión Estratégica' },
  { value: 'CTO', label: 'CTO - Arquitectura Técnica' },
  { value: 'CFO', label: 'CFO - Finanzas y ROI' },
];

const DIFFICULTY_LEVELS = [
  { value: 1, label: 'Nivel 1 - Fácil' },
  { value: 2, label: 'Nivel 2 - Medio' },
  { value: 3, label: 'Nivel 3 - Difícil' },
  { value: 4, label: 'Nivel 4 - Muy Difícil' },
  { value: 5, label: 'Nivel 5 - Experto' },
];

export default function DemoTraining() {
  const { toast } = useToast();
  const { isAdmin } = useUserRole();

  // Estado de configuración personalizada
  const [config, setConfig] = useState({
    profile: 'CEO' as 'CEO' | 'CTO' | 'CFO',
    mood: 'neutral',
    difficultyLevel: 2,
    scenarioName: 'Práctica Libre',
    scenarioCode: 'free_practice',
    profileDescription: 'Director Ejecutivo enfocado en visión estratégica y resultados de negocio',
    profileKeyFocus: 'Visión estratégica, ROI, impacto en el negocio',
    profileCommunicationStyle: 'Directo, orientado a resultados, busca respuestas claras',
  });

  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [userId, setUserId] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [sessionResults, setSessionResults] = useState<any>(null);
  const [showTranscript, setShowTranscript] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState<string>('');
  const [__isEvaluating, setIsEvaluating] = useState(false);
  const [sessionKey, setSessionKey] = useState(0); // Para forzar re-render del componente de voz
  const [isCallActive, setIsCallActive] = useState(false); // Para controlar visibilidad del chat admin
  const [isReEvaluating, setIsReEvaluating] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: userData } = await supabase
        .from('users')
        .select('id, name, nickname, email')
        .eq('auth_id', user.id)
        .single();

      if (!userData) return;

      setUserId(userData.id as string);
      const displayName = userData.name?.trim() ||
                         userData.nickname?.trim() ||
                         userData.email?.split('@')[0] ||
                         'Usuario';
      setUserName(displayName);
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const handleConfigChange = (field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));

    // Actualizar descripciones según el perfil seleccionado
    if (field === 'profile') {
      if (value === 'CEO') {
        setConfig(prev => ({
          ...prev,
          profile: value,
          profileDescription: 'Director Ejecutivo enfocado en visión estratégica y resultados de negocio',
          profileKeyFocus: 'Visión estratégica, ROI, impacto en el negocio',
          profileCommunicationStyle: 'Directo, orientado a resultados, busca respuestas claras',
        }));
      } else if (value === 'CTO') {
        setConfig(prev => ({
          ...prev,
          profile: value,
          profileDescription: 'Director de Tecnología enfocado en arquitectura y capacidades técnicas',
          profileKeyFocus: 'Arquitectura técnica, escalabilidad, integración',
          profileCommunicationStyle: 'Técnico, detallado, busca especificaciones',
        }));
      } else if (value === 'CFO') {
        setConfig(prev => ({
          ...prev,
          profile: value,
          profileDescription: 'Director Financiero enfocado en números, presupuesto y retorno de inversión',
          profileKeyFocus: 'Costos, ROI, presupuesto, justificación financiera',
          profileCommunicationStyle: 'Analítico, enfocado en números, busca datos concretos',
        }));
      }
    }
  };

  const handleStartNewSession = () => {
    // Resetear estados
    setCurrentSessionId(null);
    setShowResults(false);
    setSessionResults(null);
    setShowTranscript(false);
    setCurrentTranscript('');
    setIsCallActive(false); // Resetear estado de llamada

    // Incrementar key para forzar re-mount del componente de voz
    setSessionKey(prev => prev + 1);

    toast({
      title: "Nueva sesión iniciada",
      description: `Configuración: ${config.profile} con mood ${config.mood}`,
    });
  };

  const handleSessionStart = async () => {
    console.log('🎯 [DemoTraining] Iniciando sesión de práctica demo...');

    if (!userId) {
      console.error('❌ [DemoTraining] No se puede iniciar sesión sin userId');
      return null;
    }

    try {
      const { data: sessionId, error: sessionError } = await supabase.rpc('create_voice_session', {
        p_user_id: userId,
        p_profile_name: config.profile,
        p_questionnaire_id: '' // Demo no requiere cuestionario
      });

      if (sessionError) {
        console.error('❌ [DemoTraining] Error al crear voice_session:', sessionError);
        toast({
          title: "Error",
          description: "No se pudo crear la sesión de práctica",
          variant: "destructive"
        });
        return null;
      }

      if (sessionId && typeof sessionId === 'string') {
        setCurrentSessionId(sessionId);
        setIsCallActive(true); // Marcar que la llamada está activa
        console.log('✅ [DemoTraining] voice_session creada:', sessionId);
        return sessionId;
      }

      return null;
    } catch (error) {
      console.error('❌ [DemoTraining] Error al crear sesión:', error);
      return null;
    }
  };


  /**
   * Evalúa una sesión usando OpenAI API directamente (sincrónico)
   */
  const evaluateSession = async (sessionId: string) => {
    try {
      console.log('🤖 [DemoTraining] Evaluando sesión con OpenAI:', { sessionId });

      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('No hay sesión autenticada');
      }

      const payload = { session_id: sessionId };

      console.log('📤 [DemoTraining] Llamando a API de evaluación...');

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
        console.error('❌ [DemoTraining] Error en evaluate-session:', {
          status: response.status,
          statusText: response.statusText,
          errorData
        });

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
      console.log('✅ [DemoTraining] Evaluación recibida:', evaluation);

      if (!evaluation || !evaluation.result) {
        console.error('❌ [DemoTraining] Respuesta inválida del API:', evaluation);
        throw new Error('La evaluación no contiene los datos esperados. Por favor, intenta de nuevo.');
      }

      const result = evaluation.result;
      const evaluationScore = evaluation.score ??
        (result.dimension_scores?.clarity !== undefined
          ? Math.round((result.dimension_scores.clarity + result.dimension_scores.structure +
                       result.dimension_scores.connection + result.dimension_scores.influence) / 4)
          : 0);

      console.log('📊 [DemoTraining] Score calculado:', {
        scoreFromAPI: evaluation.score,
        scoreCalculated: evaluationScore
      });

      setSessionResults((prev: any) => ({
        ...prev,
        score: evaluationScore,
        passed: evaluationScore >= 60,
        isProcessing: false,
        evaluation: result
      }));

      setIsEvaluating(false);

    } catch (error) {
      console.error('❌ [DemoTraining] Error al evaluar sesión:', error);

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
    setSessionResults((prev: any) => ({
      ...prev,
      isProcessing: true,
      error: undefined
    }));

    try {
      console.log('🔄 [DemoTraining] Reevaluando sesión:', sessionResults.sessionId);
      await evaluateSession(sessionResults.sessionId);

      toast({
        title: "Reevaluación completa",
        description: "La sesión ha sido reevaluada exitosamente",
      });
    } catch (error) {
      console.error('❌ Error en reevaluación:', error);
    } finally {
      setIsReEvaluating(false);
    }
  };

  const handleSessionEnd = async (transcript: string, duration: number, voiceAssistantSessionId?: string, messages?: Array<{
    id: string;
    timestamp: Date;
    source: 'user' | 'ai';
    message: string;
  }>) => {
    console.log('🎯 [DemoTraining] handleSessionEnd iniciado:', {
      transcriptLength: transcript.length,
      duration,
      messagesCount: messages?.length || 0
    });

    const effectiveSessionId = currentSessionId || voiceAssistantSessionId;

    if (!effectiveSessionId || !userId) {
      toast({
        title: "Error",
        description: "Información de sesión incompleta",
        variant: "destructive"
      });
      return;
    }

    setIsCallActive(false); // Marcar que la llamada terminó
    setIsEvaluating(true);

    try {
      // 1. Guardar duration y transcript
      if (effectiveSessionId) {
        const { error: updateError } = await supabase
          .rpc('update_voice_session_transcript', {
            p_session_id: effectiveSessionId,
            p_duration_seconds: duration,
            p_raw_transcript: transcript
          });

        if (updateError) {
          console.error('❌ [DemoTraining] Error guardando duration y transcript:', updateError);
        } else {
          console.log('✅ [DemoTraining] Duration y transcript guardados exitosamente');
        }
      }

      const userMessageCount = messages?.filter(m => m.source === 'user').length || 0;

      // Guardar transcripción para modal
      setCurrentTranscript(transcript);

      // 2. Mostrar resultados temporales
      setSessionResults({
        sessionId: effectiveSessionId,
        profile: config.profile,
        scenarioName: config.scenarioName,
        score: null,
        passed: null,
        duration: duration,
        isProcessing: true,
        transcript: transcript
      });
      setShowResults(true);

      // 3. Evaluar sesión con OpenAI (sincrónico)
      if (userMessageCount >= MIN_USER_MESSAGES) {
        console.log('🤖 [DemoTraining] Evaluando sesión con OpenAI...');
        await evaluateSession(effectiveSessionId);
      } else {
        console.log('⚠️ [DemoTraining] No hay suficientes mensajes para evaluar');
        setSessionResults((prev: any) => ({
          ...prev,
          isProcessing: false,
          error: 'Sesión muy corta. Necesitas al menos 5 mensajes para evaluar.'
        }));
        setIsEvaluating(false);
      }
    } catch (error) {
      console.error('❌ [DemoTraining] Error en handleSessionEnd:', error);
      // evaluateSession ya maneja los errores y muestra toasts
    }
  };

  const handleRetryScenario = () => {
    handleStartNewSession();
  };

  const handleViewTranscript = () => {
    setShowTranscript(true);
  };

  // Si estamos mostrando resultados
  if (showResults && sessionResults) {
    return (
      <>
        <SessionResults
          {...sessionResults}
          onRetry={handleRetryScenario}
          onViewTranscript={handleViewTranscript}
          canProceedNext={false}
          onReEvaluate={handleReEvaluate}
          isReEvaluating={isReEvaluating}
        />

        {/* Modal de Transcripción */}
        <Dialog open={showTranscript} onOpenChange={setShowTranscript}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-gray-900 border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-white">Transcripción de la Sesión</DialogTitle>
              <DialogDescription className="text-gray-400">
                {config.scenarioName} • Perfil {config.profile}
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
    <div className="flex-1 h-screen bg-black overflow-hidden flex flex-col">
      <main className="w-full h-full flex flex-col">
        {/* Header */}
        <div className="p-4 pb-2 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="text-white hover:bg-white/10" />
              <div>
                <h1 className="text-2xl font-bold text-white">Demo Entrenamiento</h1>
                <p className="text-sm text-white/70">
                  Practica con configuración personalizada
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setIsConfigOpen(true)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                Configuración
              </Button>
              <Button
                onClick={handleStartNewSession}
                className="flex items-center gap-2"
              >
                <Play className="h-4 w-4" />
                Nueva Sesión
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex gap-4 px-4 py-4 overflow-hidden">
          {/* Panel de Información de Configuración */}
          <div className="w-80 overflow-y-auto">
            <Card className="bg-gray-900/50 border-gray-800 p-4">
              <h3 className="text-lg font-semibold text-white mb-4">Configuración Actual</h3>

              <div className="space-y-4">
                <div>
                  <Label className="text-gray-400 text-xs">Perfil</Label>
                  <p className="text-white font-medium">{config.profile}</p>
                  <p className="text-gray-500 text-xs mt-1">{config.profileDescription}</p>
                </div>

                <div>
                  <Label className="text-gray-400 text-xs">Mood</Label>
                  <p className="text-white font-medium capitalize">{MOODS.find(m => m.value === config.mood)?.label}</p>
                </div>

                <div>
                  <Label className="text-gray-400 text-xs">Nivel de Dificultad</Label>
                  <p className="text-white font-medium">Nivel {config.difficultyLevel}</p>
                </div>

                <div>
                  <Label className="text-gray-400 text-xs">Escenario</Label>
                  <p className="text-white font-medium">{config.scenarioName}</p>
                </div>

                <div className="pt-4 border-t border-gray-800">
                  <Label className="text-gray-400 text-xs">Key Focus</Label>
                  <p className="text-gray-300 text-sm mt-1">{config.profileKeyFocus}</p>
                </div>

                <div>
                  <Label className="text-gray-400 text-xs">Estilo de Comunicación</Label>
                  <p className="text-gray-300 text-sm mt-1">{config.profileCommunicationStyle}</p>
                </div>
              </div>
            </Card>

            {/* Chat Admin - Solo visible durante llamada activa y para admins */}
            {isAdmin && isCallActive && (
              <div className="mt-4">
                <AdminTextChat
                  onSendMessage={(message) => {
                    console.log('📨 [Admin Chat] Mensaje enviado:', message);
                    toast({
                      title: "Mensaje de texto enviado",
                      description: `Admin: ${message.substring(0, 50)}${message.length > 50 ? '...' : ''}`,
                    });
                  }}
                />
              </div>
            )}
          </div>

          {/* Agente de Voz */}
          <div className="flex-1 flex items-center justify-center">
            <RoleplayVoiceAssistant
              key={sessionKey}
              selectedProfile={config.profile}
              questionnaireId={undefined}
              userName={userName}
              userId={userId}
              scenarioCode={config.scenarioCode}
              scenarioName={config.scenarioName}
              sessionId={currentSessionId || undefined}
              onSessionStart={handleSessionStart}
              onSessionEnd={handleSessionEnd}
              profileDescription={config.profileDescription}
              profileKeyFocus={config.profileKeyFocus}
              profileCommunicationStyle={config.profileCommunicationStyle}
              difficultyLevel={config.difficultyLevel}
              difficultyName={`Nivel ${config.difficultyLevel}`}
              difficultyMood={config.mood}
            />
          </div>
        </div>
      </main>

      {/* Modal de Configuración */}
      <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
        <DialogContent className="max-w-2xl bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Configuración del Agente</DialogTitle>
            <DialogDescription className="text-gray-400">
              Personaliza el comportamiento del agente de entrenamiento
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Perfil */}
            <div>
              <Label className="text-white">Tipo de Perfil</Label>
              <Select value={config.profile} onValueChange={(value) => handleConfigChange('profile', value)}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {PROFILES.map(profile => (
                    <SelectItem key={profile.value} value={profile.value} className="text-white">
                      {profile.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Mood */}
            <div>
              <Label className="text-white">Mood / Estado de Ánimo</Label>
              <Select value={config.mood} onValueChange={(value) => handleConfigChange('mood', value)}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {MOODS.map(mood => (
                    <SelectItem key={mood.value} value={mood.value} className="text-white">
                      {mood.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Nivel de Dificultad */}
            <div>
              <Label className="text-white">Nivel de Dificultad</Label>
              <Select
                value={config.difficultyLevel.toString()}
                onValueChange={(value) => handleConfigChange('difficultyLevel', parseInt(value))}
              >
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {DIFFICULTY_LEVELS.map(level => (
                    <SelectItem key={level.value} value={level.value.toString()} className="text-white">
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Nombre del Escenario */}
            <div>
              <Label className="text-white">Nombre del Escenario</Label>
              <Input
                value={config.scenarioName}
                onChange={(e) => handleConfigChange('scenarioName', e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
                placeholder="Ej: Práctica Libre, Demo de Producto..."
              />
            </div>

            {/* Botón de aplicar */}
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsConfigOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={() => {
                setIsConfigOpen(false);
                toast({
                  title: "Configuración actualizada",
                  description: "Los cambios se aplicarán en la próxima sesión",
                });
              }}>
                Aplicar Cambios
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
