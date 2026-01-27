import React, { useState, useEffect, useRef } from 'react';
import {
    Mic, Play, Pause, BarChart2, Zap, Mountain,
    Users, Shield, Check, ChevronRight, Menu, X,
    Award, TrendingUp, TrendingDown, MessageSquare, Heart, Lock,
    Activity, ArrowUpRight, Radio, Brain, Target,
    RefreshCcw, Building2, Globe, PieChart,
    Mail, Key, ArrowRight, Laptop, Video, FileText,
    UserCheck, AlertTriangle, Lightbulb, Eye, Star, Briefcase,
    Map, Sword, Backpack, Thermometer, Wind, Trophy, Flame,
    HelpCircle, ChevronDown, Plus, Minus, Tag, Battery, Bluetooth, Wifi, HardDrive,
    Sparkles, Send, Bot, User, Loader, DollarSign, Clock, Smartphone
} from 'lucide-react';

// --- GEMINI API CONFIGURATION ---
const apiKey = ""; // La clave se inyecta en tiempo de ejecución
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

// --- DESIGN SYSTEM & CONSTANTS ---
const COLORS = {
    maityPink: '#ff0050', // Acción principal
    maityBlue: '#485df4', // Confianza
    maityGreen: '#1bea9a', // Éxito
    textMain: '#e7e7e9',   // Texto principal
    textMuted: '#A1A1AA',  // Texto secundario
    bgDark: '#050505',     // Fondo profundo
    bgCard: '#0F0F0F',     // Fondo tarjetas
    bgElevated: '#1A1A1A'  // Elementos flotantes
};

// --- MOCK DATA ---
const DASHBOARD_DATA = {
    user: {
        name: 'PONCHO ROBLES',
        level: 1,
        xp: 170,
        rank: 'Novato',
        streak: 23,
        avatar: 'PR'
    },
    scores: {
        yesterday: 5.6,
        today: 7.2
    },
    skills: [
        { name: 'Claridad', value: 80 },
        { name: 'Adaptación', value: 65 },
        { name: 'Estructura', value: 90 },
        { name: 'Propósito', value: 70 },
        { name: 'Empatía', value: 85 },
        { name: 'Persuasivo', value: 60 },
    ],
    badges: [
        { name: 'Negociador Valiente', xp: 170, icon: <Shield size={14} /> },
        { name: 'Precisión Verbal', xp: 90, icon: <Target size={14} /> },
        { name: 'Empático aguerrido', xp: 50, icon: <Heart size={14} /> },
        { name: 'Astucia Disruptiva', xp: 170, icon: <Zap size={14} /> },
    ],
    mission: {
        map: 'Montaña de Fuego',
        enemy: 'EL REGATEADOR',
        items: ['PICO DE PIEDRA', 'CASCO DE LAVA'],
        metrics: {
            escucha: 75,
            seguridad: 35,
            speak: 85
        }
    },
    analytics: {
        muletillas: 94,
        flow: 27,
        temperature: 0 // 0 to 100 scale ideally, 0 is cold
    },
    ranking: [
        { name: 'Mary B.', xp: 58000, pos: 1 },
        { name: 'Lupita', xp: 23000, pos: 2 },
        { name: 'Poncho', xp: 170, pos: 28, isUser: true }
    ]
};

// --- ANIMATION COMPONENT ---
const FadeIn = ({ children, delay = 0, className = "" }) => {
    const [isVisible, setIsVisible] = useState(false);
    const domRef = useRef();

    useEffect(() => {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            });
        });
        const currentElement = domRef.current;
        if (currentElement) observer.observe(currentElement);
        return () => {
            if (currentElement) observer.unobserve(currentElement);
        };
    }, []);

    return (
        <div
            ref={domRef}
            className={`transition-all duration-1000 ease-out transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                } ${className}`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {children}
        </div>
    );
};

// --- GEMINI HELPER FUNCTION ---
async function callGemini(prompt, systemInstruction = null) {
    try {
        const payload = {
            contents: [{ parts: [{ text: prompt }] }]
        };

        if (systemInstruction) {
            payload.systemInstruction = { parts: [{ text: systemInstruction }] };
        }

        const response = await fetch(GEMINI_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error("Gemini API Error");

        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || "Error en la respuesta de la IA.";
    } catch (error) {
        console.error(error);
        return "Lo siento, hubo un problema de conexión con la IA. Inténtalo de nuevo.";
    }
}

// --- NEW COMPONENT: ROLEPLAY SIMULATOR (WITH VOICE) ---
const RoleplaySimulator = ({ onExit }) => {
    const [messages, setMessages] = useState([
        { role: 'model', text: "Hola. Veo tu propuesta de Maity, pero sinceramente, el presupuesto está muy apretado este trimestre. Convénceme de por qué debería invertir en esto ahora." }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const messagesEndRef = useRef(null);

    // Speech Recognition Setup
    const recognitionRef = useRef(null);

    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.lang = 'es-ES';
            recognitionRef.current.interimResults = false;

            recognitionRef.current.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setInput(transcript);
                setIsListening(false);
            };

            recognitionRef.current.onerror = (event) => {
                console.error("Speech recognition error", event.error);
                setIsListening(false);
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };
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

        const userMsg = { role: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setLoading(true);

        const conversationHistory = messages.map(m =>
            `${m.role === 'user' ? 'Vendedor (Usuario)' : 'Cliente (Carlos)'}: ${m.text}`
        ).join('\n');

        const prompt = `${conversationHistory}\nVendedor (Usuario): ${input}\nCliente (Carlos): [Responde corto (max 2 frases), mantén tu postura escéptica pero profesional, reacciona a lo que dijo el vendedor]`;
        const systemPrompt = "Eres Carlos, un director de recursos humanos escéptico y ocupado. Estás en una negociación simulada. Tu objetivo es desafiar al vendedor sobre el valor y precio de 'Maity'. No cedas fácilmente. Sé breve y directo.";

        const aiResponseText = await callGemini(prompt, systemPrompt);

        setMessages(prev => [...prev, { role: 'model', text: aiResponseText }]);
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
                        <p className="text-sm text-gray-400">Objetivo: Convencer a Carlos (Director RH)</p>
                    </div>
                    <button onClick={onExit} className="text-sm text-gray-500 hover:text-white underline">
                        Salir
                    </button>
                </div>

                {/* Chat Window */}
                <div className="flex-grow bg-[#0F0F0F] rounded-xl border border-white/10 p-6 overflow-y-auto mb-4 min-h-[400px] max-h-[60vh] custom-scrollbar">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex gap-4 mb-6 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center ${msg.role === 'user' ? 'bg-pink-600' : 'bg-blue-600'}`}>
                                {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
                            </div>
                            <div className={`p-4 rounded-2xl max-w-[80%] text-sm leading-relaxed ${msg.role === 'user' ? 'bg-pink-900/20 border border-pink-500/30 text-pink-100' : 'bg-blue-900/20 border border-blue-500/30 text-blue-100'}`}>
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
                        className={`p-3 rounded-lg transition-all ${isListening
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
                        className={`p-3 rounded-lg transition-all ${loading || !input.trim() ? 'bg-gray-800 text-gray-500' : 'bg-pink-600 text-white hover:bg-pink-700'}`}
                    >
                        <Send size={20} />
                    </button>
                </div>
                <div className="text-center mt-2 text-xs text-gray-600">
                    {isListening && "🎙️ Te estamos escuchando..."}
                </div>
            </div>
        </div>
    );
};

// --- NEW COMPONENT: VIDEO TESTIMONIALS (SHORTS) ---
const VideoTestimonials = () => {
    const testimonials = [
        { id: 1, user: "Ana G.", role: "Gerente de Ventas", color: "bg-blue-500", text: "Maity me ayudó a cerrar un 20% más." },
        { id: 2, user: "David L.", role: "Freelancer", color: "bg-pink-500", text: "La IA es brutalmente honesta. Me encanta." },
        { id: 3, user: "Sofia M.", role: "Líder de Equipo", color: "bg-green-500", text: "Mis reuniones ahora duran la mitad." },
        { id: 4, user: "Jorge R.", role: "Consultor", color: "bg-purple-500", text: "Es como tener un coach 24/7." },
    ];

    return (
        <section className="py-24 bg-[#0F0F0F] border-t border-white/5 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center p-2 bg-pink-500/10 rounded-full mb-4">
                        <Smartphone size={20} className="text-pink-500" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-4">Historias Reales</h2>
                    <p className="text-gray-400">Mira cómo Maity está transformando carreras.</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                    {testimonials.map((t, idx) => (
                        <FadeIn key={idx} delay={idx * 100}>
                            <div className="aspect-[9/16] rounded-2xl bg-[#1A1A1A] relative group cursor-pointer overflow-hidden border border-white/10 hover:border-white/30 transition-all">
                                {/* Placeholder for Video Thumbnail */}
                                <div className={`absolute inset-0 opacity-20 ${t.color}`}></div>

                                {/* Overlay Content */}
                                <div className="absolute inset-0 flex flex-col justify-end p-4 bg-gradient-to-t from-black via-transparent to-transparent">
                                    <div className="mb-2">
                                        <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-2">
                                            <Play size={16} className="text-white ml-1" fill="currentColor" />
                                        </div>
                                    </div>
                                    <p className="text-white text-sm font-bold leading-tight mb-1">"{t.text}"</p>
                                    <div className="text-xs text-gray-400">{t.user} • {t.role}</div>
                                </div>
                            </div>
                        </FadeIn>
                    ))}
                </div>
            </div>
        </section>
    );
};

// --- NEW COMPONENT: ROI CALCULATOR (B2B) ---
const ROICalculator = () => {
    const [employees, setEmployees] = useState(100);
    const hourlyRate = 25; // Average hourly cost
    const hoursSavedPerMonth = 4; // Maity efficiency

    // Calculations
    const monthlySavings = employees * hoursSavedPerMonth * hourlyRate;
    const yearlySavings = monthlySavings * 12;
    const productivityGain = Math.floor(employees * 0.15); // 15% efficiency equivalent in headcount

    return (
        <section className="py-24 bg-[#0A0A0A] border-t border-white/5">
            <div className="max-w-4xl mx-auto px-4">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center justify-center p-2 bg-green-500/10 rounded-full mb-4">
                        <DollarSign size={20} className="text-green-500" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-4">Calculadora de ROI</h2>
                    <p className="text-gray-400">Estima el impacto de Maity en tu organización.</p>
                </div>

                <div className="bg-[#0F0F0F] rounded-2xl border border-white/10 p-8 md:p-12 shadow-2xl relative overflow-hidden">
                    {/* Background Glow */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/5 rounded-full blur-[100px]"></div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
                        {/* Input Side */}
                        <div>
                            <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">
                                Número de Empleados
                            </label>
                            <div className="text-5xl font-bold text-white mb-6 font-mono">
                                {employees}
                            </div>
                            <input
                                type="range"
                                min="10"
                                max="1000"
                                step="10"
                                value={employees}
                                onChange={(e) => setEmployees(parseInt(e.target.value))}
                                className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-green-500"
                            />
                            <div className="flex justify-between text-xs text-gray-500 mt-2">
                                <span>10</span>
                                <span>500</span>
                                <span>1000+</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-8 leading-relaxed">
                                *Cálculo basado en un ahorro promedio de 4 horas/mes por empleado y un costo hora promedio de $25 USD.
                            </p>
                        </div>

                        {/* Results Side */}
                        <div className="space-y-6">
                            <div className="bg-[#141414] p-6 rounded-xl border border-green-500/20">
                                <div className="text-sm text-green-400 mb-1 flex items-center gap-2">
                                    <DollarSign size={16} /> Ahorro Anual Estimado
                                </div>
                                <div className="text-3xl md:text-4xl font-bold text-white">
                                    ${yearlySavings.toLocaleString()}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-[#141414] p-4 rounded-xl border border-white/5">
                                    <div className="text-xs text-blue-400 mb-1 flex items-center gap-2">
                                        <Clock size={14} /> Horas Ahorradas
                                    </div>
                                    <div className="text-xl font-bold text-white">
                                        {(employees * hoursSavedPerMonth * 12).toLocaleString()}h/año
                                    </div>
                                </div>
                                <div className="bg-[#141414] p-4 rounded-xl border border-white/5">
                                    <div className="text-xs text-purple-400 mb-1 flex items-center gap-2">
                                        <Zap size={14} /> Productividad
                                    </div>
                                    <div className="text-xl font-bold text-white">
                                        Eq. a {productivityGain} FTEs
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

// --- COMPONENTS ---

// 1. Radar Chart
const RadarChart = ({ data, color }) => {
    const size = 180;
    const center = size / 2;
    const radius = (size / 2) - 20;
    const angleSlice = (Math.PI * 2) / data.length;

    const getPoint = (value, index, scale = 1) => {
        const angle = index * angleSlice - Math.PI / 2;
        const r = (value / 100) * radius * scale;
        return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
    };

    const points = data.map((d, i) => getPoint(d.value, i)).join(' ');
    const gridLevels = [0.25, 0.5, 0.75, 1];
    const gridLabels = ['100m', '1km', '5km', '10km'];

    return (
        <div className="relative flex flex-col items-center">
            <svg width={size + 60} height={size + 60} viewBox={`-30 -30 ${size + 60} ${size + 60}`}>
                {gridLevels.map((level, i) => (
                    <g key={i}>
                        <polygon
                            points={data.map((_, idx) => getPoint(100, idx, level)).join(' ')}
                            fill="none"
                            stroke="#333"
                            strokeWidth="1"
                            opacity="0.5"
                        />
                        <text x={center + 2} y={center - (radius * level)} fill="#555" fontSize="8" className="font-mono">
                            {gridLabels[i]}
                        </text>
                    </g>
                ))}
                {data.map((_, i) => (
                    <line
                        key={i}
                        x1={center}
                        y1={center}
                        x2={getPoint(100, i).split(',')[0]}
                        y2={getPoint(100, i).split(',')[1]}
                        stroke="#333"
                        strokeWidth="1"
                    />
                ))}
                <polygon points={points} fill={color} fillOpacity="0.2" stroke={color} strokeWidth="2" />
                {data.map((d, i) => {
                    const [x, y] = getPoint(120, i).split(',');
                    return (
                        <text
                            key={i}
                            x={x}
                            y={y}
                            fill={COLORS.textMuted}
                            fontSize="10"
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className="font-bold uppercase"
                        >
                            {d.name}
                        </text>
                    );
                })}
            </svg>
        </div>
    );
};

// 2. Navigation
const Navbar = ({ activeView, setView }) => {
    const [isOpen, setIsOpen] = useState(false);

    const navLinks = [
        { id: 'home', label: 'Individual' },
        { id: 'business', label: 'Empresas' },
        { id: 'pricing', label: 'Precios' },
    ];

    return (
        <nav className="fixed top-0 w-full z-50 backdrop-blur-md border-b border-white/10 bg-black/50 transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    <div
                        className="flex items-center cursor-pointer gap-2"
                        onClick={() => setView('home')}
                    >
                        <span className="text-3xl font-bold tracking-tighter text-white">
                            maity<span style={{ color: COLORS.maityPink }}>.</span>
                        </span>
                    </div>

                    <div className="hidden md:flex items-center space-x-6">
                        {navLinks.map((link) => (
                            <button
                                key={link.id}
                                onClick={() => setView(link.id)}
                                className={`text-sm font-medium transition-all hover:text-white ${activeView === link.id ? 'text-white border-b-2 border-pink-500' : 'text-gray-400'
                                    }`}
                            >
                                {link.label}
                            </button>
                        ))}

                        <button
                            className="text-sm font-medium text-gray-300 hover:text-white transition-colors ml-4"
                            onClick={() => setView('login')}
                        >
                            Entrar
                        </button>

                        <button
                            className="px-6 py-2.5 rounded-full text-sm font-bold text-white transition-all transform hover:scale-105 shadow-[0_0_15px_rgba(255,0,80,0.3)] hover:shadow-[0_0_25px_rgba(255,0,80,0.5)]"
                            style={{ background: `linear-gradient(90deg, ${COLORS.maityPink}, ${COLORS.maityBlue})` }}
                            onClick={() => setView('dashboard')}
                        >
                            Prueba Gratis
                        </button>
                    </div>

                    <div className="md:hidden flex items-center">
                        <button onClick={() => setIsOpen(!isOpen)} className="text-white">
                            {isOpen ? <X /> : <Menu />}
                        </button>
                    </div>
                </div>
            </div>

            {isOpen && (
                <div className="md:hidden bg-[#0F0F0F] border-b border-white/10">
                    <div className="px-4 pt-4 pb-6 space-y-2">
                        {navLinks.map((link) => (
                            <button
                                key={link.id}
                                onClick={() => { setView(link.id); setIsOpen(false); }}
                                className="block w-full text-left px-3 py-3 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-white/5"
                            >
                                {link.label}
                            </button>
                        ))}
                        <button
                            onClick={() => { setView('login'); setIsOpen(false); }}
                            className="block w-full text-left px-3 py-3 rounded-md text-base font-medium text-white bg-white/10 hover:bg-white/20 mt-4"
                        >
                            Iniciar Sesión
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
};

// 3. Login View
const LoginView = ({ setView }) => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#050505] relative overflow-hidden pt-20">
            <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full opacity-10 blur-[100px]" style={{ backgroundColor: COLORS.maityBlue }}></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full opacity-10 blur-[100px]" style={{ backgroundColor: COLORS.maityPink }}></div>

            <FadeIn className="w-full max-w-md p-8 bg-[#0F0F0F] border border-white/10 rounded-2xl shadow-2xl relative z-10 mx-4">
                <div className="text-center mb-8">
                    <span className="text-3xl font-bold tracking-tighter text-white block mb-2">
                        maity<span style={{ color: COLORS.maityPink }}>.</span>
                    </span>
                    <p className="text-gray-400 text-sm">Ingresa para continuar tu evolución.</p>
                </div>

                <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); setView('dashboard'); }}>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Correo Electrónico</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 text-gray-500" size={18} />
                            <input
                                type="email"
                                placeholder="tomas@empresa.com"
                                className="w-full bg-[#050505] border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Contraseña</label>
                            <a href="#" className="text-xs text-pink-500 hover:text-pink-400">¿Olvidaste tu contraseña?</a>
                        </div>
                        <div className="relative">
                            <Key className="absolute left-3 top-3 text-gray-500" size={18} />
                            <input
                                type="password"
                                placeholder="••••••••"
                                className="w-full bg-[#050505] border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 rounded-lg font-bold text-white shadow-lg flex items-center justify-center gap-2 hover:opacity-90 transition-all"
                        style={{ background: `linear-gradient(90deg, ${COLORS.maityPink}, ${COLORS.maityBlue})` }}
                    >
                        Entrar <ArrowRight size={18} />
                    </button>
                </form>

                <div className="my-6 flex items-center justify-between text-xs text-gray-600">
                    <div className="h-px bg-white/10 flex-1"></div>
                    <span className="px-3">O continúa con</span>
                    <div className="h-px bg-white/10 flex-1"></div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <button className="flex items-center justify-center gap-2 py-2.5 rounded-lg border border-white/10 hover:bg-white/5 transition-colors text-sm text-gray-300 font-medium">
                        Google
                    </button>
                    <button className="flex items-center justify-center gap-2 py-2.5 rounded-lg border border-white/10 hover:bg-white/5 transition-colors text-sm text-gray-300 font-medium">
                        Microsoft
                    </button>
                </div>

                <p className="mt-8 text-center text-xs text-gray-500">
                    ¿No tienes cuenta? <button onClick={() => setView('home')} className="text-pink-500 hover:text-pink-400 font-bold ml-1">Regístrate gratis</button>
                </p>
            </FadeIn>
        </div>
    );
};

// 4. Success Stories
const SuccessStories = ({ setView }) => {
    const cases = [
        {
            company: "Uber",
            industry: "Tecnología / Movilidad",
            headline: "Cómo Uber redujo el tiempo de onboarding de ventas un 40% con Maity",
            impact: "-40% tiempo onboarding",
            desc: "El equipo de ventas corporativas utilizó Maity para analizar sus llamadas de prospección. En 3 meses, la tasa de conversión aumentó significativamente al mejorar la escucha activa.",
            author: "Gerente Regional de Ventas",
            color: COLORS.maityBlue,
            tags: ["Ventas", "Onboarding"]
        },
        {
            company: "Walmart",
            industry: "Retail",
            headline: "Equipo de Customer Service mejoró satisfacción del cliente 25% en 3 meses",
            impact: "+25% satisfacción",
            desc: "Implementaron Maity en sus líderes de tienda para mejorar la comunicación y el feedback con sus equipos operativos. La satisfacción laboral subió drásticamente.",
            author: "Directora de Talento Humano",
            color: "#3b82f6",
            tags: ["Customer Service", "Liderazgo"]
        },
        {
            company: "TechFin",
            industry: "Fintech",
            headline: "Fintech líder acelera la curva de aprendizaje en soporte técnico",
            impact: "2x velocidad",
            desc: "Los nuevos ingresos en soporte técnico usaron Maity para practicar escenarios difíciles antes de hablar con clientes reales.",
            author: "VP de Operaciones",
            color: COLORS.maityGreen,
            tags: ["Onboarding", "Soporte"]
        }
    ];

    return (
        <div className="bg-[#050505] min-h-screen text-[#e7e7e9] pt-24 pb-12">
            {/* Hero Header */}
            <div className="max-w-7xl mx-auto px-4 text-center mb-20">
                <FadeIn>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/20 border border-blue-500/30 mb-6">
                        <Award size={14} className="text-blue-400" />
                        <span className="text-xs font-bold text-blue-200 tracking-wide uppercase">Resultados Comprobados</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tighter">
                        Historias de <br />
                        <span className="text-transparent bg-clip-text" style={{ backgroundImage: `linear-gradient(to right, ${COLORS.maityBlue}, ${COLORS.maityGreen})` }}>
                            Transformación Real
                        </span>
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        Empresas líderes ya están escalando sus habilidades humanas con inteligencia artificial.
                    </p>
                </FadeIn>
            </div>

            {/* Stats Banner */}
            <div className="border-y border-white/5 bg-[#0A0A0A] py-12 mb-20">
                <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    <FadeIn delay={100}>
                        <div className="text-4xl font-bold text-white mb-2">+10k</div>
                        <div className="text-xs text-gray-500 uppercase tracking-widest">Horas Entrenadas</div>
                    </FadeIn>
                    <FadeIn delay={200}>
                        <div className="text-4xl font-bold text-white mb-2">94%</div>
                        <div className="text-xs text-gray-500 uppercase tracking-widest">Aprobación de Usuarios</div>
                    </FadeIn>
                    <FadeIn delay={300}>
                        <div className="text-4xl font-bold text-white mb-2">3.5x</div>
                        <div className="text-xs text-gray-500 uppercase tracking-widest">ROI Promedio</div>
                    </FadeIn>
                    <FadeIn delay={400}>
                        <div className="text-4xl font-bold text-white mb-2">15+</div>
                        <div className="text-xs text-gray-500 uppercase tracking-widest">Países</div>
                    </FadeIn>
                </div>
            </div>

            {/* Case Studies Grid */}
            <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                {cases.map((c, i) => (
                    <FadeIn key={i} delay={i * 200} className="h-full">
                        <div className="bg-[#0F0F0F] rounded-2xl border border-white/10 p-8 hover:border-blue-500/30 transition-all hover:-translate-y-2 group flex flex-col h-full">

                            {/* Header: Logo & Industry */}
                            <div className="flex justify-between items-start mb-6">
                                <div className="h-10 w-10 bg-white/10 rounded-lg flex items-center justify-center font-bold text-white text-xl">
                                    {c.company[0]}
                                </div>
                                <span className="text-xs font-mono text-gray-500 border border-white/10 px-2 py-1 rounded">{c.industry}</span>
                            </div>

                            {/* Headline & Tags */}
                            <div className="mb-4">
                                <h3 className="text-lg font-bold text-white leading-snug mb-3 group-hover:text-blue-400 transition-colors">
                                    {c.headline}
                                </h3>
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {c.tags.map((tag, t) => (
                                        <span key={t} className="text-[10px] uppercase font-bold px-2 py-1 rounded bg-white/5 text-gray-400 border border-white/5 flex items-center gap-1">
                                            <Tag size={10} /> {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Impact Metric (Solid Color) */}
                            <div className="mb-6">
                                <div className="text-3xl font-bold mb-2 transition-colors" style={{ color: c.color }}>
                                    {c.impact}
                                </div>
                                <div className="h-1 w-20 bg-gray-800 rounded-full overflow-hidden">
                                    <div className="h-full" style={{ backgroundColor: c.color, width: '66%' }}></div>
                                </div>
                            </div>

                            {/* Description */}
                            <p className="text-gray-400 text-sm leading-relaxed mb-8 flex-grow">
                                "{c.desc}"
                            </p>

                            {/* Footer: Author */}
                            <div className="flex items-center gap-3 border-t border-white/5 pt-6 mt-auto">
                                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                                    <UserCheck size={14} className="text-gray-400" />
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-white">{c.author}</div>
                                    <div className="text-xs text-gray-500">{c.company}</div>
                                </div>
                            </div>
                        </div>
                    </FadeIn>
                ))}
            </div>

            {/* Logo Strip */}
            <div className="max-w-7xl mx-auto px-4 text-center mb-24">
                <p className="text-sm text-gray-500 mb-8 uppercase tracking-widest">Confían en nosotros</p>
                <div className="flex flex-wrap justify-center gap-12 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
                    <span className="text-2xl font-bold font-serif">UBER</span>
                    <span className="text-2xl font-bold">Walmart <span className="text-blue-500">*</span></span>
                    <span className="text-2xl font-bold tracking-tighter">ORACLE</span>
                    <span className="text-2xl font-bold italic">SoftBank</span>
                    <span className="text-2xl font-bold font-mono">Globant</span>
                </div>
            </div>

            {/* CTA */}
            <div className="max-w-3xl mx-auto px-4 text-center bg-gradient-to-br from-blue-900/20 to-green-900/20 p-12 rounded-3xl border border-white/10">
                <h2 className="text-3xl font-bold text-white mb-4">¿Listo para escribir tu caso de éxito?</h2>
                <p className="text-gray-400 mb-8">Únete a las empresas que están redefiniendo el desarrollo de talento.</p>
                <button
                    onClick={() => setView('business')}
                    className="px-8 py-3 rounded-full text-white font-bold transition-all transform hover:scale-105 shadow-lg"
                    style={{ background: `linear-gradient(90deg, ${COLORS.maityBlue}, ${COLORS.maityGreen})` }}
                >
                    Agendar Demo Personalizada
                </button>
            </div>
        </div>
    );
};

// 5. Hero Section (Individual)
const HeroSection = ({ setView }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [analysis, setAnalysis] = useState(null);

    const handleMicClick = () => {
        if (isRecording) return;
        setIsRecording(true);
        setAnalysis(null);
        setTimeout(() => {
            setIsRecording(false);
            setAnalysis({
                tone: 'Seguro',
                speed: 'Óptima',
                suggestion: 'Buen uso de pausas.'
            });
        }, 3000);
    };

    return (
        <section className="relative pt-32 pb-24 overflow-hidden min-h-screen flex items-center">
            <div className="absolute top-0 left-0 w-full h-full -z-10 bg-[#050505]">
                <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] rounded-full opacity-20 blur-[120px]" style={{ backgroundColor: COLORS.maityBlue }}></div>
                <div className="absolute bottom-[-20%] left-[-10%] w-[800px] h-[800px] rounded-full opacity-15 blur-[120px]" style={{ backgroundColor: COLORS.maityPink }}></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <div className="z-10">
                    <FadeIn delay={100}>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-6">
                            <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse"></span>
                            <span className="text-xs font-bold text-gray-300 tracking-wide uppercase">Para Individuos</span>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-8 tracking-tighter text-white">
                            La evolución no ocurre en un curso. <br />
                            <span className="text-transparent bg-clip-text" style={{ backgroundImage: `linear-gradient(to right, ${COLORS.maityPink}, ${COLORS.maityBlue})` }}>
                                Ocurre en cada conversación.
                            </span>
                        </h1>
                        <p className="text-xl text-gray-400 mb-10 leading-relaxed max-w-lg">
                            Maity es tu coach de soft skills impulsado por IA. Analiza tus reuniones, mide tu progreso y te entrena diariamente.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-5">
                            <button
                                onClick={() => setView('dashboard')}
                                className="px-8 py-4 rounded text-white font-bold text-lg shadow-xl hover:shadow-pink-500/25 transition-all transform hover:-translate-y-1"
                                style={{ backgroundColor: COLORS.maityPink }}
                            >
                                Empezar Gratis
                            </button>
                            <button
                                className="px-8 py-4 rounded text-white font-bold text-lg hover:brightness-110 transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                                style={{ backgroundColor: COLORS.maityBlue }}
                            >
                                <Play size={20} fill="currentColor" /> Ver Demo
                            </button>
                        </div>
                        <div className="mt-8 flex items-center gap-2 text-sm text-gray-500">
                            <Shield size={16} style={{ color: COLORS.maityGreen }} />
                            <span>Datos 100% privados y encriptados.</span>
                        </div>
                    </FadeIn>
                </div>

                {/* Video Widget Replacement */}
                <FadeIn delay={300} className="relative h-full">
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-blue-500 rounded-2xl blur-2xl opacity-20 transform rotate-2"></div>
                    <div className="relative bg-[#0F0F0F] rounded-2xl border border-white/10 overflow-hidden shadow-2xl backdrop-blur-xl aspect-video">
                        {/* YouTube Iframe Placeholder */}
                        <iframe
                            width="100%"
                            height="100%"
                            src="https://www.youtube.com/embed/Lx7884l7-z0?controls=0&rel=0"
                            title="Maity Demo Video"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="w-full h-full object-cover"
                        ></iframe>
                    </div>
                </FadeIn>
            </div>
        </section>
    );
};

// 6. Business Hero Section
const BusinessHeroSection = ({ setView }) => {
    return (
        <section className="relative pt-32 pb-24 overflow-hidden min-h-screen flex items-center bg-[#050505]">
            <div className="absolute top-0 left-0 w-full h-full -z-10">
                <div className="absolute top-[-20%] left-[-10%] w-[900px] h-[900px] rounded-full opacity-10 blur-[130px]" style={{ backgroundColor: COLORS.maityBlue }}></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full opacity-10 blur-[100px]" style={{ backgroundColor: COLORS.maityPink }}></div>
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <div className="z-10">
                    <FadeIn delay={100}>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/20 border border-blue-500/30 mb-6">
                            <Building2 size={14} className="text-blue-400" />
                            <span className="text-xs font-bold text-blue-200 tracking-wide uppercase">Solución Empresarial</span>
                        </div>

                        <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-8 tracking-tighter text-white">
                            Transforma el desarrollo de tu equipo en <br />
                            <span className="text-transparent bg-clip-text" style={{ backgroundImage: `linear-gradient(to right, ${COLORS.maityBlue}, ${COLORS.maityGreen})` }}>
                                sistema operativo diario.
                            </span>
                        </h1>

                        <p className="text-xl text-gray-400 mb-8 leading-relaxed max-w-lg">
                            Escala el coaching de soft skills sin carga operativa. Métricas reales de evolución, privacidad Enterprise y ROI medible desde el primer mes.
                        </p>

                        <ul className="space-y-3 mb-10 text-gray-300">
                            <li className="flex items-center gap-3">
                                <div className="p-1 bg-green-500/20 rounded-full"><Check size={14} className="text-green-400" /></div>
                                <span>Acelera curvas de aprendizaje de meses a semanas</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="p-1 bg-green-500/20 rounded-full"><Check size={14} className="text-green-400" /></div>
                                <span>Dashboards de liderazgo y cultura en tiempo real</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="p-1 bg-green-500/20 rounded-full"><Check size={14} className="text-green-400" /></div>
                                <span>Seguridad SOC2 y control de privacidad total</span>
                            </li>
                        </ul>

                        <div className="flex flex-col sm:flex-row gap-5">
                            <button
                                className="px-8 py-4 rounded text-white font-bold text-lg shadow-xl shadow-blue-500/20 transition-all transform hover:-translate-y-1 hover:shadow-blue-500/40"
                                style={{ backgroundColor: COLORS.maityBlue }}
                            >
                                Solicitar Demo
                            </button>
                            <button
                                onClick={() => setView('success-stories')}
                                className="px-8 py-4 rounded border border-white/20 text-white font-bold text-lg hover:bg-white/5 transition-colors"
                            >
                                Ver Casos de Éxito
                            </button>
                        </div>
                    </FadeIn>
                </div>

                <div className="relative">
                    <FadeIn delay={300}>
                        <div className="absolute inset-0 bg-blue-500/20 blur-[100px] rounded-full"></div>
                        <div className="relative bg-[#0A0A0A] border border-white/10 rounded-xl p-6 shadow-2xl backdrop-blur-md">
                            <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-4">
                                <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                                <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                                <div className="ml-4 px-3 py-1 bg-white/5 rounded text-[10px] text-gray-500 font-mono w-64">maity.com/empresa/dashboard</div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="bg-[#141414] p-4 rounded-lg border border-white/5">
                                    <div className="text-xs text-gray-500 mb-1">Evolución del Equipo</div>
                                    <div className="text-2xl font-bold text-white mb-2">+24%</div>
                                    <div className="h-10 flex items-end gap-1">
                                        {[40, 60, 45, 70, 85, 90, 100].map((h, i) => (
                                            <div key={i} className="flex-1 bg-blue-500/40 rounded-t-sm hover:bg-blue-500 transition-colors" style={{ height: `${h}%` }}></div>
                                        ))}
                                    </div>
                                </div>
                                <div className="bg-[#141414] p-4 rounded-lg border border-white/5">
                                    <div className="text-xs text-gray-500 mb-1">Habilidad Top (Mes)</div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Award size={20} className="text-pink-500" />
                                        <span className="font-bold text-white">Negociación</span>
                                    </div>
                                    <div className="text-xs text-gray-400">El departamento de ventas aumentó su score promedio a 8.9/10</div>
                                </div>
                            </div>

                            <div className="bg-[#141414] p-4 rounded-lg border border-white/5">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-xs font-bold text-gray-400 uppercase">Actividad Reciente</span>
                                    <PieChart size={14} className="text-gray-600" />
                                </div>
                                <div className="space-y-3">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="flex items-center justify-between text-xs">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-gray-700"></div>
                                                <span className="text-gray-300">Equipo {i === 1 ? 'Ventas' : i === 2 ? 'Soporte' : 'Liderazgo'}</span>
                                            </div>
                                            <span className="text-green-400 font-mono">+{(Math.random() * 5).toFixed(1)}%</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </FadeIn>
                </div>
            </div>
        </section>
    );
};

// 7. Business Deep Dive
const BusinessDeepDive = () => {
    return (
        <div className="bg-[#050505] text-[#e7e7e9]">
            <section className="py-24 border-t border-white/5 bg-gradient-to-b from-[#050505] to-[#0A0A0A]">
                <div className="max-w-5xl mx-auto px-4 text-center">
                    <FadeIn>
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-900/10 border border-red-500/20 mb-8">
                            <AlertTriangle size={16} className="text-red-500" />
                            <span className="text-xs font-bold text-red-400 tracking-wider uppercase">La Realidad Incómoda</span>
                        </div>
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-8 leading-tight">
                            La capacitación tradicional se ha vuelto un <br />
                            <span className="text-gray-600">placebo corporativo.</span>
                        </h2>
                        <p className="text-xl text-gray-400 leading-relaxed max-w-3xl mx-auto">
                            Cursos aislados, sin seguimiento, sin mentoría real. Mientras tanto, las habilidades más humanas —comunicación, liderazgo y toma de decisiones— están en declive.
                            <br /><br />
                            <span className="text-white">Si no lo resolvemos, terminamos con equipos poco efectivos y líderes que no inspiran.</span>
                        </p>
                    </FadeIn>
                </div>
            </section>

            <section className="py-20 bg-[#0F0F0F] relative overflow-hidden">
                <div className="absolute right-0 top-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]"></div>
                <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <FadeIn delay={100}>
                        <span className="text-sm font-bold tracking-widest uppercase mb-4 block" style={{ color: COLORS.maityBlue }}>
                            Qué es Maity
                        </span>
                        <h2 className="text-4xl font-bold text-white mb-6">Maity Desktop</h2>
                        <div className="prose prose-invert prose-lg text-gray-400">
                            <p className="leading-relaxed mb-6">
                                Maity convierte la capacitación en una experiencia viva: un coach de IA que acompaña a cada colaborador en su día a día.
                            </p>
                            <div className="p-6 bg-[#141414] rounded-xl border border-white/10 flex gap-4 items-start">
                                <div className="p-3 bg-blue-500/20 rounded-lg">
                                    <Laptop size={24} className="text-blue-400" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white mb-2">Integración Nativa</h4>
                                    <p className="text-sm">Presente en Teams, Google Meet o Zoom, escuchando (con permiso) y entregando retroalimentación práctica.</p>
                                </div>
                            </div>
                        </div>
                    </FadeIn>
                    <div className="relative">
                        <FadeIn delay={300}>
                            <div className="absolute inset-0 bg-blue-500/10 blur-3xl"></div>
                            <div className="relative bg-black border border-white/10 rounded-2xl p-8">
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center gap-4 p-4 bg-[#141414] rounded-lg border border-white/5 opacity-50">
                                        <div className="w-10 h-10 rounded-full bg-gray-700"></div>
                                        <div className="h-4 bg-gray-700 w-32 rounded"></div>
                                    </div>
                                    <div className="flex items-center gap-4 p-4 bg-[#1A1A1A] rounded-lg border border-blue-500/30 shadow-[0_0_20px_rgba(72,93,244,0.1)]">
                                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                                            <span className="font-bold text-white">M</span>
                                        </div>
                                        <div>
                                            <div className="h-4 bg-white w-48 rounded mb-2"></div>
                                            <div className="text-xs text-blue-400">Grabando y analizando con permiso...</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 p-4 bg-[#141414] rounded-lg border border-white/5 opacity-50">
                                        <div className="w-10 h-10 rounded-full bg-gray-700"></div>
                                        <div className="h-4 bg-gray-700 w-32 rounded"></div>
                                    </div>
                                </div>
                            </div>
                        </FadeIn>
                    </div>
                </div>
            </section>

            <section className="py-24 bg-[#050505]">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <FadeIn>
                            <h2 className="text-3xl font-bold text-white mb-4">Cómo funciona</h2>
                            <p className="text-gray-500">Simple, transparente y seguro.</p>
                        </FadeIn>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <Laptop size={32} className="text-white" />,
                                title: "1. Instalación",
                                desc: "Se instala Maity Desktop en el equipo del colaborador. Silencioso y ligero."
                            },
                            {
                                icon: <Video size={32} className="text-white" />,
                                title: "2. Detección",
                                desc: "Detecta reuniones y solicita permiso para grabar. El usuario siempre tiene el control."
                            },
                            {
                                icon: <FileText size={32} className="text-white" />,
                                title: "3. Análisis",
                                desc: "Al terminar, entrega insights y recomendaciones accionables al instante."
                            },
                            {
                                icon: <RefreshCcw size={32} className="text-white" />,
                                title: "4. Seguimiento",
                                desc: "Maity refuerza hábitos con retos y prácticas continuas, no solo teoría."
                            },
                            {
                                icon: <BarChart2 size={32} className="text-white" />,
                                title: "5. Dashboard Líder",
                                desc: "Visión de equipo para detectar patrones y tomar decisiones de desarrollo."
                            },
                            {
                                icon: <Users size={32} className="text-white" />,
                                title: "6. Híbrido",
                                desc: "Opción de consultoría y coaching humano para potenciar la implementación."
                            }
                        ].map((step, idx) => (
                            <FadeIn key={idx} delay={idx * 100}>
                                <div className="p-8 rounded-2xl bg-[#0F0F0F] border border-white/10 hover:border-blue-500/30 transition-all hover:-translate-y-1 h-full">
                                    <div className="w-16 h-16 rounded-xl bg-blue-900/20 flex items-center justify-center mb-6 border border-blue-500/10">
                                        {step.icon}
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                                    <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
                                </div>
                            </FadeIn>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-24 bg-[#0A0A0A] border-y border-white/5">
                <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-20">
                    <FadeIn className="h-full">
                        <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                            <Lightbulb className="text-yellow-400" /> Qué mejora Maity
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[
                                "Comunicación y claridad", "Liderazgo", "Toma de decisiones",
                                "Empatía y servicio", "Negociación", "Ventas"
                            ].map((skill, i) => (
                                <div key={i} className="flex items-center gap-3 p-4 bg-[#141414] rounded-lg border border-white/5">
                                    <div className="w-2 h-2 rounded-full bg-green-400"></div>
                                    <span className="text-gray-300 font-medium">{skill}</span>
                                </div>
                            ))}
                        </div>

                        <div className="mt-10 p-6 bg-blue-900/10 rounded-xl border border-blue-500/20">
                            <h4 className="font-bold text-blue-200 mb-2">Aprendizaje Aplicado</h4>
                            <ul className="space-y-2 text-sm text-blue-100/70">
                                <li>• Base de conocimiento especializada.</li>
                                <li>• Role playing y ejercicios prácticos.</li>
                                <li>• Prácticas cortas "en el momento".</li>
                            </ul>
                        </div>
                    </FadeIn>

                    <FadeIn delay={200} className="h-full">
                        <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                            <Shield className="text-green-400" /> Seguridad y Confianza
                        </h3>
                        <p className="text-gray-400 mb-8">
                            Sabemos que la información es de lo más valioso. Por eso, la seguridad es nuestra prioridad #1.
                        </p>
                        <div className="space-y-4">
                            <div className="flex gap-4 items-start">
                                <div className="p-2 bg-green-900/20 rounded-lg text-green-400 mt-1"><Lock size={18} /></div>
                                <div>
                                    <h4 className="font-bold text-white">Protección Enterprise</h4>
                                    <p className="text-sm text-gray-500">Datos manejados bajo estrictas políticas y encriptación de punta a punta.</p>
                                </div>
                            </div>
                            <div className="flex gap-4 items-start">
                                <div className="p-2 bg-green-900/20 rounded-lg text-green-400 mt-1"><UserCheck size={18} /></div>
                                <div>
                                    <h4 className="font-bold text-white">Permiso Explícito</h4>
                                    <p className="text-sm text-gray-500">La grabación solo ocurre con permiso del usuario y enfoque laboral.</p>
                                </div>
                            </div>
                        </div>
                    </FadeIn>
                </div>
            </section>

            <section className="py-24 bg-[#050505]">
                <div className="max-w-4xl mx-auto px-4">
                    <FadeIn>
                        <h2 className="text-3xl font-bold text-white mb-12 text-center">Beneficios para la Empresa</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[
                                "Capacitación con seguimiento real y evolutivo.",
                                "Equipos más efectivos y menor fricción.",
                                "Mejor liderazgo que inspira y alinea.",
                                "Conversaciones de ventas más sólidas.",
                                "Visibilidad accionable para directores.",
                                "Democratización del mentor para todos."
                            ].map((benefit, i) => (
                                <div key={i} className="flex items-center gap-4 p-4 border-b border-white/5">
                                    <Check className="text-blue-500" size={20} />
                                    <span className="text-gray-300">{benefit}</span>
                                </div>
                            ))}
                        </div>
                    </FadeIn>
                </div>
            </section>

            <section className="py-24 bg-gradient-to-t from-blue-900/20 to-[#050505] text-center border-t border-white/5">
                <div className="max-w-3xl mx-auto px-4">
                    <FadeIn>
                        <div className="mb-6 mx-auto w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
                            <Eye size={32} className="text-white" />
                        </div>
                        <h2 className="text-4xl font-bold text-white mb-6">Nuestra Visión</h2>
                        <p className="text-xl text-gray-300 leading-relaxed mb-8">
                            Queremos democratizar el acceso a mentores capaces de llevar a cualquier profesional a su máximo potencial.
                            Maity será el coach digital más cercano, convirtiendo aprendizaje en resultados.
                        </p>
                        <p className="text-sm text-gray-500 font-mono uppercase tracking-widest">
                            El nuevo estándar global de desarrollo humano
                        </p>
                    </FadeIn>
                </div>
            </section>

        </div>
    );
};

// 8. Problem Section
const ProblemSection = () => {
    return (
        <section className="py-24 bg-[#050505] relative overflow-hidden border-t border-white/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <FadeIn>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-6">
                            <span className="text-xs font-bold text-gray-400 tracking-wide uppercase">El Problema</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold leading-tight mb-6 text-white">
                            La capacitación inspira. <br />
                            <span className="text-gray-500">Pero el progreso ocurre cuando entrenas.</span>
                        </h2>
                        <p className="text-lg text-gray-400 mb-8 leading-relaxed border-l-2 pl-6" style={{ borderColor: COLORS.maityBlue }}>
                            Sin práctica guiada, la <strong className="text-white">curva de olvido</strong> gana.
                            El 70% de lo que aprendes en un curso se pierde en 24 horas.
                            Maity convierte lo aprendido en evolución diaria: una rutina simple, medible y motivante.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-8">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-red-500/10 rounded-lg mt-1">
                                    <TrendingDown size={20} className="text-red-500" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white text-sm">Cursos Tradicionales</h4>
                                    <p className="text-xs text-gray-500">Pico alto, caída rápida</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-green-500/10 rounded-lg mt-1">
                                    <TrendingUp size={20} style={{ color: COLORS.maityGreen }} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white text-sm">Método Maity</h4>
                                    <p className="text-xs text-gray-500">Mejora continua y sostenida</p>
                                </div>
                            </div>
                        </div>
                    </FadeIn>

                    <FadeIn delay={200} className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 blur-3xl rounded-full"></div>
                        <div className="bg-[#0F0F0F] p-8 rounded-2xl border border-white/10 relative z-10 shadow-2xl">
                            <h3 className="text-sm font-bold text-gray-400 mb-6 tracking-wider uppercase flex justify-between">
                                <span>Retención de Habilidad</span>
                                <span>30 Días</span>
                            </h3>
                            <div className="relative h-64 w-full border-l border-b border-gray-800">
                                <svg className="absolute inset-0 h-full w-full overflow-visible">
                                    <path
                                        d="M0,10 Q100,200 400,240"
                                        fill="none"
                                        stroke="#333"
                                        strokeWidth="3"
                                        strokeDasharray="5,5"
                                    />
                                    <circle cx="400" cy="240" r="4" fill="#333" />
                                    <text x="350" y="230" fill="#666" fontSize="10" fontWeight="bold">Olvido (70%)</text>
                                </svg>

                                <svg className="absolute inset-0 h-full w-full overflow-visible">
                                    <path
                                        d="M0,10 C50,10 50,50 100,40 C150,30 150,80 200,70 C250,60 250,110 300,90 C350,70 350,20 400,10"
                                        fill="none"
                                        stroke={COLORS.maityGreen}
                                        strokeWidth="4"
                                        strokeLinecap="round"
                                        className="drop-shadow-[0_0_10px_rgba(27,234,154,0.5)]"
                                    />
                                    <defs>
                                        <linearGradient id="gradientGreen" x1="0" x2="0" y1="0" y2="1">
                                            <stop offset="0%" stopColor={COLORS.maityGreen} stopOpacity="0.2" />
                                            <stop offset="100%" stopColor={COLORS.maityGreen} stopOpacity="0" />
                                        </linearGradient>
                                    </defs>
                                    <path
                                        d="M0,10 C50,10 50,50 100,40 C150,30 150,80 200,70 C250,60 250,110 300,90 C350,70 350,20 400,10 V256 H0 Z"
                                        fill="url(#gradientGreen)"
                                        stroke="none"
                                    />
                                    {[100, 200, 300].map((x, i) => (
                                        <g key={i}>
                                            <circle cx={x} cy={i === 0 ? 40 : i === 1 ? 70 : 90} r="6" fill="#0F0F0F" stroke={COLORS.maityPink} strokeWidth="2" />
                                        </g>
                                    ))}
                                    <text x="320" y="30" fill={COLORS.maityGreen} fontSize="12" fontWeight="bold">Evolución Maity</text>
                                </svg>
                                <div className="absolute -left-8 top-0 text-xs text-gray-600">100%</div>
                                <div className="absolute -left-6 bottom-0 text-xs text-gray-600">0%</div>
                            </div>

                            <div className="mt-4 flex gap-4 justify-center text-xs">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-gray-700"></div>
                                    <span className="text-gray-500">Sin práctica</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full border-2 border-green-400 shadow-[0_0_10px_rgba(27,234,154,0.5)]"></div>
                                    <span className="text-white">Con Maity</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full border-2 border-pink-500"></div>
                                    <span className="text-gray-500">Micro-práctica</span>
                                </div>
                            </div>

                        </div>
                    </FadeIn>
                </div>
            </div>
        </section>
    );
};

// 9. Product Info Section
const ProductInfoSection = () => {
    const features = [
        {
            icon: <Mic className="text-white" size={24} />,
            title: "Escucha Real",
            desc: "Escucha conversaciones reales (con consentimiento explícito) para un análisis genuino."
        },
        {
            icon: <Activity className="text-white" size={24} />,
            title: "Detecta Patrones",
            desc: "Detecta patrones y mide la evolución de tus habilidades de comunicación."
        },
        {
            icon: <Zap className="text-white" size={24} />,
            title: "Retos Diarios",
            desc: "Entrena activamente mediante retos gamificados diarios personalizados."
        },
        {
            icon: <TrendingUp className="text-white" size={24} />,
            title: "Progreso Visible",
            desc: "Genera progreso visible y motivante para mantener el compromiso."
        },
        {
            icon: <BarChart2 className="text-white" size={24} />,
            title: "Dashboards",
            desc: "Ofrece dashboards detallados tanto para individuos como para organizaciones completas."
        }
    ];

    return (
        <section className="py-24 bg-[#0A0A0A] border-t border-white/5 relative overflow-hidden">
            <div className="absolute right-0 top-1/4 w-[500px] h-[500px] bg-pink-600/5 rounded-full blur-[100px]"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                    <div className="lg:col-span-5">
                        <div className="sticky top-32">
                            <span className="text-sm font-bold tracking-widest uppercase mb-4 block" style={{ color: COLORS.maityPink }}>
                                1.1 Definición
                            </span>
                            <h2 className="text-4xl font-bold text-white mb-6">¿Qué es Maity?</h2>
                            <div className="prose prose-invert prose-lg text-gray-400">
                                <p className="leading-relaxed">
                                    Maity es un <span className="text-white font-medium">coach de soft skills impulsado por IA</span> que transforma conversaciones reales en entrenamiento medible y gamificado.
                                </p>
                                <p className="leading-relaxed mt-4">
                                    A diferencia de herramientas que solo graban y resumen, Maity <span className="text-white font-medium">entrena activamente</span> habilidades de comunicación, venta, liderazgo y servicio, convirtiendo cada interacción en una oportunidad de crecimiento.
                                </p>
                            </div>

                            <div className="mt-8 p-6 bg-[#0F0F0F] rounded-2xl border border-white/10 flex items-center gap-4">
                                <div className="p-3 bg-white/5 rounded-full" style={{ backgroundColor: `${COLORS.maityPink}20` }}>
                                    <Brain size={32} style={{ color: COLORS.maityPink }} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white">IA Coach Personal</h4>
                                    <p className="text-sm text-gray-500">Entrenamiento 24/7 adaptado a ti</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-7">
                        <span className="text-sm font-bold tracking-widest uppercase mb-4 block" style={{ color: COLORS.maityPink }}>
                            1.2 Propuesta de Valor Única
                        </span>
                        <h2 className="text-3xl font-bold text-white mb-10">Más allá de la transcripción</h2>

                        <div className="grid gap-6">
                            {features.map((feature, idx) => (
                                <div
                                    key={idx}
                                    className="group flex items-start gap-6 p-6 rounded-2xl bg-[#0F0F0F] border border-white/5 hover:border-white/20 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-pink-500/10"
                                >
                                    <div
                                        className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                                        style={{ backgroundColor: COLORS.maityPink }}
                                    >
                                        {feature.icon}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-2 transition-colors group-hover:text-pink-500">
                                            {feature.title}
                                        </h3>
                                        <p className="text-gray-400 leading-relaxed">
                                            {feature.desc}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

// 10. Dashboard
const Dashboard = ({ setView }) => {
    const { user, scores, skills, badges, mission, analytics, ranking } = DASHBOARD_DATA;
    const [insight, setInsight] = useState("");
    const [loadingInsight, setLoadingInsight] = useState(false);

    const generateInsight = async () => {
        setLoadingInsight(true);
        const prompt = `Actúa como un coach de liderazgo inspirador. Genera un consejo breve (max 2 frases) para ${user.name}, quien es nivel ${user.level} y tiene una racha de ${user.streak} días. Enfócate en mejorar su empatía.`;
        const text = await callGemini(prompt);
        setInsight(text);
        setLoadingInsight(false);
    };

    return (
        <div className="pt-24 pb-12 min-h-screen bg-[#050505] text-[#e7e7e9]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* --- GRID LAYOUT 3 COLUMNS --- */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* --- LEFT PANEL: PROFILE / PROGRESS (3 Cols) --- */}
                    <div className="lg:col-span-3 space-y-6">

                        {/* Profile Card */}
                        <div className="bg-[#0F0F0F] p-6 rounded-xl border border-white/10 text-center">
                            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-2xl font-bold text-white mb-3">
                                {user.avatar}
                            </div>
                            <h3 className="text-lg font-bold text-white">{user.name}</h3>
                            <div className="text-xs text-gray-400 uppercase tracking-widest mb-4">{user.rank}</div>

                            <div className="flex justify-between items-center bg-[#141414] p-3 rounded-lg border border-white/5 mb-4">
                                <div className="text-left">
                                    <div className="text-[10px] text-gray-500 uppercase">Nivel</div>
                                    <div className="text-xl font-bold text-white">{user.level}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] text-gray-500 uppercase">XP Total</div>
                                    <div className="text-xl font-bold text-pink-500">{user.xp} <span className="text-xs text-gray-500">XP</span></div>
                                </div>
                            </div>

                            {/* Score Compare */}
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className="bg-[#141414] p-2 rounded border border-white/5">
                                    <div className="text-[10px] text-gray-500">Ayer</div>
                                    <div className="font-bold text-gray-400 flex items-center justify-center gap-1">
                                        {scores.yesterday} <TrendingDown size={12} />
                                    </div>
                                </div>
                                <div className="bg-[#141414] p-2 rounded border border-white/5 border-b-2 border-b-green-500">
                                    <div className="text-[10px] text-gray-500">Hoy</div>
                                    <div className="font-bold text-white flex items-center justify-center gap-1">
                                        {scores.today} <TrendingUp size={12} className="text-green-500" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Radar Chart */}
                        <div className="bg-[#0F0F0F] p-4 rounded-xl border border-white/10">
                            <h4 className="text-xs font-bold text-gray-500 uppercase mb-4 text-center">Escalada Diaria</h4>
                            <RadarChart data={skills} color={COLORS.maityGreen} />
                        </div>

                        {/* Badges */}
                        <div className="bg-[#0F0F0F] p-4 rounded-xl border border-white/10">
                            <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Recompensas</h4>
                            <div className="space-y-2">
                                {badges.map((b, i) => (
                                    <div key={i} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded transition-colors">
                                        <div className="w-8 h-8 rounded-full bg-[#1A1A1A] flex items-center justify-center text-pink-500 border border-white/5">
                                            {b.icon}
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-white">{b.name}</div>
                                            <div className="text-[10px] text-gray-500">{b.xp} XP</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Performance Graph (Simple SVG) */}
                        <div className="bg-[#0F0F0F] p-4 rounded-xl border border-white/10">
                            <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Desempeño</h4>
                            <div className="h-24 w-full flex items-end gap-1">
                                {[40, 35, 55, 60, 50, 75, 80].map((h, i) => (
                                    <div key={i} className="flex-1 bg-gradient-to-t from-blue-900/50 to-blue-500 rounded-t-sm hover:opacity-80 transition-opacity" style={{ height: `${h}%` }}></div>
                                ))}
                            </div>
                        </div>

                    </div>

                    {/* --- CENTER PANEL: MISSION / COMBAT (5 Cols) --- */}
                    <div className="lg:col-span-5 space-y-6">

                        {/* Map / Mission Card */}
                        <div className="bg-[#0F0F0F] rounded-xl border border-white/10 overflow-hidden relative min-h-[400px]">
                            {/* Background "Map" */}
                            <div className="absolute inset-0 bg-gradient-to-b from-[#1a0505] to-[#0F0F0F]">
                                {/* Decorative Mountain */}
                                <svg className="absolute bottom-0 w-full text-[#2a0a0a]" viewBox="0 0 100 100" preserveAspectRatio="none">
                                    <path d="M0 100 L50 20 L100 100 Z" fill="currentColor" />
                                </svg>
                                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl"></div>
                            </div>

                            <div className="relative p-6 z-10">
                                <div className="flex justify-between items-start mb-12">
                                    <div>
                                        <div className="flex items-center gap-2 text-orange-500 mb-1">
                                            <Map size={16} />
                                            <span className="text-xs font-bold tracking-widest uppercase">Ubicación Actual</span>
                                        </div>
                                        <h2 className="text-2xl font-bold text-white">{mission.map}</h2>
                                    </div>
                                    <div className="bg-red-900/30 border border-red-500/30 px-3 py-1 rounded text-red-400 text-xs font-bold flex items-center gap-2">
                                        <Sword size={12} /> ZONA DE COMBATE
                                    </div>
                                </div>

                                {/* Enemy Card */}
                                <div className="mx-auto w-48 bg-gradient-to-b from-gray-800 to-black p-[1px] rounded-xl transform rotate-1 hover:rotate-0 transition-transform duration-300 shadow-2xl">
                                    <div className="bg-[#141414] p-4 rounded-xl text-center h-full">
                                        <div className="w-16 h-16 bg-red-500/20 rounded-full mx-auto mb-3 flex items-center justify-center border-2 border-red-500">
                                            <span className="text-2xl">👺</span>
                                        </div>
                                        <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Enemigo</div>
                                        <h3 className="font-bold text-white text-lg mb-2">{mission.enemy}</h3>
                                        <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-red-500 w-3/4"></div>
                                        </div>
                                    </div>
                                </div>

                                {/* Items */}
                                <div className="mt-12">
                                    <div className="text-[10px] text-gray-500 uppercase mb-3 flex items-center gap-2">
                                        <Backpack size={12} /> Inventario
                                    </div>
                                    <div className="flex gap-3">
                                        {mission.items.map((item, i) => (
                                            <div key={i} className="bg-white/5 border border-white/10 px-3 py-2 rounded text-xs text-gray-300 flex items-center gap-2">
                                                <span>{i === 0 ? '⛏️' : '⛑️'}</span> {item}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Combat Metrics (Circles) */}
                        <div className="grid grid-cols-3 gap-4">
                            {[
                                { label: 'ESCUCHA', val: mission.metrics.escucha, color: COLORS.maityBlue },
                                { label: 'SEGURIDAD', val: mission.metrics.seguridad, color: COLORS.maityPink },
                                { label: 'SPEAK', val: mission.metrics.speak, color: COLORS.maityGreen },
                            ].map((m, i) => (
                                <div key={i} className="bg-[#0F0F0F] p-4 rounded-xl border border-white/10 text-center">
                                    <div className="relative w-16 h-16 mx-auto mb-2 flex items-center justify-center">
                                        <svg className="w-full h-full -rotate-90">
                                            <circle cx="32" cy="32" r="28" stroke="#1A1A1A" strokeWidth="4" fill="none" />
                                            <circle
                                                cx="32" cy="32" r="28"
                                                stroke={m.color} strokeWidth="4" fill="none"
                                                strokeDasharray="175"
                                                strokeDashoffset={175 - (175 * m.val) / 100}
                                                className="transition-all duration-1000"
                                            />
                                        </svg>
                                        <span className="absolute font-bold text-white">{m.val}%</span>
                                    </div>
                                    <div className="text-[10px] font-bold text-gray-500 uppercase">{m.label}</div>
                                </div>
                            ))}
                        </div>

                    </div>

                    {/* --- RIGHT PANEL: ANALYTICS / SOCIAL (4 Cols) --- */}
                    <div className="lg:col-span-4 space-y-6">

                        {/* Atmosphere Indicators */}
                        <div className="bg-[#0F0F0F] p-6 rounded-xl border border-white/10">
                            <h4 className="text-xs font-bold text-gray-500 uppercase mb-4 flex items-center gap-2">
                                <Thermometer size={14} /> Atmósfera
                            </h4>

                            {/* Muletillas */}
                            <div className="mb-4">
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-400">Muletillas</span>
                                    <span className="text-white font-bold">{analytics.muletillas}%</span>
                                </div>
                                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-orange-400" style={{ width: `${analytics.muletillas}%` }}></div>
                                </div>
                            </div>

                            {/* Flow */}
                            <div className="mb-6">
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-400">Flow Positivo</span>
                                    <span className="text-white font-bold">{analytics.flow}%</span>
                                </div>
                                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-400" style={{ width: `${analytics.flow}%` }}></div>
                                </div>
                            </div>

                            {/* Temperature Bar */}
                            <div>
                                <div className="flex justify-between text-[10px] text-gray-500 mb-1 uppercase">
                                    <span>Frío</span>
                                    <span>Calor</span>
                                </div>
                                <div className="h-4 w-full rounded-full bg-gradient-to-r from-blue-600 via-white to-red-600 relative">
                                    <div
                                        className="absolute top-0 bottom-0 w-1 bg-black border-2 border-white rounded-full"
                                        style={{ left: `${50 + (analytics.temperature)}%` }} // 0 is middle? assuming standard scale
                                    ></div>
                                </div>
                                <div className="text-center mt-1 text-xs font-bold text-blue-300">{analytics.temperature}° (Estable)</div>
                            </div>
                        </div>

                        {/* Ranking */}
                        <div className="bg-[#0F0F0F] rounded-xl border border-white/10 overflow-hidden">
                            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[#141414]">
                                <h4 className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                                    <Trophy size={14} className="text-yellow-500" /> Ranking Global
                                </h4>
                            </div>
                            <div className="divide-y divide-white/5">
                                {ranking.map((r, i) => (
                                    <div key={i} className={`flex items-center justify-between p-3 ${r.isUser ? 'bg-white/5 border-l-2 border-pink-500' : ''}`}>
                                        <div className="flex items-center gap-3">
                                            <div className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-yellow-500/20 text-yellow-500' : 'bg-gray-800 text-gray-500'}`}>
                                                #{r.pos}
                                            </div>
                                            <span className={`text-sm ${r.isUser ? 'text-white font-bold' : 'text-gray-400'}`}>{r.name}</span>
                                        </div>
                                        <span className="text-xs font-mono text-gray-500">{r.xp.toLocaleString()} XP</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="grid grid-cols-1 gap-3">
                            <button
                                onClick={() => setView('roleplay')}
                                className="flex items-center justify-between p-4 bg-gradient-to-r from-pink-900/20 to-purple-900/20 rounded-xl border border-pink-500/30 hover:border-pink-500 transition-colors group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-pink-500/20 rounded text-pink-500"><Sparkles size={18} /></div>
                                    <div className="text-left">
                                        <div className="text-sm font-bold text-white group-hover:text-pink-400">Práctica con IA</div>
                                        <div className="text-xs text-gray-500">Negociación simulada</div>
                                    </div>
                                </div>
                                <ChevronRight size={16} className="text-gray-600 group-hover:text-white" />
                            </button>

                            <button
                                onClick={generateInsight}
                                disabled={loadingInsight}
                                className="flex items-center justify-between p-4 bg-[#0F0F0F] rounded-xl border border-white/10 hover:border-white/30 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-500/10 rounded text-blue-500"><Lightbulb size={18} /></div>
                                    <div className="text-left">
                                        <div className="text-sm font-bold text-white">Insight Diario</div>
                                        <div className="text-xs text-gray-500">{loadingInsight ? 'Generando...' : 'Obtener consejo'}</div>
                                    </div>
                                </div>
                            </button>
                            {insight && (
                                <div className="p-3 bg-blue-900/10 border border-blue-500/20 rounded-lg text-xs text-blue-200 animate-in fade-in slide-in-from-top-2">
                                    {insight}
                                </div>
                            )}
                        </div>

                    </div>

                </div>
            </div>
        </div>
    );
};

// 11. Pricing (Updated with Free, Pro, Wearable + Table)
const Pricing = () => {
    const [annual, setAnnual] = useState(true);
    const [showTable, setShowTable] = useState(false);

    return (
        <div className="py-24 bg-[#050505] text-[#e7e7e9]">
            <div className="max-w-7xl mx-auto px-4 text-center">
                <FadeIn>
                    <h2 className="text-4xl font-bold mb-4 text-white">Elige tu plan de evolución</h2>
                    <p className="text-gray-400 mb-8">Todos los planes incluyen 7 días gratis. Cancela cuando quieras.</p>

                    <div className="flex justify-center items-center gap-4 mb-16 bg-[#0F0F0F] inline-flex p-1 rounded-full border border-white/10">
                        <button
                            onClick={() => setAnnual(false)}
                            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${!annual ? 'bg-gray-800 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                        >
                            Mensual
                        </button>
                        <button
                            onClick={() => setAnnual(true)}
                            className={`px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${annual ? 'bg-gray-800 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                        >
                            Anual <span className="text-[10px] font-bold bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded">-20%</span>
                        </button>
                    </div>
                </FadeIn>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">

                    {/* FREE PLAN */}
                    <FadeIn delay={100} className="h-full">
                        <div className="border border-white/10 rounded-xl p-8 bg-[#0F0F0F] text-left hover:border-white/20 transition-all flex flex-col h-full">
                            <div className="mb-4">
                                <h3 className="font-bold text-xl text-gray-200">MAITY FREE</h3>
                                <p className="text-xs text-gray-500">Para probar y empezar</p>
                            </div>
                            <p className="text-3xl font-bold mb-6 text-white">$0<span className="text-sm font-normal text-gray-500">/mes</span></p>

                            <ul className="space-y-4 mb-8 text-sm text-gray-400 flex-grow">
                                <li className="flex gap-2"><Check size={16} className="text-gray-500" /> 5 prácticas mensuales</li>
                                <li className="flex gap-2"><Check size={16} className="text-gray-500" /> Análisis básico</li>
                                <li className="flex gap-2"><Check size={16} className="text-gray-500" /> 3 escenarios básicos</li>
                                <li className="flex gap-2"><Check size={16} className="text-gray-500" /> Muletillas y ritmo</li>
                                <li className="flex gap-2 text-gray-600"><X size={16} className="text-red-900" /> Sin análisis avanzado</li>
                                <li className="flex gap-2 text-gray-600"><X size={16} className="text-red-900" /> Sin escenarios personalizados</li>
                            </ul>
                            <button className="w-full py-3 rounded border border-white/20 font-bold hover:bg-white/5 transition-colors text-white mt-auto">
                                Empezar gratis
                            </button>
                        </div>
                    </FadeIn>

                    {/* PRO PLAN */}
                    <FadeIn delay={200} className="h-full">
                        <div className="border-2 rounded-xl p-8 shadow-xl text-left relative transform md:-translate-y-4 bg-black text-white flex flex-col h-full" style={{ borderColor: COLORS.maityPink }}>
                            <div className="absolute top-0 right-0 bg-pink-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">RECOMENDADO</div>
                            <div className="mb-4">
                                <h3 className="font-bold text-xl text-white">MAITY PRO</h3>
                                <p className="text-xs text-pink-200">Para mejorar en serio</p>
                            </div>
                            <p className="text-3xl font-bold mb-6 text-white">
                                ${annual ? '9.99' : '12.99'}
                                <span className="text-sm font-normal text-gray-400">/mes</span>
                            </p>

                            <ul className="space-y-4 mb-8 text-sm text-gray-300 flex-grow">
                                <li className="flex gap-2"><Check size={16} color={COLORS.maityPink} /> <strong>Prácticas ilimitadas</strong></li>
                                <li className="flex gap-2"><Check size={16} color={COLORS.maityPink} /> Análisis completo (energía, contacto visual)</li>
                                <li className="flex gap-2"><Check size={16} color={COLORS.maityPink} /> 15+ escenarios y 10+ IAs</li>
                                <li className="flex gap-2"><Check size={16} color={COLORS.maityPink} /> Feedback detallado con IA</li>
                                <li className="flex gap-2"><Check size={16} color={COLORS.maityPink} /> Metas y Gamificación completa</li>
                                <li className="flex gap-2"><Check size={16} color={COLORS.maityPink} /> Historial ilimitado</li>
                                <li className="flex gap-2 text-pink-400 font-bold text-xs mt-4 pt-4 border-t border-white/10"><Star size={12} /> Bonus: Descuento en Wearable ($20 off)</li>
                            </ul>
                            <button
                                className="w-full py-3 rounded font-bold transition-transform hover:scale-105 mt-auto"
                                style={{ backgroundColor: COLORS.maityPink }}
                            >
                                Iniciar prueba (7 días gratis)
                            </button>
                        </div>
                    </FadeIn>

                    {/* WEARABLE PLAN */}
                    <FadeIn delay={300} className="h-full">
                        <div className="border border-blue-500/30 rounded-xl p-8 bg-[#0A0A0A] text-left hover:border-blue-500/50 transition-all flex flex-col relative overflow-hidden h-full">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                            <div className="mb-4 relative z-10">
                                <h3 className="font-bold text-xl text-blue-100">MAITY WEARABLE</h3>
                                <p className="text-xs text-blue-400">Coaching en la vida real</p>
                            </div>
                            <p className="text-3xl font-bold mb-6 text-white">$99<span className="text-sm font-normal text-gray-500"> pago único</span></p>

                            <ul className="space-y-4 mb-8 text-sm text-gray-400 flex-grow relative z-10">
                                <li className="flex gap-2"><Check size={16} className="text-blue-400" /> Dispositivo Maity Pendant</li>
                                <li className="flex gap-2"><Check size={16} className="text-blue-400" /> Análisis de conversaciones reales</li>
                                <li className="flex gap-2"><Check size={16} className="text-blue-400" /> Feedback discreto (vibración)</li>
                                <li className="flex gap-2"><Check size={16} className="text-blue-400" /> Privacidad y encriptación</li>
                                <li className="flex gap-2"><Check size={16} className="text-blue-400" /> Batería 48h + Peso ligero (~15g)</li>
                                <li className="text-xs text-gray-500 mt-2 italic">* Requiere suscripción activa (Free o Pro)</li>
                            </ul>
                            <button className="w-full py-3 rounded border border-blue-500/50 font-bold hover:bg-blue-900/20 transition-colors text-blue-100 mt-auto relative z-10">
                                Comprar
                            </button>
                        </div>
                    </FadeIn>
                </div>

                {/* COMPARISON TABLE TOGGLE */}
                <FadeIn delay={400} className="max-w-4xl mx-auto">
                    <button
                        onClick={() => setShowTable(!showTable)}
                        className="text-sm text-gray-400 hover:text-white flex items-center justify-center gap-2 mx-auto mb-8 transition-colors"
                    >
                        {showTable ? 'Ocultar comparativa detallada' : 'Ver tabla comparativa completa'}
                        <ChevronDown size={16} className={`transform transition-transform ${showTable ? 'rotate-180' : ''}`} />
                    </button>

                    {showTable && (
                        <div className="overflow-x-auto animate-in fade-in slide-in-from-top-4 duration-500">
                            <table className="w-full text-left text-sm text-gray-400">
                                <thead>
                                    <tr className="border-b border-white/10">
                                        <th className="py-4 px-4 font-normal">Característica</th>
                                        <th className="py-4 px-4 font-bold text-white text-center">FREE</th>
                                        <th className="py-4 px-4 font-bold text-pink-500 text-center">PRO</th>
                                        <th className="py-4 px-4 font-bold text-blue-400 text-center">WEARABLE</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {[
                                        { feat: 'Prácticas con IA', free: '5/mes', pro: 'Ilimitadas', wear: '—' },
                                        { feat: 'Análisis básico', free: true, pro: true, wear: true },
                                        { feat: 'Análisis avanzado', free: false, pro: true, wear: true },
                                        { feat: 'Escenarios', free: '3', pro: '15+', wear: '—' },
                                        { feat: 'Metas personalizadas', free: false, pro: true, wear: true },
                                        { feat: 'Avatares', free: '1', pro: 'Todos', wear: 'Todos' },
                                        { feat: 'Historial', free: '30 días', pro: 'Ilimitado', wear: 'Ilimitado' },
                                        { feat: 'Conversaciones reales', free: false, pro: false, wear: true },
                                        { feat: 'Feedback en tiempo real', free: false, pro: false, wear: true },
                                    ].map((row, i) => (
                                        <tr key={i} className="hover:bg-white/5 transition-colors">
                                            <td className="py-3 px-4 text-white">{row.feat}</td>
                                            <td className="py-3 px-4 text-center">
                                                {row.free === true ? <Check size={16} className="mx-auto text-green-500" /> : row.free === false ? <Minus size={16} className="mx-auto text-gray-600" /> : row.free}
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                {row.pro === true ? <Check size={16} className="mx-auto text-pink-500" /> : row.pro === false ? <Minus size={16} className="mx-auto text-gray-600" /> : <span className="text-pink-500 font-bold">{row.pro}</span>}
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                {row.wear === true ? <Check size={16} className="mx-auto text-blue-400" /> : row.wear === false ? <Minus size={16} className="mx-auto text-gray-600" /> : row.wear}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* BUNDLES */}
                            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                                <div className="bg-[#141414] p-4 rounded-xl border border-white/5 flex justify-between items-center">
                                    <div>
                                        <div className="text-xs font-bold text-blue-400 uppercase mb-1">Starter Pack</div>
                                        <div className="text-white font-bold">Wearable + 3 meses Pro</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xl font-bold text-white">$129</div>
                                        <div className="text-xs text-green-500">Ahorras $20</div>
                                    </div>
                                </div>
                                <div className="bg-[#141414] p-4 rounded-xl border border-pink-500/20 flex justify-between items-center relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-pink-500"></div>
                                    <div>
                                        <div className="text-xs font-bold text-pink-500 uppercase mb-1">Año Completo</div>
                                        <div className="text-white font-bold">Wearable + 12 meses Pro</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xl font-bold text-white">$179</div>
                                        <div className="text-xs text-green-500">Ahorras $39</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </FadeIn>

            </div>
        </div>
    );
}

// 12. Business Pricing (NEW)
const BusinessPricing = () => {
    const [annual, setAnnual] = useState(true);
    const [showTable, setShowTable] = useState(false);

    return (
        <div className="py-24 bg-[#050505] text-[#e7e7e9] border-t border-white/5">
            <div className="max-w-7xl mx-auto px-4 text-center">
                <FadeIn>
                    <div className="inline-flex items-center justify-center p-3 bg-white/5 rounded-full mb-4">
                        <Briefcase size={24} className="text-blue-400" />
                    </div>
                    <h2 className="text-4xl font-bold mb-4 text-white">Planes Corporativos</h2>
                    <p className="text-gray-400 mb-8">Soluciones escalables para equipos de alto rendimiento.</p>

                    <div className="flex justify-center items-center gap-4 mb-16 bg-[#0F0F0F] inline-flex p-1 rounded-full border border-white/10">
                        <button
                            onClick={() => setAnnual(false)}
                            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${!annual ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                        >
                            Mensual
                        </button>
                        <button
                            onClick={() => setAnnual(true)}
                            className={`px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${annual ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                        >
                            Anual <span className="text-[10px] font-bold bg-green-500 text-black px-1.5 py-0.5 rounded">-10%</span>
                        </button>
                    </div>
                </FadeIn>

                {/* CARDS GRID */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-7xl mx-auto mb-16">

                    {/* STARTER */}
                    <FadeIn delay={100} className="h-full">
                        <div className="border border-white/10 rounded-xl p-6 bg-[#0F0F0F] text-left hover:border-blue-500/50 transition-all flex flex-col h-full">
                            <div className="mb-4">
                                <div className="text-2xl mb-2">🚀</div>
                                <h3 className="font-bold text-xl text-white">STARTER</h3>
                                <p className="text-xs text-gray-500">Equipos pequeños (5-20)</p>
                            </div>
                            <p className="text-3xl font-bold mb-6 text-white">${annual ? '19' : '22'}<span className="text-sm font-normal text-gray-500">/user/mes</span></p>

                            <ul className="space-y-3 mb-8 text-xs text-gray-400 flex-grow">
                                <li className="flex gap-2"><Check size={14} className="text-blue-500" /> Prácticas ilimitadas</li>
                                <li className="flex gap-2"><Check size={14} className="text-blue-500" /> 15+ escenarios</li>
                                <li className="flex gap-2"><Check size={14} className="text-blue-500" /> Dashboard básico admin</li>
                                <li className="flex gap-2"><Check size={14} className="text-blue-500" /> Análisis de equipo</li>
                                <li className="flex gap-2"><Check size={14} className="text-blue-500" /> 1 grupo unificado</li>
                            </ul>
                            <button className="w-full py-3 rounded border border-white/20 font-bold hover:bg-white/5 transition-colors text-white mt-auto text-sm">
                                Empezar prueba
                            </button>
                        </div>
                    </FadeIn>

                    {/* TEAM */}
                    <FadeIn delay={200} className="h-full">
                        <div className="border-2 border-green-500/50 rounded-xl p-6 bg-[#0F0F0F] text-left hover:border-green-500 transition-all flex flex-col relative h-full">
                            <div className="absolute top-0 right-0 bg-green-600 text-black text-[10px] font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">GROWTH</div>
                            <div className="mb-4">
                                <div className="text-2xl mb-2">⭐</div>
                                <h3 className="font-bold text-xl text-white">TEAM</h3>
                                <p className="text-xs text-green-400">Crecimiento (21-100)</p>
                            </div>
                            <p className="text-3xl font-bold mb-6 text-white">${annual ? '39' : '45'}<span className="text-sm font-normal text-gray-500">/user/mes</span></p>

                            <ul className="space-y-3 mb-8 text-xs text-gray-400 flex-grow">
                                <li className="flex gap-2 text-white"><Check size={14} className="text-green-500" /> <strong>Todo de Starter +</strong></li>
                                <li className="flex gap-2"><Check size={14} className="text-green-500" /> Builder escenarios custom</li>
                                <li className="flex gap-2"><Check size={14} className="text-green-500" /> Programas de training</li>
                                <li className="flex gap-2"><Check size={14} className="text-green-500" /> Manager dashboard</li>
                                <li className="flex gap-2"><Check size={14} className="text-green-500" /> AI Insights & Grupos</li>
                            </ul>
                            <button
                                className="w-full py-3 rounded font-bold transition-colors text-black mt-auto text-sm"
                                style={{ backgroundColor: COLORS.maityGreen }}
                            >
                                Empezar prueba
                            </button>
                        </div>
                    </FadeIn>

                    {/* BUSINESS */}
                    <FadeIn delay={300} className="h-full">
                        <div className="border border-purple-500/30 rounded-xl p-6 bg-[#0F0F0F] text-left hover:border-purple-500/50 transition-all flex flex-col h-full">
                            <div className="mb-4">
                                <div className="text-2xl mb-2">💎</div>
                                <h3 className="font-bold text-xl text-white">BUSINESS</h3>
                                <p className="text-xs text-purple-400">Organizaciones (101-500)</p>
                            </div>
                            <p className="text-3xl font-bold mb-6 text-white">${annual ? '59' : '69'}<span className="text-sm font-normal text-gray-500">/user/mes</span></p>

                            <ul className="space-y-3 mb-8 text-xs text-gray-400 flex-grow">
                                <li className="flex gap-2 text-white"><Check size={14} className="text-purple-500" /> <strong>Todo de Team +</strong></li>
                                <li className="flex gap-2"><Check size={14} className="text-purple-500" /> SSO/SAML & API Completa</li>
                                <li className="flex gap-2"><Check size={14} className="text-purple-500" /> Integraciones CRM/LMS</li>
                                <li className="flex gap-2"><Check size={14} className="text-purple-500" /> Branding completo</li>
                                <li className="flex gap-2"><Check size={14} className="text-purple-500" /> Dedicated CSM & SLA</li>
                            </ul>
                            <button className="w-full py-3 rounded border border-purple-500/50 font-bold hover:bg-purple-900/20 transition-colors text-white mt-auto text-sm">
                                Agendar demo
                            </button>
                        </div>
                    </FadeIn>

                    {/* ENTERPRISE */}
                    <FadeIn delay={400} className="h-full">
                        <div className="border border-yellow-500/30 rounded-xl p-6 bg-[#0A0A0A] text-left hover:border-yellow-500/50 transition-all flex flex-col relative overflow-hidden h-full">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                            <div className="mb-4 relative z-10">
                                <div className="text-2xl mb-2">🏆</div>
                                <h3 className="font-bold text-xl text-yellow-100">ENTERPRISE</h3>
                                <p className="text-xs text-yellow-500">Custom (500+)</p>
                            </div>
                            <p className="text-3xl font-bold mb-6 text-white">Custom</p>

                            <ul className="space-y-3 mb-8 text-xs text-gray-400 flex-grow relative z-10">
                                <li className="flex gap-2 text-white"><Check size={14} className="text-yellow-500" /> <strong>Todo de Business +</strong></li>
                                <li className="flex gap-2"><Check size={14} className="text-yellow-500" /> Pricing por volumen</li>
                                <li className="flex gap-2"><Check size={14} className="text-yellow-500" /> White-label total</li>
                                <li className="flex gap-2"><Check size={14} className="text-yellow-500" /> On-premise option</li>
                                <li className="flex gap-2"><Check size={14} className="text-yellow-500" /> Custom AI training</li>
                            </ul>
                            <button className="w-full py-3 rounded border border-yellow-500/50 font-bold hover:bg-yellow-900/20 transition-colors text-yellow-100 mt-auto relative z-10 text-sm">
                                Contactar ventas
                            </button>
                        </div>
                    </FadeIn>

                </div>

                {/* ENTERPRISE TABLE TOGGLE */}
                <FadeIn delay={500}>
                    <div className="max-w-5xl mx-auto">
                        <button
                            onClick={() => setShowTable(!showTable)}
                            className="text-sm text-gray-400 hover:text-white flex items-center justify-center gap-2 mx-auto mb-8 transition-colors"
                        >
                            {showTable ? 'Ocultar comparativa técnica' : 'Ver tabla de características completa'}
                            <ChevronDown size={16} className={`transform transition-transform ${showTable ? 'rotate-180' : ''}`} />
                        </button>

                        {showTable && (
                            <div className="overflow-x-auto animate-in fade-in slide-in-from-top-4 duration-500">
                                <table className="w-full text-left text-xs md:text-sm text-gray-400">
                                    <thead>
                                        <tr className="border-b border-white/10">
                                            <th className="py-4 px-2 font-normal">Característica</th>
                                            <th className="py-4 px-2 font-bold text-white text-center">STARTER</th>
                                            <th className="py-4 px-2 font-bold text-green-400 text-center">TEAM</th>
                                            <th className="py-4 px-2 font-bold text-purple-400 text-center">BUSINESS</th>
                                            <th className="py-4 px-2 font-bold text-yellow-400 text-center">CUSTOM</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {[
                                            { feat: 'Usuarios', s: '5-20', t: '21-100', b: '101-500', c: '500+' },
                                            { feat: 'Prácticas', s: 'Ilimitadas', t: 'Ilimitadas', b: 'Ilimitadas', c: 'Ilimitadas' },
                                            { feat: 'Escenarios', s: '15+ Pre', t: 'Builder Custom', b: 'Builder Custom', c: 'Diseño a medida' },
                                            { feat: 'Programas Training', s: false, t: true, b: true, c: true },
                                            { feat: 'Dashboard Admin', s: 'Básico', t: 'Manager View', b: 'Avanzado', c: 'Custom BI' },
                                            { feat: 'AI Insights', s: false, t: true, b: true, c: 'Custom Models' },
                                            { feat: 'SSO/SAML', s: false, t: false, b: true, c: true },
                                            { feat: 'API & Webhooks', s: false, t: false, b: true, c: true },
                                            { feat: 'Integraciones', s: 'Calendar', t: '+ Zoom/Teams', b: '+ CRM/LMS', c: 'Custom ERP' },
                                            { feat: 'Branding', s: false, t: 'Logo', b: 'Completo', c: 'White-label' },
                                            { feat: 'Soporte', s: '48h', t: '24h', b: 'Prioritario', c: 'Dedicado' },
                                        ].map((row, i) => (
                                            <tr key={i} className="hover:bg-white/5 transition-colors">
                                                <td className="py-3 px-2 text-white">{row.feat}</td>
                                                <td className="py-3 px-2 text-center">
                                                    {row.s === true ? <Check size={14} className="mx-auto text-blue-500" /> : row.s === false ? <Minus size={14} className="mx-auto text-gray-600" /> : row.s}
                                                </td>
                                                <td className="py-3 px-2 text-center">
                                                    {row.t === true ? <Check size={14} className="mx-auto text-green-500" /> : row.t === false ? <Minus size={14} className="mx-auto text-gray-600" /> : row.t}
                                                </td>
                                                <td className="py-3 px-2 text-center">
                                                    {row.b === true ? <Check size={14} className="mx-auto text-purple-500" /> : row.b === false ? <Minus size={14} className="mx-auto text-gray-600" /> : row.b}
                                                </td>
                                                <td className="py-3 px-2 text-center">
                                                    {row.c === true ? <Check size={14} className="mx-auto text-yellow-500" /> : row.c === false ? <Minus size={14} className="mx-auto text-gray-600" /> : row.c}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {/* ADD-ONS */}
                                <div className="mt-12 text-left bg-[#141414] p-6 rounded-xl border border-white/5">
                                    <h4 className="text-sm font-bold text-white uppercase mb-4 flex items-center gap-2"><Plus size={16} /> Add-ons Opcionales</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-400">
                                        <div className="flex justify-between border-b border-white/5 pb-2">
                                            <span>Wearables para equipo (10+)</span>
                                            <span className="text-white font-bold">$79/u</span>
                                        </div>
                                        <div className="flex justify-between border-b border-white/5 pb-2">
                                            <span>Wearables bulk (50+)</span>
                                            <span className="text-white font-bold">$59/u</span>
                                        </div>
                                        <div className="flex justify-between border-b border-white/5 pb-2">
                                            <span>Contenido Custom (Diseño instruccional)</span>
                                            <span className="text-white font-bold">$2k - $8k</span>
                                        </div>
                                        <div className="flex justify-between border-b border-white/5 pb-2">
                                            <span>Training Presencial (Día)</span>
                                            <span className="text-white font-bold">$3,000</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </FadeIn>

            </div>
        </div>
    );
}

// 5.5 FAQ SECTION
const FAQSection = () => {
    const faqs = [
        {
            q: "¿Tienen videos o contenido para empezar?",
            a: "Sí. Tenemos videos introductorios y contenido práctico para que empieces a usar Maity desde el día uno. Ahí explicamos cómo funciona, cómo integrarlo a tus reuniones y cómo sacarle valor real desde la primera semana. Maity no tiene curva de aprendizaje pesada: se aprende usándolo."
        },
        {
            q: "¿Qué tan segura está mi información?",
            a: "Tu información es tuya. Punto. Solo tú (o tu empresa, según el caso) puede acceder a tus conversaciones y análisis. Maity no vende datos, no los comparte con terceros y no los usa sin consentimiento. Toda la información se almacena en infraestructura segura y puedes pedir su eliminación en cualquier momento."
        },
        {
            q: "¿Cómo funciona el modelo de precios?",
            a: "Puedes empezar con un plan inicial y escalar según tus objetivos. Maity tiene opciones para uso individual, equipos, empresas y coaches. Si eres empresa o quieres una solución personalizada (white label o enterprise), puedes hablar directamente con nosotros para diseñar el modelo correcto."
        },
        {
            q: "¿Puedo usar Maity en mis llamadas diarias?",
            a: "Sí. Maity está pensada para usarse en tus llamadas reales, no en simulaciones. Funciona con plataformas como Zoom, Google Meet y Microsoft Teams. Maity puede operar en dos modos: Modo equipo (retroalimentación para todos) y Modo privado (solo te escucha a ti)."
        },
        {
            q: "¿Maity graba a todas las personas de la reunión?",
            a: "Depende del modo que elijas. En modo privado, solo tú eres analizado. En modo equipo, el uso es transparente y configurado a nivel organizacional. Maity está diseñada para acompañar, no para vigilar."
        },
        {
            q: "Soy coach de comunicación / liderazgo. ¿Cómo puedo usar Maity?",
            a: "Piensa en Maity como tu copiloto. Maity se encarga de analizar conversaciones, detectar patrones y generar métricas. Así tú puedes enfocarte en la intervención humana y el acompañamiento profundo. Te ayuda a ahorrar tiempo y escalar tu impacto."
        },
        {
            q: "¿Maity reemplaza al coach humano?",
            a: "No. Maity no sustituye, potencia. Hace el trabajo continuo y repetitivo que ningún humano puede hacer 24/7. Cuando el proceso lo amerita, Maity recomienda sesiones de coaching humano para profundizar."
        },
        {
            q: "¿Puedo conocer a otros usuarios o coaches que usan Maity?",
            a: "Sí. Estamos construyendo una comunidad de usuarios, coaches y líderes que creen en una nueva forma de aprender y desarrollarse: con seguimiento real y acompañamiento continuo."
        },
        {
            q: "¿Qué pasa si dejo de usar Maity?",
            a: "Nada forzado. Si dejas de interactuar, Maity entra en modo seguimiento suave y, después de un tiempo, puede invitarte a retomar cuando tenga sentido para ti. Maity acompaña. No presiona."
        },
        {
            q: "Tengo más dudas, ¿con quién hablo?",
            a: "Puedes contactarnos directamente desde la plataforma o por nuestros canales de soporte. Estamos aquí para ayudarte a entender si Maity es para ti y cómo usarla de la mejor manera, no para venderte algo que no necesitas."
        }
    ];

    const [openIndex, setOpenIndex] = useState(null);

    const toggleFAQ = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="py-24 bg-[#0F0F0F] border-t border-white/5 text-[#e7e7e9]">
            <div className="max-w-4xl mx-auto px-4">
                <div className="text-center mb-16">
                    <FadeIn>
                        <div className="inline-flex items-center justify-center p-3 bg-white/5 rounded-full mb-4">
                            <HelpCircle size={24} className="text-gray-400" />
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Preguntas Frecuentes</h2>
                        <p className="text-gray-500">Todo lo que necesitas saber para empezar tu evolución.</p>
                    </FadeIn>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <FadeIn key={index} delay={index * 50}>
                            <div
                                className={`rounded-xl border transition-all duration-300 overflow-hidden ${openIndex === index
                                    ? 'bg-[#141414] border-pink-500/50 shadow-lg shadow-pink-900/10'
                                    : 'bg-[#0A0A0A] border-white/10 hover:border-white/20'
                                    }`}
                            >
                                <button
                                    onClick={() => toggleFAQ(index)}
                                    className="w-full flex justify-between items-center p-5 text-left focus:outline-none"
                                >
                                    <span className={`font-medium text-lg ${openIndex === index ? 'text-white' : 'text-gray-300'}`}>
                                        {faq.q}
                                    </span>
                                    <div className={`p-1 rounded-full transition-colors ${openIndex === index ? 'bg-pink-500 text-white' : 'text-gray-500'}`}>
                                        {openIndex === index ? <Minus size={16} /> : <Plus size={16} />}
                                    </div>
                                </button>

                                <div
                                    className={`transition-all duration-300 ease-in-out ${openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                                        }`}
                                >
                                    <div className="p-5 pt-0 text-gray-400 leading-relaxed border-t border-white/5 mt-2">
                                        {faq.a}
                                    </div>
                                </div>
                            </div>
                        </FadeIn>
                    ))}
                </div>
            </div>
        </div>
    );
};

// 6. Gamification "The Climb"
const TheClimb = () => {
    return (
        <div className="pt-24 pb-12 min-h-screen relative overflow-hidden bg-[#050505]">
            <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
                <div className="mb-16">
                    <h2 className="text-4xl font-bold text-white mb-2 flex items-center justify-center gap-3">
                        <Mountain size={40} className="text-white" />
                        La Escalada
                    </h2>
                    <p className="text-gray-400">Tu viaje hacia la maestría.</p>
                </div>

                <div className="bg-[#0F0F0F] p-12 rounded-2xl border border-white/10 text-gray-500 italic">
                    (Visualización de Mapa 3D cargando en este entorno oscuro...)
                </div>
            </div>
        </div>
    )
}

// 7. Footer
const Footer = () => (
    <footer className="bg-black text-white pt-20 pb-10 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12">
            <div>
                <span className="text-2xl font-bold tracking-tighter block mb-6">maity<span className="text-pink-500">.</span></span>
                <p className="text-sm text-gray-500 leading-relaxed">
                    Transformando el aprendizaje en evolución diaria a través de IA ética y humana.
                </p>
            </div>
            <div>
                <h4 className="font-bold mb-6 text-gray-200">Producto</h4>
                <ul className="space-y-3 text-sm text-gray-500">
                    <li className="hover:text-pink-500 cursor-pointer transition-colors">Dashboard</li>
                    <li className="hover:text-pink-500 cursor-pointer transition-colors">App Windows</li>
                    <li className="hover:text-pink-500 cursor-pointer transition-colors">La Escalada</li>
                </ul>
            </div>
            <div>
                <h4 className="font-bold mb-6 text-gray-200">Empresa</h4>
                <ul className="space-y-3 text-sm text-gray-500">
                    <li className="hover:text-blue-500 cursor-pointer transition-colors">Nosotros</li>
                    <li className="hover:text-blue-500 cursor-pointer transition-colors">Seguridad</li>
                    <li className="hover:text-blue-500 cursor-pointer transition-colors">Contacto</li>
                </ul>
            </div>
            <div>
                <h4 className="font-bold mb-6 text-gray-200">Legal</h4>
                <ul className="space-y-3 text-sm text-gray-500">
                    <li className="hover:text-gray-300 cursor-pointer transition-colors">Privacidad</li>
                    <li className="hover:text-gray-300 cursor-pointer transition-colors">Términos</li>
                </ul>
            </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-16 pt-8 border-t border-white/10 text-center flex justify-between items-center text-xs text-gray-600">
            <p>© 2025 Maity Inc.</p>
            <div className="flex gap-4">
                <span>Twitter</span>
                <span>LinkedIn</span>
            </div>
        </div>
    </footer>
);

// --- MAIN APP COMPONENT ---
export default function App() {
    const [activeView, setActiveView] = useState('home');

    return (
        <div className="min-h-screen font-sans bg-[#050505] text-[#e7e7e9]">
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        body { font-family: 'Inter', sans-serif; background-color: #050505; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #1a1a1a; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #444; }
      `}</style>

            <Navbar activeView={activeView} setView={setActiveView} />

            <main>
                {activeView === 'home' && (
                    <>
                        <HeroSection setView={setActiveView} />
                        <ProblemSection />
                        <ProductInfoSection />
                        <VideoTestimonials />
                        <Pricing />
                        <FAQSection />
                    </>
                )}

                {/* NEW BUSINESS VIEW */}
                {activeView === 'business' && (
                    <>
                        <BusinessHeroSection setView={setActiveView} />
                        <BusinessDeepDive />
                        <ROICalculator />
                        <BusinessPricing />
                    </>
                )}

                {/* NEW SUCCESS STORIES VIEW */}
                {activeView === 'success-stories' && (
                    <SuccessStories setView={setActiveView} />
                )}

                {/* NEW LOGIN VIEW */}
                {activeView === 'login' && (
                    <LoginView setView={setActiveView} />
                )}

                {/* APP VIEWS */}
                {activeView === 'dashboard' && <Dashboard setView={setActiveView} />}
                {activeView === 'climb' && <TheClimb />}
                {/* NEW ROLEPLAY VIEW */}
                {activeView === 'roleplay' && (
                    <RoleplaySimulator onExit={() => setView('dashboard')} />
                )}
                {activeView === 'pricing' && <Pricing />}
            </main>

            <Footer />
        </div>
    );
}
