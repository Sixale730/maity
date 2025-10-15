import { useState, useCallback } from 'react';
import { env } from '@/lib/env';
import type { AgentState } from '@/components/coach/CoachPage';

interface ChatMessage {
  id: string;
  text: string;
  timestamp: Date;
  sender: 'user' | 'agent';
}

interface ChatConfig {
  onStateChange?: (state: AgentState) => void;
  onError?: (error: Error) => void;
}

interface ChatStatus {
  isProcessing: boolean;
  isConfigured: boolean;
  error: string | null;
  messages: ChatMessage[];
}

export function useElevenLabsChat(config: ChatConfig = {}) {
  const [status, setStatus] = useState<ChatStatus>({
    isProcessing: false,
    isConfigured: !!env.elevenLabsApiKey,
    error: null,
    messages: [{
      id: '1',
      text: '¡Hola! Soy tu coach personal de Maity. ¿En qué puedo ayudarte hoy?',
      timestamp: new Date(),
      sender: 'agent'
    }],
  });

  const { onStateChange, onError } = config;

  // Simulate conversation with predefined responses
  const sendMessage = useCallback(async (userMessage: string) => {
    if (!userMessage.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      text: userMessage,
      timestamp: new Date(),
      sender: 'user'
    };

    // Add user message
    setStatus(prev => ({
      ...prev,
      messages: [...prev.messages, userMsg],
      isProcessing: true
    }));

    onStateChange?.('thinking');

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Generate response based on user input
    const responses = getCoachResponse(userMessage);

    const agentMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      text: responses,
      timestamp: new Date(),
      sender: 'agent'
    };

    onStateChange?.('speaking');

    // Simulate speaking delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    setStatus(prev => ({
      ...prev,
      messages: [...prev.messages, agentMsg],
      isProcessing: false
    }));

    onStateChange?.('idle');
  }, [onStateChange]);

  const clearMessages = useCallback(() => {
    setStatus(prev => ({
      ...prev,
      messages: [{
        id: '1',
        text: '¡Hola! Soy tu coach personal de Maity. ¿En qué puedo ayudarte hoy?',
        timestamp: new Date(),
        sender: 'agent'
      }]
    }));
  }, []);

  return {
    ...status,
    sendMessage,
    clearMessages,
  };
}

// Generate contextual coaching responses
function getCoachResponse(userMessage: string): string {
  const message = userMessage.toLowerCase();

  // Leadership and management topics
  if (message.includes('equipo') || message.includes('team') || message.includes('liderazgo') || message.includes('leadership')) {
    return 'El liderazgo efectivo se basa en la comunicación clara y la confianza mutua. ¿Qué desafío específico estás enfrentando con tu equipo? Podemos trabajar en estrategias para mejorar la dinámica grupal y tu estilo de liderazgo.';
  }

  // Technical skills and development
  if (message.includes('habilidades') || message.includes('skills') || message.includes('desarrollo') || message.includes('development')) {
    return 'El desarrollo de habilidades es clave en TI. Te recomiendo enfocarte en competencias tanto técnicas como blandas. ¿Hay alguna tecnología específica que te interese o alguna habilidad interpersonal que quieras desarrollar?';
  }

  // Career and growth
  if (message.includes('carrera') || message.includes('career') || message.includes('crecimiento') || message.includes('growth')) {
    return 'Tu carrera profesional es un maratón, no una carrera de velocidad. Es importante tener objetivos claros y un plan de desarrollo. ¿Cuáles son tus metas profesionales a corto y largo plazo?';
  }

  // Productivity and time management
  if (message.includes('productividad') || message.includes('productivity') || message.includes('tiempo') || message.includes('time')) {
    return 'La gestión del tiempo es fundamental para el éxito. Te sugiero aplicar técnicas como Pomodoro o time-blocking. ¿Qué actividades te consumen más tiempo actualmente y cuáles son tus mayores distracciones?';
  }

  // Stress and work-life balance
  if (message.includes('estrés') || message.includes('stress') || message.includes('balance') || message.includes('burnout')) {
    return 'El equilibrio entre vida personal y laboral es esencial para tu bienestar y rendimiento. Es importante establecer límites claros y practicar técnicas de manejo del estrés. ¿Qué estrategias has intentado hasta ahora?';
  }

  // Communication
  if (message.includes('comunicación') || message.includes('communication') || message.includes('presentación') || message.includes('presentation')) {
    return 'La comunicación efectiva es una habilidad que se puede desarrollar. Practica la escucha activa y estructura tus ideas de manera clara. ¿En qué contextos sientes que necesitas mejorar tu comunicación?';
  }

  // General motivation and guidance
  if (message.includes('motivación') || message.includes('motivation') || message.includes('ayuda') || message.includes('help')) {
    return 'Recuerda que cada desafío es una oportunidad de crecimiento. La clave está en mantener una mentalidad de aprendizaje continuo. ¿Qué te está desmotivando actualmente y cómo podemos convertirlo en una oportunidad?';
  }

  // Innovation and technology
  if (message.includes('innovación') || message.includes('innovation') || message.includes('tecnología') || message.includes('technology')) {
    return 'La innovación tecnológica es clave en el sector IT. Te recomiendo mantenerte actualizado con las tendencias emergentes y fomentar una cultura de experimentación en tu equipo. ¿Qué tecnologías emergentes te interesan más o qué barreras encuentras para innovar?';
  }

  // Problem solving
  if (message.includes('problema') || message.includes('problem') || message.includes('solución') || message.includes('solution')) {
    return 'El enfoque sistemático para resolver problemas es fundamental. Te sugiero usar metodologías como los 5 porqués o el pensamiento de diseño. ¿Podrías describir el problema específico que estás enfrentando? Así podremos estructurar un plan de acción efectivo.';
  }

  // Decision making
  if (message.includes('decisión') || message.includes('decision') || message.includes('elegir') || message.includes('choose')) {
    return 'Tomar decisiones efectivas requiere un balance entre datos y intuición. Te recomiendo hacer una matriz de decisión evaluando pros, contras y riesgos. ¿Qué tipo de decisión necesitas tomar y cuáles son las opciones que estás considerando?';
  }

  // Greeting responses
  if (message.includes('hola') || message.includes('hello') || message.includes('hi') || message.includes('buenos')) {
    return '¡Hola! Me alegra verte aquí. Soy tu coach personal especializado en desarrollo profesional para líderes de TI. Estoy aquí para ayudarte con temas de liderazgo, gestión de equipos, desarrollo de habilidades y crecimiento profesional. ¿En qué te gustaría trabajar hoy?';
  }

  // Thanks responses
  if (message.includes('gracias') || message.includes('thank') || message.includes('thanks')) {
    return 'De nada, es un placer ayudarte en tu desarrollo profesional. Recuerda que el crecimiento es un proceso continuo. ¿Hay algo más en lo que pueda apoyarte hoy?';
  }

  // Default response
  return 'Entiendo tu consulta. Como tu coach, mi objetivo es ayudarte a desarrollar tanto tus habilidades técnicas como tu liderazgo. ¿Podrías contarme más detalles sobre la situación específica que estás enfrentando? Así podremos trabajar juntos en una solución personalizada.';
}