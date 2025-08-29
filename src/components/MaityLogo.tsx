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
    full: "min-w-[151px]", // Para logo completo
    symbol: "min-w-[37px]"  // Para isotipo
  };

  if (variant === "symbol") {
    return (
      <div className={`${sizeClasses[size]} ${minWidths.symbol} ${className} flex items-center justify-center`}>
        <img 
          src="/lovable-uploads/9386ff20-7e95-47d9-8f35-ac09c6e07482.png" 
          alt="Maity Isotipo" 
          className="w-full h-full object-contain"
        />
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} ${minWidths.full} ${className} flex items-center justify-center`}>
      <img 
        src="/lovable-uploads/48d136b9-162b-464d-8c62-b76137422d33.png" 
        alt="Maity Logo Completo" 
        className="w-full h-full object-contain"
      />
    </div>
  );
};

export default MaityLogo;