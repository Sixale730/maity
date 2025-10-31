import { useState, useEffect } from 'react';
import { SidebarTrigger } from '@/ui/components/ui/sidebar';
import { RoleplayVoiceAssistant } from '@/features/roleplay/components/RoleplayVoiceAssistant';
import { supabase, AuthService, InterviewService } from '@maity/shared';
import { env } from '@/lib/env';
import { useToast } from '@/ui/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/components/ui/card';
import { Badge } from '@/ui/components/ui/badge';
import { Briefcase, CheckCircle2, Loader2 } from 'lucide-react';

export function InterviewPage() {
  const { toast } = useToast();
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [userId, setUserId] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isProcessingAnalysis, setIsProcessingAnalysis] = useState(false);

  useEffect(() => {
    const initializeUser = async () => {
      try {
        const authUser = await AuthService.getUser();
        if (!authUser) {
          toast({
            variant: 'destructive',
            title: 'Error',
            description: 'No se pudo obtener la información del usuario.',
          });
          return;
        }

        // Obtener el ID de maity.users usando auth_id
        const { data: profile, error: profileError } = await supabase
          .schema('maity')
          .from('users')
          .select('id, name')
          .eq('auth_id', authUser.id)
          .single();

        if (profileError || !profile) {
          console.error('Error al obtener perfil de usuario:', profileError);
          toast({
            variant: 'destructive',
            title: 'Error',
            description: 'No se pudo obtener el perfil del usuario.',
          });
          return;
        }

        setUserId(profile.id); // Ahora usamos el id de maity.users
        if (profile.name) {
          setUserName(profile.name);
        }
      } catch (error) {
        console.error('Error al inicializar usuario:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Ocurrió un error al cargar la información del usuario.',
        });
      } finally {
        setIsInitialLoading(false);
      }
    };

    initializeUser();
  }, [toast]);

  const handleSessionStart = async (): Promise<string | null> => {
    try {
      // Crear nueva sesión en la base de datos
      const { data, error } = await supabase
        .schema('maity')
        .from('interview_sessions')
        .insert({
          user_id: userId,
          status: 'in_progress',
          started_at: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (error) throw error;

      setCurrentSessionId(data.id);
      return data.id;
    } catch (error) {
      console.error('Error al crear sesión de entrevista:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo iniciar la sesión de entrevista.',
      });
      return null;
    }
  };

  const handleSessionEnd = async (
    transcript: string,
    duration: number,
    sessionId?: string
  ) => {
    try {
      const idToUpdate = sessionId || currentSessionId;
      if (!idToUpdate) {
        throw new Error('No se encontró el ID de la sesión');
      }

      setIsProcessingAnalysis(true);

      // 1. Actualizar la sesión con transcript y duración
      const { error: updateError } = await supabase
        .schema('maity')
        .from('interview_sessions')
        .update({
          ended_at: new Date().toISOString(),
          duration_seconds: duration,
          raw_transcript: transcript,
          status: 'completed',
        })
        .eq('id', idToUpdate);

      if (updateError) throw updateError;

      // 2. Crear evaluación
      console.log('[InterviewPage] 📝 Creando evaluación...');
      const requestId = await InterviewService.createEvaluation(idToUpdate, userId);
      console.log('[InterviewPage] ✅ Evaluación creada:', requestId);

      // 3. Enviar transcript a n8n para análisis
      const webhookUrl = env.n8nInterviewWebhookUrl;

      if (webhookUrl && webhookUrl.length > 0) {
        console.log('[InterviewPage] 📤 Enviando transcript a n8n para análisis...');

        const webhookPayload = {
          request_id: requestId,
          session_id: idToUpdate,
          transcript: transcript,
          metadata: {
            user_id: userId,
            user_name: userName,
            duration_seconds: duration,
            timestamp: new Date().toISOString(),
          }
        };

        // Fire and forget - no esperamos respuesta del webhook
        fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(webhookPayload),
        }).catch(error => {
          console.error('❌ [InterviewPage] Error al enviar a n8n:', error);
          console.log('ℹ️ [InterviewPage] La evaluación quedará pendiente.');
        });
      } else {
        console.warn('⚠️ [InterviewPage] Webhook de análisis no configurado.');
      }

      toast({
        title: '¡Entrevista finalizada!',
        description: 'Tu sesión ha sido guardada. El análisis se procesará en breve.',
      });

      setCurrentSessionId(null);
      setIsProcessingAnalysis(false);
    } catch (error) {
      console.error('Error al finalizar sesión:', error);
      setIsProcessingAnalysis(false);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Ocurrió un error al guardar la sesión.',
      });
    }
  };

  if (isInitialLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Check if agent ID is configured
  if (!env.elevenLabsInterviewAgentId) {
    return (
      <div className="flex items-center justify-center h-screen p-4">
        <Card className="max-w-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Briefcase className="h-6 w-6" />
              Configuración requerida
            </CardTitle>
            <CardDescription>
              La entrevista no está configurada correctamente. Por favor, contacta al administrador.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <SidebarTrigger />
            <div className="flex items-center gap-2 sm:gap-3">
              <Briefcase className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              <div>
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">
                  Mi Primer Entrevista
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                  Practica tus habilidades de entrevista con IA
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl">
          {/* Processing Analysis Banner */}
          {isProcessingAnalysis && (
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg flex items-center gap-3">
              <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
              <div>
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Procesando análisis de entrevista...
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  Esto puede tomar algunos minutos. Puedes cerrar esta página y regresar después.
                </p>
              </div>
            </div>
          )}

          <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Left Column - Instructions */}
            <div className="lg:col-span-1 space-y-4 sm:space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    Instrucciones
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  <div className="space-y-2">
                    <Badge variant="outline" className="text-xs">Paso 1</Badge>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Haz clic en "Iniciar Entrevista" para comenzar la conversación con el asistente de IA.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Badge variant="outline" className="text-xs">Paso 2</Badge>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Habla de forma natural. El asistente te hará preguntas típicas de una entrevista laboral.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Badge variant="outline" className="text-xs">Paso 3</Badge>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Cuando termines, haz clic en "Finalizar" para guardar tu sesión.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Consejos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                  <p>• Responde con ejemplos concretos de tu experiencia</p>
                  <p>• Mantén un tono profesional pero natural</p>
                  <p>• No hay respuestas incorrectas, esto es práctica</p>
                  <p>• Tómate tu tiempo para pensar antes de responder</p>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Voice Assistant */}
            <div className="lg:col-span-2">
              <Card className="h-full min-h-[500px] sm:min-h-[600px]">
                <CardContent className="p-4 sm:p-6 h-full">
                  <RoleplayVoiceAssistant
                    agentId={env.elevenLabsInterviewAgentId}
                    userName={userName}
                    userId={userId}
                    sessionId={currentSessionId || undefined}
                    onSessionStart={handleSessionStart}
                    onSessionEnd={handleSessionEnd}
                    scenarioName="Mi Primer Entrevista"
                    scenarioDescription="Practica tus habilidades de entrevista con IA"
                    scenarioCode="interview"
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default InterviewPage;
