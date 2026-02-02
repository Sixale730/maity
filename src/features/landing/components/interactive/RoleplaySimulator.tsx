import { useState, useEffect, useRef } from 'react';
import { Sparkles, Send, Bot, User, Loader, Mic } from 'lucide-react';

// --- GEMINI API CONFIGURATION ---
const apiKey = ""; // La clave se inyecta en tiempo de ejecución
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

// --- Gemini API Call Helper ---
interface GeminiPayload {
  contents: { parts: { text: string }[] }[];
  systemInstruction?: { parts: { text: string }[] };
}

async function callGemini(prompt: string, systemInstruction: string | null = null): Promise<string> {
  try {
    const payload: GeminiPayload = {
      contents: [{ parts: [{ text: prompt }] }],
    };

    if (systemInstruction) {
      payload.systemInstruction = { parts: [{ text: systemInstruction }] };
    }

    const response = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) throw new Error("Gemini API Error");

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "Error en la respuesta de la IA.";
  } catch (error) {
    console.error(error);
    return "Lo siento, hubo un problema de conexión con la IA. Inténtalo de nuevo.";
  }
}

// --- Types ---
interface RoleplaySimulatorProps {
  onExit: () => void;
}

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

// --- Component ---
export const RoleplaySimulator = ({ onExit }: RoleplaySimulatorProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      text: "Hola. Veo tu propuesta de Maity, pero sinceramente, el presupuesto está muy apretado este trimestre. Convénceme de por qué debería invertir en esto ahora.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Speech Recognition Setup
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognitionCtor =
        (window as unknown as { SpeechRecognition?: typeof SpeechRecognition }).SpeechRecognition ||
        (window as unknown as { webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition;

      if (SpeechRecognitionCtor) {
        recognitionRef.current = new SpeechRecognitionCtor();
        recognitionRef.current.continuous = false;
        recognitionRef.current.lang = 'es-ES';
        recognitionRef.current.interimResults = false;

        recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
          const transcript = event.results[0][0].transcript;
          setInput(transcript);
          setIsListening(false);
        };

        recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error("Speech recognition error", event.error);
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = { role: 'user', text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    const conversationHistory = messages
      .map((m) =>
        `${m.role === 'user' ? 'Vendedor (Usuario)' : 'Cliente (Carlos)'}: ${m.text}`
      )
      .join('\n');

    const prompt = `${conversationHistory}\nVendedor (Usuario): ${input}\nCliente (Carlos): [Responde corto (max 2 frases), mantén tu postura escéptica pero profesional, reacciona a lo que dijo el vendedor]`;
    const systemPrompt =
      "Eres Carlos, un director de recursos humanos escéptico y ocupado. Estás en una negociación simulada. Tu objetivo es desafiar al vendedor sobre el valor y precio de 'Maity'. No cedas fácilmente. Sé breve y directo.";

    const aiResponseText = await callGemini(prompt, systemPrompt);

    setMessages((prev) => [...prev, { role: 'model', text: aiResponseText }]);
    setLoading(false);
  };

  return (
    <div className="pt-24 pb-12 min-h-screen bg-[#050505] text-[#e7e7e9] flex flex-col items-center">
      <div className="w-full max-w-3xl px-4 flex-grow flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Sparkles className="text-pink-500" /> Simulador de Negociación
            </h2>
            <p className="text-sm text-gray-400">
              Objetivo: Convencer a Carlos (Director RH)
            </p>
          </div>
          <button
            onClick={onExit}
            className="text-sm text-gray-500 hover:text-white underline"
          >
            Salir
          </button>
        </div>

        {/* Chat Window */}
        <div className="flex-grow bg-[#0F0F0F] rounded-xl border border-white/10 p-6 overflow-y-auto mb-4 min-h-[400px] max-h-[60vh] custom-scrollbar">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-4 mb-6 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center ${
                  msg.role === 'user' ? 'bg-pink-600' : 'bg-blue-600'
                }`}
              >
                {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
              </div>
              <div
                className={`p-4 rounded-2xl max-w-[80%] text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-pink-900/20 border border-pink-500/30 text-pink-100'
                    : 'bg-blue-900/20 border border-blue-500/30 text-blue-100'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-4 mb-6">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center animate-pulse">
                <Bot size={18} />
              </div>
              <div className="p-4 rounded-2xl bg-blue-900/10 border border-blue-500/10 text-blue-200 flex items-center gap-2">
                <Loader size={16} className="animate-spin" /> Escribiendo...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-[#141414] p-2 rounded-xl border border-white/10 flex gap-2 items-center">
          {/* Voice Input Button */}
          <button
            onClick={toggleListening}
            className={`p-3 rounded-lg transition-all ${
              isListening
                ? 'bg-red-500/20 text-red-500 animate-pulse border border-red-500/50'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
            title="Usar micrófono"
          >
            <Mic size={20} />
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder={isListening ? "Escuchando..." : "Escribe o habla tu argumento..."}
            className="flex-grow bg-transparent border-none outline-none text-white px-4 py-3 placeholder-gray-600"
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className={`p-3 rounded-lg transition-all ${
              loading || !input.trim()
                ? 'bg-gray-800 text-gray-500'
                : 'bg-pink-600 text-white hover:bg-pink-700'
            }`}
          >
            <Send size={20} />
          </button>
        </div>
        <div className="text-center mt-2 text-xs text-gray-600">
          {isListening && "Te estamos escuchando..."}
        </div>
      </div>
    </div>
  );
};
