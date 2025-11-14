import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/ui/components/ui/dialog';
import { Button } from '@/ui/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/ui/components/ui/radio-group';
import { Label } from '@/ui/components/ui/label';
import { Card } from '@/ui/components/ui/card';
import { Separator } from '@/ui/components/ui/separator';
import { Loader2, RotateCcw } from 'lucide-react';
import { useAdminSelfAssessmentTest } from '../hooks/useAdminSelfAssessmentTest';
import {
  LikertQuestions,
  CompetencyArea,
  CompetencyColors,
  LikertValue,
} from '@maity/shared';

interface AdminSelfAssessmentTestProps {
  isOpen: boolean;
  onClose: () => void;
}

const LIKERT_OPTIONS = [
  { value: 1, label: '1 - Totalmente en desacuerdo' },
  { value: 2, label: '2 - En desacuerdo' },
  { value: 3, label: '3 - Neutral' },
  { value: 4, label: '4 - De acuerdo' },
  { value: 5, label: '5 - Totalmente de acuerdo' },
];

export function AdminSelfAssessmentTest({ isOpen, onClose }: AdminSelfAssessmentTestProps) {
  const {
    formData,
    updateQuestion,
    resetForm,
    setPreset,
    submitForm,
    isLoading,
  } = useAdminSelfAssessmentTest();

  const handleSubmit = () => {
    submitForm();
    // Keep dialog open to show success message, user can close manually
  };

  const handleReset = () => {
    resetForm();
  };

  // Group questions by competency
  const groupedQuestions = LikertQuestions.reduce((acc, question) => {
    if (!acc[question.area]) {
      acc[question.area] = [];
    }
    acc[question.area].push(question);
    return acc;
  }, {} as Record<CompetencyArea, typeof LikertQuestions>);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Prueba de Autoevaluación (Admin)</DialogTitle>
          <DialogDescription>
            Completa las 12 preguntas Likert para actualizar tu autoevaluación. Los resultados se
            verán en el radar chart cuando cambies a vista de usuario.
          </DialogDescription>
        </DialogHeader>

        {/* Preset Buttons */}
        <div className="flex flex-wrap gap-2 py-3 border-t border-b">
          <p className="text-sm font-medium text-gray-700 w-full mb-2">Presets de prueba:</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setPreset('low')}
            disabled={isLoading}
          >
            Scores Bajos
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setPreset('medium')}
            disabled={isLoading}
          >
            Scores Medios
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setPreset('high')}
            disabled={isLoading}
          >
            Scores Altos
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setPreset('mixed')}
            disabled={isLoading}
          >
            Scores Mixtos
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleReset}
            disabled={isLoading}
            className="ml-auto"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Resetear
          </Button>
        </div>

        {/* Questions by Competency */}
        <div className="space-y-6 py-4">
          {Object.entries(groupedQuestions).map(([area, questions], index) => {
            const competencyArea = area as CompetencyArea;
            const color = CompetencyColors[competencyArea];

            return (
              <div key={area}>
                {index > 0 && <Separator className="my-6" />}

                {/* Competency Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <h3 className="text-lg font-semibold capitalize">
                    {competencyArea}
                  </h3>
                </div>

                {/* Questions for this competency */}
                <div className="space-y-4">
                  {questions.map((question) => (
                    <Card key={question.id} className="p-4">
                      <Label className="text-sm font-medium mb-3 block">
                        {question.text}
                      </Label>
                      <RadioGroup
                        value={formData[question.id as keyof typeof formData].toString()}
                        onValueChange={(value) =>
                          updateQuestion(
                            question.id as keyof typeof formData,
                            parseInt(value) as LikertValue
                          )
                        }
                        disabled={isLoading}
                        className="space-y-2"
                      >
                        {LIKERT_OPTIONS.map((option) => (
                          <div key={option.value} className="flex items-center space-x-3">
                            <RadioGroupItem
                              value={option.value.toString()}
                              id={`${question.id}-${option.value}`}
                            />
                            <Label
                              htmlFor={`${question.id}-${option.value}`}
                              className="font-normal cursor-pointer text-sm"
                            >
                              {option.label}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <DialogFooter className="border-t pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              'Guardar Autoevaluación'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
