import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Mic, Square, Volume2, VolumeX } from 'lucide-react';

interface VoiceControlsProps {
  onVoiceStart: () => void;
  onVoiceStop: () => void;
  isListening: boolean;
}

export function VoiceControls({ onVoiceStart, onVoiceStop, isListening }: VoiceControlsProps) {
  const [isMuted, setIsMuted] = useState(false);

  const handleMicToggle = () => {
    if (isListening) {
      onVoiceStop();
    } else {
      onVoiceStart();
    }
  };

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Main Voice Button */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative"
      >
        <Button
          onClick={handleMicToggle}
          size="lg"
          className={`w-20 h-20 rounded-full text-white border-4 transition-all duration-300 ${
            isListening
              ? 'bg-red-500 hover:bg-red-600 border-red-300 shadow-lg shadow-red-500/50'
              : 'bg-green-500 hover:bg-green-600 border-green-300 shadow-lg shadow-green-500/50'
          }`}
        >
          {isListening ? (
            <Square className="w-8 h-8" />
          ) : (
            <Mic className="w-8 h-8" />
          )}
        </Button>

        {/* Pulse Animation when Listening */}
        {isListening && (
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-red-400"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.8, 0, 0.8],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}
      </motion.div>

      {/* Status Text */}
      <motion.p
        key={isListening ? 'listening' : 'idle'}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-white text-center font-medium"
      >
        {isListening ? (
          <>
            <span className="text-red-400">●</span> Grabando...
            <br />
            <span className="text-sm text-white/70">Presiona para detener</span>
          </>
        ) : (
          <>
            Presiona para hablar
            <br />
            <span className="text-sm text-white/70">o escribe tu mensaje</span>
          </>
        )}
      </motion.p>

      {/* Secondary Controls */}
      <div className="flex space-x-4">
        {/* Mute/Unmute Button */}
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <Button
            onClick={handleMuteToggle}
            variant="outline"
            size="sm"
            className={`bg-white/10 border-white/30 text-white hover:bg-white/20 ${
              isMuted ? 'bg-red-500/20 border-red-400' : ''
            }`}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </Button>
        </motion.div>

        {/* Voice Settings Indicator */}
        <motion.div
          className="flex items-center space-x-1 text-white/60 text-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span>Micrófono activo</span>
        </motion.div>
      </div>

      {/* Voice Level Indicator */}
      {isListening && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="w-full max-w-xs"
        >
          <p className="text-white/70 text-xs text-center mb-2">Nivel de voz</p>
          <div className="flex space-x-1 justify-center">
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="w-1 bg-green-400 rounded-full"
                animate={{
                  height: [4, Math.random() * 20 + 4, 4],
                }}
                transition={{
                  duration: 0.5,
                  repeat: Infinity,
                  delay: i * 0.1,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* Instructions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-center text-white/50 text-xs max-w-xs"
      >
        <p>
          Habla de forma clara y pausada para mejores resultados.
          El coach puede ayudarte con objetivos profesionales, feedback y desarrollo personal.
        </p>
      </motion.div>
    </div>
  );
}