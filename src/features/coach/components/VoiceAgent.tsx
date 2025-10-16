import Lottie from 'lottie-react';
import { motion } from 'framer-motion';
import type { AgentState } from '../types';

// Placeholder animation data - replace with actual Lottie files
const animationData = {
  idle: {
    v: "5.7.4",
    fr: 30,
    ip: 0,
    op: 60,
    w: 512,
    h: 512,
    nm: "idle",
    ddd: 0,
    assets: [],
    layers: [{
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "Circle",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 1, k: [{ i: { x: [0.833], y: [0.833] }, o: { x: [0.167], y: [0.167] }, t: 0, s: [0] }, { t: 59, s: [360] }] },
        p: { a: 0, k: [256, 256, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] }
      },
      ao: 0,
      shapes: [{
        ty: "gr",
        it: [{
          d: 1,
          ty: "el",
          s: { a: 0, k: [200, 200] },
          p: { a: 0, k: [0, 0] }
        }, {
          ty: "fl",
          c: { a: 0, k: [0.2, 0.4, 1, 1] },
          o: { a: 0, k: 100 }
        }]
      }],
      ip: 0,
      op: 60,
      st: 0
    }]
  }
};

interface VoiceAgentProps {
  state: AgentState;
}

export function VoiceAgent({ state }: VoiceAgentProps) {
  const getAgentConfig = () => {
    switch (state) {
      case 'listening':
        return {
          scale: 1.1,
          color: '#10B981', // green
          pulse: true,
          glow: 'shadow-green-500/50'
        };
      case 'thinking':
        return {
          scale: 1.05,
          color: '#F59E0B', // amber
          pulse: true,
          glow: 'shadow-amber-500/50'
        };
      case 'speaking':
        return {
          scale: 1.15,
          color: '#8B5CF6', // purple
          pulse: true,
          glow: 'shadow-purple-500/50'
        };
      default:
        return {
          scale: 1,
          color: '#3B82F6', // blue
          pulse: false,
          glow: 'shadow-blue-500/30'
        };
    }
  };

  const config = getAgentConfig();

  const getStateText = () => {
    switch (state) {
      case 'listening':
        return 'Escuchando...';
      case 'thinking':
        return 'Procesando...';
      case 'speaking':
        return 'Hablando...';
      default:
        return 'Listo para ayudarte';
    }
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Agent Avatar */}
      <motion.div
        animate={{
          scale: config.scale,
        }}
        transition={{
          duration: 0.3,
          ease: "easeInOut"
        }}
        className={`relative w-48 h-48 rounded-full ${config.glow} shadow-2xl`}
      >
        {/* Animated Background Ring */}
        {config.pulse && (
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-white/30"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.8, 0.2, 0.8],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}

        {/* Main Agent Circle with Lottie */}
        <div
          className="w-full h-full rounded-full flex items-center justify-center relative overflow-hidden"
          style={{ backgroundColor: config.color }}
        >
          {/* Fallback to simple animation if Lottie fails */}
          <motion.div
            className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center"
            animate={{
              scale: config.pulse ? [1, 1.1, 1] : 1,
            }}
            transition={{
              duration: 1.5,
              repeat: config.pulse ? Infinity : 0,
              ease: "easeInOut"
            }}
          >
            {/* AI Icon */}
            <svg
              className="w-16 h-16 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
          </motion.div>
        </div>

        {/* Voice Wave Animation for Speaking */}
        {state === 'speaking' && (
          <div className="absolute inset-0 flex items-center justify-center">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-full h-full rounded-full border-2 border-white/40"
                animate={{
                  scale: [0.8, 1.3, 0.8],
                  opacity: [0.8, 0, 0.8],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.3,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>
        )}
      </motion.div>

      {/* State Text */}
      <motion.div
        key={state}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h3 className="text-2xl font-bold text-white mb-2">Coach Maity</h3>
        <p className="text-white/80 text-lg">{getStateText()}</p>
      </motion.div>

      {/* Status Indicators */}
      <div className="flex space-x-2">
        {['idle', 'listening', 'thinking', 'speaking'].map((s) => (
          <motion.div
            key={s}
            className={`w-3 h-3 rounded-full ${
              state === s ? 'bg-white' : 'bg-white/30'
            }`}
            animate={{
              scale: state === s ? 1.2 : 1,
            }}
            transition={{ duration: 0.2 }}
          />
        ))}
      </div>
    </div>
  );
}