import React from "react";

interface MaityLogoProps {
  size?: "sm" | "md" | "lg";
  variant?: "full" | "symbol";
  className?: string;
}

const MaityLogo: React.FC<MaityLogoProps> = ({ size = "md", variant = "full", className = "" }) => {
  const sizeClasses = {
    sm: "h-6",
    md: "h-8", 
    lg: "h-12"
  };

  const minWidths = {
    full: "min-w-[151px]", // 40mm / 151px para isologotipo
    symbol: "min-w-[37px]"  // 10mm / 37px para símbolo
  };

  if (variant === "symbol") {
    return (
      <div className={`${sizeClasses[size]} ${minWidths.symbol} ${className} flex items-center justify-center`}>
      {/* Símbolo de Maity - estrella de 6 puntas con círculos */}
      <svg viewBox="0 0 40 40" className="w-full h-full" fill="currentColor">
        <g className="text-primary">
          {/* Centro */}
          <circle cx="20" cy="20" r="2.5" />
          
          {/* Puntas principales de la estrella (6 direcciones) */}
          {/* Superior */}
          <path d="M20 2 L22 10 L18 10 Z" />
          <circle cx="20" cy="6" r="1.5" />
          
          {/* Inferior */}
          <path d="M20 38 L22 30 L18 30 Z" />
          <circle cx="20" cy="34" r="1.5" />
          
          {/* Superior derecha */}
          <path d="M34.64 10 L28.28 16.36 L30.64 19.64 Z" />
          <circle cx="31.46" cy="12.82" r="1.5" />
          
          {/* Inferior izquierda */}
          <path d="M5.36 30 L11.72 23.64 L9.36 20.36 Z" />
          <circle cx="8.54" cy="27.18" r="1.5" />
          
          {/* Superior izquierda */}
          <path d="M5.36 10 L11.72 16.36 L9.36 19.64 Z" />
          <circle cx="8.54" cy="12.82" r="1.5" />
          
          {/* Inferior derecha */}
          <path d="M34.64 30 L28.28 23.64 L30.64 20.36 Z" />
          <circle cx="31.46" cy="27.18" r="1.5" />
        </g>
      </svg>
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} ${minWidths.full} ${className} flex items-center space-x-2`}>
      {/* Símbolo */}
      <div className="w-8 h-8 flex items-center justify-center">
        <svg viewBox="0 0 40 40" className="w-full h-full" fill="currentColor">
          <g className="text-primary">
            {/* Centro */}
            <circle cx="20" cy="20" r="2.5" />
            
            {/* Puntas principales de la estrella (6 direcciones) */}
            {/* Superior */}
            <path d="M20 2 L22 10 L18 10 Z" />
            <circle cx="20" cy="6" r="1.5" />
            
            {/* Inferior */}
            <path d="M20 38 L22 30 L18 30 Z" />
            <circle cx="20" cy="34" r="1.5" />
            
            {/* Superior derecha */}
            <path d="M34.64 10 L28.28 16.36 L30.64 19.64 Z" />
            <circle cx="31.46" cy="12.82" r="1.5" />
            
            {/* Inferior izquierda */}
            <path d="M5.36 30 L11.72 23.64 L9.36 20.36 Z" />
            <circle cx="8.54" cy="27.18" r="1.5" />
            
            {/* Superior izquierda */}
            <path d="M5.36 10 L11.72 16.36 L9.36 19.64 Z" />
            <circle cx="8.54" cy="12.82" r="1.5" />
            
            {/* Inferior derecha */}
            <path d="M34.64 30 L28.28 23.64 L30.64 20.36 Z" />
            <circle cx="31.46" cy="27.18" r="1.5" />
          </g>
        </svg>
      </div>
      
      {/* Texto Maity */}
      <span className="font-geist font-bold text-xl text-foreground">maity</span>
    </div>
  );
};

export default MaityLogo;