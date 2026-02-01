import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Send, Mic, MicOff, User, Bot, X, Loader } from 'lucide-react';
import { FadeIn } from '../shared/FadeIn';
import { LANDING_COLORS } from '../../constants/colors';

interface Message {
  role: 'user' | 'model';
  text: string;
}

const INITIAL_MESSAGE: Message = {
  role: 'model',
  text: 'Hola. Veo tu propuesta de Maity, pero sinceramente, el presupuesto está muy apretado este trimestre. Convénceme de por qué debería invertir en esto ahora.',
};

const SYSTEM_PROMPT =
  'Eres Carlos, un director de recursos humanos escéptico y ocupado. Tienes 15 años de experiencia y has visto muchas soluciones de capacitación fallar. Responde de forma realista: haz objeciones sobre presupuesto, tiempo de implementación, ROI, y resistencia del equipo. No seas fácil de convencer pero tampoco imposible. Si el usuario presenta buenos argumentos, muestra interés gradualmente. Responde en español, máximo 3 oraciones. No rompas el personaje.';

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=';

async function callGemini(prompt: string, systemInstruction?: string): Promise<string> {
  try {
    const payload: Record<string, unknown> = { contents: [{ parts: [{ text: prompt }] }] };
    if (systemInstruction) {
      payload.systemInstruction = { parts: [{ text: systemInstruction }] };
    }
    const response = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('Gemini API Error');
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Error en la respuesta de la IA.';
  } catch {
    return 'Lo siento, hubo un problema de conexión con la IA. Inténtalo de nuevo.';
  }
}

export const RoleplaySimulator = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // Setup speech recognition
  useEffect(() => {
    const SpeechRecognitionAPI =
      (window as unknown as { webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition ||
      window.SpeechRecognition;
    if (!SpeechRecognitionAPI) return;

    const recognition = new SpeechRecognitionAPI();
    recognition.lang = 'es-ES';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0]?.[0]?.transcript;
      if (transcript) setInput((prev) => prev + transcript);
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognitionRef.current = recognition;
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { role: 'user', text };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput('');
    setLoading(true);

    // Build conversation context
    const conversationContext = updated
      .map((m) => `${m.role === 'user' ? 'Usuario' : 'Carlos'}: ${m.text}`)
      .join('\n');

    const reply = await callGemini(
      `Continúa esta conversación de negociación. Solo responde como Carlos.\n\n${conversationContext}\nCarlos:`,
      SYSTEM_PROMPT,
    );

    setMessages((prev) => [...prev, { role: 'model', text: reply }]);
    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <section className="min-h-screen flex flex-col px-4 py-6 md:px-6 md:py-8 max-w-3xl mx-auto">
      {/* Header */}
      <FadeIn>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${LANDING_COLORS.maityPink}20` }}
            >
              <Sparkles className="w-5 h-5" style={{ color: LANDING_COLORS.maityPink }} />
            </div>
            <div>
              <h1 className="text-lg font-bold" style={{ color: LANDING_COLORS.textMain }}>
                Simulador de Negociación
              </h1>
              <p className="text-xs" style={{ color: LANDING_COLORS.textMuted }}>
                Practica persuasión con IA en tiempo real
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm border border-white/10 hover:bg-white/5 transition-colors"
            style={{ color: LANDING_COLORS.textMuted }}
          >
            <X className="w-4 h-4" /> Salir
          </button>
        </div>
      </FadeIn>

      {/* Chat window */}
      <div
        ref={chatRef}
        className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 min-h-0"
        style={{ maxHeight: 'calc(100vh - 220px)' }}
      >
        {messages.map((msg, i) => {
          const isUser = msg.role === 'user';
          return (
            <div key={i} className={`flex items-end gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
              {!isUser && (
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${LANDING_COLORS.maityBlue}20` }}
                >
                  <Bot className="w-4 h-4" style={{ color: LANDING_COLORS.maityBlue }} />
                </div>
              )}
              <div
                className="max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed"
                style={{
                  backgroundColor: isUser ? LANDING_COLORS.maityPink : `${LANDING_COLORS.maityBlue}20`,
                  color: isUser ? '#ffffff' : LANDING_COLORS.textMain,
                  borderBottomRightRadius: isUser ? '4px' : undefined,
                  borderBottomLeftRadius: !isUser ? '4px' : undefined,
                }}
              >
                {msg.text}
              </div>
              {isUser && (
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${LANDING_COLORS.maityPink}20` }}
                >
                  <User className="w-4 h-4" style={{ color: LANDING_COLORS.maityPink }} />
                </div>
              )}
            </div>
          );
        })}

        {/* Loading indicator */}
        {loading && (
          <div className="flex items-end gap-2 justify-start">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${LANDING_COLORS.maityBlue}20` }}
            >
              <Bot className="w-4 h-4" style={{ color: LANDING_COLORS.maityBlue }} />
            </div>
            <div className="px-4 py-3 rounded-2xl" style={{ backgroundColor: `${LANDING_COLORS.maityBlue}20` }}>
              <Loader className="w-4 h-4 animate-spin" style={{ color: LANDING_COLORS.maityBlue }} />
            </div>
          </div>
        )}
      </div>

      {/* Input area */}
      <div
        className="flex items-center gap-2 p-3 rounded-xl border border-white/10"
        style={{ backgroundColor: LANDING_COLORS.bgCard }}
      >
        <button
          onClick={toggleListening}
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors"
          style={{
            backgroundColor: isListening ? '#ef444430' : 'rgba(255,255,255,0.05)',
            border: isListening ? '1px solid #ef4444' : '1px solid transparent',
          }}
          title={isListening ? 'Detener micrófono' : 'Hablar'}
        >
          {isListening ? (
            <MicOff className="w-4 h-4" style={{ color: '#ef4444' }} />
          ) : (
            <Mic className="w-4 h-4" style={{ color: LANDING_COLORS.textMuted }} />
          )}
        </button>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escribe tu argumento..."
          className="flex-1 bg-transparent outline-none text-sm"
          style={{ color: LANDING_COLORS.textMain }}
          disabled={loading}
        />

        <button
          onClick={handleSend}
          disabled={!input.trim() || loading}
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors"
          style={{
            backgroundColor: input.trim() ? LANDING_COLORS.maityPink : 'rgba(255,255,255,0.05)',
            cursor: input.trim() && !loading ? 'pointer' : 'default',
          }}
        >
          <Send className="w-4 h-4" style={{ color: input.trim() ? '#ffffff' : LANDING_COLORS.textMuted }} />
        </button>
      </div>
    </section>
  );
};
