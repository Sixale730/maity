import { Card } from '@/ui/components/ui/card';
import { Info, Target, Clock, CheckCircle } from 'lucide-react';

interface ScenarioInstructionsProps {
  scenarioName: string;
  scenarioCode: string;
  profile: 'CEO' | 'CTO' | 'CFO';
  scenarioOrder: number;
  minScoreToPass: number;
  userInstructions?: string | null;
}

export function ScenarioInstructions({
  scenarioName,
  scenarioCode,
  profile,
  scenarioOrder,
  minScoreToPass,
  userInstructions
}: ScenarioInstructionsProps) {
  // Instrucciones específicas por escenario y perfil
  const getInstructions = () => {
    const baseInstructions = {
      first_visit: {
        title: "Primera Visita - Descubrimiento",
        objectives: [
          "Establecer rapport y credibilidad",
          "Identificar necesidades y pain points",
          "Calificar al prospecto",
          "Agendar siguiente paso"
        ],
        tips: {
          CEO: [
            "Enfócate en el impacto estratégico y visión a largo plazo",
            "Habla de ROI y ventajas competitivas",
            "Sé conciso y directo al punto",
            "Prepárate para preguntas sobre escalabilidad"
          ],
          CTO: [
            "Prepárate para preguntas técnicas detalladas",
            "Habla de arquitectura y integraciones",
            "Demuestra conocimiento técnico profundo",
            "Discute sobre seguridad y compliance"
          ],
          CFO: [
            "Ten números y métricas listas",
            "Habla de reducción de costos y eficiencia",
            "Prepara un análisis de TCO (Total Cost of Ownership)",
            "Sé transparente sobre precios y licenciamiento"
          ]
        }
      },
      product_demo: {
        title: "Demostración de Producto",
        objectives: [
          "Mostrar funcionalidades clave relevantes",
          "Conectar características con necesidades identificadas",
          "Manejar preguntas técnicas",
          "Generar entusiasmo y urgencia"
        ],
        tips: {
          CEO: [
            "Muestra el dashboard ejecutivo primero",
            "Enfatiza facilidad de uso y adopción",
            "Demuestra valor inmediato",
            "Conecta con objetivos estratégicos"
          ],
          CTO: [
            "Muestra la arquitectura técnica",
            "Demuestra APIs y capacidades de integración",
            "Habla de personalización y flexibilidad",
            "Muestra casos de uso técnicos"
          ],
          CFO: [
            "Muestra reportes y analytics financieros",
            "Demuestra automatización de procesos",
            "Enfatiza ahorro de tiempo y recursos",
            "Muestra el ROI calculator"
          ]
        }
      },
      objection_handling: {
        title: "Manejo de Objeciones",
        objectives: [
          "Escuchar y validar preocupaciones",
          "Responder con datos y casos de éxito",
          "Convertir objeciones en oportunidades",
          "Mantener la conversación positiva"
        ],
        tips: {
          CEO: [
            "Anticipa objeciones sobre timing y prioridades",
            "Ten casos de éxito de empresas similares",
            "Habla de riesgos de no actuar",
            "Ofrece implementación gradual"
          ],
          CTO: [
            "Prepárate para objeciones técnicas complejas",
            "Ten documentación técnica lista",
            "Ofrece POCs y trials técnicos",
            "Involucra a tu equipo técnico si es necesario"
          ],
          CFO: [
            "Anticipa objeciones de presupuesto",
            "Ten opciones de pricing flexibles",
            "Muestra análisis de costo-beneficio",
            "Ofrece términos de pago favorables"
          ]
        }
      },
      closing: {
        title: "Negociación y Cierre",
        objectives: [
          "Presentar propuesta de valor clara",
          "Negociar términos mutuamente beneficiosos",
          "Crear sentido de urgencia",
          "Asegurar compromiso y siguientes pasos"
        ],
        tips: {
          CEO: [
            "Enfatiza ventaja competitiva y time-to-market",
            "Ofrece soporte ejecutivo dedicado",
            "Propón un rollout estratégico",
            "Asegura buy-in del board si es necesario"
          ],
          CTO: [
            "Detalla el plan de implementación técnica",
            "Ofrece soporte técnico premium",
            "Propón arquitectura de solución detallada",
            "Asegura recursos técnicos dedicados"
          ],
          CFO: [
            "Presenta propuesta comercial detallada",
            "Ofrece descuentos por volumen o prepago",
            "Muestra proyección de ROI a 3 años",
            "Negocia SLAs y penalizaciones"
          ]
        }
      },
      follow_up: {
        title: "Seguimiento Post-Demo",
        objectives: [
          "Mantener momentum después de la demo",
          "Resolver dudas pendientes",
          "Involucrar a otros stakeholders",
          "Avanzar hacia la decisión final"
        ],
        tips: {
          CEO: [
            "Envía resumen ejecutivo personalizado",
            "Ofrece reunión con cliente referencia",
            "Propón workshop estratégico",
            "Mantén comunicación al nivel C-suite"
          ],
          CTO: [
            "Envía documentación técnica adicional",
            "Ofrece sesión técnica profunda",
            "Propón prueba de concepto",
            "Conecta con tu equipo de ingeniería"
          ],
          CFO: [
            "Envía análisis financiero detallado",
            "Ofrece auditoría de procesos actual",
            "Propón modelo de pricing personalizado",
            "Incluye garantías de ROI"
          ]
        }
      }
    };

    return baseInstructions[scenarioCode as keyof typeof baseInstructions] || baseInstructions.first_visit;
  };

  const instructions = getInstructions();
  const estimatedTime = scenarioOrder === 1 ? 3 : scenarioOrder <= 3 ? 5 : 7;

  // Si hay instrucciones personalizadas de la BD, mostrarlas
  if (userInstructions) {
    return (
      <Card className="bg-gray-900/50 border-gray-800 p-4 h-full">
        <div className="space-y-3 h-full flex flex-col">
          {/* Header */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-500/10 rounded-lg">
                <Info className="h-5 w-5 text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-white">
                  Escenario {scenarioOrder}: {scenarioName}
                </h3>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-400">
                    Perfil {profile} • Score mínimo: {minScoreToPass}%
                  </p>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock className="h-3 w-3" />
                    <span>{estimatedTime}-{estimatedTime + 2} min</span>
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

  // Fallback: mostrar instrucciones genéricas
  return (
    <Card className="bg-gray-900/50 border-gray-800 p-4 h-full">
      <div className="space-y-4 h-full flex flex-col">
        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-500/10 rounded-lg">
              <Info className="h-5 w-5 text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-white">
                Sala de Entrenamiento
              </h3>
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-400">
                  Escenario {scenarioOrder} • Perfil {profile}
                </p>
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Clock className="h-3 w-3" />
                  <span>{estimatedTime}-{estimatedTime + 2} min</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Instrucciones Genéricas */}
        <div className="flex-1 space-y-4">
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-200">
              ¿Cómo funciona la sala de entrenamiento?
            </h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Practica tus habilidades de comunicación en un entorno seguro.
              Mantén una conversación natural con el agente de inteligencia artificial
              que simulará diferentes situaciones profesionales.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-200">
              Consejos para tu sesión:
            </h4>
            <ul className="space-y-1.5">
              <li className="flex items-start gap-2 text-xs text-gray-400">
                <span className="text-blue-400 mt-0.5">✓</span>
                <span>Habla con claridad y naturalidad</span>
              </li>
              <li className="flex items-start gap-2 text-xs text-gray-400">
                <span className="text-blue-400 mt-0.5">✓</span>
                <span>Mantén un tono profesional y respetuoso</span>
              </li>
              <li className="flex items-start gap-2 text-xs text-gray-400">
                <span className="text-blue-400 mt-0.5">✓</span>
                <span>Escucha activamente y responde con atención</span>
              </li>
              <li className="flex items-start gap-2 text-xs text-gray-400">
                <span className="text-blue-400 mt-0.5">✓</span>
                <span>No te preocupes por errores, es parte del aprendizaje</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Recordatorio */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mt-auto">
          <p className="text-xs text-blue-400">
            💡 Esta es tu oportunidad de practicar sin presión. Aprovecha el tiempo para mejorar tus habilidades.
          </p>
        </div>
      </div>
    </Card>
  );
}