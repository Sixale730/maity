import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, MessageSquare, X } from 'lucide-react';
import { MAITY_COLORS } from '@/lib/colors';

interface Message {
  id: string;
  text: string;
  timestamp: Date;
  sender: 'admin';
}

interface AdminTextChatProps {
  onSendMessage?: (message: string) => void;
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
}

export function AdminTextChat({ onSendMessage, isMinimized, onToggleMinimize }: AdminTextChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(true);

  // Auto scroll al final del chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputValue.trim(),
      timestamp: new Date(),
      sender: 'admin'
    };

    setMessages(prev => [...prev, newMessage]);

    // Llamar callback si existe
    if (onSendMessage) {
      onSendMessage(inputValue.trim());
    }

    // Limpiar input
    setInputValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
    if (onToggleMinimize) {
      onToggleMinimize();
    }
  };

  return (
    <div className={`flex flex-col bg-gray-900/50 border-2 rounded-xl transition-all duration-300 ${
      isExpanded ? 'w-full lg:w-96 max-h-[50vh] lg:max-h-[600px]' : 'w-fit'
    }`}
         style={{ borderColor: MAITY_COLORS.accent }}>
      {/* Header del chat */}
      <div className="p-4 border-b cursor-pointer"
           style={{ borderColor: MAITY_COLORS.accent }}
           onClick={handleToggle}>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg" style={{ backgroundColor: `${MAITY_COLORS.accent}20` }}>
            <MessageSquare
              className="w-5 h-5"
              style={{ color: MAITY_COLORS.accent }}
            />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white">Chat Admin</h3>
            {isExpanded && (
              <p className="text-xs text-gray-400">Modo texto durante la llamada</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="px-2 py-1 rounded text-xs font-medium"
                 style={{
                   backgroundColor: `${MAITY_COLORS.accent}20`,
                   color: MAITY_COLORS.accent
                 }}>
              ADMIN
            </div>
            <button
              className="p-1 hover:bg-gray-800 rounded transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                handleToggle();
              }}
            >
              {isExpanded ? (
                <X className="w-4 h-4 text-gray-400" />
              ) : (
                <MessageSquare className="w-4 h-4" style={{ color: MAITY_COLORS.accent }} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Contenido expandible */}
      {isExpanded && (
        <>
          {/* Chat messages */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 min-h-0 max-h-[30vh] lg:max-h-[400px]">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center"
                     style={{ backgroundColor: `${MAITY_COLORS.accent}20` }}>
                  <MessageSquare className="w-6 h-6" style={{ color: MAITY_COLORS.accent }} />
                </div>
                <p className="text-gray-500 text-sm">
                  Envía mensajes de texto durante la llamada
                </p>
                <p className="text-gray-600 text-xs mt-1">
                  Solo visible para administradores
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className="flex justify-end animate-in slide-in-from-right duration-200">
                  <div className="max-w-[85%] sm:max-w-[80%] p-2 sm:p-3 rounded-lg rounded-br-none shadow-lg"
                       style={{
                         backgroundColor: MAITY_COLORS.accent,
                         color: '#000000'
                       }}>
                    <p className="text-xs sm:text-sm whitespace-pre-wrap font-medium">
                      {message.text}
                    </p>
                    <p className="text-xs mt-1 opacity-70">
                      {message.timestamp.toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input area */}
          <div className="p-3 border-t" style={{ borderColor: MAITY_COLORS.accent }}>
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Escribe un mensaje de texto..."
                className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:ring-1 transition-all"
                style={{
                  borderColor: inputValue ? MAITY_COLORS.accent : undefined
                }}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                className="px-4 transition-all hover:scale-105"
                style={{
                  backgroundColor: inputValue.trim() ? MAITY_COLORS.accent : '#374151',
                  color: inputValue.trim() ? '#000000' : '#9CA3AF'
                }}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-gray-500">
                {messages.length} {messages.length === 1 ? 'mensaje enviado' : 'mensajes enviados'}
              </p>
              <p className="text-xs" style={{ color: MAITY_COLORS.accent }}>
                Chat exclusivo para administradores
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}