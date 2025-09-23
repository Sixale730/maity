import React, { useRef, useEffect } from 'react';

interface ParticleSphereProps {
  isListening: boolean;
  isSpeaking: boolean;
}

export function ParticleSphere({ isListening, isSpeaking }: ParticleSphereProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const particlesRef = useRef<Particle[]>([]);
  const timeRef = useRef(0);

  class Particle {
    theta: number;
    phi: number;
    x: number;
    y: number;
    z: number;
    baseRadius: number;
    pulseOffset: number;

    constructor() {
      this.theta = Math.random() * Math.PI * 2;
      this.phi = Math.acos(Math.random() * 2 - 1);
      this.baseRadius = 120;
      this.pulseOffset = Math.random() * Math.PI * 2;
      this.x = 0;
      this.y = 0;
      this.z = 0;
      this.updatePosition(0);
    }

    updatePosition(time: number) {
      const pulseFactor = isListening ? 1 + Math.sin(time * 0.003 + this.pulseOffset) * 0.15 : 1;
      const radius = this.baseRadius * pulseFactor;

      this.x = radius * Math.sin(this.phi) * Math.cos(this.theta);
      this.y = radius * Math.sin(this.phi) * Math.sin(this.theta);
      this.z = radius * Math.cos(this.phi);

      if (isListening && !isSpeaking) {
        this.theta += 0.002;
        this.phi += Math.sin(time * 0.001) * 0.001;
      }
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const setCanvasSize = () => {
      canvas.width = 400;
      canvas.height = 400;
    };
    setCanvasSize();

    // Create particles
    const particleCount = 300;
    particlesRef.current = Array.from({ length: particleCount }, () => new Particle());

    const render = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Sort particles by z-depth for proper layering
      const sortedParticles = [...particlesRef.current].sort((a, b) => a.z - b.z);

      sortedParticles.forEach((particle) => {
        particle.updatePosition(timeRef.current);

        // 3D to 2D projection
        const scale = 200 / (200 + particle.z);
        const x2d = centerX + particle.x * scale;
        const y2d = centerY + particle.y * scale;

        // Size and opacity based on depth
        const size = Math.max(0.5, 3 * scale);
        const opacity = Math.min(1, Math.max(0.2, scale));

        // Color changes based on state
        let color: string;
        if (isSpeaking) {
          // Green glow when agent is speaking
          const green = Math.floor(150 + Math.sin(timeRef.current * 0.005) * 50);
          color = `rgba(34, ${green}, 94, ${opacity})`;
        } else if (isListening) {
          // Brighter green when listening
          const green = Math.floor(180 + Math.sin(timeRef.current * 0.004) * 40);
          color = `rgba(34, ${green}, 94, ${opacity})`;
        } else {
          // Dimmer green when idle
          color = `rgba(34, 150, 94, ${opacity * 0.5})`;
        }

        // Draw particle
        ctx.beginPath();
        ctx.arc(x2d, y2d, size, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();

        // Add glow effect for nearby particles
        if (scale > 0.8) {
          ctx.beginPath();
          ctx.arc(x2d, y2d, size * 2, 0, Math.PI * 2);
          ctx.fillStyle = color.replace(/[\d.]+\)$/, '0.1)');
          ctx.fill();
        }
      });

      if (isListening && !isSpeaking) {
        timeRef.current += 16;
      }

      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isListening, isSpeaking]);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        className="rounded-full"
        style={{
          filter: isListening ? 'drop-shadow(0 0 30px rgba(34, 197, 94, 0.5))' : 'none',
          transition: 'filter 0.3s ease'
        }}
      />
      {isListening && (
        <div className="absolute inset-0 rounded-full bg-green-500/5 blur-3xl animate-pulse" />
      )}
    </div>
  );
}