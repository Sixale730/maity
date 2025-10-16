import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/ui/components/ui/select";
import { Globe, Check } from "lucide-react";
import { useLanguage } from '@/contexts/LanguageContext';

interface LanguageSelectorProps {
  className?: string;
  compact?: boolean;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ className = "", compact = false }) => {
  const { language, setLanguage } = useLanguage();

  console.log('LanguageSelector rendered with language:', language);

  const languages = {
    es: { code: 'es', name: 'Español', flag: '🇪🇸' },
    en: { code: 'en', name: 'English', flag: '🇺🇸' }
  };

  const handleLanguageChange = (value: 'es' | 'en') => {
    console.log('Language change requested from:', language, 'to:', value);
    setLanguage(value);
    console.log('Language changed to:', value);
  };

  const handleClick = () => {
    console.log('Language selector clicked');
  };

  return (
    <div className="w-full">
      <Select value={language} onValueChange={handleLanguageChange}>
        <SelectTrigger 
          className={`${compact ? 'w-[120px] h-8' : 'w-[140px] h-9'} font-inter bg-sidebar-accent/50 hover:bg-sidebar-accent border-sidebar-border text-sidebar-foreground ${className}`}
          onClick={handleClick}
        >
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span className="text-sm font-medium">
              {languages[language].flag} {languages[language].code.toUpperCase()}
            </span>
          </div>
        </SelectTrigger>
        <SelectContent 
          className="z-[100] bg-popover border-sidebar-border shadow-lg min-w-[140px]" 
          align="end" 
          side="bottom" 
          sideOffset={4}
        >
          {Object.values(languages).map((lang) => (
            <SelectItem 
              key={lang.code} 
              value={lang.code}
              onSelect={() => {
                console.log('SelectItem clicked for:', lang.code);
                handleLanguageChange(lang.code as 'es' | 'en');
              }}
              className="text-popover-foreground hover:bg-sidebar-accent-foreground/10 focus:bg-sidebar-accent-foreground/10 cursor-pointer"
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <span>{lang.flag}</span>
                  <span className="font-medium">{lang.name}</span>
                </div>
                {language === lang.code && (
                  <Check className="h-4 w-4 text-accent ml-2" />
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default LanguageSelector;