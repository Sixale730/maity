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
        {/* Símbolo de Maity - patrón de puntos en forma de asterisco */}
        <svg viewBox="0 0 40 40" className="w-full h-full" fill="currentColor">
          <g className="text-primary">
            {/* Puntos centrales */}
            <circle cx="20" cy="20" r="2" />
            
            {/* Puntos superiores */}
            <circle cx="20" cy="8" r="2" />
            <circle cx="16" cy="10" r="1.5" />
            <circle cx="24" cy="10" r="1.5" />
            
            {/* Puntos inferiores */}
            <circle cx="20" cy="32" r="2" />
            <circle cx="16" cy="30" r="1.5" />
            <circle cx="24" cy="30" r="1.5" />
            
            {/* Puntos izquierda */}
            <circle cx="8" cy="20" r="2" />
            <circle cx="10" cy="16" r="1.5" />
            <circle cx="10" cy="24" r="1.5" />
            
            {/* Puntos derecha */}
            <circle cx="32" cy="20" r="2" />
            <circle cx="30" cy="16" r="1.5" />
            <circle cx="30" cy="24" r="1.5" />
            
            {/* Puntos diagonales */}
            <circle cx="14" cy="14" r="1.5" />
            <circle cx="26" cy="14" r="1.5" />
            <circle cx="14" cy="26" r="1.5" />
            <circle cx="26" cy="26" r="1.5" />
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
            <circle cx="20" cy="20" r="2" />
            <circle cx="20" cy="8" r="2" />
            <circle cx="16" cy="10" r="1.5" />
            <circle cx="24" cy="10" r="1.5" />
            <circle cx="20" cy="32" r="2" />
            <circle cx="16" cy="30" r="1.5" />
            <circle cx="24" cy="30" r="1.5" />
            <circle cx="8" cy="20" r="2" />
            <circle cx="10" cy="16" r="1.5" />
            <circle cx="10" cy="24" r="1.5" />
            <circle cx="32" cy="20" r="2" />
            <circle cx="30" cy="16" r="1.5" />
            <circle cx="30" cy="24" r="1.5" />
            <circle cx="14" cy="14" r="1.5" />
            <circle cx="26" cy="14" r="1.5" />
            <circle cx="14" cy="26" r="1.5" />
            <circle cx="26" cy="26" r="1.5" />
          </g>
        </svg>
      </div>
      
      {/* Texto Maity */}
      <span className="font-geist font-bold text-xl text-foreground">maity</span>
    </div>
  );
};

export default MaityLogo;