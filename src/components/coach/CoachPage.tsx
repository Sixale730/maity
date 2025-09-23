import React, { useState, useCallback, useRef } from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, MessageCircle, Loader2, Phone, PhoneOff, Eye, EyeOff, Sparkles } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ElevenLabsConvAI } from './ElevenLabsConvAI';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'agent';
  timestamp: Date;
}

export function CoachPage() {
  const { t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: '¡Hola! Soy tu coach personal de Maity. ¿En qué puedo ayudarte hoy?',
      sender: 'agent',
      timestamp: new Date()
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Voice functionality
  const [isCallActive, setIsCallActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [showTranscript, setShowTranscript] = useState(true);
  const [activeTab, setActiveTab] = useState('elevenlabs');

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  const generateResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();

    if (input.includes('hola') || input.includes('hello')) {
      return '¡Hola! Me alegra verte aquí. Soy tu coach personal especializado en desarrollo profesional para líderes de TI. ¿En qué te gustaría trabajar hoy?';
    }

    if (input.includes('equipo') || input.includes('liderazgo')) {
      return 'El liderazgo efectivo se basa en la comunicación clara y la confianza mutua. ¿Qué desafío específico estás enfrentando con tu equipo?';
    }

    if (input.includes('productividad') || input.includes('tiempo')) {
      return 'La gestión del tiempo es fundamental para el éxito. Te sugiero aplicar técnicas como Pomodoro. ¿Qué actividades te consumen más tiempo?';
    }

    if (input.includes('habilidades') || input.includes('desarrollo')) {
      return 'El desarrollo de habilidades es clave en TI. ¿Hay alguna habilidad específica que te interese desarrollar?';
    }

    return 'Entiendo tu consulta. Como tu coach, estoy aquí para ayudarte con tu desarrollo profesional. ¿Podrías contarme más detalles?';
  };

  // Initialize speech recognition
  const initializeSpeechRecognition = useCallback(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();

      if (recognitionRef.current) {
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'es-ES';

        recognitionRef.current.onstart = () => {
          setIsListening(true);
        };

        recognitionRef.current.onresult = (event) => {
          const currentTranscript = Array.from(event.results)
            .map(result => result[0].transcript)
            .join('');
          setTranscript(currentTranscript);

          // Process final results
          if (event.results[event.results.length - 1].isFinal) {
            handleVoiceMessage(currentTranscript);
          }
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
          if (isCallActive) {
            // Restart listening if call is still active
            setTimeout(() => {
              recognitionRef.current?.start();
            }, 100);
          }
        };

        recognitionRef.current.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };
      }
    }

    // Initialize speech synthesis
    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }
  }, [isCallActive]);

  // Handle voice message
  const handleVoiceMessage = useCallback(async (voiceText: string) => {
    if (!voiceText.trim()) return;

    setTranscript('');
    setIsProcessing(true);

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: voiceText,
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);

    // Generate and speak response
    setTimeout(() => {
      const response = generateResponse(voiceText);
      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: 'agent',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, agentMessage]);
      setIsProcessing(false);

      // Speak the response
      if (synthRef.current && isCallActive) {
        const utterance = new SpeechSynthesisUtterance(response);
        utterance.lang = 'es-ES';
        utterance.rate = 0.9;
        utterance.pitch = 1.0;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);

        synthRef.current.speak(utterance);
      }
    }, 1000);
  }, [isCallActive]);

  // Start voice call
  const startCall = useCallback(() => {
    initializeSpeechRecognition();
    setIsCallActive(true);
    setTranscript('');

    if (recognitionRef.current) {
      recognitionRef.current.start();
    }
  }, [initializeSpeechRecognition]);

  // End voice call
  const endCall = useCallback(() => {
    setIsCallActive(false);
    setIsListening(false);
    setIsSpeaking(false);
    setTranscript('');

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    if (synthRef.current) {
      synthRef.current.cancel();
    }
  }, []);

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || isProcessing) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: currentMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsProcessing(true);

    // Simulate processing delay
    setTimeout(() => {
      const response = generateResponse(currentMessage);
      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: 'agent',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, agentMessage]);
      setIsProcessing(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      <main className="flex-1 p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <SidebarTrigger className="text-white hover:bg-white/10" />
          <div>
            <h1 className="text-3xl font-bold text-white">Coach IA</h1>
            <p className="text-white/70">Tu mentor personal para crecimiento profesional</p>
          </div>
        </div>

        {/* Voice Controls with Tabs */}
        <div className="max-w-4xl mx-auto mb-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-white/10 border-white/20">
              <TabsTrigger value="elevenlabs" className="data-[state=active]:bg-white/20">
                <Sparkles className="w-4 h-4 mr-2" />
                ElevenLabs AI
              </TabsTrigger>
              <TabsTrigger value="browser" className="data-[state=active]:bg-white/20">
                <Phone className="w-4 h-4 mr-2" />
                Navegador Nativo
              </TabsTrigger>
            </TabsList>

            <TabsContent value="elevenlabs" className="mt-4">
              <ElevenLabsConvAI
                onMessageReceived={(text, sender) => {
                  const newMessage: Message = {
                    id: Date.now().toString(),
                    text,
                    sender,
                    timestamp: new Date()
                  };
                  setMessages(prev => [...prev, newMessage]);
                }}
              />
            </TabsContent>

            <TabsContent value="browser" className="mt-4">
              <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex gap-2">
                      <Button
                        onClick={startCall}
                        disabled={isCallActive}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        Iniciar Llamada
                      </Button>
                      <Button
                        onClick={endCall}
                        disabled={!isCallActive}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        <PhoneOff className="w-4 h-4 mr-2" />
                        Terminar Llamada
                      </Button>
                    </div>

                    {isCallActive && (
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${
                          isSpeaking ? 'bg-blue-400 animate-pulse' :
                          isListening ? 'bg-green-400 animate-pulse' :
                          'bg-yellow-400'
                        }`} />
                        <span className="text-white text-sm">
                          {isSpeaking ? 'Coach hablando...' :
                           isListening ? 'Escuchando...' :
                           'En llamada'
                          }
                        </span>
                      </div>
                    )}
                  </div>

                  {isCallActive && (
                    <Button
                      onClick={() => setShowTranscript(!showTranscript)}
                      variant="outline"
                      size="sm"
                      className="bg-white/5 border-white/20 text-white hover:bg-white/10"
                    >
                      {showTranscript ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
                      {showTranscript ? 'Ocultar' : 'Mostrar'} Transcripción
                    </Button>
                  )}
                </div>

                {/* Transcript */}
                {isCallActive && showTranscript && transcript && (
                  <div className="mt-4 p-3 bg-black/20 rounded-lg border border-white/10">
                    <div className="text-white/60 text-xs mb-1">Transcripción en tiempo real:</div>
                    <div className="text-white text-sm">"{transcript}"</div>
                  </div>
                )}

                {/* Instructions for browser */}
                {!isCallActive && (
                  <div className="mt-4 text-white/60 text-sm">
                    <p>🎤 Usa el reconocimiento de voz nativo del navegador</p>
                    <p>🔊 Síntesis de voz con las voces del sistema</p>
                  </div>
                )}
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Chat Interface */}
        <div className="max-w-4xl mx-auto">
          <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">
                Coach de Inteligencia Artificial
              </h2>
              <p className="text-white/80">
                Conversa con tu coach personal para obtener mentoría personalizada
              </p>
            </div>

            {/* Messages */}
            <ScrollArea className="h-96 mb-4 pr-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-4 rounded-lg ${
                        message.sender === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white/20 text-white'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {message.sender === 'agent' && (
                          <MessageCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                        )}
                        <p className="leading-relaxed">{message.text}</p>
                      </div>
                      <p className="text-xs opacity-60 mt-2">
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
                    <div className="bg-white/20 text-white p-4 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Tu coach está pensando...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="flex gap-2">
              <Input
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Escribe tu consulta de coaching..."
                disabled={isProcessing}
                className="bg-white/10 border-white/30 text-white placeholder-white/60"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!currentMessage.trim() || isProcessing}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isProcessing ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </div>

            <div className="text-center text-white/60 text-sm mt-4">
              <p>✨ Tu coach inteligente está listo para ayudarte con liderazgo, productividad y desarrollo profesional</p>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}

// Type declarations for Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}