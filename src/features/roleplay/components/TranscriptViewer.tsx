import React from 'react';
import { User, Bot } from 'lucide-react';
import { MAITY_COLORS } from '@maity/shared';

interface TranscriptViewerProps {
  transcript: string;
  className?: string;
}

interface ParsedMessage {
  type: 'user' | 'agent';
  speaker: string;
  message: string;
}

export function TranscriptViewer({ transcript, className = '' }: TranscriptViewerProps) {
  const parseTranscript = (text: string): ParsedMessage[] => {
    if (!text || text.trim().length === 0) {
      return [];
    }

    const lines = text.split('\n').filter(line => line.trim().length > 0);
    const messages: ParsedMessage[] = [];

    for (const line of lines) {
      const trimmedLine = line.trim();

      // Detectar mensajes del usuario
      if (trimmedLine.startsWith('Usuario:') || trimmedLine.startsWith('User:')) {
        const message = trimmedLine.replace(/^(Usuario:|User:)\s*/, '');
        messages.push({
          type: 'user',
          speaker: 'Usuario',
          message: message
        });
      }
      // Detectar mensajes del agente (cualquier variante)
      else if (trimmedLine.startsWith('Agente')) {
        // Extraer el perfil (CEO, CTO, CFO, etc.)
        const match = trimmedLine.match(/^Agente\s+([A-Z]+):\s*(.*)$/);
        if (match) {
          messages.push({
            type: 'agent',
            speaker: `Agente ${match[1]}`,
            message: match[2]
          });
        } else {
          // Fallback si no match el patrón esperado
          const message = trimmedLine.replace(/^Agente[^:]*:\s*/, '');
          messages.push({
            type: 'agent',
            speaker: 'Agente',
            message: message
          });
        }
      }
      // Detectar otros formatos de agente
      else if (trimmedLine.startsWith('AI:') || trimmedLine.startsWith('Agent:')) {
        const message = trimmedLine.replace(/^(AI:|Agent:)\s*/, '');
        messages.push({
          type: 'agent',
          speaker: 'Agente',
          message: message
        });
      }
    }

    return messages;
  };

  const messages = parseTranscript(transcript);

  if (messages.length === 0) {
    return (
      <div className={`text-center py-8 text-gray-400 ${className}`}>
        <p>No hay mensajes en la transcripción</p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Contador de mensajes */}
      <div className="flex justify-between items-center text-xs text-gray-400 pb-2 border-b border-gray-700">
        <span>Total de mensajes: {messages.length}</span>
        <div className="flex gap-4">
          <span>👤 Usuario: {messages.filter(m => m.type === 'user').length}</span>
          <span>🤖 Agente: {messages.filter(m => m.type === 'agent').length}</span>
        </div>
      </div>

      {/* Mensajes */}
      <div className="space-y-3">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}
          >
            <div
              className="rounded-2xl px-4 py-3 max-w-[85%]"
              style={{
                backgroundColor: msg.type === 'user'
                  ? MAITY_COLORS.secondary
                  : MAITY_COLORS.darkGrayAlpha(0.8),
                color: '#ffffff'
              }}
            >
              {/* Header con ícono y nombre */}
              <div className="flex items-center gap-2 mb-2">
                {msg.type === 'user' ? (
                  <User className="h-4 w-4" style={{ color: '#ffffff' }} />
                ) : (
                  <Bot className="h-4 w-4" style={{ color: MAITY_COLORS.primary }} />
                )}
                <span
                  className="text-xs font-semibold"
                  style={{
                    color: msg.type === 'user' ? 'rgba(255, 255, 255, 0.9)' : MAITY_COLORS.primary
                  }}
                >
                  {msg.speaker}
                </span>
              </div>

              {/* Mensaje */}
              <p
                className={`text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.type === 'user' ? 'font-semibold' : 'font-normal'
                }`}
                style={{ color: '#ffffff' }}
              >
                {msg.message}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
