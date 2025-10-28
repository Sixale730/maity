import { Card } from '@/ui/components/ui/card';
import { Info, Target, Clock, CheckCircle, Zap } from 'lucide-react';

interface TechWeekInstructionsProps {
  scenarioName?: string;
  userInstructions?: string | null;
  minScoreToPass?: number;
}

export function TechWeekInstructions({
  scenarioName = 'Tech Week - Sesión General',
  userInstructions,
  minScoreToPass = 70
}: TechWeekInstructionsProps) {
  // Instrucciones por defecto para Tech Week
  const defaultInstructions = {
    title: "Tech Week - Práctica Intensiva",
    objectives: [
      "Comunicar ideas técnicas de forma clara y accesible",
      "Responder preguntas técnicas con confianza y precisión",
      "Demostrar profesionalismo y habilidades de networking",
      "Presentar proyectos con estructura y claridad"
    ],
    tips: [
      "Prepara un elevator pitch de 60-90 segundos",
      "Conoce bien tu proyecto o área de expertise",
      "Mantén un balance entre profundidad técnica y claridad",
      "Practica respuestas a preguntas frecuentes",
      "Adapta tu mensaje según tu audiencia",
      "Cierra con llamados a la acción o siguientes pasos"
    ],
    estimatedTime: 5
  };

  // Si hay instrucciones personalizadas de la BD, mostrarlas
  if (userInstructions) {
    return (
      <Card className="bg-gray-900/50 border-gray-800 p-4 h-full">
        <div className="space-y-3 h-full flex flex-col">
          {/* Header */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg" style={{ backgroundColor: '#FF69B410' }}>
                <Info className="h-5 w-5" style={{ color: '#FF69B4' }} />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-white">
                  {scenarioName}
                </h3>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-400">
                    Score mínimo: {minScoreToPass}%
                  </p>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock className="h-3 w-3" />
                    <span>{defaultInstructions.estimatedTime}-{defaultInstructions.estimatedTime + 2} min</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Instrucciones de la BD */}
          <div className="flex-1 overflow-y-auto prose prose-invert prose-sm max-w-none">
            <div
              className="text-xs text-gray-300 whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: userInstructions.replace(/\n/g, '<br />') }}
            />
          </div>
        </div>
      </Card>
    );
  }

  // Mostrar instrucciones por defecto
  return (
    <Card className="bg-gray-900/50 border-gray-800 p-4 h-full">
      <div className="space-y-3 h-full flex flex-col">
        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg" style={{ backgroundColor: '#FF69B410' }}>
              <Zap className="h-5 w-5" style={{ color: '#FF69B4' }} />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-white">
                {defaultInstructions.title}
              </h3>
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-400">
                  Score mínimo: {minScoreToPass}%
                </p>
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Clock className="h-3 w-3" />
                  <span>{defaultInstructions.estimatedTime}-{defaultInstructions.estimatedTime + 2} min</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Objetivos */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-sm font-medium text-gray-300">
            <Target className="h-4 w-4" style={{ color: '#FF1493' }} />
            <span>Objetivos</span>
          </div>
          <ul className="space-y-1 ml-5">
            {defaultInstructions.objectives.map((objective, idx) => (
              <li key={idx} className="flex items-start gap-1.5 text-xs text-gray-400">
                <CheckCircle className="h-3 w-3 mt-0.5 flex-shrink-0" style={{ color: '#FF1493' }} />
                <span>{objective}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Tips para Tech Week */}
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-1.5 text-sm font-medium text-gray-300">
            <Info className="h-4 w-4" style={{ color: '#FF69B4' }} />
            <span>Tips para Tech Week</span>
          </div>
          <ul className="space-y-1 ml-5">
            {defaultInstructions.tips.map((tip, idx) => (
              <li key={idx} className="flex items-start gap-1.5 text-xs text-gray-400">
                <span style={{ color: '#FF69B4' }}>•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Recordatorio */}
        <div className="rounded-lg p-3 mt-auto" style={{
          backgroundColor: '#FFB6C110',
          border: '1px solid #FFB6C120'
        }}>
          <p className="text-xs" style={{ color: '#FFB6C1' }}>
            💡 El agente evaluará tu claridad técnica, profesionalismo y capacidad de comunicación. Sé claro, conciso y profesional.
          </p>
        </div>
      </div>
    </Card>
  );
}
