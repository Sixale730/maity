import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/ui/components/ui/dialog';
import { Button } from '@/ui/components/ui/button';
import { Card } from '@/ui/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/ui/components/ui/radio-group';
import { Label } from '@/ui/components/ui/label';
import { ChevronRight, Users, Target } from 'lucide-react';
import { supabase } from '@maity/shared';
import { useToast } from '@/shared/hooks/use-toast';

interface PrePracticeQuestionnaireProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: {
    mostDifficultProfile: 'CEO' | 'CTO' | 'CFO';
    practiceStartProfile: 'CEO' | 'CTO' | 'CFO';
    questionnaireId: string;
  }) => void;
  userId: string;
}

export function PrePracticeQuestionnaire({
  isOpen,
  onClose,
  onComplete,
  userId
}: PrePracticeQuestionnaireProps) {
  const { toast } = useToast();
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [mostDifficultProfile, setMostDifficultProfile] = useState<'CEO' | 'CTO' | 'CFO' | null>(null);
  const [practiceStartProfile, setPracticeStartProfile] = useState<'CEO' | 'CTO' | 'CFO' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const profiles = [
    {
      value: 'CEO',
      label: 'CEO - Director Ejecutivo',
      description: 'Enfocado en visión y ROI',
      icon: '👔',
      traits: ['Directo', 'Tiempo limitado', 'Resultados']
    },
    {
      value: 'CTO',
      label: 'CTO - Director de Tecnología',
      description: 'Enfocado en arquitectura técnica',
      icon: '💻',
      traits: ['Detallista', 'Analítico', 'Técnico']
    },
    {
      value: 'CFO',
      label: 'CFO - Director Financiero',
      description: 'Enfocado en números y presupuesto',
      icon: '📊',
      traits: ['Conservador', 'Métricas', 'ROI']
    }
  ];

  const handleNext = () => {
    if (currentQuestion === 1 && mostDifficultProfile) {
      setCurrentQuestion(2);
    }
  };

  const handleSubmit = async () => {
    if (!mostDifficultProfile || !practiceStartProfile) {
      toast({
        title: "Error",
        description: "Por favor responde ambas preguntas",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Guardar respuestas en la base de datos
      const { data, error } = await supabase
        .from('voice_pre_practice_questionnaire')
        .insert({
          user_id: userId,
          most_difficult_profile: mostDifficultProfile,
          practice_start_profile: practiceStartProfile
        })
        .select('id')
        .single();

      if (error || !data?.id) throw error || new Error('No ID returned');

      // Llamar callback con los datos
      onComplete({
        mostDifficultProfile,
        practiceStartProfile,
        questionnaireId: data.id
      });

      toast({
        title: "¡Listo!",
        description: "Iniciando tu sesión de práctica...",
      });

    } catch (error) {
      console.error('Error saving questionnaire:', error);
      toast({
        title: "Error",
        description: "No se pudieron guardar tus respuestas. Intenta de nuevo.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-w-[95vw] p-0 overflow-hidden max-h-[95vh] flex flex-col">
        {/* Header con progreso */}
        <div
          className="p-4 sm:p-6 text-white transition-colors flex-shrink-0"
          style={{
            background: currentQuestion === 1
              ? 'linear-gradient(to right, rgb(37, 99, 235), rgb(79, 70, 229))'
              : 'linear-gradient(to right, rgb(27, 234, 154), rgb(16, 185, 129))'
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl font-bold text-white">
              Preparación para tu Práctica
            </DialogTitle>
            <DialogDescription className={`mt-1 sm:mt-2 text-sm sm:text-base ${
              currentQuestion === 1 ? 'text-blue-50' : 'text-emerald-50'
            }`}>
              Responde estas preguntas para personalizar tu experiencia
            </DialogDescription>
          </DialogHeader>

          {/* Progress indicator */}
          <div className="flex items-center gap-2 mt-3 sm:mt-4">
            <div className={`h-2 flex-1 rounded-full ${currentQuestion >= 1 ? 'bg-white' : 'bg-blue-300/50'}`} />
            <div className={`h-2 flex-1 rounded-full ${currentQuestion >= 2 ? 'bg-white' : 'bg-blue-300/50'}`} />
          </div>
          <div className="text-xs sm:text-sm mt-2">
            Pregunta {currentQuestion} de 2
          </div>
        </div>

        {/* Contenido del cuestionario - Scrolleable */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {currentQuestion === 1 ? (
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <Users className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 flex-shrink-0" />
                <h3 className="text-base sm:text-lg font-semibold">
                  ¿Con qué perfil se te dificulta más negociar?
                </h3>
              </div>

              <RadioGroup
                value={mostDifficultProfile || ''}
                onValueChange={(value) => setMostDifficultProfile(value as 'CEO' | 'CTO' | 'CFO')}
              >
                <div className="space-y-2 sm:space-y-3">
                  {profiles.map((profile) => (
                    <Card
                      key={profile.value}
                      className={`p-3 sm:p-4 cursor-pointer transition-all hover:shadow-md ${
                        mostDifficultProfile === profile.value
                          ? 'ring-2 ring-blue-500 bg-blue-50'
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setMostDifficultProfile(profile.value as 'CEO' | 'CTO' | 'CFO')}
                    >
                      <Label className="flex items-start gap-2 sm:gap-3 cursor-pointer">
                        <RadioGroupItem
                          value={profile.value}
                          className="mt-1 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                            <span className="text-xl sm:text-2xl">{profile.icon}</span>
                            <span className="font-semibold text-sm sm:text-base">{profile.label}</span>
                          </div>
                          <p className="text-xs sm:text-sm text-gray-600 mb-1.5 sm:mb-2">{profile.description}</p>
                          <div className="flex flex-wrap gap-1">
                            {profile.traits.map((trait, idx) => (
                              <span
                                key={idx}
                                className="text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 bg-blue-100/70 text-blue-800 rounded-full"
                              >
                                {trait}
                              </span>
                            ))}
                          </div>
                        </div>
                      </Label>
                    </Card>
                  ))}
                </div>
              </RadioGroup>

              <Button
                onClick={handleNext}
                disabled={!mostDifficultProfile}
                className="w-full mt-4 sm:mt-6"
                size="lg"
              >
                Siguiente
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <Target className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 flex-shrink-0" />
                <h3 className="text-base sm:text-lg font-semibold">
                  ¿Con qué perfil quieres empezar a practicar?
                </h3>
              </div>

              <RadioGroup
                value={practiceStartProfile || ''}
                onValueChange={(value) => setPracticeStartProfile(value as 'CEO' | 'CTO' | 'CFO')}
              >
                <div className="space-y-2 sm:space-y-3">
                  {profiles.map((profile) => (
                    <Card
                      key={profile.value}
                      className={`p-3 sm:p-4 cursor-pointer transition-all hover:shadow-md ${
                        practiceStartProfile === profile.value
                          ? 'ring-2 ring-blue-500 bg-blue-50'
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setPracticeStartProfile(profile.value as 'CEO' | 'CTO' | 'CFO')}
                    >
                      <Label className="flex items-start gap-2 sm:gap-3 cursor-pointer">
                        <RadioGroupItem
                          value={profile.value}
                          className="mt-1 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 sm:gap-2 mb-1 flex-wrap">
                            <span className="text-xl sm:text-2xl">{profile.icon}</span>
                            <span className="font-semibold text-sm sm:text-base">{profile.label}</span>
                            {mostDifficultProfile === profile.value && (
                              <span className="text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 bg-orange-100 text-orange-700 rounded-full">
                                Más difícil para ti
                              </span>
                            )}
                          </div>
                          <p className="text-xs sm:text-sm text-gray-600 mb-1.5 sm:mb-2">{profile.description}</p>
                          <div className="flex flex-wrap gap-1">
                            {profile.traits.map((trait, idx) => (
                              <span
                                key={idx}
                                className="text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 bg-blue-100/70 text-blue-800 rounded-full"
                              >
                                {trait}
                              </span>
                            ))}
                          </div>
                        </div>
                      </Label>
                    </Card>
                  ))}
                </div>
              </RadioGroup>

              <div className="flex gap-2 sm:gap-3 mt-4 sm:mt-6">
                <Button
                  onClick={() => setCurrentQuestion(1)}
                  variant="outline"
                  size="lg"
                  className="flex-1"
                >
                  Anterior
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!practiceStartProfile || isSubmitting}
                  size="lg"
                  className="flex-1"
                >
                  <span className="hidden sm:inline">{isSubmitting ? 'Guardando...' : 'Comenzar Práctica'}</span>
                  <span className="sm:hidden">{isSubmitting ? 'Guardando...' : 'Comenzar'}</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}