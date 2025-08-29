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
        <img 
          src="/lovable-uploads/551be33f-9355-4d82-93d4-b2be9001f8d1.png" 
          alt="Maity Logo" 
          className="w-full h-full object-contain"
        />
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} ${minWidths.full} ${className} flex items-center justify-center`}>
      <img 
        src="/lovable-uploads/551be33f-9355-4d82-93d4-b2be9001f8d1.png" 
        alt="Maity Logo" 
        className="w-full h-full object-contain"
      />
    </div>
  );
};

export default MaityLogo;