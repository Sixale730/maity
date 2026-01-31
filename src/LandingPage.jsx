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
    Sparkles, Send, Bot, User, Loader, DollarSign, Clock, Smartphone,
    Linkedin, Instagram, Facebook, Video as YoutubeIcon, Youtube, Calendar,
    Download, Monitor, Apple, Smartphone as SmartphoneIcon,
    Layout, Scale, Headphones, Smile, Flag, Share2,
    UserPlus, Rocket, CreditCard, BookOpen, Newspaper, GraduationCap, Podcast
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

// --- LANDING VIDEOS DATA ---
const LANDING_VIDEOS = {
    queEsMaity: {
        id: 'v1',
        title: 'Qué es Maity',
        description: 'Conoce la plataforma que transforma tu comunicación',
        duration: '0:55',
        thumbnailUrl: null,
        videoUrl: 'https://youtu.be/Nf3Y_SEuhbw',
        placement: 'hero'
    },
    elProblema: {
        id: 'v2',
        title: 'El problema que nadie te dice',
        description: 'Por qué la capacitación tradicional ya no funciona',
        duration: '0:45',
        thumbnailUrl: null,
        videoUrl: null,
        placement: 'problem'
    },
    comoFunciona: {
        id: 'v3',
        title: 'Cómo funciona Maity',
        description: 'Tu escalada en 3 pasos simples',
        duration: '1:00',
        thumbnailUrl: null,
        videoUrl: null,
        placement: 'how-it-works'
    },
    laEscalada: {
        id: 'v5',
        title: 'La Escalada: tu aventura',
        description: 'Gamificación que transforma el aprendizaje',
        duration: '0:55',
        thumbnailUrl: null,
        videoUrl: null,
        placement: 'the-climb'
    },
    privacidad: {
        id: 'v8',
        title: 'Tu privacidad es sagrada',
        description: 'Así protegemos tu información',
        duration: '0:45',
        thumbnailUrl: null,
        videoUrl: null,
        placement: 'trust'
    },
    planesPrecios: {
        id: 'v12',
        title: 'Planes y precios',
        description: 'Encuentra el plan perfecto para ti',
        duration: '0:50',
        thumbnailUrl: null,
        videoUrl: null,
        placement: 'pricing'
    },
    empresa: {
        id: 'v9',
        title: 'Maity para tu empresa',
        description: 'Transforma el desarrollo de tu equipo',
        duration: '0:55',
        thumbnailUrl: null,
        videoUrl: null,
        placement: 'business-hero'
    }
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

// --- VIDEO CARD COMPONENT ---
const VideoCard = ({ title, description, duration, thumbnailUrl, videoUrl, variant = 'inline', accentColor = COLORS.maityPink }) => {
    const [playing, setPlaying] = useState(false);

    const getYouTubeId = (url) => {
        if (!url) return null;
        const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([a-zA-Z0-9_-]{11})/);
        return match ? match[1] : null;
    };

    const ytId = getYouTubeId(videoUrl);
    const embedUrl = ytId ? `https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0` : null;
    const autoThumbnail = !thumbnailUrl && ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : thumbnailUrl;
    const isPlaceholder = !videoUrl && !thumbnailUrl && !autoThumbnail;

    return (
        <FadeIn delay={200}>
            <div className={`${variant === 'featured' ? 'mt-12' : 'mt-10'}`}>
                <div className={`relative overflow-hidden rounded-2xl border transition-all group ${
                    variant === 'featured' ? 'max-w-2xl mx-auto' : 'max-w-xl mx-auto'
                } ${isPlaceholder ? 'border-white/5 hover:border-white/10 cursor-default' : 'border-white/10 hover:border-pink-500/30 cursor-pointer'}`}
                    style={{ aspectRatio: '16/9' }}
                    onClick={() => !isPlaceholder && embedUrl && setPlaying(true)}
                >
                    {playing && embedUrl ? (
                        <iframe
                            src={embedUrl}
                            className="absolute inset-0 w-full h-full"
                            allow="autoplay; encrypted-media; picture-in-picture"
                            allowFullScreen
                            frameBorder="0"
                        />
                    ) : (
                        <>
                            {/* Background */}
                            {autoThumbnail ? (
                                <img src={autoThumbnail} alt={title} className="absolute inset-0 w-full h-full object-cover" />
                            ) : (
                                <div className="absolute inset-0 bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A]" />
                            )}

                            {/* Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                            {/* Play Button */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className={`${variant === 'featured' ? 'w-20 h-20' : 'w-14 h-14'} rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/20 group-hover:scale-110 transition-all border border-white/20`}>
                                    <Play size={variant === 'featured' ? 32 : 22} className="text-white ml-1" fill="currentColor" />
                                </div>
                            </div>

                            {/* Placeholder State */}
                            {isPlaceholder && (
                                <div className="absolute top-4 right-4">
                                    <span className="text-[10px] uppercase tracking-widest text-gray-500 bg-black/50 px-2 py-1 rounded-full">Próximamente</span>
                                </div>
                            )}

                            {/* Duration Badge */}
                            {duration && (
                                <div className="absolute bottom-14 right-4 bg-black/70 px-2 py-0.5 rounded text-xs font-mono text-gray-300">
                                    {duration}
                                </div>
                            )}

                            {/* Bottom Info */}
                            <div className="absolute bottom-0 left-0 right-0 p-4">
                                <h4 className="font-bold text-white text-sm mb-0.5">{title}</h4>
                                {description && <p className="text-xs text-gray-400">{description}</p>}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </FadeIn>
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
        { id: 'product', label: 'Producto' },
        { id: 'como-funciona', label: 'C\u00f3mo Funciona', scroll: true },
        { id: 'la-escalada', label: 'La Escalada', scroll: true },
        { id: 'business', label: 'Empresas' },
        { id: 'pricing', label: 'Precios' },
        { id: 'demo-calendar', label: 'Agenda' },
    ];

    const handleNavClick = (link) => {
        if (link.scroll) {
            if (activeView !== 'product') setView('product');
            setTimeout(() => {
                document.getElementById(link.id)?.scrollIntoView({ behavior: 'smooth' });
            }, activeView !== 'product' ? 200 : 50);
        } else {
            setView(link.id);
        }
    };

    return (
        <nav className="fixed top-0 w-full z-50 backdrop-blur-md border-b border-white/10 bg-black/50 transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    <div
                        className="flex items-center cursor-pointer gap-2"
                        onClick={() => setView('product')}
                    >
                        <span className="text-3xl font-bold tracking-tighter text-white">
                            maity<span style={{ color: COLORS.maityPink }}>.</span>
                        </span>
                    </div>

                    <div className="hidden md:flex items-center space-x-6">
                        {navLinks.map((link) => (
                            <button
                                key={link.id}
                                onClick={() => handleNavClick(link)}
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
                            onClick={() => setView('primeros-pasos')}
                        >
                            Probar Maity Gratis
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
                                onClick={() => { handleNavClick(link); setIsOpen(false); }}
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

                <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); setView('primeros-pasos'); }}>
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
                            <button onClick={() => setView('primeros-pasos')} className="text-xs text-pink-500 hover:text-pink-400">¿Olvidaste tu contraseña?</button>
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
                    <button onClick={() => setView('primeros-pasos')} className="flex items-center justify-center gap-2 py-2.5 rounded-lg border border-white/10 hover:bg-white/5 transition-colors text-sm text-gray-300 font-medium">
                        Google
                    </button>
                    <button onClick={() => setView('primeros-pasos')} className="flex items-center justify-center gap-2 py-2.5 rounded-lg border border-white/10 hover:bg-white/5 transition-colors text-sm text-gray-300 font-medium">
                        Microsoft
                    </button>
                </div>

                <p className="mt-8 text-center text-xs text-gray-500">
                    ¿No tienes cuenta? <button onClick={() => setView('primeros-pasos')} className="text-pink-500 hover:text-pink-400 font-bold ml-1">Regístrate gratis</button>
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
                            <span className="text-xs font-bold text-gray-300 tracking-wide uppercase">Para Personas</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-bold leading-[0.95] mb-8 tracking-tighter text-white font-geist">
                            La evolución no ocurre en un curso. <br /> <span className="text-transparent bg-clip-text" style={{ backgroundImage: `linear-gradient(to right, ${COLORS.maityPink}, ${COLORS.maityBlue}, ${COLORS.maityGreen})` }}>Ocurre en cada conversación.</span>
                        </h1>
                        <p className="text-xl text-gray-400 mb-12 leading-relaxed max-w-xl">
                            Maity te acompaña en tus conversaciones reales, analiza tus habilidades de comunicación y te entrena con retos para vender, persuadir, conectar y liderar mejor.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 flex-wrap">
                            <button
                                onClick={() => setView('primeros-pasos')}
                                className="px-8 py-4 rounded-full text-white font-bold text-lg shadow-2xl hover:scale-105 transition-all flex items-center gap-3 justify-center"
                                style={{ backgroundColor: COLORS.maityPink }}
                            >
                                <Download size={20} /> Empieza a entrenar gratis
                            </button>
                            <button
                                onClick={() => {
                                    document.getElementById('como-funciona')?.scrollIntoView({ behavior: 'smooth' });
                                }}
                                className="px-8 py-4 rounded-full border border-white/20 text-white font-bold text-lg hover:bg-white/5 transition-all flex items-center justify-center gap-2"
                            >
                                <Play size={20} fill="currentColor" /> Ver cómo funciona
                            </button>
                        </div>
                        <div className="mt-6 flex items-center gap-3 text-sm text-gray-500">
                            <span>Sin tarjeta de crédito</span>
                            <span className="w-1 h-1 rounded-full bg-gray-600"></span>
                            <span>7 días gratis</span>
                            <span className="w-1 h-1 rounded-full bg-gray-600"></span>
                            <span>Control total de tus datos</span>
                        </div>

                        {/* Video: Qué es Maity */}
                        <VideoCard
                            title={LANDING_VIDEOS.queEsMaity.title}
                            description={LANDING_VIDEOS.queEsMaity.description}
                            duration={LANDING_VIDEOS.queEsMaity.duration}
                            thumbnailUrl={LANDING_VIDEOS.queEsMaity.thumbnailUrl}
                            videoUrl={LANDING_VIDEOS.queEsMaity.videoUrl}
                            variant="featured"
                            accentColor={COLORS.maityPink}
                        />

                        {/* Trust Bar */}
                        <div className="mt-16 pt-8 border-t border-white/5">
                            <p className="text-[10px] uppercase font-bold text-gray-600 tracking-[0.2em] mb-4">Líderes de alto rendimiento en:</p>
                            <div className="flex flex-wrap gap-8 opacity-30 grayscale contrast-125">
                                <span className="text-xl font-bold tracking-tighter">UBER</span>
                                <span className="text-xl font-bold font-serif italic">SoftBank</span>
                                <span className="text-xl font-bold tracking-widest">ORACLE</span>
                                <span className="text-xl font-bold">Globant</span>
                            </div>
                        </div>
                    </FadeIn>
                </div>

                {/* Hero Persona Image */}
                <FadeIn delay={300} className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-blue-500/20 blur-[100px] rounded-full"></div>
                    <div className="relative z-10 perspective-1000">
                        <img
                            src="/assets/maity-persona.png"
                            alt="Maity Persona"
                            className="w-full h-auto object-contain drop-shadow-[0_0_50px_rgba(255,0,80,0.15)] animate-float"
                        />
                        {/* Floating elements */}
                        <div className="absolute top-1/4 -right-12 bg-[#1A1A1A]/80 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl animate-float-delayed">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                                    <Check size={16} className="text-green-500" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-500 uppercase font-black">Escucha Activa</p>
                                    <p className="text-sm font-bold text-green-400">Nivel Superior</p>
                                </div>
                            </div>
                        </div>
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
                            Impulsa la evolución de tu equipo con <br />
                            <span className="text-transparent bg-clip-text" style={{ backgroundImage: `linear-gradient(to right, ${COLORS.maityBlue}, ${COLORS.maityGreen})` }}>
                                un mentor de IA que nunca se detiene.
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
                                onClick={() => setView('demo-calendar')}
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

                        {/* Video Empresarial */}
                        <VideoCard
                            title="Maity para Empresas"
                            description="Descubre cómo Maity transforma equipos completos"
                            duration="1:30"
                            videoUrl="https://youtu.be/YiyN6K-Ng_c"
                            variant="featured"
                            accentColor={COLORS.maityBlue}
                        />
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

                {/* Video: Maity para tu empresa */}
                <div className="max-w-2xl mx-auto mt-12 px-4">
                    <VideoCard
                        title={LANDING_VIDEOS.empresa.title}
                        description={LANDING_VIDEOS.empresa.description}
                        duration={LANDING_VIDEOS.empresa.duration}
                        thumbnailUrl={LANDING_VIDEOS.empresa.thumbnailUrl}
                        videoUrl={LANDING_VIDEOS.empresa.videoUrl}
                        variant="featured"
                        accentColor={COLORS.maityBlue}
                    />
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
                            Cursos aislados, sin seguimiento, sin mentoría real. Mientras tanto, las habilidades más humanas •comunicación, liderazgo y toma de decisiones• están en declive.
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
                                Maity no es un curso más. Es un mentor de IA que acompaña, desafía y mide el crecimiento real de cada colaborador — todos los días.
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

                        {/* Video: El problema que nadie te dice */}
                        <VideoCard
                            title={LANDING_VIDEOS.elProblema.title}
                            description={LANDING_VIDEOS.elProblema.description}
                            duration={LANDING_VIDEOS.elProblema.duration}
                            thumbnailUrl={LANDING_VIDEOS.elProblema.thumbnailUrl}
                            videoUrl={LANDING_VIDEOS.elProblema.videoUrl}
                            variant="inline"
                            accentColor={COLORS.maityPink}
                        />
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
            desc: "Ofrece dashboards detallados tanto para personas como para organizaciones completas."
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


// 11. Unified Pricing Section
const Pricing = ({ initialTab = 'individual', setView }) => {
    const [activeTab, setActiveTab] = useState(initialTab);
    const [annual, setAnnual] = useState(true);

    return (
        <section className="py-24 bg-[#050505] text-[#e7e7e9]">
            <div className="max-w-7xl mx-auto px-4 text-center">
                <FadeIn>
                    <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">Elige tu plan de evolución</h2>
                    <p className="text-gray-400 mb-12">Escala tu potencial según tus metas.</p>

                    <div className="flex justify-center mb-12">
                        <div className="bg-[#0F0F0F] p-1 rounded-full border border-white/10 flex">
                            <button
                                onClick={() => setActiveTab('individual')}
                                className={`px-8 py-2.5 rounded-full text-sm font-bold transition-all ${activeTab === 'individual' ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/20' : 'text-gray-500 hover:text-white'}`}
                            >
                                Personas
                            </button>
                            <button
                                onClick={() => setActiveTab('business')}
                                className={`px-8 py-2.5 rounded-full text-sm font-bold transition-all ${activeTab === 'business' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-gray-500 hover:text-white'}`}
                            >
                                Para Empresas
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-center items-center gap-4 mb-16 px-4 py-2 bg-[#0A0A0A] inline-flex rounded-full border border-white/5">
                        <span className={`text-xs ${!annual ? 'text-white font-bold' : 'text-gray-500'}`}>Mensual</span>
                        <div
                            onClick={() => setAnnual(!annual)}
                            className="w-12 h-6 rounded-full bg-[#1A1A1A] relative border border-white/10 cursor-pointer transition-colors"
                        >
                            <div className={`absolute top-1 w-4 h-4 rounded-full transition-all duration-300 ${annual ? 'right-1 bg-green-500' : 'left-1 bg-gray-600'}`}></div>
                        </div>
                        <span className={`text-xs ${annual ? 'text-white font-bold' : 'text-gray-500'}`}>Anual <span className="text-green-500 ml-1">(-20%)</span></span>
                    </div>
                </FadeIn>

                {activeTab === 'individual' ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        <FadeIn delay={100} className="flex flex-col h-full">
                            <div className="p-8 bg-[#0F0F0F] border border-white/10 rounded-3xl text-left hover:border-white/20 transition-all flex flex-col h-full group">
                                <h3 className="font-bold text-xl text-white mb-2">Maity Free</h3>
                                <p className="text-3xl font-bold text-white mb-6">$0</p>
                                <ul className="space-y-4 mb-12 text-sm text-gray-500 flex-grow">
                                    <li className="flex gap-3"><Check size={16} className="text-gray-700" /> 5 prácticas mensuales</li>
                                    <li className="flex gap-3"><Check size={16} className="text-gray-700" /> Análisis básico</li>
                                    <li className="flex gap-3"><Check size={16} className="text-gray-700" /> Web App access</li>
                                </ul>
                                <button onClick={() => setView('primeros-pasos')} className="w-full py-4 rounded-xl border border-white/10 font-bold hover:bg-white hover:text-black transition-all">
                                    Empezar Gratis
                                </button>
                            </div>
                        </FadeIn>

                        <FadeIn delay={200} className="flex flex-col h-full">
                            <div className="p-8 bg-black border-2 border-pink-500 rounded-3xl text-left shadow-2xl shadow-pink-500/10 flex flex-col h-full relative transform md:-translate-y-4">
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-pink-500 text-white text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-tighter">Más Popular</div>
                                <h3 className="font-bold text-xl text-white mb-2">Maity Pro</h3>
                                <p className="text-3xl font-bold text-white mb-6">${annual ? '9.99' : '12.99'}<span className="text-sm font-normal text-gray-500">/mes</span></p>
                                <ul className="space-y-4 mb-12 text-sm text-gray-300 flex-grow">
                                    <li className="flex gap-3"><Check size={16} className="text-pink-500" /> <strong>Llamadas reales ilimitadas</strong></li>
                                    <li className="flex gap-3"><Check size={16} className="text-pink-500" /> Feedback táctico IA</li>
                                    <li className="flex gap-3"><Check size={16} className="text-pink-500" /> Todos los escenarios</li>
                                    <li className="flex gap-3"><Check size={16} className="text-pink-500" /> Dashboard de evolución</li>
                                </ul>
                                <button onClick={() => setView('primeros-pasos')} className="w-full py-4 rounded-xl bg-pink-500 text-white font-bold hover:scale-[1.02] transition-all shadow-lg shadow-pink-500/20">
                                    Suscribirse ahora
                                </button>
                            </div>
                        </FadeIn>

                        <FadeIn delay={300} className="flex flex-col h-full">
                            <div className="p-8 bg-[#0F0F0F] border border-white/10 rounded-3xl text-left hover:border-blue-500/30 transition-all flex flex-col h-full">
                                <h3 className="font-bold text-xl text-blue-400 mb-2">Maity Pendant</h3>
                                <p className="text-3xl font-bold text-white mb-6">$99<span className="text-sm font-normal text-gray-500"> (Pago único)</span></p>
                                <ul className="space-y-4 mb-12 text-sm text-gray-500 flex-grow">
                                    <li className="flex gap-3"><Check size={16} className="text-blue-500" /> Hardware Maity Original</li>
                                    <li className="flex gap-3"><Check size={16} className="text-blue-500" /> Feedback háptico</li>
                                    <li className="flex gap-3"><Check size={16} className="text-blue-500" /> Privacidad offline</li>
                                </ul>
                                <button onClick={() => setView('primeros-pasos')} className="w-full py-4 rounded-xl border border-blue-500/30 text-blue-400 font-bold hover:bg-blue-500/10 transition-all">
                                    Reservar Unidad
                                </button>
                            </div>
                        </FadeIn>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        <FadeIn delay={100} className="flex flex-col h-full">
                            <div className="p-8 bg-[#0F0F0F] border border-white/10 rounded-3xl text-left flex flex-col h-full">
                                <h3 className="font-bold text-xl text-white mb-2">Starter</h3>
                                <p className="text-3xl font-bold text-white mb-6">${annual ? '19' : '22'}<span className="text-sm font-normal text-gray-500">/user/mes</span></p>
                                <ul className="space-y-4 mb-12 text-sm text-gray-500 flex-grow">
                                    <li className="flex gap-3"><Check size={16} className="text-blue-500" /> Equipos hasta 20 personas</li>
                                    <li className="flex gap-3"><Check size={16} className="text-blue-500" /> Dashboard de manager</li>
                                    <li className="flex gap-3"><Check size={16} className="text-blue-500" /> Soporte standard</li>
                                </ul>
                                <button onClick={() => setView('demo-calendar')} className="w-full py-4 rounded-xl border border-white/10 font-bold hover:bg-white hover:text-black transition-all">
                                    Iniciar Piloto
                                </button>
                            </div>
                        </FadeIn>

                        <FadeIn delay={200} className="flex flex-col h-full">
                            <div className="p-8 bg-black border-2 border-blue-600 rounded-3xl text-left shadow-2xl shadow-blue-500/10 flex flex-col h-full relative transform md:-translate-y-4">
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-tighter">Escalable</div>
                                <h3 className="font-bold text-xl text-white mb-2">Growth</h3>
                                <p className="text-3xl font-bold text-white mb-6">${annual ? '39' : '45'}<span className="text-sm font-normal text-gray-500">/user/mes</span></p>
                                <ul className="space-y-4 mb-12 text-sm text-gray-300 flex-grow">
                                    <li className="flex gap-3"><Check size={16} className="text-blue-500" /> Hasta 100 personas</li>
                                    <li className="flex gap-3"><Check size={16} className="text-blue-500" /> Escenarios customizados</li>
                                    <li className="flex gap-3"><Check size={16} className="text-blue-500" /> Integración con CRM</li>
                                    <li className="flex gap-3"><Check size={16} className="text-blue-500" /> AI Insights avanzados</li>
                                </ul>
                                <button onClick={() => setView('demo-calendar')} className="w-full py-4 rounded-xl bg-blue-600 text-white font-bold hover:scale-[1.02] transition-all">
                                    Hablar con Ventas
                                </button>
                            </div>
                        </FadeIn>

                        <FadeIn delay={300} className="flex flex-col h-full">
                            <div className="p-8 bg-[#0F0F0F] border border-white/10 rounded-3xl text-left flex flex-col h-full">
                                <h3 className="font-bold text-xl text-white mb-2">Enterprise</h3>
                                <p className="text-3xl font-bold text-white mb-6">Custom</p>
                                <ul className="space-y-4 mb-12 text-sm text-gray-500 flex-grow">
                                    <li className="flex gap-3"><Check size={16} className="text-blue-500" /> Usuarios ilimitados</li>
                                    <li className="flex gap-3"><Check size={16} className="text-blue-500" /> On-premise / Private Cloud</li>
                                    <li className="flex gap-3"><Check size={16} className="text-blue-500" /> SLA garantizado</li>
                                    <li className="flex gap-3"><Check size={16} className="text-blue-500" /> Dedicated CSM</li>
                                </ul>
                                <button onClick={() => setView('demo-calendar')} className="w-full py-4 rounded-xl border border-white/10 font-bold hover:bg-white hover:text-black transition-all">
                                    Pedir Cotización
                                </button>
                            </div>
                        </FadeIn>
                    </div>
                )}

                {/* Trust Badges */}
                <FadeIn delay={350}>
                    <div className="flex flex-wrap justify-center items-center gap-6 mt-12 text-xs text-gray-500">
                        <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/5">
                            <Lock size={12} className="text-green-500" /> Cifrado AES-256
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/5">
                            <Shield size={12} className="text-blue-500" /> Sin tarjeta para plan gratuito
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/5">
                            <Eye size={12} className="text-pink-500" /> Cancela cuando quieras
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/5">
                            <UserCheck size={12} className="text-purple-500" /> GDPR Compliant
                        </div>
                    </div>
                </FadeIn>

                {/* Tabla Comparativa */}
                <FadeIn delay={400}>
                    <div className="mt-20 max-w-6xl mx-auto">
                        <h3 className="text-2xl font-bold text-white mb-2">Compara los planes</h3>
                        <p className="text-gray-500 text-sm mb-8">Todo lo que incluye cada versión</p>

                        {activeTab === 'individual' ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr className="border-b border-white/10">
                                            <th className="py-4 px-4 text-gray-400 font-medium w-1/3">Característica</th>
                                            <th className="py-4 px-4 text-center text-white font-bold">Free</th>
                                            <th className="py-4 px-4 text-center text-pink-400 font-bold">Pro</th>
                                            <th className="py-4 px-4 text-center text-blue-400 font-bold">Pendant</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-gray-400">
                                        {[
                                            { feature: "Conversaciones analizadas", free: "5/mes", pro: "Ilimitadas", pendant: "Ilimitadas" },
                                            { feature: "Feedback de IA", free: "Básico", pro: "Táctico avanzado", pendant: "Táctico avanzado" },
                                            { feature: "Escenarios de práctica", free: "2", pro: "Todos", pendant: "Todos" },
                                            { feature: "Dashboard de evolución", free: false, pro: true, pendant: true },
                                            { feature: "La Escalada (gamificación)", free: "Básica", pro: "Completa", pendant: "Completa" },
                                            { feature: "Competencias certificables", free: false, pro: true, pendant: true },
                                            { feature: "Feedback háptico", free: false, pro: false, pendant: true },
                                            { feature: "Hardware Maity", free: false, pro: false, pendant: true },
                                            { feature: "Modo offline", free: false, pro: false, pendant: true },
                                            { feature: "Soporte", free: "Comunidad", pro: "Email prioritario", pendant: "Prioritario" },
                                        ].map((row, i) => (
                                            <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                                <td className="py-3.5 px-4 text-gray-300">{row.feature}</td>
                                                {['free', 'pro', 'pendant'].map((plan) => (
                                                    <td key={plan} className="py-3.5 px-4 text-center">
                                                        {row[plan] === true ? (
                                                            <Check size={16} className={`mx-auto ${plan === 'pro' ? 'text-pink-500' : plan === 'pendant' ? 'text-blue-500' : 'text-green-500'}`} />
                                                        ) : row[plan] === false ? (
                                                            <span className="text-gray-700">—</span>
                                                        ) : (
                                                            <span className={plan === 'pro' ? 'text-pink-400' : plan === 'pendant' ? 'text-blue-400' : ''}>{row[plan]}</span>
                                                        )}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr className="border-b border-white/10">
                                            <th className="py-4 px-4 text-gray-400 font-medium w-1/3">Característica</th>
                                            <th className="py-4 px-4 text-center text-white font-bold">Starter</th>
                                            <th className="py-4 px-4 text-center text-blue-400 font-bold">Growth</th>
                                            <th className="py-4 px-4 text-center text-white font-bold">Enterprise</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-gray-400">
                                        {[
                                            { feature: "Usuarios", starter: "Hasta 20", growth: "Hasta 100", enterprise: "Ilimitados" },
                                            { feature: "Dashboard de manager", starter: true, growth: true, enterprise: true },
                                            { feature: "Escenarios customizados", starter: false, growth: true, enterprise: true },
                                            { feature: "Integración con CRM", starter: false, growth: true, enterprise: true },
                                            { feature: "AI Insights avanzados", starter: false, growth: true, enterprise: true },
                                            { feature: "ROI Dashboard", starter: false, growth: true, enterprise: true },
                                            { feature: "On-premise / Private Cloud", starter: false, growth: false, enterprise: true },
                                            { feature: "SLA garantizado", starter: false, growth: false, enterprise: true },
                                            { feature: "CSM dedicado", starter: false, growth: false, enterprise: true },
                                            { feature: "Soporte", starter: "Standard", growth: "Prioritario", enterprise: "24/7 dedicado" },
                                        ].map((row, i) => (
                                            <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                                <td className="py-3.5 px-4 text-gray-300">{row.feature}</td>
                                                {['starter', 'growth', 'enterprise'].map((plan) => (
                                                    <td key={plan} className="py-3.5 px-4 text-center">
                                                        {row[plan] === true ? (
                                                            <Check size={16} className={`mx-auto ${plan === 'growth' ? 'text-blue-500' : 'text-green-500'}`} />
                                                        ) : row[plan] === false ? (
                                                            <span className="text-gray-700">—</span>
                                                        ) : (
                                                            <span className={plan === 'growth' ? 'text-blue-400' : ''}>{row[plan]}</span>
                                                        )}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </FadeIn>

                {/* Video: Planes y precios */}
                <div className="max-w-xl mx-auto mt-12">
                    <VideoCard
                        title={LANDING_VIDEOS.planesPrecios.title}
                        description={LANDING_VIDEOS.planesPrecios.description}
                        duration={LANDING_VIDEOS.planesPrecios.duration}
                        thumbnailUrl={LANDING_VIDEOS.planesPrecios.thumbnailUrl}
                        videoUrl={LANDING_VIDEOS.planesPrecios.videoUrl}
                        variant="inline"
                        accentColor={COLORS.maityPink}
                    />
                </div>
            </div>
        </section>
    );
};

// 5.5 FAQ SECTION
const FAQSection = () => {
    const faqs = [
        {
            q: "¿Cómo funciona Maity en mi día a día?",
            a: "Maity se conecta a tus llamadas en Zoom, Google Meet o Microsoft Teams. Escucha (con tu permiso), analiza tu comunicación en tiempo real y te entrega feedback accionable al terminar. Además, te envía micro-retos diarios personalizados para que mejores sin esfuerzo extra."
        },
        {
            q: "¿Mis datos están seguros?",
            a: "Tu información es tuya. Punto. Maity no vende datos, no los comparte con terceros y no los usa sin consentimiento. Toda la información se almacena en infraestructura segura y puedes pedir su eliminación en cualquier momento."
        },
        {
            q: "¿Cuánto cuesta?",
            a: "Puedes empezar gratis con 5 prácticas al mes. Maity Pro cuesta $9.99/mes (o menos con plan anual) e incluye llamadas ilimitadas. Para empresas, los precios escalan según el tamaño del equipo con opciones desde $19/usuario/mes."
        },
        {
            q: "¿Funciona con Zoom, Teams y Google Meet?",
            a: "Sí. Maity está pensada para tus llamadas reales, no simulaciones. Funciona con las principales plataformas de videoconferencia. Puede operar en modo privado (solo te escucha a ti) o modo equipo (retroalimentación para todos)."
        },
        {
            q: "¿Maity reemplaza al coach humano?",
            a: "No. Maity es tu entrenador 24/7 que detecta patrones y te da práctica constante. Tu coach humano es quien te ayuda a profundizar y a ser mejor persona. Uno sin el otro es la mitad de la fuerza."
        },
        {
            q: "¿Qué pasa si dejo de usar Maity?",
            a: "Nada forzado. Si dejas de interactuar, Maity entra en modo seguimiento suave y puede invitarte a retomar cuando tenga sentido para ti. Puedes cancelar en cualquier momento sin penalización. Maity acompaña. No presiona."
        }
    ];

    const [openIndex, setOpenIndex] = useState(null);

    const toggleFAQ = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div id="faq-section" className="py-24 bg-[#0F0F0F] border-t border-white/5 text-[#e7e7e9]">
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

// --- NEW SECTION: SKILLS GRID ---
const SkillsGridSection = () => {
    return (
        <section className="py-24 bg-[#050505]">
            <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-16">
                    <FadeIn>
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Domina las <span className="text-pink-500">Soft Skills</span></h2>
                        <p className="text-gray-400 max-w-2xl mx-auto">Maity entrena las competencias críticas para el éxito profesional moderno.</p>
                    </FadeIn>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[
                        { t: "Claridad y Estructura", d: "Comunica ideas de forma simple, ordenada y memorable", i: <Zap className="text-pink-500" /> },
                        { t: "Empat\u00eda y Conexi\u00f3n", d: "Escucha activa, validaci\u00f3n emocional, rapport", i: <Heart className="text-blue-500" /> },
                        { t: "Persuasi\u00f3n \u00c9tica", d: "Argumenta con evidencia, historias y l\u00f3gica", i: <Zap className="text-yellow-500" /> },
                        { t: "Venta Consultiva", d: "Descubre necesidades, propone valor, cierra acuerdos", i: <DollarSign className="text-green-500" /> },
                        { t: "Negociaci\u00f3n", d: "Encuentra puntos medios, maneja objeciones", i: <Scale className="text-purple-500" /> },
                        { t: "Servicio al Cliente", d: "Contenci\u00f3n, resoluci\u00f3n, seguimiento efectivo", i: <Headphones className="text-orange-500" /> },
                        { t: "Manejo Emocional", d: "Mant\u00e9n calma, lee el ambiente, adapta tu tono", i: <Smile className="text-pink-400" /> },
                        { t: "Liderazgo Comunicativo", d: "Inspira, da feedback, alinea equipos", i: <Flag className="text-green-400" /> }
                    ].map((skill, i) => (
                        <FadeIn key={i} delay={i * 50} className="p-8 bg-[#0F0F0F] border border-white/5 rounded-2xl hover:border-white/20 transition-all text-center group">
                            <div className="mb-4 flex justify-center group-hover:scale-110 transition-transform">{skill.i}</div>
                            <h3 className="font-bold text-white text-sm uppercase tracking-widest mb-2">{skill.t}</h3>
                            <p className="text-xs text-gray-500 leading-relaxed">{skill.d}</p>
                        </FadeIn>
                    ))}
                </div>
            </div>
        </section>
    );
};

// --- NEW SECTION: B2B TEASER ---
const B2BTeaser = ({ setView }) => {
    return (
        <section className="py-24 bg-gradient-to-b from-[#050505] to-[#0A0A0A] border-t border-white/5">
            <div className="max-w-5xl mx-auto px-4 text-center">
                <FadeIn>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-8">
                        <Briefcase size={16} className="text-blue-500" />
                        <span className="text-xs font-bold text-blue-400 uppercase">Soluciones para Empresas</span>
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tighter">Transforma el desarrollo de tu equipo en sistema operativo diario.</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto mb-12 text-left">
                        {[
                            "Acelera curvas de aprendizaje de meses a semanas",
                            "Entrenamiento escalable sin carga operativa",
                            "M\u00e9tricas y paneles para decisiones basadas en datos",
                            "Seguridad y privacidad de nivel enterprise"
                        ].map((item, i) => (
                            <div key={i} className="flex items-start gap-3 p-3">
                                <div className="p-1 bg-blue-500/20 rounded-full mt-0.5"><Check size={14} className="text-blue-400" /></div>
                                <span className="text-gray-300 text-sm leading-relaxed">{item}</span>
                            </div>
                        ))}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => setView('business')}
                            className="px-10 py-5 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20"
                        >
                            Conocer solución empresarial
                        </button>
                        <button
                            onClick={() => setView('demo-calendar')}
                            className="px-10 py-5 bg-white/5 text-white font-bold rounded-full border border-white/10 hover:bg-white/10 transition-all"
                        >
                            Solicitar demo
                        </button>
                    </div>
                </FadeIn>
            </div>
        </section>
    );
};

// --- NEW SECTION: TRUST (4 PILLARS) ---
const TrustSection = ({ variant = 'product', setView }) => {
    const basePillars = [
        { t: "Control Total", d: "Tú decides qué se graba, analiza y elimina.", i: <Lock className="text-pink-500" /> },
        { t: "Consentimiento", d: "Maity exige notificar a participantes.", i: <UserCheck className="text-blue-500" /> },
        { t: "Cifrado", d: "Datos protegidos en tránsito y reposo.", i: <Shield className="text-green-500" /> },
        { t: "Sin Venta de Datos", d: "Tu información nunca se comparte con terceros.", i: <Check className="text-yellow-500" /> }
    ];

    const complianceBadges = [
        { name: "SOC 2 Type II", status: "En proceso", color: "#ffd93d" },
        { name: "ISO 27001", status: "Diseñado conforme", color: COLORS.maityBlue },
        { name: "GDPR", status: "Cumplimiento total", color: COLORS.maityGreen },
        { name: "CCPA", status: "Cumplimiento total", color: COLORS.maityGreen },
        { name: "LFPDPPP", status: "Cumplimiento total", color: COLORS.maityGreen }
    ];

    const technicalSecurity = [
        { t: "Cifrado AES-256", d: "Datos protegidos en reposo con cifrado de grado militar.", i: <Lock size={18} /> },
        { t: "TLS 1.3 en tránsito", d: "Toda la comunicación encriptada con el estándar más reciente.", i: <Shield size={18} /> },
        { t: "Arquitectura Zero-Knowledge", d: "Tus datos de voz se procesan y se eliminan. No almacenamos grabaciones.", i: <Eye size={18} /> },
        { t: "Pruebas de penetración", d: "Auditorías de seguridad regulares por terceros certificados.", i: <AlertTriangle size={18} /> },
        { t: "Residencia de datos", d: "Elige dónde se almacenan tus datos: NA, EU o LATAM.", i: <Globe size={18} /> }
    ];

    const privacyByDesign = [
        { t: "Minimización de datos", d: "Solo recopilamos lo estrictamente necesario para el servicio.", i: <FileText size={18} /> },
        { t: "Consentimiento granular", d: "Cada participante debe dar consentimiento explícito.", i: <UserCheck size={18} /> },
        { t: "Derecho al olvido", d: "Elimina todos tus datos en cualquier momento con un click.", i: <Key size={18} /> },
        { t: "Portabilidad", d: "Exporta todos tus datos en formato estándar cuando quieras.", i: <Download size={18} /> },
        { t: "Sin venta de datos", d: "Tu información nunca se comparte ni se vende. Punto.", i: <Check size={18} /> }
    ];

    const orgSecurity = [
        { t: "Verificación de equipo", d: "Background checks para todo el personal con acceso a datos.", i: <Users size={18} /> },
        { t: "Capacitación continua", d: "Entrenamiento obligatorio de seguridad para todo el equipo.", i: <Brain size={18} /> },
        { t: "Plan de respuesta", d: "Protocolo de respuesta a incidentes con notificación en 72h.", i: <AlertTriangle size={18} /> },
        { t: "Continuidad", d: "Plan de continuidad de negocio con backup geo-redundante.", i: <HardDrive size={18} /> }
    ];

    return (
        <section className="py-24 bg-[#0A0A0A] border-y border-white/5">
            <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-12">
                    <FadeIn>
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            {variant === 'enterprise' ? 'Seguridad y privacidad Enterprise' : 'Tu información, tu control'}
                        </h2>
                        <p className="text-gray-400">
                            {variant === 'enterprise'
                                ? 'Cumplimiento normativo, cifrado de grado militar y privacidad por diseño. Tus datos están seguros.'
                                : 'Maity está diseñado con privacidad desde el día uno.'}
                        </p>
                    </FadeIn>
                </div>

                {/* Base Pillars - always shown */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {basePillars.map((item, i) => (
                        <FadeIn key={i} delay={i * 100} className="p-8 rounded-2xl bg-white/2 hover:bg-white/5 transition-colors border border-white/5">
                            <div className="mb-4">{item.i}</div>
                            <h4 className="font-bold text-white mb-2">{item.t}</h4>
                            <p className="text-sm text-gray-500 leading-relaxed">{item.d}</p>
                        </FadeIn>
                    ))}
                </div>

                {/* Enterprise additions */}
                {variant === 'enterprise' && (
                    <>
                        {/* Tier 1: Compliance Badges */}
                        <FadeIn delay={200}>
                            <div className="mt-16 mb-12">
                                <h3 className="text-xl font-bold text-white mb-6 text-center">Cumplimiento Normativo</h3>
                                <div className="flex flex-wrap justify-center gap-4">
                                    {complianceBadges.map((badge, i) => (
                                        <div key={i} className="flex items-center gap-3 px-5 py-3 bg-[#0F0F0F] rounded-xl border border-white/10">
                                            <Shield size={16} style={{ color: badge.color }} />
                                            <div>
                                                <div className="text-sm font-bold text-white">{badge.name}</div>
                                                <div className="text-xs" style={{ color: badge.color }}>{badge.status}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </FadeIn>

                        {/* Tier 2: Technical Security + Privacy by Design */}
                        <FadeIn delay={300}>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                                <div className="p-8 bg-[#0F0F0F] rounded-2xl border border-white/5">
                                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                        <Shield size={20} style={{ color: COLORS.maityBlue }} /> Seguridad Técnica
                                    </h3>
                                    <div className="space-y-5">
                                        {technicalSecurity.map((item, i) => (
                                            <div key={i} className="flex gap-4">
                                                <div className="mt-0.5 text-blue-400 flex-shrink-0">{item.i}</div>
                                                <div>
                                                    <div className="text-sm font-bold text-white mb-1">{item.t}</div>
                                                    <div className="text-xs text-gray-500 leading-relaxed">{item.d}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="p-8 bg-[#0F0F0F] rounded-2xl border border-white/5">
                                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                        <Lock size={20} style={{ color: COLORS.maityGreen }} /> Privacidad por Diseño
                                    </h3>
                                    <div className="space-y-5">
                                        {privacyByDesign.map((item, i) => (
                                            <div key={i} className="flex gap-4">
                                                <div className="mt-0.5 text-green-400 flex-shrink-0">{item.i}</div>
                                                <div>
                                                    <div className="text-sm font-bold text-white mb-1">{item.t}</div>
                                                    <div className="text-xs text-gray-500 leading-relaxed">{item.d}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </FadeIn>

                        {/* Tier 3: Organizational Security */}
                        <FadeIn delay={400}>
                            <div className="p-8 bg-[#0F0F0F] rounded-2xl border border-white/5 mb-12">
                                <h3 className="text-lg font-bold text-white mb-6 text-center">Seguridad Organizacional</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {orgSecurity.map((item, i) => (
                                        <div key={i} className="text-center">
                                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-3 text-gray-400">
                                                {item.i}
                                            </div>
                                            <div className="text-sm font-bold text-white mb-1">{item.t}</div>
                                            <div className="text-xs text-gray-500 leading-relaxed">{item.d}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </FadeIn>

                        {/* Tier 4: Transparency Strip */}
                        <FadeIn delay={500}>
                            <div className="flex flex-wrap justify-center gap-3 text-xs text-gray-500 mb-8">
                                {["Auditorías de seguridad regulares", "Programa de divulgación responsable", "Acuerdos de procesamiento de datos (DPA)", "Lista de sub-procesadores publicada"].map((item, i) => (
                                    <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full">
                                        <Check size={12} className="text-green-500" />
                                        <span>{item}</span>
                                    </div>
                                ))}
                            </div>
                        </FadeIn>
                    </>
                )}

                <FadeIn delay={variant === 'enterprise' ? 600 : 400}>
                    <div className="text-center mt-10">
                        <button onClick={() => setView && setView('seguridad')} className="text-sm text-gray-400 hover:text-pink-400 transition-colors flex items-center gap-2 mx-auto">
                            <Shield size={14} /> Ver política de privacidad completa <ChevronRight size={14} />
                        </button>
                    </div>

                    {/* Video: Tu privacidad es sagrada */}
                    <div className="max-w-xl mx-auto mt-12">
                        <VideoCard
                            title={LANDING_VIDEOS.privacidad.title}
                            description={LANDING_VIDEOS.privacidad.description}
                            duration={LANDING_VIDEOS.privacidad.duration}
                            thumbnailUrl={LANDING_VIDEOS.privacidad.thumbnailUrl}
                            videoUrl={LANDING_VIDEOS.privacidad.videoUrl}
                            variant="inline"
                            accentColor={COLORS.maityGreen}
                        />
                    </div>
                </FadeIn>
            </div>
        </section>
    );
};

// 6. Gamification "The Climb"
const TheClimb = ({ setView }) => {
    const levels = [
        { name: "Aprendiz", color: "bg-gray-600", active: true },
        { name: "Explorador", color: "bg-blue-500", active: true },
        { name: "Comunicador", color: "bg-purple-500", active: true },
        { name: "Experto", color: "bg-pink-500", active: false },
        { name: "Leyenda", color: "bg-yellow-500", active: false },
    ];

    const skills = [
        { name: "Claridad", pct: 72, color: "bg-pink-500" },
        { name: "Empat\u00eda", pct: 45, color: "bg-blue-500" },
        { name: "Persuasi\u00f3n", pct: 58, color: "bg-purple-500" },
        { name: "Negociaci\u00f3n", pct: 33, color: "bg-green-500" },
    ];

    return (
        <section id="la-escalada" className="py-24 bg-[#050505] relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <FadeIn>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 mb-6">
                            <Mountain size={14} className="text-pink-500" />
                            <span className="text-xs font-bold text-pink-200 tracking-wide uppercase">Tu Ruta de Crecimiento</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Tu progreso, <span className="text-transparent bg-clip-text" style={{ backgroundImage: `linear-gradient(to right, ${COLORS.maityPink}, ${COLORS.maityBlue})` }}>visible y medible</span></h2>
                        <p className="text-xl text-gray-400 mb-10 leading-relaxed">
                            Cada conversación que analizas suma a tu desarrollo. Maity convierte tu evolución en una ruta clara con niveles, hitos y reconocimientos que puedes compartir.
                        </p>
                        <ul className="space-y-5 text-gray-300">
                            {[
                                { t: "Avance por pr\u00e1ctica real", d: "Cada conversaci\u00f3n analizada suma a tu nivel de competencia.", i: <TrendingUp size={18} className="text-green-500" /> },
                                { t: "H\u00e1bito diario", d: "Mant\u00e9n tu ritmo de entrenamiento y acelera tu crecimiento.", i: <Activity size={18} className="text-orange-500" /> },
                                { t: "Niveles de maestr\u00eda", d: "Progresa de Aprendiz a Leyenda en 5 niveles medibles.", i: <Award size={18} className="text-blue-500" /> },
                                { t: "Competencias certificables", d: "Claridad, Empat\u00eda, Persuasi\u00f3n: cada habilidad tiene su propia ruta.", i: <Target size={18} className="text-purple-500" /> },
                                { t: "Reconocimientos", d: "Insignias por logros reales: primera llamada, racha de 7 d\u00edas, nivel avanzado.", i: <Trophy size={18} className="text-yellow-500" /> }
                            ].map((item, i) => (
                                <li key={i} className="flex gap-4">
                                    <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">{item.i}</div>
                                    <div>
                                        <h4 className="font-bold text-white">{item.t}</h4>
                                        <p className="text-sm text-gray-500">{item.d}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                        <button
                            onClick={() => setView('primeros-pasos')}
                            className="mt-10 px-8 py-4 rounded-full text-white font-bold shadow-xl hover:scale-105 transition-all flex items-center gap-2"
                            style={{ backgroundColor: COLORS.maityPink }}
                        >
                            <Mountain size={18} /> Descubre tu nivel
                        </button>
                    </FadeIn>

                    {/* Right — Professional Progress Mockup */}
                    <FadeIn delay={200} className="relative">
                        <div className="bg-[#0F0F0F] rounded-3xl border border-white/10 overflow-hidden shadow-2xl p-8">
                            {/* Level Progress Header */}
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">Tu nivel actual</p>
                                    <h3 className="text-2xl font-bold text-white">Comunicador</h3>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">Nivel 3 de 5</p>
                                    <p className="text-sm font-bold text-pink-400">60% completado</p>
                                </div>
                            </div>

                            {/* Level Steps */}
                            <div className="flex items-center gap-1 mb-8">
                                {levels.map((level, i) => (
                                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                        <div className={`w-full h-2 rounded-full ${level.active ? level.color : 'bg-gray-800'} transition-all`}></div>
                                        <span className={`text-[10px] font-bold ${level.active ? 'text-gray-300' : 'text-gray-700'}`}>{level.name}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Skill Bars */}
                            <div className="space-y-4 mb-8">
                                <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Competencias</p>
                                {skills.map((skill, i) => (
                                    <div key={i}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-gray-300 font-medium">{skill.name}</span>
                                            <span className="text-gray-500">{skill.pct}%</span>
                                        </div>
                                        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                            <div className={`h-full ${skill.color} rounded-full transition-all`} style={{ width: `${skill.pct}%` }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Streak Badge */}
                            <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/5">
                                <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                                    <Flame size={20} className="text-orange-500" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white">Racha activa: 7 días</p>
                                    <p className="text-xs text-gray-500">Tu mejor racha: 14 días</p>
                                </div>
                            </div>
                        </div>
                    </FadeIn>
                </div>

                {/* Video: La Escalada */}
                <div className="mt-12 max-w-xl mx-auto">
                    <VideoCard
                        title={LANDING_VIDEOS.laEscalada.title}
                        description={LANDING_VIDEOS.laEscalada.description}
                        duration={LANDING_VIDEOS.laEscalada.duration}
                        thumbnailUrl={LANDING_VIDEOS.laEscalada.thumbnailUrl}
                        videoUrl={LANDING_VIDEOS.laEscalada.videoUrl}
                        variant="inline"
                        accentColor={COLORS.maityGreen}
                    />
                </div>
            </div>
        </section>
    );
};

// --- NEW VIEWS (RECONSTRUCTED) ---

const ArchetypeQuiz = ({ setView }) => {
    const [step, setStep] = useState('intro');
    const [currentQ, setCurrentQ] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [revealing, setRevealing] = useState(false);

    const archetypes = {
        driver: {
            name: "Comunicador Directo",
            emoji: "⚡",
            color: COLORS.maityPink,
            tagline: "Tu superpoder: ir al punto con claridad y seguridad",
            description: "No te andas con rodeos. Cuando hablas, la gente sabe exactamente qué esperas. Tu franqueza genera respeto y tus ideas se entienden a la primera. Pero a veces la velocidad puede hacer que otros sientan que no hay espacio para su voz.",
            strengths: ["Claridad bajo presión", "Mensajes directos y memorables", "Decisiones rápidas y comunicadas"],
            growth: ["Dar espacio a la escucha activa", "Suavizar el tono en temas sensibles", "Pausar antes de responder"],
            maityPlan: "Tu Escalada Maity: Empatía Track — 21 días de micro-retos para conectar sin perder tu fuerza."
        },
        connector: {
            name: "Comunicador Empático",
            emoji: "💫",
            color: COLORS.maityBlue,
            tagline: "Tu superpoder: que la gente se sienta escuchada y segura contigo",
            description: "Las personas confían en ti porque genuinamente escuchas. Creas ambientes donde todos se atreven a hablar. Tu calidez desarma conflictos y construye equipos fuertes. Pero a veces tu amabilidad puede diluir tu mensaje cuando necesitas ser firme.",
            strengths: ["Escucha activa y validación", "Construcción de confianza rápida", "Resolución natural de tensiones"],
            growth: ["Comunicar con firmeza cuando es necesario", "Decir que no sin culpa", "Estructurar ideas antes de compartirlas"],
            maityPlan: "Tu Escalada Maity: Claridad Track — 21 días para comunicar con fuerza sin perder tu calidez."
        },
        strategist: {
            name: "Comunicador Analítico",
            emoji: "🎯",
            color: COLORS.maityGreen,
            tagline: "Tu superpoder: que nadie cuestione tu lógica ni tu preparación",
            description: "Piensas antes de hablar y se nota. Tus argumentos son sólidos, tus presentaciones impecables. La gente respeta tu rigor y confía en tus conclusiones. Pero a veces el exceso de análisis puede frenar la conversación y alejar a quienes buscan conexión emocional.",
            strengths: ["Argumentación sólida y estructurada", "Preparación meticulosa", "Análisis objetivo de situaciones"],
            growth: ["Storytelling emocional", "Improvisar con confianza", "Conectar antes de convencer"],
            maityPlan: "Tu Escalada Maity: Persuasión Track — 21 días para inspirar y mover a la acción."
        }
    };

    const questions = [
        {
            t: "Un colega te da feedback que consideras injusto frente a otros. ¿Cómo reaccionas?",
            o: [
                { t: "Le digo con firmeza que no estoy de acuerdo y explico mi perspectiva ahí mismo.", k: "driver" },
                { t: "Respiro, agradezco el comentario y le pido hablar en privado después.", k: "connector" },
                { t: "Anoto los puntos, verifico los hechos y luego respondo con datos concretos.", k: "strategist" }
            ]
        },
        {
            t: "En una reunión, dos compañeros no se ponen de acuerdo y la tensión sube. ¿Qué haces?",
            o: [
                { t: "Corto la discusión y propongo una solución concreta para avanzar.", k: "driver" },
                { t: "Les doy espacio, valido ambas posturas y busco un punto en común.", k: "connector" },
                { t: "Pido a ambos que presenten sus argumentos con evidencia antes de decidir.", k: "strategist" }
            ]
        },
        {
            t: "Tienes que presentar una idea importante a personas que no conoces bien. ¿Cómo te preparas?",
            o: [
                { t: "Preparo un mensaje corto, directo y con los beneficios claros desde el minuto uno.", k: "driver" },
                { t: "Investigo quiénes son, busco puntos en común y empiezo con una historia personal.", k: "connector" },
                { t: "Armo una presentación estructurada con datos, contexto y posibles objeciones resueltas.", k: "strategist" }
            ]
        },
        {
            t: "Debes dar malas noticias a tu equipo o grupo de trabajo. ¿Cómo lo manejas?",
            o: [
                { t: "Directo y sin rodeos, con un plan de acción claro para lo que sigue.", k: "driver" },
                { t: "Con empatía, reconociendo cómo se sienten antes de hablar de soluciones.", k: "connector" },
                { t: "Con análisis de causa raíz, alternativas evaluadas y próximos pasos definidos.", k: "strategist" }
            ]
        },
        {
            t: "Alguien nuevo en tu entorno te pide ayuda. ¿Qué priorizas?",
            o: [
                { t: "Le doy instrucciones claras, paso a paso, para que sea autónomo rápido.", k: "driver" },
                { t: "Lo invito a platicar, le pregunto cómo se siente y le ofrezco acompañamiento.", k: "connector" },
                { t: "Le comparto documentación organizada y recursos para que aprenda a su ritmo.", k: "strategist" }
            ]
        },
        {
            t: "Expresas una opinión y alguien te malinterpreta públicamente. ¿Qué haces?",
            o: [
                { t: "Aclaro de inmediato lo que quise decir, sin dejar espacio a la ambigüedad.", k: "driver" },
                { t: "Le pregunto qué entendió, escucho con calma y reformulo con más contexto.", k: "connector" },
                { t: "Vuelvo al punto original con datos y ejemplos para eliminar la confusión.", k: "strategist" }
            ]
        },
        {
            t: "¿Qué tipo de reconocimiento valoras más de quienes trabajan contigo?",
            o: [
                { t: "Resultados: 'Resolviste el problema más difícil del trimestre'.", k: "driver" },
                { t: "Impacto humano: 'Tu equipo dice que contigo se sienten seguros'.", k: "connector" },
                { t: "Proceso: 'Tu análisis fue clave para tomar la mejor decisión'.", k: "strategist" }
            ]
        }
    ];

    const getResult = (allAnswers) => {
        const counts = { driver: 0, connector: 0, strategist: 0 };
        allAnswers.forEach(a => counts[a]++);
        const total = allAnswers.length;
        const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
        const winner = sorted[0][0];
        const percentages = {};
        sorted.forEach(([key, val]) => { percentages[key] = Math.round((val / total) * 100); });
        return { archetype: archetypes[winner], percentages, winnerKey: winner };
    };

    const handleAnswer = (key) => {
        const newAnswers = [...answers, key];
        setAnswers(newAnswers);
        if (currentQ < questions.length - 1) {
            setCurrentQ(currentQ + 1);
        } else {
            setRevealing(true);
            setTimeout(() => {
                setRevealing(false);
                setStep('result');
            }, 2000);
        }
    };

    const result = answers.length === questions.length ? getResult(answers) : null;
    const progress = ((currentQ + (step === 'result' || revealing ? 1 : 0)) / questions.length) * 100;

    return (
        <section className="py-24 bg-[#050505] flex items-center justify-center">
            <div className="max-w-2xl w-full px-4 text-center">
                {step === 'intro' && (
                    <FadeIn>
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-900/10 border border-pink-500/20 mb-8">
                            <Sparkles size={16} className="text-pink-500" />
                            <span className="text-xs font-bold text-pink-400 tracking-wider uppercase">Test de 2 minutos</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">¿Cuál es tu <span className="text-pink-500">superpoder de comunicación</span>?</h2>
                        <p className="text-gray-400 mb-12 text-lg">7 situaciones reales. 2 minutos. Descubre tu arquetipo y recibe un plan de acción personalizado para tu escalada.</p>
                        <button onClick={() => setStep('quiz')} className="px-10 py-5 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform text-xl">
                            Empezar Test
                        </button>
                    </FadeIn>
                )}

                {(step === 'quiz' || revealing) && (
                    <div>
                        {/* Progress Bar */}
                        <div className="w-full bg-white/5 rounded-full h-2 mb-8">
                            <div
                                className="h-2 rounded-full transition-all duration-500 ease-out"
                                style={{ width: `${revealing ? 100 : progress}%`, background: `linear-gradient(90deg, ${COLORS.maityPink}, ${COLORS.maityBlue})` }}
                            />
                        </div>

                        {revealing ? (
                            <div className="py-20">
                                <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                                <p className="text-xl text-white font-bold">Analizando tu perfil...</p>
                                <p className="text-gray-500 mt-2">Calculando tu arquetipo de comunicación</p>
                            </div>
                        ) : (
                            <div key={currentQ}>
                                <div className="mb-8 text-pink-500 font-bold tracking-widest uppercase text-sm">Pregunta {currentQ + 1} de {questions.length}</div>
                                <h3 className="text-2xl md:text-3xl font-bold text-white mb-10 leading-tight">{questions[currentQ].t}</h3>
                                <div className="grid gap-4">
                                    {questions[currentQ].o.map((opt, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleAnswer(opt.k)}
                                            className="p-5 md:p-6 bg-[#0F0F0F] border border-white/10 hover:border-pink-500/50 hover:bg-pink-500/5 rounded-2xl text-left text-base md:text-lg text-white transition-all group flex justify-between items-center"
                                        >
                                            <span>{opt.t}</span>
                                            <ChevronRight className="text-gray-600 group-hover:text-pink-500 flex-shrink-0 ml-3" size={20} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {step === 'result' && result && (
                    <FadeIn>
                        {/* Archetype Badge */}
                        <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 border-2 text-5xl"
                            style={{ backgroundColor: `${result.archetype.color}20`, borderColor: result.archetype.color }}>
                            {result.archetype.emoji}
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">Eres un <span style={{ color: result.archetype.color }}>{result.archetype.name}</span></h2>
                        <p className="text-lg font-medium mb-6" style={{ color: result.archetype.color }}>{result.archetype.tagline}</p>

                        {/* Score Breakdown */}
                        <div className="flex justify-center gap-4 mb-8 text-sm">
                            {Object.entries(result.percentages).map(([key, pct]) => (
                                <div key={key} className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                                    <span className="font-bold" style={{ color: archetypes[key].color }}>{archetypes[key].emoji} {pct}%</span>
                                </div>
                            ))}
                        </div>

                        <p className="text-gray-400 mb-8 text-lg leading-relaxed max-w-lg mx-auto">{result.archetype.description}</p>

                        {/* Strengths & Growth */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 text-left">
                            <div className="p-5 bg-[#0F0F0F] rounded-xl border border-green-500/20">
                                <h4 className="text-sm font-bold text-green-400 uppercase tracking-wider mb-3">Tus fortalezas</h4>
                                {result.archetype.strengths.map((s, i) => (
                                    <div key={i} className="flex items-center gap-2 mb-2 text-gray-300">
                                        <Check size={14} className="text-green-400 flex-shrink-0" /> <span className="text-sm">{s}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="p-5 bg-[#0F0F0F] rounded-xl border border-yellow-500/20">
                                <h4 className="text-sm font-bold text-yellow-400 uppercase tracking-wider mb-3">Tu oportunidad de crecimiento</h4>
                                {result.archetype.growth.map((g, i) => (
                                    <div key={i} className="flex items-center gap-2 mb-2 text-gray-300">
                                        <TrendingUp size={14} className="text-yellow-400 flex-shrink-0" /> <span className="text-sm">{g}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Maity Plan */}
                        <div className="p-5 bg-gradient-to-r from-pink-900/10 to-blue-900/10 rounded-xl border border-pink-500/20 mb-8">
                            <p className="text-white font-bold text-sm">{result.archetype.maityPlan}</p>
                        </div>

                        {/* CTAs */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={() => setView('primeros-pasos')}
                                className="px-8 py-4 font-bold rounded-full text-white flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg text-lg"
                                style={{ background: `linear-gradient(90deg, ${COLORS.maityPink}, ${COLORS.maityBlue})` }}
                            >
                                Empieza Tu Escalada Gratis
                            </button>
                            <button
                                onClick={() => { if (navigator.share) { navigator.share({ title: `Mi arquetipo Maity: ${result.archetype.name}`, text: `${result.archetype.tagline}. Descubre el tuyo en maity.com` }); } }}
                                className="px-6 py-4 font-bold rounded-full border border-white/20 text-white hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
                            >
                                <Share2 size={18} /> Compartir Resultado
                            </button>
                        </div>
                    </FadeIn>
                )}
            </div>
        </section>
    );
};

const ScenariosSection = ({ setView }) => {
    const scenarios = [
        {
            icon: <DollarSign size={22} />,
            skill: "Negociación",
            title: "Cierre de venta con objeciones de precio",
            desc: "El cliente dice que es muy caro. Practica cómo defender tu propuesta de valor sin ceder en precio.",
            color: "text-pink-500",
            bg: "bg-pink-500/10"
        },
        {
            icon: <Users size={22} />,
            skill: "Liderazgo",
            title: "Retroalimentación a un colaborador difícil",
            desc: "Tu mejor talento tiene actitud negativa. Practica cómo dar feedback directo sin perder al empleado.",
            color: "text-blue-500",
            bg: "bg-blue-500/10"
        },
        {
            icon: <Target size={22} />,
            skill: "Presentación",
            title: "Pitch de producto ante directivos",
            desc: "Tienes 5 minutos frente al comité. Practica cómo presentar resultados y pedir presupuesto con confianza.",
            color: "text-green-500",
            bg: "bg-green-500/10"
        },
        {
            icon: <Shield size={22} />,
            skill: "Manejo de objeciones",
            title: "Cliente que quiere cancelar el contrato",
            desc: "Tu cliente más importante amenaza con irse. Practica retención con empatía y soluciones concretas.",
            color: "text-yellow-500",
            bg: "bg-yellow-500/10"
        },
        {
            icon: <Heart size={22} />,
            skill: "Empatía",
            title: "Comunicar malas noticias al equipo",
            desc: "Hay recortes de presupuesto. Practica cómo comunicar con transparencia sin destruir la moral.",
            color: "text-red-500",
            bg: "bg-red-500/10"
        },
        {
            icon: <Briefcase size={22} />,
            skill: "Confianza",
            title: "Primera reunión con un prospecto enterprise",
            desc: "No te conocen y son escépticos. Practica cómo generar credibilidad y confianza en los primeros 3 minutos.",
            color: "text-purple-500",
            bg: "bg-purple-500/10"
        },
    ];

    return (
        <section className="py-24 bg-[#050505] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[150px]"></div>
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-pink-500/5 rounded-full blur-[150px]"></div>

            <div className="max-w-6xl mx-auto px-4 relative z-10">
                <FadeIn>
                    <div className="text-center mb-6">
                        <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 rounded-full text-xs font-bold text-blue-400 border border-blue-500/20 mb-6">
                            <Mic size={14} /> Conversaciones simuladas con IA
                        </span>
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
                            Escenarios que <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">transforman habilidades</span>
                        </h2>
                        <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
                            Tu equipo practica conversaciones reales con un agente de IA que responde, desafía y evalúa. Después de cada sesión, reciben feedback detallado sobre qué mejorar y cómo hacerlo.
                        </p>
                    </div>
                </FadeIn>

                {/* Video */}
                <VideoCard
                    title="Escenarios en Acción"
                    description="Mira cómo funciona una sesión de práctica con IA"
                    duration="2:00"
                    videoUrl="https://youtu.be/gCfLZJHGfjU"
                    variant="featured"
                    accentColor={COLORS.maityBlue}
                />

                {/* How it works */}
                <FadeIn delay={200}>
                    <div className="flex flex-col md:flex-row items-center justify-center gap-8 mt-16 mb-16">
                        {[
                            { step: "1", label: "Elige un escenario", detail: "Selecciona la situación que quieres practicar" },
                            { step: "2", label: "Conversa con la IA", detail: "El agente responde en tiempo real como lo haría un interlocutor real" },
                            { step: "3", label: "Recibe feedback", detail: "Evaluación detallada de claridad, empatía, persuasión y estructura" },
                        ].map((s, i) => (
                            <div key={i} className="flex items-center gap-4">
                                {i > 0 && <div className="hidden md:block w-12 h-px bg-white/10"></div>}
                                <div className="text-center">
                                    <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 font-bold text-white text-lg" style={{ background: `linear-gradient(135deg, ${COLORS.maityBlue}, ${COLORS.maityGreen})` }}>
                                        {s.step}
                                    </div>
                                    <h4 className="font-bold text-white text-sm mb-1">{s.label}</h4>
                                    <p className="text-xs text-gray-500 max-w-[180px]">{s.detail}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </FadeIn>

                {/* Scenarios Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {scenarios.map((sc, i) => (
                        <FadeIn key={i} delay={i * 80}>
                            <div className="bg-[#0F0F0F] rounded-2xl border border-white/5 p-6 hover:border-white/10 transition-all group h-full flex flex-col">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className={`w-10 h-10 rounded-xl ${sc.bg} flex items-center justify-center ${sc.color}`}>{sc.icon}</div>
                                    <span className={`text-xs font-bold uppercase tracking-widest ${sc.color}`}>{sc.skill}</span>
                                </div>
                                <h3 className="font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">{sc.title}</h3>
                                <p className="text-sm text-gray-500 leading-relaxed flex-grow">{sc.desc}</p>
                            </div>
                        </FadeIn>
                    ))}
                </div>

                {/* CTA */}
                <FadeIn delay={500}>
                    <div className="text-center mt-16">
                        <p className="text-gray-400 text-sm mb-6">Cada escenario es personalizable. Crea los tuyos propios para tu industria y equipo.</p>
                        <button
                            onClick={() => setView('demo-calendar')}
                            className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-white hover:opacity-90 transition-all"
                            style={{ background: `linear-gradient(90deg, ${COLORS.maityBlue}, ${COLORS.maityGreen})` }}
                        >
                            <Play size={18} /> Ver Demo de Escenarios
                        </button>
                    </div>
                </FadeIn>
            </div>
        </section>
    );
};

const CorporateQuiz = ({ setView }) => {
    const [step, setStep] = useState('intro');
    const [currentQ, setCurrentQ] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [revealing, setRevealing] = useState(false);

    const archetypes = {
        visionary: {
            name: "Líder Visionario",
            emoji: "🔭",
            color: COLORS.maityBlue,
            tagline: "Tu superpoder: transformar ideas en dirección estratégica",
            description: "Ves el panorama completo. Tu comunicación inspira equipos a moverse hacia una visión compartida. Los stakeholders confían en tu capacidad para articular el futuro. Pero a veces la visión puede sentirse lejana para quienes necesitan instrucciones concretas.",
            strengths: ["Visión estratégica clara", "Comunicación inspiradora", "Alineación de equipos grandes"],
            growth: ["Bajar la estrategia a tácticas concretas", "Escuchar las necesidades operativas", "Medir impacto en el corto plazo"],
            maityPlan: "Escalada Corporativa: Ejecución Track — 21 días para convertir tu visión en planes de acción concretos."
        },
        negotiator: {
            name: "Negociador Natural",
            emoji: "🤝",
            color: COLORS.maityPink,
            tagline: "Tu superpoder: encontrar acuerdos donde otros ven conflicto",
            description: "Lees a las personas como nadie. Sabes cuándo presionar y cuándo ceder. Tu habilidad para persuadir y cerrar acuerdos es tu mayor activo. Pero a veces la orientación al resultado puede hacer que otros sientan que solo te importa ganar.",
            strengths: ["Lectura de interlocutores", "Manejo de objeciones", "Cierre de acuerdos complejos"],
            growth: ["Construir relaciones a largo plazo", "Ceder estratégicamente", "Comunicar valor más allá del precio"],
            maityPlan: "Escalada Corporativa: Relaciones Track — 21 días para convertir negociaciones en alianzas duraderas."
        },
        architect: {
            name: "Arquitecto de Equipos",
            emoji: "🏗️",
            color: COLORS.maityGreen,
            tagline: "Tu superpoder: construir culturas donde la gente crece",
            description: "Tu fortaleza está en desarrollar personas. Sabes dar feedback que transforma, resolver conflictos internos y crear ambientes de alto rendimiento. Pero a veces la atención al equipo puede hacerte perder velocidad en decisiones de negocio.",
            strengths: ["Feedback transformador", "Resolución de conflictos internos", "Desarrollo de talento"],
            growth: ["Tomar decisiones impopulares", "Comunicar urgencia sin perder empatía", "Delegar con confianza"],
            maityPlan: "Escalada Corporativa: Impacto Track — 21 días para liderar con resultados sin perder tu humanidad."
        }
    };

    const questions = [
        {
            t: "Tu equipo de ventas no está alcanzando la cuota trimestral. ¿Cuál es tu primer movimiento?",
            o: [
                { t: "Convoco una sesión estratégica para redefinir el enfoque y la narrativa de venta.", k: "visionary" },
                { t: "Analizo los deals perdidos, identifico objeciones clave y armo un playbook de respuestas.", k: "negotiator" },
                { t: "Me reúno uno a uno con cada vendedor para entender sus bloqueos y dar coaching personalizado.", k: "architect" }
            ]
        },
        {
            t: "Un cliente importante amenaza con irse a la competencia. ¿Cómo manejas la conversación?",
            o: [
                { t: "Le presento una visión de futuro: el roadmap de evolución y cómo encaja su negocio.", k: "visionary" },
                { t: "Escucho sus quejas, hago preguntas precisas y negocio condiciones que funcionen para ambos.", k: "negotiator" },
                { t: "Involucro a todo el equipo de cuenta para demostrar compromiso y resolvemos juntos.", k: "architect" }
            ]
        },
        {
            t: "Debes presentar resultados a la junta directiva y los números no son buenos. ¿Cómo lo abordas?",
            o: [
                { t: "Presento los números con contexto, enfoco en las oportunidades y propongo un plan a 6 meses.", k: "visionary" },
                { t: "Anticipo las objeciones, preparo respuestas sólidas y negocio los próximos pasos con datos.", k: "negotiator" },
                { t: "Incluyo la perspectiva del equipo, reconozco el esfuerzo y propongo ajustes en la estructura.", k: "architect" }
            ]
        },
        {
            t: "Dos departamentos tienen un conflicto que está afectando un proyecto clave. ¿Qué haces?",
            o: [
                { t: "Convoco a ambos líderes y reencuadro el conflicto como oportunidad de innovación conjunta.", k: "visionary" },
                { t: "Facilito una negociación donde cada parte define sus mínimos y encontramos un acuerdo operativo.", k: "negotiator" },
                { t: "Hablo con cada equipo por separado, entiendo las frustraciones y diseño un proceso de colaboración.", k: "architect" }
            ]
        },
        {
            t: "Necesitas que tu equipo adopte una herramienta nueva que genera resistencia. ¿Cómo lo comunicas?",
            o: [
                { t: "Pinto la visión de cómo esta herramienta nos posiciona mejor para el futuro del mercado.", k: "visionary" },
                { t: "Demuestro el ROI concreto: horas ahorradas, errores reducidos, resultados proyectados.", k: "negotiator" },
                { t: "Identifico a los early adopters, los empodero como champions y creo un sistema de acompañamiento.", k: "architect" }
            ]
        },
        {
            t: "Un líder de tu organización tiene problemas de comunicación que afectan a su equipo. ¿Cómo intervienes?",
            o: [
                { t: "Le muestro cómo su comunicación impacta en los objetivos estratégicos y le doy una meta clara.", k: "visionary" },
                { t: "Tengo una conversación directa: le presento evidencia y negociamos un plan de mejora medible.", k: "negotiator" },
                { t: "Le doy feedback honesto y constructivo, lo acompaño con sesiones de coaching uno a uno.", k: "architect" }
            ]
        },
        {
            t: "¿Cómo defines el éxito de un programa de desarrollo de talento?",
            o: [
                { t: "Que el equipo esté alineado con la visión y sea capaz de adaptarse a los cambios del mercado.", k: "visionary" },
                { t: "Métricas duras: incremento en ventas, retención de clientes, deals cerrados.", k: "negotiator" },
                { t: "Que las personas crezcan, el clima laboral mejore y la rotación baje.", k: "architect" }
            ]
        }
    ];

    const getResult = (allAnswers) => {
        const counts = { visionary: 0, negotiator: 0, architect: 0 };
        allAnswers.forEach(a => counts[a]++);
        const total = allAnswers.length;
        const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
        const winner = sorted[0][0];
        const percentages = {};
        sorted.forEach(([key, val]) => { percentages[key] = Math.round((val / total) * 100); });
        return { archetype: archetypes[winner], percentages, winnerKey: winner };
    };

    const handleAnswer = (key) => {
        const newAnswers = [...answers, key];
        setAnswers(newAnswers);
        if (currentQ < questions.length - 1) {
            setCurrentQ(currentQ + 1);
        } else {
            setRevealing(true);
            setTimeout(() => {
                setRevealing(false);
                setStep('result');
            }, 2000);
        }
    };

    const result = answers.length === questions.length ? getResult(answers) : null;
    const progress = ((currentQ + (step === 'result' || revealing ? 1 : 0)) / questions.length) * 100;

    return (
        <section className="py-24 bg-[#050505] flex items-center justify-center">
            <div className="max-w-2xl w-full px-4 text-center">
                {step === 'intro' && (
                    <FadeIn>
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-900/10 border border-blue-500/20 mb-8">
                            <Building2 size={16} className="text-blue-500" />
                            <span className="text-xs font-bold text-blue-400 tracking-wider uppercase">Evaluación Corporativa</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">¿Cuál es tu <span className="text-blue-500">estilo de liderazgo comunicativo</span>?</h2>
                        <p className="text-gray-400 mb-12 text-lg">7 escenarios reales de negocio. 2 minutos. Descubre tu perfil de liderazgo y recibe un plan de acción para tu organización.</p>
                        <button onClick={() => setStep('quiz')} className="px-10 py-5 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform text-xl">
                            Empezar Evaluación
                        </button>
                    </FadeIn>
                )}

                {(step === 'quiz' || revealing) && (
                    <div>
                        <div className="w-full bg-white/5 rounded-full h-2 mb-8">
                            <div
                                className="h-2 rounded-full transition-all duration-500 ease-out"
                                style={{ width: `${revealing ? 100 : progress}%`, background: `linear-gradient(90deg, ${COLORS.maityBlue}, ${COLORS.maityGreen})` }}
                            />
                        </div>

                        {revealing ? (
                            <div className="py-20">
                                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                                <p className="text-xl text-white font-bold">Analizando tu perfil de liderazgo...</p>
                                <p className="text-gray-500 mt-2">Calculando tu estilo comunicativo corporativo</p>
                            </div>
                        ) : (
                            <div key={currentQ}>
                                <div className="mb-8 text-blue-500 font-bold tracking-widest uppercase text-sm">Pregunta {currentQ + 1} de {questions.length}</div>
                                <h3 className="text-2xl md:text-3xl font-bold text-white mb-10 leading-tight">{questions[currentQ].t}</h3>
                                <div className="grid gap-4">
                                    {questions[currentQ].o.map((opt, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleAnswer(opt.k)}
                                            className="p-5 md:p-6 bg-[#0F0F0F] border border-white/10 hover:border-blue-500/50 hover:bg-blue-500/5 rounded-2xl text-left text-base md:text-lg text-white transition-all group flex justify-between items-center"
                                        >
                                            <span>{opt.t}</span>
                                            <ChevronRight className="text-gray-600 group-hover:text-blue-500 flex-shrink-0 ml-3" size={20} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {step === 'result' && result && (
                    <FadeIn>
                        <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 border-2 text-5xl"
                            style={{ backgroundColor: `${result.archetype.color}20`, borderColor: result.archetype.color }}>
                            {result.archetype.emoji}
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">Tu estilo: <span style={{ color: result.archetype.color }}>{result.archetype.name}</span></h2>
                        <p className="text-lg font-medium mb-6" style={{ color: result.archetype.color }}>{result.archetype.tagline}</p>

                        <div className="flex justify-center gap-4 mb-8 text-sm">
                            {Object.entries(result.percentages).map(([key, pct]) => (
                                <div key={key} className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                                    <span className="font-bold" style={{ color: archetypes[key].color }}>{archetypes[key].emoji} {pct}%</span>
                                </div>
                            ))}
                        </div>

                        <p className="text-gray-400 mb-8 text-lg leading-relaxed max-w-lg mx-auto">{result.archetype.description}</p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 text-left">
                            <div className="p-5 bg-[#0F0F0F] rounded-xl border border-green-500/20">
                                <h4 className="text-sm font-bold text-green-400 uppercase tracking-wider mb-3">Fortalezas de liderazgo</h4>
                                {result.archetype.strengths.map((s, i) => (
                                    <div key={i} className="flex items-center gap-2 mb-2 text-gray-300">
                                        <Check size={14} className="text-green-400 flex-shrink-0" /> <span className="text-sm">{s}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="p-5 bg-[#0F0F0F] rounded-xl border border-yellow-500/20">
                                <h4 className="text-sm font-bold text-yellow-400 uppercase tracking-wider mb-3">Oportunidad de crecimiento</h4>
                                {result.archetype.growth.map((g, i) => (
                                    <div key={i} className="flex items-center gap-2 mb-2 text-gray-300">
                                        <TrendingUp size={14} className="text-yellow-400 flex-shrink-0" /> <span className="text-sm">{g}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-5 bg-gradient-to-r from-blue-900/10 to-green-900/10 rounded-xl border border-blue-500/20 mb-8">
                            <p className="text-white font-bold text-sm">{result.archetype.maityPlan}</p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={() => setView('demo-calendar')}
                                className="px-8 py-4 font-bold rounded-full text-white flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg text-lg"
                                style={{ background: `linear-gradient(90deg, ${COLORS.maityBlue}, ${COLORS.maityGreen})` }}
                            >
                                Solicitar Demo Corporativa
                            </button>
                            <button
                                onClick={() => { if (navigator.share) { navigator.share({ title: `Mi estilo de liderazgo Maity: ${result.archetype.name}`, text: `${result.archetype.tagline}. Descubre el tuyo en maity.com` }); } }}
                                className="px-6 py-4 font-bold rounded-full border border-white/20 text-white hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
                            >
                                <Share2 size={18} /> Compartir Resultado
                            </button>
                        </div>
                    </FadeIn>
                )}
            </div>
        </section>
    );
};

const PrimerosPasosView = ({ setView }) => {
    const [email, setEmail] = useState('');

    const steps = [
        { num: 1, label: 'Crea tu cuenta', icon: <UserPlus size={16} /> },
        { num: 2, label: 'Descarga la app', icon: <Download size={16} /> },
        { num: 3, label: 'Tu primer reto', icon: <Rocket size={16} /> }
    ];

    const platforms = [
        { name: 'Windows', icon: <Monitor size={32} />, label: '.exe', available: true },
        { name: 'macOS', icon: <Apple size={32} />, label: '.dmg', available: true },
        { name: 'iOS App', icon: <SmartphoneIcon size={32} />, label: 'App Store', available: false },
        { name: 'Android', icon: <SmartphoneIcon size={32} />, label: 'Google Play', available: false }
    ];

    return (
        <section className="min-h-screen pt-32 pb-24 bg-[#050505]">
            <div className="max-w-5xl mx-auto px-4">

                {/* Header */}
                <FadeIn>
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-900/10 border border-pink-500/20 mb-6">
                            <Sparkles size={16} className="text-pink-500" />
                            <span className="text-xs font-bold text-pink-400 tracking-wider uppercase">Primeros Pasos</span>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 font-geist tracking-tighter">
                            Empieza tu{' '}
                            <span className="bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(90deg, ${COLORS.maityPink}, ${COLORS.maityBlue})` }}>
                                evolución
                            </span>
                        </h1>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto">Crea tu cuenta y descarga Maity en menos de 2 minutos</p>
                    </div>
                </FadeIn>

                {/* Step Indicator */}
                <FadeIn delay={100}>
                    <div className="flex items-center justify-center gap-0 mb-20 max-w-lg mx-auto">
                        {steps.map((step, i) => (
                            <div key={step.num} className="flex items-center flex-1">
                                <div className="flex flex-col items-center flex-1">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 border-2 ${
                                        step.num === 1 ? 'border-pink-500 bg-pink-500/20 text-pink-400' : 'border-white/10 bg-[#0F0F0F] text-gray-500'
                                    }`}>
                                        {step.icon}
                                    </div>
                                    <span className={`text-xs font-bold ${step.num === 1 ? 'text-pink-400' : 'text-gray-600'}`}>{step.label}</span>
                                </div>
                                {i < steps.length - 1 && (
                                    <div className="h-px w-full bg-white/10 -mt-6 mx-1" />
                                )}
                            </div>
                        ))}
                    </div>
                </FadeIn>

                {/* Step 1: Create Account */}
                <FadeIn delay={200}>
                    <div className="mb-20">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center text-white font-bold text-sm">1</div>
                            <h2 className="text-2xl font-bold text-white">Crea tu cuenta gratis</h2>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                            {/* Form */}
                            <div className="lg:col-span-3 p-8 bg-[#0F0F0F] border border-white/10 rounded-2xl">
                                <form onSubmit={(e) => { e.preventDefault(); }} className="space-y-5">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Correo Electrónico</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-3.5 text-gray-500" size={18} />
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="tu@empresa.com"
                                                className="w-full bg-[#050505] border border-white/10 rounded-xl py-3.5 pl-10 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full py-4 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 hover:opacity-90 transition-all text-lg"
                                        style={{ background: `linear-gradient(90deg, ${COLORS.maityPink}, ${COLORS.maityBlue})` }}
                                    >
                                        Crear cuenta gratis <ArrowRight size={20} />
                                    </button>
                                </form>

                                <div className="my-5 flex items-center justify-between text-xs text-gray-600">
                                    <div className="h-px bg-white/10 flex-1"></div>
                                    <span className="px-3">O continúa con</span>
                                    <div className="h-px bg-white/10 flex-1"></div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <button className="flex items-center justify-center gap-2 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-colors text-sm text-gray-300 font-medium">
                                        Google
                                    </button>
                                    <button className="flex items-center justify-center gap-2 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-colors text-sm text-gray-300 font-medium">
                                        Microsoft
                                    </button>
                                </div>

                                <p className="mt-5 text-center text-xs text-gray-500">
                                    ¿Ya tienes cuenta? <button onClick={() => setView('login')} className="text-pink-500 hover:text-pink-400 font-bold ml-1">Inicia sesión</button>
                                </p>
                            </div>

                            {/* Trust Sidebar */}
                            <div className="lg:col-span-2 flex flex-col gap-4">
                                {[
                                    { icon: <CreditCard size={20} />, title: 'Sin tarjeta de crédito', desc: 'Empieza sin compromiso financiero' },
                                    { icon: <Shield size={20} />, title: '7 días gratis', desc: 'Prueba todas las funciones Pro' },
                                    { icon: <Lock size={20} />, title: 'Control total de tus datos', desc: 'Tú decides qué se graba y qué se analiza' }
                                ].map((item, i) => (
                                    <div key={i} className="p-5 bg-[#0F0F0F] border border-white/5 rounded-xl flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-400 flex-shrink-0">
                                            {item.icon}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white text-sm">{item.title}</h4>
                                            <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                                <div className="p-4 border border-white/5 rounded-xl text-center mt-2">
                                    <p className="text-xs text-gray-500">Más de <span className="text-white font-bold">10,000</span> profesionales ya entrenan con Maity</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </FadeIn>

                {/* Step 2: Download */}
                <FadeIn delay={300}>
                    <div className="mb-20">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-gray-400 font-bold text-sm border border-white/10">2</div>
                            <h2 className="text-2xl font-bold text-white">Descarga Maity</h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                            {platforms.map((plat, i) => (
                                <div key={i} className={`p-8 bg-[#0F0F0F] border rounded-2xl transition-all group cursor-pointer text-center ${
                                    plat.available ? 'border-white/10 hover:border-pink-500 hover:bg-pink-500/5' : 'border-white/5 opacity-60'
                                }`}>
                                    <div className="text-gray-400 group-hover:text-pink-500 transition-colors mb-6 flex justify-center">{plat.icon}</div>
                                    <h3 className="text-lg font-bold text-white mb-2">{plat.name}</h3>
                                    <p className="text-[10px] uppercase tracking-widest text-gray-600 group-hover:text-pink-400">
                                        {plat.available ? plat.label : 'Próximamente'}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </FadeIn>

                {/* Step 3: First Challenge */}
                <FadeIn delay={400}>
                    <div className="mb-20">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-gray-400 font-bold text-sm border border-white/10">3</div>
                            <h2 className="text-2xl font-bold text-white">Completa tu primer reto</h2>
                        </div>
                        <div className="p-8 bg-gradient-to-r from-pink-900/10 to-blue-900/10 border border-pink-500/10 rounded-2xl text-center max-w-2xl">
                            <div className="w-16 h-16 rounded-full bg-pink-500/20 flex items-center justify-center mx-auto mb-4">
                                <Rocket size={28} className="text-pink-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">3 minutos para empezar</h3>
                            <p className="text-gray-400 mb-6 max-w-md mx-auto">
                                Tu primer reto te dará 25 puntos de experiencia e iniciará tu racha. Solo necesitas una conversación grabada o una práctica rápida con IA.
                            </p>
                            <div className="flex items-center justify-center gap-6 text-sm">
                                <div className="flex items-center gap-2 text-gray-500">
                                    <Clock size={14} className="text-pink-400" />
                                    <span>3-5 min</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-500">
                                    <Star size={14} className="text-yellow-400" />
                                    <span>+25 XP</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-500">
                                    <TrendingUp size={14} className="text-green-400" />
                                    <span>Inicia tu racha</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </FadeIn>

                {/* Social Proof Strip */}
                <FadeIn delay={500}>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
                        {[
                            { value: '+10k', label: 'Horas Entrenadas' },
                            { value: '94%', label: 'Aprobación' },
                            { value: '3.5x', label: 'ROI Promedio' },
                            { value: '15+', label: 'Países' }
                        ].map((stat, i) => (
                            <div key={i} className="text-center p-4 bg-[#0A0A0A] rounded-xl border border-white/5">
                                <div className="text-2xl font-bold text-white">{stat.value}</div>
                                <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </FadeIn>

                {/* Privacy Footer */}
                <FadeIn delay={600}>
                    <div className="p-6 border border-white/5 rounded-2xl bg-[#0A0A0A] max-w-2xl mx-auto">
                        <div className="flex items-center gap-4 text-left">
                            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 flex-shrink-0">
                                <Lock size={24} />
                            </div>
                            <div>
                                <h4 className="font-bold text-white">Privacidad Total</h4>
                                <p className="text-sm text-gray-500">Tus datos nunca salen de tu dispositivo sin tu permiso explícito. Cifrado end-to-end.</p>
                            </div>
                        </div>
                    </div>
                </FadeIn>
            </div>
        </section>
    );
};

const DemoCalendar = ({ setView }) => {
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);
    const [bookingStep, setBookingStep] = useState('date');
    const [formData, setFormData] = useState({ name: '', email: '', company: '' });

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const dayNames = ['Lun', 'Mar', 'Mi\u00e9', 'Jue', 'Vie', 'S\u00e1b', 'Dom'];

    const getDaysInMonth = (m, y) => new Date(y, m + 1, 0).getDate();
    const getFirstDayOfMonth = (m, y) => {
        const d = new Date(y, m, 1).getDay();
        return d === 0 ? 6 : d - 1;
    };

    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);

    const isAvailable = (day) => {
        const date = new Date(currentYear, currentMonth, day);
        const dow = date.getDay();
        return dow !== 0 && dow !== 6 && day >= now.getDate();
    };

    const timeSlots = [
        { time: '9:00 AM', period: 'Ma\u00f1ana' },
        { time: '10:00 AM', period: 'Ma\u00f1ana' },
        { time: '11:00 AM', period: 'Ma\u00f1ana' },
        { time: '12:00 PM', period: 'Mediod\u00eda' },
        { time: '4:00 PM', period: 'Tarde' },
        { time: '5:00 PM', period: 'Tarde' },
        { time: '6:00 PM', period: 'Tarde' },
    ];

    const steps = [
        { id: 'date', label: 'Fecha' },
        { id: 'time', label: 'Hora' },
        { id: 'details', label: 'Datos' },
    ];

    const currentStepIndex = steps.findIndex(s => s.id === bookingStep);

    const handleDateSelect = (day) => {
        if (isAvailable(day)) {
            setSelectedDate(day);
            setBookingStep('time');
        }
    };

    const handleTimeSelect = (time) => {
        setSelectedTime(time);
        setBookingStep('details');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData.name && formData.email) {
            setBookingStep('confirmed');
        }
    };

    return (
        <section className="min-h-screen pt-32 pb-24 bg-[#050505]">
            <div className="max-w-7xl mx-auto px-4">
                {/* Header */}
                <FadeIn>
                    <div className="text-center mb-12">
                        <span className="text-sm font-bold text-pink-500 uppercase tracking-widest mb-4 block">Agenda una Demo</span>
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            Descubre Maity en <span className="bg-gradient-to-r from-pink-500 to-blue-500 bg-clip-text text-transparent">20 minutos</span>
                        </h2>
                        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                            Una sesión personalizada donde verás cómo Maity transforma la comunicación de tu equipo.
                        </p>
                    </div>
                </FadeIn>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left Sidebar */}
                    <div className="lg:w-[340px] shrink-0">
                        <FadeIn>
                            <div className="bg-[#0F0F0F] rounded-2xl border border-white/10 p-8 lg:sticky lg:top-32">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center">
                                        <Clock size={20} className="text-pink-500" />
                                    </div>
                                    <div>
                                        <p className="text-white font-bold">20 min</p>
                                        <p className="text-xs text-gray-500">Videollamada 1:1</p>
                                    </div>
                                </div>

                                <div className="space-y-4 mb-8">
                                    {[
                                        { icon: <BarChart2 size={18} />, text: "An\u00e1lisis de ROI para tu equipo", color: "text-green-400" },
                                        { icon: <Monitor size={18} />, text: "Demo en vivo del dashboard", color: "text-blue-400" },
                                        { icon: <Target size={18} />, text: "Plan personalizado de implementaci\u00f3n", color: "text-purple-400" },
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center gap-3 text-sm">
                                            <span className={item.color}>{item.icon}</span>
                                            <span className="text-gray-300">{item.text}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="border-t border-white/5 pt-6">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="flex -space-x-2">
                                            {['bg-pink-500', 'bg-blue-500', 'bg-green-500'].map((c, i) => (
                                                <div key={i} className={`w-7 h-7 rounded-full ${c} border-2 border-[#0F0F0F] flex items-center justify-center text-[10px] font-bold text-white`}>
                                                    {['M', 'A', 'R'][i]}
                                                </div>
                                            ))}
                                        </div>
                                        <p className="text-xs text-gray-500">+120 demos este mes</p>
                                    </div>
                                    <div className="flex gap-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={14} className="text-yellow-500 fill-yellow-500" />
                                        ))}
                                        <span className="text-xs text-gray-500 ml-1">4.9/5</span>
                                    </div>
                                </div>
                            </div>
                        </FadeIn>
                    </div>

                    {/* Right Content - Booking Flow */}
                    <div className="flex-1">
                        <FadeIn>
                            <div className="bg-[#0F0F0F] rounded-2xl border border-white/10 p-8 md:p-10">
                                {/* Step Indicator */}
                                {bookingStep !== 'confirmed' && (
                                    <div className="flex items-center gap-2 mb-8">
                                        {steps.map((s, i) => (
                                            <React.Fragment key={s.id}>
                                                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                                                    bookingStep === s.id ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30' :
                                                    currentStepIndex > i ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                                                    'bg-white/5 text-gray-600 border border-white/5'
                                                }`}>
                                                    {currentStepIndex > i ? <Check size={12} /> : <span>{i + 1}</span>}
                                                    <span>{s.label}</span>
                                                </div>
                                                {i < steps.length - 1 && (
                                                    <div className={`h-px flex-1 ${currentStepIndex > i ? 'bg-green-500/30' : 'bg-white/10'}`}></div>
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </div>
                                )}

                                {/* Step: Date Selection */}
                                {bookingStep === 'date' && (
                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-1">Selecciona una fecha</h3>
                                        <p className="text-sm text-gray-500 mb-6">{monthNames[currentMonth]} {currentYear} · Horario Ciudad de México (CST)</p>

                                        <div className="grid grid-cols-7 gap-1 mb-2">
                                            {dayNames.map(d => (
                                                <div key={d} className="text-center text-xs font-bold text-gray-600 py-2">{d}</div>
                                            ))}
                                        </div>

                                        <div className="grid grid-cols-7 gap-1">
                                            {[...Array(firstDay)].map((_, i) => (
                                                <div key={`empty-${i}`} className="aspect-square"></div>
                                            ))}
                                            {[...Array(daysInMonth)].map((_, i) => {
                                                const day = i + 1;
                                                const available = isAvailable(day);
                                                const isToday = day === now.getDate();
                                                const isSelected = selectedDate === day;
                                                return (
                                                    <button
                                                        key={day}
                                                        onClick={() => available && handleDateSelect(day)}
                                                        disabled={!available}
                                                        className={`aspect-square rounded-xl flex items-center justify-center text-sm font-medium transition-all ${
                                                            isSelected ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/25 scale-110' :
                                                            available ? 'bg-white/5 text-white hover:bg-pink-500/20 hover:text-pink-400 hover:border-pink-500/30 border border-transparent cursor-pointer' :
                                                            'text-gray-800 cursor-not-allowed'
                                                        } ${isToday && !isSelected ? 'ring-1 ring-pink-500/50' : ''}`}
                                                    >
                                                        {day}
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        <p className="text-xs text-gray-600 mt-4 flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-pink-500/50"></span>
                                            Hoy
                                            <span className="w-2 h-2 rounded-full bg-white/20 ml-2"></span>
                                            Disponible
                                        </p>
                                    </div>
                                )}

                                {/* Step: Time Selection */}
                                {bookingStep === 'time' && (
                                    <div>
                                        <button onClick={() => setBookingStep('date')} className="text-sm text-gray-500 hover:text-pink-400 mb-4 flex items-center gap-1 transition-colors">
                                            <ChevronRight size={14} className="rotate-180" /> Cambiar fecha
                                        </button>
                                        <h3 className="text-xl font-bold text-white mb-1">Selecciona un horario</h3>
                                        <p className="text-sm text-gray-500 mb-6">{selectedDate} de {monthNames[currentMonth]} · Horario CST (Ciudad de México)</p>

                                        <div className="space-y-2">
                                            {timeSlots.map((slot) => (
                                                <button
                                                    key={slot.time}
                                                    onClick={() => handleTimeSelect(slot.time)}
                                                    className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                                                        selectedTime === slot.time
                                                            ? 'bg-pink-500/20 border-pink-500/50 text-pink-400'
                                                            : 'bg-white/5 border-white/5 text-white hover:border-pink-500/30 hover:bg-pink-500/10'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <Clock size={16} className="text-gray-500" />
                                                        <span className="font-medium">{slot.time}</span>
                                                    </div>
                                                    <span className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded-full">{slot.period}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Step: Details Form */}
                                {bookingStep === 'details' && (
                                    <div>
                                        <button onClick={() => setBookingStep('time')} className="text-sm text-gray-500 hover:text-pink-400 mb-4 flex items-center gap-1 transition-colors">
                                            <ChevronRight size={14} className="rotate-180" /> Cambiar hora
                                        </button>
                                        <h3 className="text-xl font-bold text-white mb-1">Completa tus datos</h3>
                                        <p className="text-sm text-gray-500 mb-6">{selectedDate} de {monthNames[currentMonth]} a las {selectedTime}</p>

                                        <form onSubmit={handleSubmit} className="space-y-4">
                                            <div>
                                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Nombre completo</label>
                                                <div className="relative">
                                                    <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
                                                    <input
                                                        type="text"
                                                        value={formData.name}
                                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                        placeholder="Tu nombre"
                                                        required
                                                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/25 transition-all"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Email corporativo</label>
                                                <div className="relative">
                                                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
                                                    <input
                                                        type="email"
                                                        value={formData.email}
                                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                        placeholder="tu@empresa.com"
                                                        required
                                                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/25 transition-all"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Empresa</label>
                                                <div className="relative">
                                                    <Building2 size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
                                                    <input
                                                        type="text"
                                                        value={formData.company}
                                                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                                        placeholder="Nombre de tu empresa"
                                                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/25 transition-all"
                                                    />
                                                </div>
                                            </div>
                                            <button
                                                type="submit"
                                                className="w-full mt-4 bg-gradient-to-r from-pink-600 to-pink-500 text-white font-bold py-4 rounded-xl hover:shadow-lg hover:shadow-pink-500/25 transition-all flex items-center justify-center gap-2"
                                            >
                                                <Send size={18} />
                                                Confirmar Demo
                                            </button>
                                        </form>

                                        <p className="text-xs text-gray-600 mt-4 text-center">
                                            <Lock size={12} className="inline mr-1" />
                                            Tus datos están protegidos. No compartimos información con terceros.
                                        </p>
                                    </div>
                                )}

                                {/* Step: Confirmed */}
                                {bookingStep === 'confirmed' && (
                                    <div className="text-center py-8">
                                        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/30">
                                            <Check size={40} className="text-green-500" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-white mb-2">Demo Confirmada</h3>
                                        <p className="text-gray-400 mb-6">
                                            {selectedDate} de {monthNames[currentMonth]} a las {selectedTime}
                                        </p>
                                        <div className="bg-white/5 rounded-xl p-6 border border-white/10 max-w-sm mx-auto mb-8">
                                            <div className="space-y-3 text-sm text-left">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Nombre</span>
                                                    <span className="text-white font-medium">{formData.name}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Email</span>
                                                    <span className="text-white font-medium">{formData.email}</span>
                                                </div>
                                                {formData.company && (
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-500">Empresa</span>
                                                        <span className="text-white font-medium">{formData.company}</span>
                                                    </div>
                                                )}
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Duración</span>
                                                    <span className="text-white font-medium">20 minutos</span>
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-500 mb-6">
                                            Te enviaremos un correo de confirmación con el enlace de la videollamada.
                                        </p>
                                        <button
                                            onClick={() => setView('product')}
                                            className="text-pink-400 hover:text-pink-300 text-sm font-medium transition-colors"
                                        >
                                            ← Volver al inicio
                                        </button>
                                    </div>
                                )}
                            </div>
                        </FadeIn>
                    </div>
                </div>
            </div>
        </section>
    );
};

const ResourcesView = ({ setView }) => {
    const [activeCategory, setActiveCategory] = useState('todos');

    const categories = [
        { key: 'todos', label: 'Todos' },
        { key: 'guia', label: 'Guías' },
        { key: 'video', label: 'Videos' },
        { key: 'articulo', label: 'Artículos' },
        { key: 'webinar', label: 'Webinars' },
    ];

    const resources = [
        {
            t: "Guía de Inicio: Maity 101",
            d: "Todo lo que necesitas para configurar tu coach de comunicación en menos de 5 minutos. Desde tu primera práctica hasta interpretar tu dashboard.",
            c: "guia",
            label: "Guía",
            icon: <BookOpen size={24} />,
            color: "from-blue-600 to-blue-400",
            ready: true,
            time: "5 min lectura"
        },
        {
            t: "Liderazgo en la Era de la IA",
            d: "Manual detallado para managers sobre cómo usar métricas de IA para dar feedback basado en datos reales de comunicación.",
            c: "guia",
            label: "PDF",
            icon: <FileText size={24} />,
            color: "from-pink-600 to-pink-400",
            ready: false,
            time: "15 min lectura"
        },
        {
            t: "Masterclass: Ventas de Alto Impacto",
            d: "Cómo cerrar más tratos analizando tus propias grabaciones con Maity. Técnicas de persuasión y negociación basadas en evidencia.",
            c: "webinar",
            label: "Webinar",
            icon: <Video size={24} />,
            color: "from-green-600 to-green-400",
            ready: false,
            time: "45 min"
        },
        {
            t: "El Arte de la Empatía Digital",
            d: "¿Se puede ser empático por Zoom? Descubre los patrones de comunicación que Maity detecta y cómo mejorarlos.",
            c: "articulo",
            label: "Artículo",
            icon: <MessageSquare size={24} />,
            color: "from-purple-600 to-purple-400",
            ready: false,
            time: "8 min lectura"
        },
        {
            t: "Cómo Preparar tu Primera Entrevista con IA",
            d: "Guía paso a paso para usar el coach de entrevistas de Maity. Configura escenarios, practica respuestas y revisa tu desempeño.",
            c: "guia",
            label: "Guía",
            icon: <GraduationCap size={24} />,
            color: "from-orange-600 to-orange-400",
            ready: true,
            time: "7 min lectura"
        },
        {
            t: "Comunicación No Violenta en el Trabajo",
            d: "Aprende a dar feedback difícil sin generar conflicto. Basado en los principios de Marshall Rosenberg adaptados al contexto laboral moderno.",
            c: "articulo",
            label: "Artículo",
            icon: <Heart size={24} />,
            color: "from-red-600 to-red-400",
            ready: false,
            time: "10 min lectura"
        },
        {
            t: "Demo Producto: Dashboard de Evolución",
            d: "Recorrido visual del dashboard donde ves tu progreso, competencias, rachas y cómo Maity personaliza tu ruta de mejora.",
            c: "video",
            label: "Video",
            icon: <Play size={24} />,
            color: "from-cyan-600 to-cyan-400",
            ready: true,
            time: "3 min"
        },
        {
            t: "Podcast: El Futuro del Desarrollo Humano",
            d: "Conversación con nuestro equipo fundador sobre cómo la IA está transformando el entrenamiento de habilidades blandas.",
            c: "webinar",
            label: "Podcast",
            icon: <Podcast size={24} />,
            color: "from-yellow-600 to-yellow-400",
            ready: false,
            time: "30 min"
        },
    ];

    const filtered = activeCategory === 'todos' ? resources : resources.filter(r => r.c === activeCategory);

    return (
        <section className="min-h-screen pt-32 pb-24 bg-[#050505] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-[150px]"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-pink-500/5 rounded-full blur-[150px]"></div>

            <div className="max-w-7xl mx-auto px-4 relative z-10">
                {/* Header */}
                <div className="max-w-3xl mb-12">
                    <FadeIn>
                        <span className="text-sm font-bold text-blue-500 uppercase tracking-widest mb-4 block">Centro de Conocimiento</span>
                        <h2 className="text-5xl md:text-7xl font-bold text-white mb-8 tracking-tighter">
                            Potencia tus <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-pink-500">Soft Skills</span>
                        </h2>
                        <p className="text-xl text-gray-400 leading-relaxed">
                            Guías, artículos y videos diseñados para acelerar tu evolución profesional con Maity.
                        </p>
                    </FadeIn>
                </div>

                {/* Category Filter */}
                <FadeIn delay={100}>
                    <div className="flex flex-wrap gap-3 mb-12">
                        {categories.map(cat => (
                            <button
                                key={cat.key}
                                onClick={() => setActiveCategory(cat.key)}
                                className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${activeCategory === cat.key
                                    ? 'bg-white text-black'
                                    : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                                }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </FadeIn>

                {/* Resource Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {filtered.map((res, i) => (
                        <FadeIn key={`${activeCategory}-${i}`} delay={i * 80}>
                            <div className="bg-[#0F0F0F] rounded-3xl border border-white/5 overflow-hidden group hover:border-white/10 transition-all flex h-full">
                                <div className={`w-28 sm:w-32 flex items-center justify-center bg-gradient-to-br ${res.color} group-hover:scale-105 transition-transform duration-500 shrink-0`}>
                                    <div className="text-white drop-shadow-lg">{res.icon}</div>
                                </div>
                                <div className="p-6 sm:p-8 flex-grow flex flex-col">
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className="px-3 py-1 bg-white/5 text-[10px] font-bold text-gray-400 rounded-full uppercase tracking-tighter border border-white/5">{res.label}</span>
                                        <span className="text-[10px] text-gray-600">{res.time}</span>
                                        {!res.ready && (
                                            <span className="px-2 py-0.5 bg-yellow-500/10 text-[10px] font-bold text-yellow-500 rounded-full border border-yellow-500/20">Próximamente</span>
                                        )}
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">{res.t}</h3>
                                    <p className="text-sm text-gray-500 leading-relaxed mb-6 flex-grow">{res.d}</p>
                                    {res.ready ? (
                                        <button onClick={() => setView('primeros-pasos')} className="flex items-center gap-2 text-xs font-bold text-white group-hover:gap-4 transition-all uppercase tracking-widest">
                                            Ver Ahora <ArrowRight size={14} className="text-blue-500" />
                                        </button>
                                    ) : (
                                        <span className="flex items-center gap-2 text-xs font-bold text-gray-600 uppercase tracking-widest">
                                            <Clock size={14} /> Disponible pronto
                                        </span>
                                    )}
                                </div>
                            </div>
                        </FadeIn>
                    ))}
                </div>

                {/* Newsletter CTA */}
                <FadeIn delay={300}>
                    <div className="mt-20 p-10 bg-gradient-to-br from-[#0F0F0F] to-[#1A1A1A] rounded-3xl border border-white/5 text-center max-w-3xl mx-auto">
                        <Newspaper size={32} className="text-blue-500 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-white mb-3">Suscríbete al Newsletter</h3>
                        <p className="text-gray-400 text-sm mb-8 max-w-md mx-auto">
                            Recibe semanalmente artículos, guías y herramientas sobre comunicación, liderazgo y productividad con IA.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                            <input
                                type="email"
                                placeholder="tu@email.com"
                                className="flex-1 bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                            />
                            <button
                                onClick={() => setView('primeros-pasos')}
                                className="px-6 py-3 rounded-xl font-bold text-white text-sm hover:opacity-90 transition-all"
                                style={{ background: `linear-gradient(90deg, ${COLORS.maityPink}, ${COLORS.maityBlue})` }}
                            >
                                Suscribirme
                            </button>
                        </div>
                        <p className="text-[10px] text-gray-600 mt-4">Sin spam. Cancela cuando quieras.</p>
                    </div>
                </FadeIn>
            </div>
        </section>
    );
};

// --- NOSOTROS VIEW ---
const NosotrosView = ({ setView }) => {
    const values = [
        {
            title: "Humanidad Aumentada",
            description: "Ponemos la tecnología al servicio de lo más humano: el crecimiento, la emoción, la confianza.",
            icon: <Heart size={24} />,
            color: COLORS.maityPink
        },
        {
            title: "Empatía Algorítmica",
            description: "Nuestra IA entiende emociones, pero nuestra empresa prioriza la conexión humana.",
            icon: <Brain size={24} />,
            color: COLORS.maityBlue
        },
        {
            title: "Resultados Sin Excusas",
            description: "Medimos todo, porque lo que no se define no se mejora.",
            icon: <Target size={24} />,
            color: COLORS.maityGreen
        },
        {
            title: "Disrupción Con Propósito",
            description: "Innovamos para romper paradigmas, pero siempre con un impacto real en las personas.",
            icon: <Zap size={24} />,
            color: "#9b4dca"
        },
        {
            title: "Sociedad Con Talento",
            description: "No competimos contra las personas; potenciamos su grandeza.",
            icon: <Users size={24} />,
            color: "#ff8c42"
        }
    ];

    const personality = [
        { trait: "Retadora", icon: <Flame size={18} className="text-pink-500" /> },
        { trait: "Emocionalmente Inteligente", icon: <Heart size={18} className="text-blue-500" /> },
        { trait: "Visionaria", icon: <Eye size={18} className="text-green-500" /> },
        { trait: "Humana", icon: <Users size={18} className="text-yellow-500" /> }
    ];

    return (
        <div className="bg-[#050505] min-h-screen text-[#e7e7e9] pt-24 pb-12">
            {/* Hero de Misión */}
            <section className="py-24">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <FadeIn>
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-900/10 border border-blue-500/20 mb-8">
                            <Heart size={16} className="text-blue-500" />
                            <span className="text-xs font-bold text-blue-400 tracking-wider uppercase">Quiénes Somos</span>
                        </div>

                        <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-10 tracking-tighter">
                            Impulsamos la{' '}
                            <span className="text-transparent bg-clip-text" style={{ backgroundImage: `linear-gradient(to right, ${COLORS.maityPink}, ${COLORS.maityBlue})` }}>
                                evolución humana
                            </span>
                            {' '}a través de la inteligencia artificial
                        </h1>

                        <div className="max-w-3xl mx-auto mb-8 p-8 bg-[#0A0A0A] rounded-2xl border-l-4" style={{ borderLeftColor: COLORS.maityPink }}>
                            <p className="text-lg text-gray-300 leading-relaxed italic">
                                "MAITY no es solo una herramienta, es un mentor de inteligencia artificial que acompaña, desafía y mide el crecimiento real de los equipos. Combina IA emocional y técnica, gamificación y retroalimentación brutalmente honesta para convertir la capacitación en un hábito tangible y medible."
                            </p>
                        </div>

                        <p className="text-xl text-gray-400 leading-relaxed max-w-2xl mx-auto">
                            Construimos profesionales más seguros, hábiles y plenos en un mundo que cambia a velocidad exponencial.
                        </p>
                    </FadeIn>
                </div>
            </section>

            {/* Nuestra Voz */}
            <section className="py-12">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <FadeIn>
                        <p className="text-2xl md:text-3xl font-bold text-white leading-snug">
                            Somos la voz que reta, apoya y transforma.{' '}
                            <span style={{ color: COLORS.maityPink }}>Todos los días.</span>
                        </p>
                    </FadeIn>
                </div>
            </section>

            {/* 5 Valores */}
            <section className="py-24">
                <div className="max-w-6xl mx-auto px-4">
                    <FadeIn>
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Nuestros Valores</h2>
                            <p className="text-gray-400">Los principios que guían cada decisión, cada línea de código, cada interacción.</p>
                        </div>
                    </FadeIn>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        {values.slice(0, 3).map((value, i) => (
                            <FadeIn key={i} delay={i * 100}>
                                <div className="p-8 bg-[#0F0F0F] rounded-2xl border border-white/5 hover:border-white/20 transition-all h-full">
                                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6" style={{ backgroundColor: `${value.color}20` }}>
                                        <div style={{ color: value.color }}>{value.icon}</div>
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-3 uppercase tracking-wider">{value.title}</h3>
                                    <p className="text-gray-400 text-sm leading-relaxed">{value.description}</p>
                                </div>
                            </FadeIn>
                        ))}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                        {values.slice(3).map((value, i) => (
                            <FadeIn key={i + 3} delay={(i + 3) * 100}>
                                <div className="p-8 bg-[#0F0F0F] rounded-2xl border border-white/5 hover:border-white/20 transition-all h-full">
                                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6" style={{ backgroundColor: `${value.color}20` }}>
                                        <div style={{ color: value.color }}>{value.icon}</div>
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-3 uppercase tracking-wider">{value.title}</h3>
                                    <p className="text-gray-400 text-sm leading-relaxed">{value.description}</p>
                                </div>
                            </FadeIn>
                        ))}
                    </div>
                </div>
            </section>

            {/* Personalidad Strip */}
            <section className="py-16 bg-gradient-to-r from-[#0A0A0A] to-[#0F0F0F] border-y border-white/5">
                <div className="max-w-5xl mx-auto px-4 text-center">
                    <FadeIn>
                        <p className="text-sm text-gray-500 uppercase tracking-widest mb-8">Nuestra personalidad</p>
                        <div className="flex flex-wrap justify-center gap-4">
                            {personality.map((p, i) => (
                                <div key={i} className="flex items-center gap-3 px-6 py-3 bg-white/5 rounded-full border border-white/10">
                                    {p.icon}
                                    <span className="text-white font-bold text-sm">{p.trait}</span>
                                </div>
                            ))}
                        </div>
                    </FadeIn>
                </div>
            </section>

            {/* Tagline CTA */}
            <section className="py-24">
                <div className="max-w-3xl mx-auto px-4 text-center">
                    <FadeIn>
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-8 leading-tight tracking-tight">
                            MAITY no te entrena para un curso.{' '}
                            <span className="text-transparent bg-clip-text" style={{ backgroundImage: `linear-gradient(to right, ${COLORS.maityPink}, ${COLORS.maityBlue})` }}>
                                Te transforma para siempre.
                            </span>
                        </h2>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={() => setView('primeros-pasos')}
                                className="px-10 py-5 rounded-full text-white font-bold text-lg shadow-2xl hover:scale-105 transition-all"
                                style={{ backgroundColor: COLORS.maityPink }}
                            >
                                Empieza Tu Transformación
                            </button>
                            <button
                                onClick={() => setView('business')}
                                className="px-10 py-5 rounded-full border border-white/20 text-white font-bold text-lg hover:bg-white/5 transition-all"
                            >
                                Solución Empresarial
                            </button>
                        </div>
                    </FadeIn>
                </div>
            </section>
        </div>
    );
};

// 7. Footer
// --- CTA DE CIERRE ---
const PrivacyPolicyView = ({ setView }) => {
    const sections = [
        {
            title: "1. Responsable del Tratamiento",
            content: `Maity Inc. (en adelante "Maity"), con domicilio en Ciudad de México, México, es responsable del tratamiento de sus datos personales. Para cualquier consulta relacionada con la protección de sus datos puede contactarnos en: privacy@maity.com.mx`
        },
        {
            title: "2. Datos Personales que Recopilamos",
            content: `Recopilamos las siguientes categorías de datos personales:

• Datos de identificación: nombre completo, correo electrónico corporativo, cargo, empresa u organización.
• Datos de cuenta: credenciales de acceso (gestionadas mediante proveedores OAuth como Google y Microsoft), preferencias de configuración, rol dentro de la plataforma.
• Datos de uso: grabaciones de voz durante sesiones de práctica (procesadas en tiempo real y eliminadas tras el análisis), transcripciones generadas por IA, métricas de desempeño en competencias de comunicación, historial de sesiones y progreso.
• Datos técnicos: dirección IP, tipo de navegador, sistema operativo, datos de dispositivo, logs de acceso.
• Datos de facturación: procesados exclusivamente a través de proveedores de pago certificados PCI DSS. Maity no almacena datos de tarjeta de crédito.`
        },
        {
            title: "3. Finalidades del Tratamiento",
            content: `Sus datos personales son tratados para las siguientes finalidades:

Finalidades primarias (necesarias para el servicio):
• Crear y administrar su cuenta de usuario.
• Proveer el servicio de coaching de comunicación con IA, incluyendo análisis de voz, evaluación de competencias y generación de feedback personalizado.
• Generar métricas de desempeño y dashboards de progreso.
• Procesar pagos y gestionar suscripciones.
• Comunicar actualizaciones del servicio, cambios en términos o incidentes de seguridad.

Finalidades secundarias (opcionales):
• Enviar contenido educativo, newsletters y recomendaciones de uso.
• Realizar encuestas de satisfacción y mejora del producto.
• Generar estadísticas agregadas y anónimas para investigación y desarrollo.

Usted puede manifestar su negativa al tratamiento de finalidades secundarias enviando un correo a privacy@maity.com.mx.`
        },
        {
            title: "4. Procesamiento de Datos de Voz",
            content: `Maity utiliza inteligencia artificial para analizar sesiones de práctica de comunicación. Es importante que conozca nuestro proceso:

• Las grabaciones de voz se procesan en tiempo real utilizando servicios de IA de terceros (OpenAI, ElevenLabs) bajo acuerdos de procesamiento de datos.
• Arquitectura Zero-Knowledge: los fragmentos de audio se procesan y eliminan inmediatamente después del análisis. No almacenamos grabaciones de voz completas.
• Solo se conservan las transcripciones textuales y las métricas de evaluación generadas, vinculadas a su cuenta.
• Ningún dato de voz o transcripción se utiliza para entrenar modelos de IA de terceros.
• Usted puede solicitar la eliminación completa de sus transcripciones y métricas en cualquier momento.`
        },
        {
            title: "5. Transferencias de Datos",
            content: `Sus datos pueden ser transferidos a:

• Proveedores de infraestructura cloud (servidores en Estados Unidos y Unión Europea) bajo cláusulas contractuales estándar.
• Proveedores de servicios de IA (OpenAI, ElevenLabs) exclusivamente para el procesamiento en tiempo real descrito en la sección 4.
• Proveedores de pago (Stripe) para procesamiento de transacciones.
• Proveedores de autenticación (Google, Microsoft) para gestión de acceso OAuth.

No vendemos, alquilamos ni compartimos sus datos personales con terceros para fines de marketing o publicidad. Todos los proveedores están sujetos a acuerdos de procesamiento de datos (DPA) que garantizan estándares equivalentes de protección.`
        },
        {
            title: "6. Derechos ARCO y Derechos del Titular",
            content: `Usted tiene derecho a:

• Acceso: conocer qué datos personales tenemos sobre usted.
• Rectificación: solicitar la corrección de datos inexactos o incompletos.
• Cancelación: solicitar la eliminación de sus datos personales.
• Oposición: oponerse al tratamiento de sus datos para finalidades específicas.
• Portabilidad: recibir sus datos en un formato estructurado y de uso común.
• Derecho al olvido: solicitar la eliminación completa de su cuenta y todos los datos asociados.

Para ejercer estos derechos, envíe un correo a privacy@maity.com.mx con su solicitud. Responderemos en un plazo máximo de 20 días hábiles (LFPDPPP) o 30 días calendario (GDPR).

Para usuarios en la Unión Europea: puede presentar una queja ante su autoridad de protección de datos local.
Para usuarios en México: puede acudir al INAI (Instituto Nacional de Transparencia, Acceso a la Información y Protección de Datos Personales).`
        },
        {
            title: "7. Medidas de Seguridad",
            content: `Implementamos medidas de seguridad técnicas, administrativas y físicas para proteger sus datos:

• Cifrado AES-256 para datos en reposo.
• TLS 1.3 para datos en tránsito.
• Autenticación OAuth 2.0 con proveedores de identidad verificados.
• Controles de acceso basados en roles (RBAC).
• Monitoreo continuo de accesos y actividad anómala.
• Pruebas de penetración regulares por terceros independientes.
• Capacitación periódica del equipo en protección de datos.
• Plan de respuesta a incidentes con notificación en 72 horas.`
        },
        {
            title: "8. Cookies y Tecnologías de Rastreo",
            content: `Utilizamos cookies estrictamente necesarias para el funcionamiento de la plataforma:

• Cookies de sesión: para mantener su sesión activa de forma segura.
• Cookies de preferencias: para recordar su configuración de idioma y tema.

No utilizamos cookies de terceros para publicidad ni rastreo entre sitios. No participamos en redes de publicidad ni compartimos datos de navegación con terceros.`
        },
        {
            title: "9. Retención de Datos",
            content: `• Datos de cuenta activa: se conservan mientras su cuenta esté activa.
• Datos tras cancelación: se eliminan dentro de los 30 días siguientes a la cancelación de la cuenta, excepto cuando la ley exija su conservación.
• Datos de facturación: se conservan por 5 años para cumplimiento fiscal.
• Logs de seguridad: se conservan por 12 meses.
• Datos anonimizados y agregados: pueden conservarse indefinidamente para mejora del servicio.`
        },
        {
            title: "10. Legislación Aplicable",
            content: `Este aviso de privacidad se rige por:

• Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP) — México.
• Reglamento General de Protección de Datos (GDPR) — Unión Europea, para usuarios en el EEE.
• California Consumer Privacy Act (CCPA) — para residentes de California.

En caso de conflicto entre jurisdicciones, se aplicará la normativa que ofrezca mayor protección al titular de los datos.`
        },
        {
            title: "11. Cambios al Aviso de Privacidad",
            content: `Maity se reserva el derecho de modificar este aviso de privacidad. Cualquier cambio material será notificado a través de:

• Correo electrónico a la dirección registrada en su cuenta.
• Aviso destacado en la plataforma durante 30 días.

La fecha de última actualización se indica al final de este documento.`
        },
        {
            title: "12. Contacto",
            content: `Para consultas, solicitudes o quejas relacionadas con la protección de sus datos personales:

Correo electrónico: privacy@maity.com.mx
Responsable de Protección de Datos: Maity Inc., Ciudad de México, México.`
        }
    ];

    return (
        <section className="min-h-screen pt-32 pb-24 bg-[#050505]">
            <div className="max-w-4xl mx-auto px-4">
                <FadeIn>
                    <button onClick={() => setView('product')} className="text-sm text-gray-500 hover:text-white transition-colors mb-8 flex items-center gap-2">
                        <ArrowRight size={14} className="rotate-180" /> Volver al inicio
                    </button>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                            <Shield size={20} className="text-blue-500" />
                        </div>
                        <span className="text-sm font-bold text-blue-500 uppercase tracking-widest">Aviso de Privacidad</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">Aviso de Privacidad</h1>
                    <p className="text-gray-500 text-sm mb-2">Última actualización: 29 de enero de 2026</p>
                    <p className="text-gray-400 mb-12 leading-relaxed">
                        En Maity, la protección de tus datos personales es una prioridad. Este aviso describe cómo recopilamos, usamos, protegemos y compartimos tu información.
                    </p>
                </FadeIn>

                <div className="space-y-10">
                    {sections.map((s, i) => (
                        <FadeIn key={i} delay={i * 50}>
                            <div className="bg-[#0F0F0F] rounded-2xl border border-white/5 p-8">
                                <h2 className="text-lg font-bold text-white mb-4">{s.title}</h2>
                                <div className="text-sm text-gray-400 leading-relaxed whitespace-pre-line">{s.content}</div>
                            </div>
                        </FadeIn>
                    ))}
                </div>

                <FadeIn delay={200}>
                    <div className="mt-16 p-8 bg-[#0F0F0F] rounded-2xl border border-white/5 text-center">
                        <p className="text-gray-400 text-sm mb-4">¿Tienes preguntas sobre tus datos?</p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button onClick={() => setView('demo-calendar')} className="px-6 py-3 rounded-xl font-bold text-white text-sm hover:opacity-90 transition-all" style={{ background: `linear-gradient(90deg, ${COLORS.maityPink}, ${COLORS.maityBlue})` }}>
                                Contactar al equipo de privacidad
                            </button>
                            <button onClick={() => setView('seguridad')} className="px-6 py-3 rounded-xl font-bold text-white text-sm border border-white/10 hover:bg-white/5 transition-all">
                                Ver seguridad técnica
                            </button>
                        </div>
                    </div>
                </FadeIn>
            </div>
        </section>
    );
};

const TermsOfServiceView = ({ setView }) => {
    const sections = [
        {
            title: "1. Definiciones",
            content: `• "Maity" o "la Plataforma": se refiere al servicio de coaching de comunicación con inteligencia artificial operado por Maity Inc.
• "Usuario": toda persona física que accede y utiliza la Plataforma, ya sea en modalidad gratuita o de pago.
• "Cuenta": el perfil personal creado por el Usuario para acceder a los servicios de Maity.
• "Contenido del Usuario": toda información, grabaciones de voz, transcripciones y datos generados por el Usuario al utilizar la Plataforma.
• "Servicios": el conjunto de funcionalidades ofrecidas por Maity, incluyendo práctica de comunicación con IA, análisis de desempeño, dashboard de progreso y recursos educativos.
• "Suscripción": el plan de pago contratado por el Usuario para acceder a funcionalidades premium.`
        },
        {
            title: "2. Aceptación de los Términos",
            content: `Al crear una cuenta o utilizar cualquier servicio de Maity, usted acepta estos Términos de Servicio en su totalidad. Si no está de acuerdo con alguno de estos términos, no debe utilizar la Plataforma.

Maity se reserva el derecho de modificar estos términos. Los cambios materiales serán notificados con al menos 30 días de anticipación por correo electrónico. El uso continuado de la Plataforma después de la notificación constituye la aceptación de los términos modificados.`
        },
        {
            title: "3. Registro y Cuenta de Usuario",
            content: `• Para usar Maity debe crear una cuenta utilizando autenticación de Google o Microsoft (OAuth 2.0).
• Usted es responsable de mantener la confidencialidad de su cuenta y de todas las actividades realizadas bajo ella.
• Debe proporcionar información veraz y actualizada.
• Cada persona puede tener una sola cuenta. Las cuentas son personales e intransferibles.
• Los usuarios deben tener al menos 18 años de edad o contar con el consentimiento de un tutor legal.
• Maity se reserva el derecho de suspender o cancelar cuentas que violen estos términos.`
        },
        {
            title: "4. Descripción del Servicio",
            content: `Maity provee una plataforma de entrenamiento de habilidades de comunicación impulsada por inteligencia artificial que incluye:

• Sesiones de práctica interactivas con agentes de IA que simulan escenarios de comunicación profesional.
• Análisis de voz en tiempo real con evaluación de competencias como claridad, empatía, persuasión y estructura.
• Dashboard de progreso con métricas de evolución personal.
• Sistema de niveles y reconocimientos para motivar la práctica continua.
• Recursos educativos complementarios.

Para cuentas empresariales, funcionalidades adicionales incluyen dashboards de equipo, escenarios personalizados, integraciones y reportes de análisis.

Los servicios de IA se proporcionan "tal como están" y las evaluaciones generadas son orientativas, no sustituyen el juicio profesional humano.`
        },
        {
            title: "5. Planes y Pagos",
            content: `Maity ofrece los siguientes tipos de planes:

Planes individuales:
• Maity Free: acceso limitado sin costo.
• Maity Pro: suscripción mensual o anual con funcionalidades completas.

Planes empresariales:
• Starter, Growth y Enterprise con precios según el número de usuarios y funcionalidades requeridas.

Condiciones de pago:
• Los pagos se procesan a través de Stripe. Maity no almacena datos de tarjeta de crédito.
• Las suscripciones se renuevan automáticamente al final de cada período.
• Los precios pueden cambiar con aviso previo de 30 días. Los cambios no afectan períodos ya pagados.
• No hay reembolsos por períodos parciales, excepto donde la ley aplicable lo requiera.

Cancelación:
• Puede cancelar su suscripción en cualquier momento desde su cuenta.
• La cancelación es efectiva al final del período de facturación actual.
• Tras la cancelación, su cuenta revierte al plan gratuito.`
        },
        {
            title: "6. Propiedad Intelectual",
            content: `Propiedad de Maity:
• La plataforma, su diseño, código fuente, algoritmos, modelos de IA, marcas, logotipos y todo el contenido original son propiedad exclusiva de Maity Inc.
• Queda prohibida la reproducción, distribución o modificación sin autorización expresa.

Contenido del Usuario:
• Usted conserva todos los derechos sobre el contenido que genera al usar la Plataforma.
• Al usar Maity, otorga una licencia limitada, no exclusiva y revocable para procesar su contenido con el único fin de proveer los servicios contratados.
• Maity no utiliza el contenido del usuario para entrenar modelos de IA ni para ningún fin distinto a la prestación del servicio.`
        },
        {
            title: "7. Uso Aceptable",
            content: `Al usar Maity, usted se compromete a:

• Utilizar la Plataforma únicamente para fines de desarrollo profesional legítimo.
• No intentar acceder a áreas restringidas del sistema ni a cuentas de otros usuarios.
• No realizar ingeniería inversa, descompilar o intentar extraer el código fuente.
• No utilizar la Plataforma para generar contenido ilegal, difamatorio, discriminatorio o que infrinja derechos de terceros.
• No usar bots, scrapers ni herramientas automatizadas para acceder al servicio.
• No sobrecargar intencionalmente los servidores ni realizar ataques de denegación de servicio.
• Respetar la propiedad intelectual de Maity y de terceros.

El incumplimiento de estas condiciones puede resultar en la suspensión o terminación inmediata de su cuenta.`
        },
        {
            title: "8. Privacidad y Protección de Datos",
            content: `El tratamiento de sus datos personales se rige por nuestro Aviso de Privacidad, disponible en la sección de Privacidad de la plataforma.

Aspectos clave:
• Las grabaciones de voz se procesan en tiempo real y se eliminan inmediatamente (arquitectura Zero-Knowledge).
• Solo se conservan transcripciones y métricas de evaluación.
• Cifrado AES-256 para datos en reposo y TLS 1.3 en tránsito.
• Cumplimiento con LFPDPPP (México), GDPR (UE) y CCPA (California).
• Puede solicitar la eliminación completa de sus datos en cualquier momento.`
        },
        {
            title: "9. Limitación de Responsabilidad",
            content: `• Maity se provee "tal como está" y "según disponibilidad". No garantizamos que el servicio sea ininterrumpido ni libre de errores.
• Las evaluaciones de IA son herramientas de apoyo y no sustituyen el diagnóstico o consejo profesional.
• Maity no será responsable por daños indirectos, incidentales, especiales o consecuentes derivados del uso o imposibilidad de uso de la Plataforma.
• La responsabilidad total de Maity no excederá el monto pagado por el Usuario en los 12 meses anteriores al evento que origina la reclamación.
• Estas limitaciones se aplican en la máxima medida permitida por la legislación aplicable.`
        },
        {
            title: "10. Disponibilidad del Servicio",
            content: `• Maity se esfuerza por mantener una disponibilidad del 99.9% (SLA para planes Enterprise).
• Pueden ocurrir interrupciones planificadas para mantenimiento, notificadas con al menos 48 horas de anticipación.
• Maity no es responsable por interrupciones causadas por factores fuera de su control (fuerza mayor, fallos de proveedores de infraestructura, desastres naturales).`
        },
        {
            title: "11. Terminación",
            content: `Terminación por el Usuario:
• Puede eliminar su cuenta en cualquier momento desde la configuración de su perfil o contactando a soporte.
• Al eliminar su cuenta, todos sus datos serán eliminados permanentemente dentro de los 30 días siguientes.

Terminación por Maity:
• Maity puede suspender o terminar cuentas que violen estos términos o el uso aceptable.
• En caso de terminación por violación, no se realizarán reembolsos.
• Maity notificará al usuario y proporcionará un plazo razonable para descargar sus datos, excepto en casos de violaciones graves.`
        },
        {
            title: "12. Resolución de Disputas",
            content: `• Cualquier controversia será resuelta preferentemente mediante negociación directa.
• Si no se alcanza un acuerdo en 30 días, las partes podrán acudir a mediación.
• Como última instancia, las disputas se someterán a los tribunales competentes de la Ciudad de México, México.
• Para usuarios de la Unión Europea: nada en estos términos limita su derecho a acudir a los tribunales de su jurisdicción o a la plataforma de resolución de disputas en línea de la UE.`
        },
        {
            title: "13. Legislación Aplicable",
            content: `Estos Términos de Servicio se rigen por las leyes de los Estados Unidos Mexicanos, sin perjuicio de las disposiciones imperativas de protección al consumidor aplicables en la jurisdicción del Usuario.`
        },
        {
            title: "14. Contacto",
            content: `Para consultas sobre estos Términos de Servicio:

Correo electrónico: legal@maity.com.mx
Soporte general: soporte@maity.com.mx
Maity Inc., Ciudad de México, México.`
        }
    ];

    return (
        <section className="min-h-screen pt-32 pb-24 bg-[#050505]">
            <div className="max-w-4xl mx-auto px-4">
                <FadeIn>
                    <button onClick={() => setView('product')} className="text-sm text-gray-500 hover:text-white transition-colors mb-8 flex items-center gap-2">
                        <ArrowRight size={14} className="rotate-180" /> Volver al inicio
                    </button>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center">
                            <Scale size={20} className="text-pink-500" />
                        </div>
                        <span className="text-sm font-bold text-pink-500 uppercase tracking-widest">Documento Legal</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">Términos de Servicio</h1>
                    <p className="text-gray-500 text-sm mb-2">Última actualización: 29 de enero de 2026</p>
                    <p className="text-gray-400 mb-12 leading-relaxed">
                        Estos términos regulan el uso de la plataforma Maity. Al utilizar nuestros servicios, aceptas las condiciones aquí descritas.
                    </p>
                </FadeIn>

                <div className="space-y-10">
                    {sections.map((s, i) => (
                        <FadeIn key={i} delay={i * 50}>
                            <div className="bg-[#0F0F0F] rounded-2xl border border-white/5 p-8">
                                <h2 className="text-lg font-bold text-white mb-4">{s.title}</h2>
                                <div className="text-sm text-gray-400 leading-relaxed whitespace-pre-line">{s.content}</div>
                            </div>
                        </FadeIn>
                    ))}
                </div>

                <FadeIn delay={200}>
                    <div className="mt-16 flex flex-col sm:flex-row gap-4 justify-center">
                        <button onClick={() => setView('privacidad')} className="px-6 py-3 rounded-xl font-bold text-white text-sm border border-white/10 hover:bg-white/5 transition-all flex items-center gap-2 justify-center">
                            <Shield size={16} /> Ver Aviso de Privacidad
                        </button>
                        <button onClick={() => setView('seguridad')} className="px-6 py-3 rounded-xl font-bold text-white text-sm border border-white/10 hover:bg-white/5 transition-all flex items-center gap-2 justify-center">
                            <Lock size={16} /> Ver Seguridad Técnica
                        </button>
                    </div>
                </FadeIn>
            </div>
        </section>
    );
};

const CareersView = ({ setView }) => {
    const values = [
        { icon: <Rocket size={24} />, title: "Misión con propósito", desc: "Trabajamos para que millones de personas mejoren cómo se comunican. Cada línea de código, cada diseño, cada decisión impacta vidas reales." },
        { icon: <Brain size={24} />, title: "IA + Humanidad", desc: "Combinamos lo mejor de la inteligencia artificial con la comprensión profunda del comportamiento humano. No somos solo tech." },
        { icon: <Users size={24} />, title: "Equipo diverso y remoto", desc: "Operamos desde México, LATAM y el mundo. Valoramos perspectivas diversas y trabajo asíncrono con comunicación clara." },
        { icon: <TrendingUp size={24} />, title: "Crecimiento real", desc: "Startup en etapa temprana con tracción real. Tu trabajo tiene impacto directo y visible desde el día uno." },
    ];

    const openings = [
        { role: "Senior Frontend Engineer", area: "Ingeniería", type: "Remoto", tags: ["React", "TypeScript", "Three.js"] },
        { role: "AI/ML Engineer", area: "Inteligencia Artificial", type: "Remoto", tags: ["Python", "NLP", "LLMs"] },
        { role: "Product Designer", area: "Diseño", type: "Remoto", tags: ["Figma", "UX Research", "Design Systems"] },
        { role: "Content Strategist", area: "Marketing", type: "Remoto", tags: ["Copywriting", "SEO", "Educación"] },
        { role: "Customer Success Manager", area: "Operaciones", type: "Remoto (LATAM)", tags: ["B2B SaaS", "Onboarding", "Español/Inglés"] },
    ];

    return (
        <section className="min-h-screen pt-32 pb-24 bg-[#050505] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-pink-500/5 rounded-full blur-[150px]"></div>
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[150px]"></div>

            <div className="max-w-5xl mx-auto px-4 relative z-10">
                {/* Header */}
                <FadeIn>
                    <button onClick={() => setView('product')} className="text-sm text-gray-500 hover:text-white transition-colors mb-8 flex items-center gap-2">
                        <ArrowRight size={14} className="rotate-180" /> Volver al inicio
                    </button>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center">
                            <Briefcase size={20} className="text-pink-500" />
                        </div>
                        <span className="text-sm font-bold text-pink-500 uppercase tracking-widest">Únete al equipo</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
                        Construye el futuro de la <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-blue-500">comunicación humana</span>
                    </h1>
                    <p className="text-xl text-gray-400 leading-relaxed max-w-3xl mb-16">
                        Maity está transformando cómo las personas desarrollan sus habilidades de comunicación con IA. Buscamos personas apasionadas que quieran hacer una diferencia real.
                    </p>
                </FadeIn>

                {/* Values */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20">
                    {values.map((v, i) => (
                        <FadeIn key={i} delay={i * 100}>
                            <div className="p-6 bg-[#0F0F0F] rounded-2xl border border-white/5 hover:border-white/10 transition-all">
                                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-pink-500 mb-4">{v.icon}</div>
                                <h3 className="font-bold text-white text-lg mb-2">{v.title}</h3>
                                <p className="text-sm text-gray-500 leading-relaxed">{v.desc}</p>
                            </div>
                        </FadeIn>
                    ))}
                </div>

                {/* Benefits */}
                <FadeIn delay={200}>
                    <div className="p-8 bg-gradient-to-br from-[#0F0F0F] to-[#1A1A1A] rounded-3xl border border-white/5 mb-20">
                        <h2 className="text-2xl font-bold text-white mb-8">Lo que ofrecemos</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {[
                                { icon: <Globe size={20} />, label: "100% Remoto" },
                                { icon: <Calendar size={20} />, label: "Horario flexible" },
                                { icon: <Heart size={20} />, label: "Salud y bienestar" },
                                { icon: <Award size={20} />, label: "Equity" },
                                { icon: <BookOpen size={20} />, label: "Presupuesto de aprendizaje" },
                                { icon: <Laptop size={20} />, label: "Equipo de trabajo" },
                                { icon: <Smartphone size={20} />, label: "Acceso completo a Maity" },
                                { icon: <Star size={20} />, label: "Vacaciones flexibles" },
                            ].map((b, i) => (
                                <div key={i} className="flex items-center gap-3 text-sm">
                                    <div className="text-blue-500">{b.icon}</div>
                                    <span className="text-gray-300">{b.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </FadeIn>

                {/* Open Positions */}
                <FadeIn delay={300}>
                    <h2 className="text-3xl font-bold text-white mb-2">Posiciones abiertas</h2>
                    <p className="text-gray-500 text-sm mb-8">Todas nuestras posiciones son remotas. Aplica desde cualquier lugar.</p>
                </FadeIn>

                <div className="space-y-4 mb-16">
                    {openings.map((job, i) => (
                        <FadeIn key={i} delay={300 + i * 80}>
                            <a
                                href={`mailto:careers@maity.com.mx?subject=Aplicación: ${job.role}`}
                                className="block p-6 bg-[#0F0F0F] rounded-2xl border border-white/5 hover:border-pink-500/30 transition-all group"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div>
                                        <h3 className="font-bold text-white text-lg group-hover:text-pink-400 transition-colors">{job.role}</h3>
                                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                                            <span>{job.area}</span>
                                            <span className="w-1 h-1 rounded-full bg-gray-700"></span>
                                            <span>{job.type}</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {job.tags.map((tag, j) => (
                                                <span key={j} className="px-2 py-0.5 bg-white/5 text-[10px] font-bold text-gray-400 rounded-full border border-white/5">{tag}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm font-bold text-pink-500 group-hover:gap-4 transition-all shrink-0">
                                        Aplicar <ArrowRight size={16} />
                                    </div>
                                </div>
                            </a>
                        </FadeIn>
                    ))}
                </div>

                {/* Open Application */}
                <FadeIn delay={500}>
                    <div className="text-center p-10 bg-[#0F0F0F] rounded-3xl border border-white/5">
                        <h3 className="text-xl font-bold text-white mb-3">¿No ves tu rol ideal?</h3>
                        <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">
                            Siempre estamos buscando talento excepcional. Envíanos tu CV y cuéntanos cómo quieres contribuir.
                        </p>
                        <a
                            href="mailto:careers@maity.com.mx?subject=Aplicación espontánea"
                            className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-white hover:opacity-90 transition-all"
                            style={{ background: `linear-gradient(90deg, ${COLORS.maityPink}, ${COLORS.maityBlue})` }}
                        >
                            <Mail size={18} /> Enviar aplicación espontánea
                        </a>
                    </div>
                </FadeIn>
            </div>
        </section>
    );
};

const SoporteView = ({ setView }) => {
    const faqs = [
        { q: "¿Cómo empiezo a usar Maity?", a: "Regístrate gratis con tu cuenta de Google o Microsoft. En menos de 5 minutos tendrás acceso a tu primera sesión de práctica con el coach de IA." },
        { q: "¿Mis grabaciones de voz se almacenan?", a: "No. Utilizamos una arquitectura Zero-Knowledge: el audio se procesa en tiempo real y se elimina inmediatamente. Solo conservamos la transcripción textual y las métricas de evaluación." },
        { q: "¿Puedo cancelar mi suscripción en cualquier momento?", a: "Sí. Puedes cancelar desde tu cuenta sin penalización. La cancelación es efectiva al final del período de facturación actual y tu cuenta revierte al plan gratuito." },
        { q: "¿Cómo funciona la evaluación de IA?", a: "Después de cada sesión de práctica, nuestro sistema analiza tu comunicación en múltiples competencias (claridad, empatía, persuasión, estructura) y te da feedback específico y accionable." },
        { q: "¿Maity funciona para equipos?", a: "Sí. Ofrecemos planes empresariales con dashboards de equipo, escenarios personalizados, integraciones y reportes de análisis. Solicita una demo para conocer más." },
        { q: "¿En qué idiomas funciona Maity?", a: "Actualmente Maity funciona en español e inglés. Estamos trabajando en agregar más idiomas próximamente." },
        { q: "¿Qué pasa con mis datos si elimino mi cuenta?", a: "Todos tus datos personales, transcripciones y métricas se eliminan permanentemente dentro de los 30 días siguientes a la eliminación de tu cuenta." },
        { q: "¿Maity reemplaza a un coach humano?", a: "Maity complementa el desarrollo profesional. Es una herramienta de práctica diaria que permite iterar mucho más rápido que con sesiones presenciales, pero no sustituye el criterio profesional humano cuando es necesario." },
    ];

    const [openFaq, setOpenFaq] = useState(null);

    const channels = [
        { icon: <Mail size={24} />, title: "Email", desc: "Respuesta en menos de 24 horas", action: "soporte@maity.com.mx", href: "mailto:soporte@maity.com.mx", color: "text-blue-500" },
        { icon: <Calendar size={24} />, title: "Videollamada", desc: "Agenda una sesión de soporte 1:1", action: "Agendar llamada", onClick: () => setView('demo-calendar'), color: "text-pink-500" },
        { icon: <MessageSquare size={24} />, title: "Chat en vivo", desc: "Disponible L-V, 9am - 6pm (CST)", action: "Próximamente", href: null, color: "text-green-500" },
    ];

    return (
        <section className="min-h-screen pt-32 pb-24 bg-[#050505] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[150px]"></div>

            <div className="max-w-5xl mx-auto px-4 relative z-10">
                {/* Header */}
                <FadeIn>
                    <button onClick={() => setView('product')} className="text-sm text-gray-500 hover:text-white transition-colors mb-8 flex items-center gap-2">
                        <ArrowRight size={14} className="rotate-180" /> Volver al inicio
                    </button>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                            <Headphones size={20} className="text-blue-500" />
                        </div>
                        <span className="text-sm font-bold text-blue-500 uppercase tracking-widest">Centro de Ayuda</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
                        ¿Cómo podemos <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">ayudarte</span>?
                    </h1>
                    <p className="text-xl text-gray-400 leading-relaxed max-w-3xl mb-16">
                        Encuentra respuestas rápidas o contacta a nuestro equipo. Estamos aquí para que tu experiencia con Maity sea excepcional.
                    </p>
                </FadeIn>

                {/* Contact Channels */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
                    {channels.map((ch, i) => (
                        <FadeIn key={i} delay={i * 100}>
                            <div className="p-6 bg-[#0F0F0F] rounded-2xl border border-white/5 hover:border-white/10 transition-all text-center">
                                <div className={`w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4 ${ch.color}`}>{ch.icon}</div>
                                <h3 className="font-bold text-white text-lg mb-1">{ch.title}</h3>
                                <p className="text-xs text-gray-500 mb-4">{ch.desc}</p>
                                {ch.href ? (
                                    <a href={ch.href} className={`text-sm font-bold ${ch.color} hover:opacity-80 transition-all`}>{ch.action}</a>
                                ) : ch.onClick ? (
                                    <button onClick={ch.onClick} className={`text-sm font-bold ${ch.color} hover:opacity-80 transition-all`}>{ch.action}</button>
                                ) : (
                                    <span className="text-sm font-bold text-gray-600">{ch.action}</span>
                                )}
                            </div>
                        </FadeIn>
                    ))}
                </div>

                {/* Quick Links */}
                <FadeIn delay={200}>
                    <h2 className="text-2xl font-bold text-white mb-6">Acceso rápido</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-20">
                        {[
                            { icon: <BookOpen size={18} />, label: "Guía de inicio", view: 'resources' },
                            { icon: <Shield size={18} />, label: "Seguridad y datos", view: 'seguridad' },
                            { icon: <FileText size={18} />, label: "Aviso de privacidad", view: 'privacidad' },
                            { icon: <Scale size={18} />, label: "Términos de servicio", view: 'terminos' },
                        ].map((link, i) => (
                            <button
                                key={i}
                                onClick={() => setView(link.view)}
                                className="flex items-center gap-3 p-4 bg-[#0F0F0F] rounded-xl border border-white/5 hover:border-blue-500/30 transition-all text-left group"
                            >
                                <div className="text-blue-500">{link.icon}</div>
                                <span className="text-sm text-gray-300 group-hover:text-white transition-colors">{link.label}</span>
                                <ArrowRight size={14} className="text-gray-700 group-hover:text-blue-500 ml-auto transition-colors" />
                            </button>
                        ))}
                    </div>
                </FadeIn>

                {/* FAQ */}
                <FadeIn delay={300}>
                    <h2 className="text-2xl font-bold text-white mb-2">Preguntas frecuentes</h2>
                    <p className="text-gray-500 text-sm mb-8">Las respuestas a las dudas más comunes sobre Maity.</p>
                </FadeIn>

                <div className="space-y-3 mb-16">
                    {faqs.map((faq, i) => (
                        <FadeIn key={i} delay={300 + i * 50}>
                            <div className="bg-[#0F0F0F] rounded-2xl border border-white/5 overflow-hidden">
                                <button
                                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                    className="w-full p-6 flex items-center justify-between text-left"
                                >
                                    <span className="font-bold text-white text-sm pr-4">{faq.q}</span>
                                    <div className={`text-gray-500 shrink-0 transition-transform duration-300 ${openFaq === i ? 'rotate-45' : ''}`}>
                                        <Plus size={18} />
                                    </div>
                                </button>
                                {openFaq === i && (
                                    <div className="px-6 pb-6">
                                        <p className="text-sm text-gray-400 leading-relaxed">{faq.a}</p>
                                    </div>
                                )}
                            </div>
                        </FadeIn>
                    ))}
                </div>

                {/* Still need help */}
                <FadeIn delay={500}>
                    <div className="text-center p-10 bg-gradient-to-br from-[#0F0F0F] to-[#1A1A1A] rounded-3xl border border-white/5">
                        <HelpCircle size={32} className="text-blue-500 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-3">¿Necesitas más ayuda?</h3>
                        <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">
                            Nuestro equipo está listo para resolver cualquier duda. Respuesta garantizada en menos de 24 horas.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a
                                href="mailto:soporte@maity.com.mx"
                                className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-white hover:opacity-90 transition-all"
                                style={{ background: `linear-gradient(90deg, ${COLORS.maityBlue}, ${COLORS.maityGreen})` }}
                            >
                                <Mail size={18} /> Escribir a soporte
                            </a>
                            <button
                                onClick={() => setView('demo-calendar')}
                                className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-white border border-white/10 hover:bg-white/5 transition-all"
                            >
                                <Calendar size={18} /> Agendar videollamada
                            </button>
                        </div>
                    </div>
                </FadeIn>
            </div>
        </section>
    );
};

const CommunityPartnerSection = ({ setView }) => {
    const tracks = [
        {
            icon: <Mic size={28} />,
            title: "Coach Certificado Maity",
            desc: "Usa Maity como tu herramienta principal de coaching. Ofrece entrenamiento de comunicación a tus clientes con tecnología de IA y gana una comisión recurrente por cada membresía activa.",
            benefits: ["Comisión recurrente por membresía", "Panel de seguimiento de clientes", "Material de marca compartida", "Soporte prioritario"],
            cta: "Aplicar como Coach",
            color: COLORS.maityPink,
            accent: "pink"
        },
        {
            icon: <Users size={28} />,
            title: "Referenciador",
            desc: "Recomienda Maity a empresas y profesionales. Por cada venta que generes, recibes un porcentaje de la suscripción mientras el cliente se mantenga activo. Sin inversión, sin riesgo.",
            benefits: ["Ingreso pasivo recurrente", "Link de referido personalizado", "Dashboard de conversiones", "Sin mínimos ni exclusividad"],
            cta: "Unirme al Programa",
            color: COLORS.maityBlue,
            accent: "blue"
        },
        {
            icon: <Briefcase size={28} />,
            title: "Socio o Inversionista",
            desc: "Maity está en pleno crecimiento. Buscamos socios estratégicos e inversionistas que crean en el futuro del desarrollo humano potenciado por IA.",
            benefits: ["Acceso a métricas de tracción", "Reunión directa con founders", "Oportunidad de equity", "Impacto en millones de profesionales"],
            cta: "Agendar Conversación",
            color: COLORS.maityGreen,
            accent: "green"
        },
    ];

    return (
        <section className="py-24 bg-[#050505] relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-pink-500/5 rounded-full blur-[150px]"></div>

            <div className="max-w-6xl mx-auto px-4 relative z-10">
                <FadeIn>
                    <div className="text-center mb-16">
                        <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full text-xs font-bold text-gray-400 border border-white/10 mb-6">
                            <Rocket size={14} className="text-pink-500" /> Oportunidad de crecimiento
                        </span>
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
                            Crece con <span className="text-transparent bg-clip-text bg-gradient-to-r" style={{ backgroundImage: `linear-gradient(90deg, ${COLORS.maityPink}, ${COLORS.maityBlue})` }}>Maity</span>
                        </h2>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                            No solo uses Maity. Sé parte de la revolución. Gana dinero ayudando a otros a comunicarse mejor.
                        </p>
                    </div>
                </FadeIn>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    {tracks.map((track, i) => (
                        <FadeIn key={i} delay={i * 120}>
                            <div className="bg-[#0F0F0F] rounded-3xl border border-white/5 p-8 hover:border-white/10 transition-all flex flex-col h-full group">
                                <div className={`w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-6 text-${track.accent}-500`}>
                                    {track.icon}
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">{track.title}</h3>
                                <p className="text-sm text-gray-500 leading-relaxed mb-6 flex-grow">{track.desc}</p>
                                <ul className="space-y-3 mb-8">
                                    {track.benefits.map((b, j) => (
                                        <li key={j} className="flex items-center gap-3 text-sm text-gray-400">
                                            <Check size={14} className={`text-${track.accent}-500 shrink-0`} />
                                            {b}
                                        </li>
                                    ))}
                                </ul>
                                <button
                                    onClick={() => setView('demo-calendar')}
                                    className="w-full py-4 rounded-xl font-bold text-white hover:opacity-90 transition-all"
                                    style={{ backgroundColor: track.color }}
                                >
                                    {track.cta}
                                </button>
                            </div>
                        </FadeIn>
                    ))}
                </div>

                <FadeIn delay={400}>
                    <div className="bg-gradient-to-r from-[#0F0F0F] to-[#1A1A1A] rounded-3xl border border-white/5 p-10 text-center">
                        <div className="flex flex-wrap justify-center gap-8 mb-8">
                            {[
                                { value: "30%", label: "Comisión por referido" },
                                { value: "Recurrente", label: "Mientras el cliente siga activo" },
                                { value: "$0", label: "Inversión para empezar" },
                                { value: "24h", label: "Aprobación de aplicación" },
                            ].map((stat, i) => (
                                <div key={i} className="text-center">
                                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                                    <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
                                </div>
                            ))}
                        </div>
                        <p className="text-gray-400 text-sm mb-6 max-w-xl mx-auto">
                            Ya sea como coach, asesor, capacitador, referenciador o inversionista — hay un lugar para ti en el ecosistema Maity.
                        </p>
                        <button
                            onClick={() => setView('demo-calendar')}
                            className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-white hover:opacity-90 transition-all"
                            style={{ background: `linear-gradient(90deg, ${COLORS.maityPink}, ${COLORS.maityBlue})` }}
                        >
                            <UserPlus size={18} /> Quiero ser parte
                        </button>
                    </div>
                </FadeIn>
            </div>
        </section>
    );
};

const CTACierre = ({ setView }) => (
    <section className="py-24 bg-gradient-to-b from-[#050505] to-black relative overflow-hidden">
        <div className="absolute inset-0">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10 blur-[150px]" style={{ backgroundColor: COLORS.maityPink }}></div>
        </div>
        <div className="max-w-3xl mx-auto px-4 text-center relative z-10">
            <FadeIn>
                <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
                    Empieza a evolucionar hoy.
                </h2>
                <p className="text-xl text-gray-400 mb-10 leading-relaxed">
                    7 días gratis. Sin compromiso. Con resultados desde la primera semana.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={() => setView('primeros-pasos')}
                        className="px-10 py-5 rounded-full text-white font-bold text-lg shadow-2xl hover:scale-105 transition-all"
                        style={{ backgroundColor: COLORS.maityPink }}
                    >
                        Probar Maity Gratis
                    </button>
                    <button
                        onClick={() => setView('demo-calendar')}
                        className="px-10 py-5 rounded-full border border-white/20 text-white font-bold text-lg hover:bg-white/5 transition-all"
                    >
                        Hablar con ventas
                    </button>
                </div>
            </FadeIn>
        </div>
    </section>
);

const Footer = ({ setView }) => {
    const handleScrollTo = (viewId, sectionId) => {
        setView(viewId);
        setTimeout(() => {
            document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
        }, 200);
    };

    return (
        <footer className="bg-black text-white pt-20 pb-10 border-t border-white/10">
            <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12">
                <div>
                    <span onClick={() => setView('product')} className="text-2xl font-bold tracking-tighter block mb-6 cursor-pointer">maity<span className="text-pink-500">.</span></span>
                    <p className="text-sm text-gray-500 leading-relaxed">
                        Transformando el aprendizaje en evolución diaria a través de IA ética y humana.
                    </p>
                </div>
                <div>
                    <h4 className="font-bold mb-6 text-gray-200">Producto</h4>
                    <ul className="space-y-3 text-sm text-gray-500">
                        <li onClick={() => setView('primeros-pasos')} className="hover:text-pink-500 cursor-pointer transition-colors">Dashboard</li>
                        <li onClick={() => setView('primeros-pasos')} className="hover:text-pink-500 cursor-pointer transition-colors">App Windows</li>
                        <li onClick={() => setView('primeros-pasos')} className="hover:text-pink-500 cursor-pointer transition-colors">App Móvil</li>
                        <li onClick={() => handleScrollTo('product', 'la-escalada')} className="hover:text-pink-500 cursor-pointer transition-colors">La Escalada</li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold mb-6 text-gray-200">Empresa</h4>
                    <ul className="space-y-3 text-sm text-gray-500">
                        <li onClick={() => setView('nosotros')} className="hover:text-blue-500 cursor-pointer transition-colors">Nosotros</li>
                        <li onClick={() => setView('seguridad')} className="hover:text-blue-500 cursor-pointer transition-colors">Seguridad</li>
                        <li onClick={() => setView('demo-calendar')} className="hover:text-blue-500 cursor-pointer transition-colors">Contacto</li>
                        <li className="hover:text-blue-500 cursor-pointer transition-colors">
                            <span onClick={() => setView('careers')} className="cursor-pointer">Trabaja con nosotros</span>
                        </li>
                        <li onClick={() => setView('comunidad')} className="hover:text-blue-500 cursor-pointer transition-colors">Sé Partner</li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold mb-6 text-gray-200">Recursos</h4>
                    <ul className="space-y-3 text-sm text-gray-500">
                        <li onClick={() => setView('resources')} className="hover:text-gray-300 cursor-pointer transition-colors">Blog</li>
                        <li onClick={() => setView('resources')} className="hover:text-gray-300 cursor-pointer transition-colors">Guías</li>
                        <li onClick={() => setView('corporate-quiz')} className="hover:text-gray-300 cursor-pointer transition-colors">Quiz Corporativo</li>
                        <li onClick={() => handleScrollTo('product', 'faq-section')} className="hover:text-gray-300 cursor-pointer transition-colors">FAQs</li>
                        <li onClick={() => setView('soporte')} className="hover:text-gray-300 cursor-pointer transition-colors">Soporte</li>
                    </ul>
                </div>
            </div>
            <div className="max-w-7xl mx-auto px-4 mt-16 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-600">
                <p>© 2026 Maity Inc.</p>
                <div className="flex gap-4">
                    <span onClick={() => setView('privacidad')} className="hover:text-gray-400 cursor-pointer transition-colors">Privacidad</span>
                    <span onClick={() => setView('terminos')} className="hover:text-gray-400 cursor-pointer transition-colors">Términos</span>
                </div>
                <div className="flex gap-4">
                    <a href="https://twitter.com/maityai" target="_blank" rel="noopener noreferrer" className="hover:text-gray-400 cursor-pointer transition-colors">Twitter</a>
                    <a href="https://linkedin.com/company/maity" target="_blank" rel="noopener noreferrer" className="hover:text-gray-400 cursor-pointer transition-colors">LinkedIn</a>
                </div>
            </div>
        </footer>
    );
};

// --- HOW IT WORKS (5 STEPS) ---
const HowItWorksSection = () => {
    return (
        <section id="como-funciona" className="py-24 bg-[#0A0A0A] border-y border-white/5">
            <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-16">
                    <FadeIn>
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Tu Escalada en 5 Pasos</h2>
                        <p className="text-gray-400">Cada conversación es una oportunidad de crecer. Sin fricción. Sin excusas. Sin pausa.</p>
                    </FadeIn>
                </div>
                <div className="flex flex-wrap justify-center gap-8 relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute top-12 left-0 right-0 h-0.5 bg-gradient-to-r from-pink-500/0 via-pink-500/30 to-pink-500/0 z-0"></div>

                    {[
                        {
                            icon: <UserCheck size={24} className="text-pink-500" />,
                            step: "01",
                            title: "Configura tu perfil",
                            desc: "Crea tu perfil, define tu rol y elige tu objetivo. Maity personaliza tu ruta de desarrollo."
                        },
                        {
                            icon: <Mic size={24} className="text-blue-500" />,
                            step: "02",
                            title: "Captura conversaciones",
                            desc: "Graba reuniones (Windows) o conversaciones del d\u00eda a d\u00eda (m\u00f3vil + wearable). Solo cuando t\u00fa lo eliges."
                        },
                        {
                            icon: <Brain size={24} className="text-purple-500" />,
                            step: "03",
                            title: "Maity analiza con IA",
                            desc: "Dashboard con score general, m\u00e9tricas por habilidad y momentos destacados. Recomendaciones accionables."
                        },
                        {
                            icon: <Trophy size={24} className="text-yellow-500" />,
                            step: "04",
                            title: "Retos personalizados",
                            desc: "Retos diarios de 3-7 minutos. Progresa con XP, racha, insignias y niveles."
                        },
                        {
                            icon: <BarChart2 size={24} className="text-green-500" />,
                            step: "05",
                            title: "Ve tu evoluci\u00f3n",
                            desc: "M\u00e9tricas claras de tu crecimiento. Ve c\u00f3mo evolucionan tus habilidades semana a semana."
                        }
                    ].map((item, idx) => (
                        <FadeIn key={idx} delay={idx * 150} className="relative z-10 flex flex-col items-center text-center group w-full md:w-1/6">
                            <div className="w-20 h-20 rounded-3xl bg-[#141414] border border-white/10 flex items-center justify-center mb-6 shadow-2xl group-hover:scale-110 transition-transform duration-500 relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-3xl"></div>
                                {item.icon}
                                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-[#1A1A1A] border border-white/10 flex items-center justify-center text-xs font-bold text-gray-500">
                                    {item.step}
                                </div>
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2 leading-tight">{item.title}</h3>
                            <p className="text-sm text-gray-500 leading-relaxed px-2">{item.desc}</p>
                        </FadeIn>
                    ))}
                </div>

                {/* Video: Cómo funciona Maity */}
                <FadeIn delay={400}>
                    <div className="max-w-2xl mx-auto mt-16">
                        <VideoCard
                            title={LANDING_VIDEOS.comoFunciona.title}
                            description={LANDING_VIDEOS.comoFunciona.description}
                            duration={LANDING_VIDEOS.comoFunciona.duration}
                            thumbnailUrl={LANDING_VIDEOS.comoFunciona.thumbnailUrl}
                            videoUrl={LANDING_VIDEOS.comoFunciona.videoUrl}
                            variant="featured"
                            accentColor={COLORS.maityBlue}
                        />
                    </div>
                </FadeIn>
            </div>
        </section>
    );
};

// --- MAIN APP COMPONENT ---
export default function App() {
    const [activeView, setActiveView] = useState('product');

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
                {activeView === 'product' && (
                    <>
                        <HeroSection setView={setActiveView} />
                        <ProblemSection />
                        <HowItWorksSection />
                        <SkillsGridSection />
                        <ArchetypeQuiz setView={setActiveView} />
                        <TheClimb setView={setActiveView} />
                        <ProductInfoSection />
                        <TrustSection setView={setActiveView} />
                        <Pricing setView={setActiveView} />
                        <VideoTestimonials />
                        <FAQSection />
                        <CommunityPartnerSection setView={setActiveView} />
                        <CTACierre setView={setActiveView} />
                    </>
                )}

                {activeView === 'demo-calendar' && (
                    <DemoCalendar setView={setActiveView} />
                )}

                {activeView === 'resources' && (
                    <ResourcesView setView={setActiveView} />
                )}

                {activeView === 'primeros-pasos' && (
                    <PrimerosPasosView setView={setActiveView} />
                )}

                {activeView === 'archetype-quiz' && (
                    <ArchetypeQuiz setView={setActiveView} />
                )}

                {/* NEW BUSINESS VIEW */}
                {activeView === 'business' && (
                    <>
                        <BusinessHeroSection setView={setActiveView} />
                        <BusinessDeepDive />
                        <ScenariosSection setView={setActiveView} />
                        <CorporateQuiz setView={setActiveView} />
                        <B2BTeaser setView={setActiveView} />
                        <ROICalculator />
                        <Pricing initialTab="business" setView={setActiveView} />
                        <DemoCalendar setView={setActiveView} />
                        <TrustSection variant="enterprise" setView={setActiveView} />
                        <FAQSection />
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
                {activeView === 'climb' && <TheClimb setView={setActiveView} />}
                {/* NEW ROLEPLAY VIEW */}
                {activeView === 'roleplay' && (
                    <RoleplaySimulator onExit={() => setView('product')} />
                )}
                {activeView === 'pricing' && <Pricing setView={setActiveView} />}

                {/* NOSOTROS VIEW */}
                {activeView === 'nosotros' && (
                    <NosotrosView setView={setActiveView} />
                )}

                {/* SEGURIDAD VIEW */}
                {activeView === 'seguridad' && (
                    <div className="pt-24">
                        <TrustSection variant="enterprise" setView={setActiveView} />
                    </div>
                )}

                {/* CORPORATE QUIZ STANDALONE */}
                {activeView === 'corporate-quiz' && (
                    <CorporateQuiz setView={setActiveView} />
                )}

                {/* LEGAL VIEWS */}
                {activeView === 'privacidad' && (
                    <PrivacyPolicyView setView={setActiveView} />
                )}

                {activeView === 'terminos' && (
                    <TermsOfServiceView setView={setActiveView} />
                )}

                {/* CAREERS VIEW */}
                {activeView === 'careers' && (
                    <CareersView setView={setActiveView} />
                )}

                {/* SOPORTE VIEW */}
                {activeView === 'soporte' && (
                    <SoporteView setView={setActiveView} />
                )}

                {/* COMMUNITY / PARTNERS */}
                {activeView === 'comunidad' && (
                    <div className="pt-24">
                        <CommunityPartnerSection setView={setActiveView} />
                    </div>
                )}
            </main>

            <Footer setView={setActiveView} />
        </div>
    );
}
