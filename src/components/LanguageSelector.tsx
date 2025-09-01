import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe } from "lucide-react";
import { useLanguage } from '@/contexts/LanguageContext';

interface LanguageSelectorProps {
  className?: string;
  compact?: boolean;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ className = "", compact = false }) => {
  const { language, setLanguage } = useLanguage();

  return (
    <Select value={language} onValueChange={(value: 'es' | 'en') => setLanguage(value)}>
      <SelectTrigger className={`${compact ? 'w-[80px] h-8' : 'w-[100px] h-9'} font-inter ${className}`}>
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          <SelectValue />
        </div>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="es">ES</SelectItem>
        <SelectItem value="en">EN</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default LanguageSelector;