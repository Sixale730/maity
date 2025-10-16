import React, { useState } from 'react';
import { Button } from '@/ui/components/ui/button';
import { Input } from '@/ui/components/ui/input';
import { ScrollArea } from '@/ui/components/ui/scroll-area';
import { Mic, MicOff, Send, MessageCircle, Loader2, Volume2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useElevenLabsChat, useVoiceConversation } from '@maity/shared';
import { env } from '@/lib/env';
import type { AgentState } from '../types';

interface VoiceInterfaceProps {
  agentState: AgentState;
  onStateChange: (state: AgentState) => void;
}

export function VoiceInterface({ agentState, onStateChange }: VoiceInterfaceProps) {
  const [currentMessage, setCurrentMessage] = useState('');
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const { t } = useLanguage();

  const { messages, isProcessing, sendMessage, clearMessages } = useElevenLabsChat({
    onStateChange,
  });

  // Voice conversation hook
  const {
    isListening,
    isSpeaking,
    canUseVoice,
    transcript,
    error: voiceError,
    startListening,
    stopListening,
    stopSpeaking,
  } = useVoiceConversation({
    onStateChange,
    onTranscript: (text) => {
      setCurrentMessage(text);
    },
    onResponse: (_response) => {
      // Voice response received - could be added to chat messages in the future
      // This would ideally update the messages state, but we'll keep it simple for now
    },
    onError: (error) => {
      console.error('Voice error:', error);
    }
  });

  // Update voice mode availability based on configuration
  const isVoiceConfigured = !!env.elevenLabsApiKey && canUseVoice;

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || isProcessing) return;

    const messageToSend = currentMessage;
    setCurrentMessage('');
    await sendMessage(messageToSend);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleVoiceToggle = () => {
    if (isVoiceMode && isListening) {
      stopListening();
    } else if (isVoiceMode && !isListening) {
      startListening();
    }
    setIsVoiceMode(!isVoiceMode);
  };

  const handleVoiceAction = () => {
    if (isListening) {
      stopListening();
    } else if (isSpeaking) {
      stopSpeaking();
    } else {
      startListening();
    }
  };

  const getStatusMessage = () => {
    switch (agentState) {
      case 'listening':
        return t('coach.status.listening');
      case 'thinking':
        return t('coach.status.thinking');
      case 'speaking':
        return t('coach.status.speaking');
      default:
        return t('coach.status.ready');
    }
  };

  const getStatusColor = () => {
    switch (agentState) {
      case 'listening':
        return 'text-green-400';
      case 'thinking':
        return 'text-yellow-400';
      case 'speaking':
        return 'text-blue-400';
      default:
        return 'text-white';
    }
  };

  return (
    <div className="space-y-6">
      {/* Status Display */}
      <div className="text-center">
        <div className={`text-lg font-medium ${getStatusColor()} transition-colors duration-300 mb-4`}>
          {getStatusMessage()}
        </div>

        {/* Animated Status Indicator */}
        <div className="flex justify-center mb-4">
          <div className={`w-4 h-4 rounded-full transition-all duration-300 ${
            agentState === 'listening' ? 'bg-green-400 animate-pulse' :
            agentState === 'thinking' ? 'bg-yellow-400 animate-ping' :
            agentState === 'speaking' ? 'bg-blue-400 animate-bounce' :
            'bg-gray-400'
          }`} />
        </div>
      </div>

      {/* Chat Interface */}
      <div className="bg-white/5 rounded-xl border border-white/10 p-4">
        {/* Messages Area */}
        <ScrollArea className="h-64 mb-4 pr-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-blue-600 text-white ml-4'
                      : 'bg-white/10 text-white mr-4'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {message.sender === 'agent' && (
                      <MessageCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    )}
                    <p className="text-sm leading-relaxed">{message.text}</p>
                  </div>
                  <p className="text-xs opacity-60 mt-1">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            ))}
            {isProcessing && (
              <div className="flex justify-start">
                <div className="bg-white/10 text-white mr-4 p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">{t('coach.thinking')}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="flex gap-2">
          <Input
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={t('coach.placeholder')}
            disabled={isProcessing}
            className="bg-white/5 border-white/20 text-white placeholder-white/60"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!currentMessage.trim() || isProcessing}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4"
          >
            {isProcessing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4">
        <Button
          variant="outline"
          onClick={clearMessages}
          className="bg-white/5 border-white/20 text-white hover:bg-white/10"
        >
          {t('coach.new_conversation')}
        </Button>

        <Button
          variant="outline"
          onClick={handleVoiceToggle}
          className={`bg-white/5 border-white/20 text-white hover:bg-white/10 ${
            isVoiceMode ? 'bg-blue-600/20 border-blue-400/40' : ''
          }`}
          disabled={!isVoiceConfigured}
        >
          {isVoiceMode ? <MicOff className="w-4 h-4 mr-2" /> : <Mic className="w-4 h-4 mr-2" />}
          {isVoiceConfigured ?
            (isVoiceMode ? 'Modo Texto' : 'Modo Voz') :
            t('coach.voice_mode')
          }
        </Button>
      </div>

      {/* Voice Mode Interface */}
      {isVoiceMode && isVoiceConfigured && (
        <div className="bg-white/5 rounded-xl border border-white/10 p-6">
          <div className="text-center space-y-4">
            <h3 className="text-lg font-medium text-white">Modo Conversación por Voz</h3>

            {/* Voice Action Button */}
            <Button
              onClick={handleVoiceAction}
              className={`w-24 h-24 rounded-full transition-all duration-300 text-white ${
                isListening
                  ? 'bg-green-600 hover:bg-green-700 shadow-lg shadow-green-500/30 animate-pulse'
                  : isSpeaking
                  ? 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30'
                  : 'bg-gray-600 hover:bg-gray-700 shadow-lg'
              }`}
            >
              {isListening ? (
                <Mic className="w-8 h-8" />
              ) : isSpeaking ? (
                <Volume2 className="w-8 h-8" />
              ) : (
                <Mic className="w-8 h-8" />
              )}
            </Button>

            {/* Voice Status */}
            <div className="space-y-2">
              <p className={`font-medium ${
                isListening ? 'text-green-400' :
                isSpeaking ? 'text-blue-400' :
                'text-white'
              }`}>
                {isListening ? '🎤 Escuchando...' :
                 isSpeaking ? '🔊 Hablando...' :
                 '⏸️ Listo para conversar'
                }
              </p>

              {transcript && (
                <div className="bg-white/10 rounded-lg p-3 max-w-md mx-auto">
                  <p className="text-sm text-white/80">"{transcript}"</p>
                </div>
              )}

              {voiceError && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                  <p className="text-red-300 text-sm">{voiceError}</p>
                </div>
              )}
            </div>

            <p className="text-white/60 text-sm">
              {isListening ? 'Habla ahora, te estoy escuchando...' :
               isSpeaking ? 'Escucha mi respuesta...' :
               'Presiona el micrófono y comienza a hablar'
              }
            </p>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="text-center text-white/60 text-sm">
        <p>{isVoiceMode ? 'Conversación por voz activada' : t('coach.instructions')}</p>
        <p className="text-xs text-white/40 mt-1">
          ✨ {t('coach.specialties')}
        </p>
        {isVoiceConfigured && (
          <p className="text-xs text-green-400 mt-2">
            🎤 ElevenLabs configurado - Voz disponible
          </p>
        )}
      </div>
    </div>
  );
}