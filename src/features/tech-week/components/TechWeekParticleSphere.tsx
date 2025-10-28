import { useRef, useEffect } from 'react';

interface TechWeekParticleSphereProps {
  isListening: boolean;
  isSpeaking: boolean;
}

// Tech Week Pink/Rose Color Palette
const TECH_WEEK_COLORS = {
  lightPink: '#FFB6C1',
  hotPink: '#FF69B4',
  deepPink: '#FF1493',
  paleVioletRed: '#DB7093',
  // Helper functions for alpha transparency
  lightPinkAlpha: (alpha: number) => `rgba(255, 182, 193, ${alpha})`,
  hotPinkAlpha: (alpha: number) => `rgba(255, 105, 180, ${alpha})`,
  deepPinkAlpha: (alpha: number) => `rgba(255, 20, 147, ${alpha})`,
  paleVioletRedAlpha: (alpha: number) => `rgba(219, 112, 147, ${alpha})`,
};

export function TechWeekParticleSphere({ isListening, isSpeaking }: TechWeekParticleSphereProps) {
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
      // Responsive radius based on screen size
      const isMobile = window.innerWidth < 640;
      const isTablet = window.innerWidth < 1024;

      if (isMobile) {
        this.baseRadius = 75;
      } else if (isTablet) {
        this.baseRadius = 90;
      } else {
        this.baseRadius = 120;
      }
      this.pulseOffset = Math.random() * Math.PI * 2;
      this.x = 0;
      this.y = 0;
      this.z = 0;
      this.updatePosition(0);
    }

    updatePosition(time: number) {
      let pulseFactor = 1;

      if (isSpeaking) {
        // Cuando habla: movimiento visible pero suave
        pulseFactor = 1 + Math.sin(time * 0.004 + this.pulseOffset) * 0.2;
        this.theta += 0.003 + Math.sin(time * 0.002) * 0.002;
        this.phi += Math.sin(time * 0.0015 + this.pulseOffset) * 0.004;
      } else if (isListening) {
        // Cuando escucha: animación suave de suspensión
        pulseFactor = 1 + Math.sin(time * 0.002 + this.pulseOffset) * 0.08;
        this.theta += 0.0005;
        this.phi += Math.sin(time * 0.0008) * 0.002;
      }

      const radius = this.baseRadius * pulseFactor;

      this.x = radius * Math.sin(this.phi) * Math.cos(this.theta);
      this.y = radius * Math.sin(this.phi) * Math.sin(this.theta);
      this.z = radius * Math.cos(this.phi);
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const setCanvasSize = () => {
      // Responsive canvas size
      const isMobile = window.innerWidth < 640;
      const isTablet = window.innerWidth < 1024;

      if (isMobile) {
        canvas.width = 250;
        canvas.height = 250;
      } else if (isTablet) {
        canvas.width = 300;
        canvas.height = 300;
      } else {
        canvas.width = 400;
        canvas.height = 400;
      }
    };
    setCanvasSize();

    // Create particles - fewer on mobile for better performance
    const isMobile = window.innerWidth < 640;
    const particleCount = isMobile ? 150 : 300;
    particlesRef.current = Array.from({ length: particleCount }, () => new Particle());

    const render = () => {
      // Dark background with subtle fade for trail effect
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

        // Pink color palette based on state - Tech Week theme
        let color: string;
        if (isSpeaking) {
          // Deep pink vibrante cuando el agente está hablando
          const pulse = Math.sin(timeRef.current * 0.005) * 0.3;
          color = TECH_WEEK_COLORS.deepPinkAlpha(opacity * (0.8 + pulse));
        } else if (isListening) {
          // Hot pink brillante cuando está escuchando
          const pulse = Math.sin(timeRef.current * 0.004) * 0.4;
          color = TECH_WEEK_COLORS.hotPinkAlpha(opacity * (0.9 + pulse));
        } else {
          // Light pink suave cuando está inactivo
          color = TECH_WEEK_COLORS.lightPinkAlpha(opacity * 0.6);
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
          let glowColor: string;
          if (isSpeaking) {
            glowColor = TECH_WEEK_COLORS.deepPinkAlpha(0.15);
          } else if (isListening) {
            glowColor = TECH_WEEK_COLORS.hotPinkAlpha(0.2);
          } else {
            glowColor = TECH_WEEK_COLORS.paleVioletRedAlpha(0.08);
          }
          ctx.fillStyle = glowColor;
          ctx.fill();
        }
      });

      // Siempre avanza el tiempo para animaciones con velocidades ajustadas
      if (isSpeaking) {
        timeRef.current += 12; // Moderado cuando habla
      } else if (isListening) {
        timeRef.current += 8;  // Suave cuando escucha
      } else {
        timeRef.current += 4;  // Muy lento cuando está inactivo
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
          filter: isSpeaking
            ? `drop-shadow(0 0 40px ${TECH_WEEK_COLORS.deepPink}80)`
            : isListening
            ? `drop-shadow(0 0 30px ${TECH_WEEK_COLORS.hotPink}80)`
            : 'none',
          transition: 'filter 0.3s ease'
        }}
      />
      {(isListening || isSpeaking) && (
        <div
          className="absolute inset-0 rounded-full blur-3xl animate-pulse"
          style={{
            backgroundColor: isSpeaking
              ? TECH_WEEK_COLORS.deepPinkAlpha(0.1)
              : TECH_WEEK_COLORS.hotPinkAlpha(0.1)
          }}
        />
      )}
    </div>
  );
}
