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
          src="/lovable-uploads/e9252a75-4067-41c2-8cc0-d3ca42f2c771.png" 
          alt="Maity Isotipo" 
          className="w-full h-full object-contain"
        />
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} ${minWidths.full} ${className} flex items-center justify-center`}>
      <img 
        src="/lovable-uploads/17dd8975-ae14-431f-a50f-3639ccdf30bf.png" 
        alt="Maity Logo" 
        className="w-full h-full object-contain"
      />
    </div>
  );
};

export default MaityLogo;