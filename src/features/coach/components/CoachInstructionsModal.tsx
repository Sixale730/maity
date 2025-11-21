import { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/ui/components/ui/dialog';
import { Button } from '@/ui/components/ui/button';
import { Lightbulb, Mic, Volume2, Timer, Target, CheckCircle2 } from 'lucide-react';
import { MAITY_COLORS } from '@maity/shared';

interface CoachInstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartInterview: () => void;
}

export function CoachInstructionsModal({
  isOpen,
  onClose,
  onStartInterview,
}: CoachInstructionsModalProps) {
  // Log when component renders and isOpen changes
  useEffect(() => {
    console.log('[CoachInstructionsModal] 🎨 Renderizando modal, isOpen:', isOpen);
  }, [isOpen]);

  const handleStartInterview = () => {
    console.log('[CoachInstructionsModal] ✅ Click en Comenzar Entrevista');
    onStartInterview();
  };

  const handleOpenChange = (open: boolean) => {
    console.log('[CoachInstructionsModal] 🚪 Dialog onOpenChange, valor:', open);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white">
            Preparación para la Entrevista Diagnóstica
          </DialogTitle>
          <DialogDescription className="text-base text-gray-300">
            Aprende cómo prepararte para tu conversación con el Coach
          </DialogDescription>
        </DialogHeader>

        {/* YouTube Video */}
        <div className="w-full">
          <div className="aspect-video w-full rounded-lg overflow-hidden shadow-lg">
            <iframe
              src="https://www.youtube.com/embed/LBS1Lp2sl7I"
              title="Instrucciones para la Entrevista Diagnóstica"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        </div>

        {/* Tips Section */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="h-5 w-5" style={{ color: MAITY_COLORS.primary }} />
            <h3 className="text-lg font-semibold text-gray-900">
              Consejos para la Entrevista
            </h3>
          </div>

          <div className="space-y-3 text-sm">
            {/* Tip 1 */}
            <div className="flex items-start gap-3 p-3 rounded-lg border" style={{
              backgroundColor: MAITY_COLORS.primaryAlpha(0.1),
              borderColor: MAITY_COLORS.primaryAlpha(0.3)
            }}>
              <Volume2 className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: MAITY_COLORS.primary }} />
              <div>
                <p className="font-medium text-white">Busca un lugar tranquilo</p>
                <p className="text-gray-300 text-xs mt-1">
                  Elige un espacio sin interrupciones donde puedas hablar con libertad
                </p>
              </div>
            </div>

            {/* Tip 2 */}
            <div className="flex items-start gap-3 p-3 rounded-lg border" style={{
              backgroundColor: MAITY_COLORS.secondaryAlpha(0.1),
              borderColor: MAITY_COLORS.secondaryAlpha(0.3)
            }}>
              <Mic className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: MAITY_COLORS.secondary }} />
              <div>
                <p className="font-medium text-white">Verifica tu micrófono</p>
                <p className="text-gray-300 text-xs mt-1">
                  Asegúrate de que tu micrófono funcione correctamente antes de comenzar
                </p>
              </div>
            </div>

            {/* Tip 3 */}
            <div className="flex items-start gap-3 p-3 rounded-lg border" style={{
              backgroundColor: MAITY_COLORS.primaryAlpha(0.1),
              borderColor: MAITY_COLORS.primaryAlpha(0.3)
            }}>
              <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: MAITY_COLORS.primary }} />
              <div>
                <p className="font-medium text-white">Habla con naturalidad</p>
                <p className="text-gray-300 text-xs mt-1">
                  Responde como en una conversación real. No hay respuestas correctas o incorrectas
                </p>
              </div>
            </div>

            {/* Tip 4 */}
            <div className="flex items-start gap-3 p-3 rounded-lg border" style={{
              backgroundColor: MAITY_COLORS.secondaryAlpha(0.1),
              borderColor: MAITY_COLORS.secondaryAlpha(0.3)
            }}>
              <Timer className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: MAITY_COLORS.secondary }} />
              <div>
                <p className="font-medium text-white">Duración estimada: 5-10 minutos</p>
                <p className="text-gray-300 text-xs mt-1">
                  La entrevista es breve y conversacional
                </p>
              </div>
            </div>

            {/* Tip 5 */}
            <div className="flex items-start gap-3 p-3 rounded-lg border" style={{
              backgroundColor: MAITY_COLORS.primaryAlpha(0.1),
              borderColor: MAITY_COLORS.primaryAlpha(0.3)
            }}>
              <Target className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: MAITY_COLORS.primary }} />
              <div>
                <p className="font-medium text-white">6 competencias evaluadas</p>
                <p className="text-gray-300 text-xs mt-1">
                  El Coach evaluará: Claridad, Adaptación, Persuasión, Estructura, Propósito y Empatía
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleStartInterview}
            className="w-full text-white font-semibold py-6 text-base hover:opacity-90 transition-opacity"
            style={{
              background: `linear-gradient(to right, ${MAITY_COLORS.primary}, ${MAITY_COLORS.secondary})`,
            }}
          >
            Comenzar Entrevista
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
