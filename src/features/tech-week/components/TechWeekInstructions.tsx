import { Card } from '@/ui/components/ui/card';
import { Sparkles } from 'lucide-react';

interface TechWeekInstructionsProps {
  scenarioName?: string;
  userInstructions?: string | null;
  minScoreToPass?: number;
}

export function TechWeekInstructions({
  scenarioName = 'Tech Week',
  userInstructions,
  minScoreToPass = 70
}: TechWeekInstructionsProps) {
  // Si hay instrucciones personalizadas de la BD, mostrarlas
  if (userInstructions) {
    return (
      <Card className="bg-gray-900/50 border-gray-800 p-6 h-full">
        <div className="space-y-4 h-full flex flex-col">
          {/* Header con felicitación */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: '#FF69B420' }}>
              <Sparkles className="h-6 w-6" style={{ color: '#FF69B4' }} />
            </div>
            <h3 className="text-lg font-semibold text-white">
              {scenarioName}
            </h3>
          </div>

          {/* Instrucciones de la BD */}
          <div className="flex-1 overflow-y-auto prose prose-invert prose-sm max-w-none">
            <div
              className="text-sm text-gray-300 whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: userInstructions.replace(/\n/g, '<br />') }}
            />
          </div>
        </div>
      </Card>
    );
  }

  // Mostrar instrucciones por defecto simplificadas
  return (
    <Card className="bg-gray-900/50 border-gray-800 p-6 h-full">
      <div className="space-y-5 h-full flex flex-col">
        {/* Header con felicitación */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: '#FF69B420' }}>
              <Sparkles className="h-6 w-6" style={{ color: '#FF69B4' }} />
            </div>
            <h3 className="text-lg font-semibold text-white">
              ¡Felicidades!
            </h3>
          </div>

          <p className="text-sm text-gray-300">
            Has sido seleccionada para evaluar tu comunicación.
          </p>
        </div>

        {/* Descripción del ejercicio */}
        <div className="space-y-3 flex-1">
          <p className="text-sm text-gray-300">
            Realizarás un ejercicio muy corto donde presentarás tu <strong className="text-white">elevator pitch</strong> a Maity.
          </p>

          <p className="text-sm text-gray-300">
            Maity evaluará tu presentación y te dará retroalimentación sobre tu comunicación.
          </p>
        </div>

        {/* Tips de preparación */}
        <div className="rounded-lg p-4" style={{
          backgroundColor: '#FF69B410',
          border: '1px solid #FF69B420'
        }}>
          <p className="text-sm font-medium text-white mb-2">Antes de comenzar:</p>
          <ul className="space-y-1.5 text-sm text-gray-300">
            <li className="flex items-start gap-2">
              <span style={{ color: '#FF69B4' }}>•</span>
              <span>Asegúrate de tener tu micrófono funcionando</span>
            </li>
            <li className="flex items-start gap-2">
              <span style={{ color: '#FF69B4' }}>•</span>
              <span>Busca un lugar tranquilo sin distracciones</span>
            </li>
            <li className="flex items-start gap-2">
              <span style={{ color: '#FF69B4' }}>•</span>
              <span>Relájate y habla con naturalidad</span>
            </li>
          </ul>
        </div>
      </div>
    </Card>
  );
}
