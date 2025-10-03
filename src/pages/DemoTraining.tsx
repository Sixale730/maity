import React, { useState, useEffect } from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { RoleplayVoiceAssistant } from '@/components/roleplay/RoleplayVoiceAssistant';
import { SessionResults } from '@/components/roleplay/SessionResults';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { createEvaluation, useEvaluationRealtime } from '@/hooks/useEvaluationRealtime';
import { env } from '@/lib/env';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Settings, Play } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

const MIN_USER_MESSAGES = 8;

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
  const [evaluationRequestId, setEvaluationRequestId] = useState<string | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [sessionKey, setSessionKey] = useState(0); // Para forzar re-render del componente de voz

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

      setUserId(userData.id);
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
    setEvaluationRequestId(null);

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
        p_questionnaire_id: null // Demo no requiere cuestionario
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

      if (sessionId) {
        const sessionIdString = typeof sessionId === 'string' ? sessionId : sessionId.toString();
        setCurrentSessionId(sessionIdString);
        console.log('✅ [DemoTraining] voice_session creada:', sessionIdString);
        return sessionIdString;
      }

      return null;
    } catch (error) {
      console.error('❌ [DemoTraining] Error al crear sesión:', error);
      return null;
    }
  };

  const handleEvaluationComplete = async (result: any) => {
    console.log('✅ [DemoTraining] Evaluación completada:', result);

    const evaluationScore = result.score ??
      (result.clarity !== undefined && result.structure !== undefined &&
       result.connection !== undefined && result.influence !== undefined
        ? Math.round((result.clarity + result.structure + result.connection + result.influence) / 4)
        : 0);

    setSessionResults(prev => ({
      ...prev,
      score: evaluationScore,
      passed: evaluationScore >= 60,
      isProcessing: false,
      evaluation: result
    }));

    if (currentSessionId) {
      await supabase
        .schema('maity')
        .from('voice_sessions')
        .update({
          score: evaluationScore,
          processed_feedback: result,
          status: 'completed',
          ended_at: new Date().toISOString()
        })
        .eq('id', currentSessionId);
    }

    setIsEvaluating(false);
  };

  const handleEvaluationError = (errorMessage: string) => {
    console.error('❌ [DemoTraining] Error en evaluación:', errorMessage);
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
  };

  const { evaluation, isLoading: evaluationLoading, error: evaluationError } = useEvaluationRealtime({
    requestId: evaluationRequestId || '',
    onComplete: handleEvaluationComplete,
    onError: handleEvaluationError
  });

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

    setIsEvaluating(true);

    try {
      const requestId = crypto.randomUUID();

      // Guardar duration y transcript
      if (effectiveSessionId) {
        await supabase
          .schema('maity')
          .from('voice_sessions')
          .update({
            duration_seconds: duration,
            raw_transcript: transcript,
            ended_at: new Date().toISOString()
          })
          .eq('id', effectiveSessionId);
      }

      // Crear evaluación
      const { data: evaluationData, error: createError } = await createEvaluation(
        requestId,
        userId,
        effectiveSessionId
      );

      if (createError) {
        console.error('❌ [DemoTraining] Error al crear evaluation:', createError);
        setIsEvaluating(false);
        return;
      }

      setEvaluationRequestId(requestId);

      const userMessageCount = messages?.filter(m => m.source === 'user').length || 0;

      // Guardar transcripción para modal
      setCurrentTranscript(transcript);

      // Mostrar resultados temporales
      setSessionResults({
        sessionId: effectiveSessionId,
        profile: config.profile,
        scenarioName: config.scenarioName,
        score: null,
        passed: null,
        duration: duration,
        isProcessing: true,
        requestId: requestId
      });
      setShowResults(true);

      // Enviar a n8n si hay suficientes mensajes
      if (userMessageCount >= MIN_USER_MESSAGES) {
        const n8nWebhookUrl = env.n8nWebhookUrl;

        if (n8nWebhookUrl && n8nWebhookUrl.length > 0) {
          const webhookPayload = {
            request_id: requestId,
            session_id: effectiveSessionId,
            transcript: transcript,
            messages: messages || [],
            test: false,
            metadata: {
              user_id: userId,
              profile: config.profile,
              scenario: config.scenarioName,
              difficulty: config.difficultyLevel,
              mood: config.mood,
              duration_seconds: duration,
              message_count: messages?.length || 0,
              user_message_count: userMessageCount,
              is_demo: true
            }
          };

          fetch(n8nWebhookUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify(webhookPayload)
          }).catch(error => {
            console.error('❌ Error enviando a n8n:', error);
          });
        }
      }
    } catch (error) {
      console.error('❌ [DemoTraining] Error en handleSessionEnd:', error);
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
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                  <pre className="whitespace-pre-wrap text-sm text-gray-200 font-mono">
                    {currentTranscript}
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
