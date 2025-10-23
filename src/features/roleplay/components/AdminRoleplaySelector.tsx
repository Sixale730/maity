import { useEffect, useState, useRef } from 'react';
import { RoleplayService } from '@maity/shared';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/components/ui/select';

interface Scenario {
  id: string;
  name: string;
  code: string;
  order_index: number;
}

interface AdminRoleplaySelectorProps {
  onProfileScenarioChange: (profile: 'CEO' | 'CTO' | 'CFO', scenarioCode: string, scenarioName: string) => void;
  defaultProfile?: 'CEO' | 'CTO' | 'CFO';
}

export function AdminRoleplaySelector({ onProfileScenarioChange, defaultProfile = 'CEO' }: AdminRoleplaySelectorProps) {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<'CEO' | 'CTO' | 'CFO'>(defaultProfile);
  const [selectedScenarioCode, setSelectedScenarioCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const isInitialMount = useRef(true);

  useEffect(() => {
    loadScenarios();
  }, []);

  const loadScenarios = async () => {
    try {
      setIsLoading(true);
      const scenariosData = await RoleplayService.getAllScenarios();

      if (scenariosData && Array.isArray(scenariosData)) {
        const typedScenarios = scenariosData as Scenario[];
        setScenarios(typedScenarios);

        // Seleccionar el primer escenario por defecto y notificar al padre
        if (typedScenarios.length > 0 && isInitialMount.current) {
          const firstScenario = typedScenarios[0];
          setSelectedScenarioCode(firstScenario.code);
          // Notificar al padre para establecer adminOverride y cargar el escenario
          onProfileScenarioChange(selectedProfile, firstScenario.code, firstScenario.name);
          isInitialMount.current = false;
        }
      }
    } catch (error) {
      console.error('Error loading scenarios:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileChange = (profile: 'CEO' | 'CTO' | 'CFO') => {
    setSelectedProfile(profile);
    if (selectedScenarioCode) {
      const scenario = scenarios.find(s => s.code === selectedScenarioCode);
      if (scenario) {
        onProfileScenarioChange(profile, selectedScenarioCode, scenario.name);
      }
    }
  };

  const handleScenarioChange = (scenarioCode: string) => {
    setSelectedScenarioCode(scenarioCode);
    const scenario = scenarios.find(s => s.code === scenarioCode);
    if (scenario) {
      onProfileScenarioChange(selectedProfile, scenarioCode, scenario.name);
    }
  };

  if (isLoading) {
    return (
      <div className="flex gap-2 items-center">
        <div className="text-xs text-white/70">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      {/* Profile Selector */}
      <Select value={selectedProfile} onValueChange={handleProfileChange}>
        <SelectTrigger className="w-full sm:w-[140px] bg-white/10 border-white/20 text-white text-xs sm:text-sm">
          <SelectValue placeholder="Perfil" />
        </SelectTrigger>
        <SelectContent className="bg-gray-900 border-gray-700">
          <SelectItem value="CEO" className="text-white hover:bg-white/10">CEO</SelectItem>
          <SelectItem value="CTO" className="text-white hover:bg-white/10">CTO</SelectItem>
          <SelectItem value="CFO" className="text-white hover:bg-white/10">CFO</SelectItem>
        </SelectContent>
      </Select>

      {/* Scenario Selector */}
      <Select value={selectedScenarioCode} onValueChange={handleScenarioChange}>
        <SelectTrigger className="w-full sm:w-[200px] bg-white/10 border-white/20 text-white text-xs sm:text-sm">
          <SelectValue placeholder="Escenario" />
        </SelectTrigger>
        <SelectContent className="bg-gray-900 border-gray-700 max-h-[300px]">
          {scenarios.map((scenario) => (
            <SelectItem
              key={scenario.code}
              value={scenario.code}
              className="text-white hover:bg-white/10"
            >
              {scenario.order_index}. {scenario.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
