-- Add user_instructions column to voice_profile_scenarios
-- This will store instructions shown to users before starting a practice session

ALTER TABLE maity.voice_profile_scenarios
ADD COLUMN IF NOT EXISTS user_instructions TEXT;

COMMENT ON COLUMN maity.voice_profile_scenarios.user_instructions IS 'Instrucciones mostradas al usuario antes de iniciar la práctica';

-- Update CFO - Primera Visita scenarios with initial instructions
UPDATE maity.voice_profile_scenarios vps
SET user_instructions = '🚀 Descripción de la actividad

Este es un ejercicio de role playing (simulación) de una primera visita con Maity. Tú eres el comunicador: vas a expresar un mensaje y mantener una conversación. Maity será tu interlocutor (ej. un Director de área, CFO, CTO, etc.).

La dinámica está diseñada para que practiques cómo iniciar, guiar y cerrar una reunión inicial de manera clara y efectiva.

🎯 Objetivo

Que desarrolles tu capacidad para ganar confianza, descubrir lo que tu interlocutor necesita o piensa, y cerrar la conversación con un siguiente paso concreto.

✅ ¿Qué debes hacer?

Inicia la conversación saludando y presentándote (ejemplo: "Hola, soy parte del equipo de…").

Rompe el hielo: haz un comentario breve que genere confianza o credibilidad.

Explora con preguntas abiertas (ejemplo: "¿Cuáles son sus principales retos ahora mismo?").

Escucha y responde: toma lo que Maity diga y profundiza con más preguntas o comentarios.

Cierra proponiendo un siguiente paso (ejemplo: "¿Le parece si programamos otra reunión para revisar opciones?").

💡 Tip: No memorices un guion. Habla como si fuera una reunión real. Maity adaptará sus respuestas según cómo te comuniques.'
FROM maity.voice_agent_profiles vap, maity.voice_scenarios vsc
WHERE vps.profile_id = vap.id
  AND vps.scenario_id = vsc.id
  AND vap.name = 'CFO'
  AND vsc.code = 'first_visit';
