import React from "react";

interface MaityLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "full" | "symbol";
  className?: string;
}

const MaityLogo: React.FC<MaityLogoProps> = ({ size = "md", variant = "full", className = "" }) => {
  const sizeClasses = {
    sm: "h-6",
    md: "h-8", 
    lg: "h-12",
    xl: "h-16 lg:h-20"
  };

  const minWidths = {
    full: "min-w-[151px]", // Para logo completo
    symbol: "min-w-[37px]"  // Para isotipo
  };

  if (variant === "symbol") {
    return (
      <div className={`${sizeClasses[size]} ${minWidths.symbol} ${className} flex items-center justify-center`}>
        <img 
          src="/lovable-uploads/e9fc8b3a-57b9-4f1a-93d8-0708c42e0d86.png" 
          alt="Maity Isotipo" 
          className="w-6 h-6 object-contain"
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

export { MaityLogo };
export default MaityLogo;