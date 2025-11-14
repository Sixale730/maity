import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/ui/components/ui/dialog';
import { Button } from '@/ui/components/ui/button';
import { ChevronLeft, Loader2, Zap } from 'lucide-react';
import { useAdminSelfAssessmentTest } from '../hooks/useAdminSelfAssessmentTest';
import {
  LikertQuestions,
  CompetencyColors,
  LikertValue,
} from '@maity/shared';
import { LikertScale } from './LikertScale';
import { ProgressIndicator } from './ProgressIndicator';

interface AdminSelfAssessmentTestProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminSelfAssessmentTest({ isOpen, onClose }: AdminSelfAssessmentTestProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const {
    formData,
    updateQuestion,
    setPreset,
    submitForm,
    isLoading,
  } = useAdminSelfAssessmentTest();

  const currentQ = LikertQuestions[currentQuestion];
  const isLastQuestion = currentQuestion === LikertQuestions.length - 1;
  const isFirstQuestion = currentQuestion === 0;

  const handleNext = () => {
    if (currentQuestion < LikertQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleQuestionChange = (value: LikertValue) => {
    updateQuestion(currentQ.id as keyof typeof formData, value);
  };

  const handleSubmit = () => {
    submitForm();
    // Keep dialog open to show success message
  };

  const handlePresetAndSkip = (preset: 'low' | 'medium' | 'high' | 'mixed') => {
    setPreset(preset);
    // Jump to last question to review and submit
    setCurrentQuestion(LikertQuestions.length - 1);
  };

  const handleDialogClose = () => {
    setCurrentQuestion(0);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl">Autoevaluación - Modo Testing</DialogTitle>
              <DialogDescription>
                Completa las 12 preguntas para actualizar tu autoevaluación de prueba
              </DialogDescription>
            </div>
            {/* Quick preset buttons */}
            <div className="flex gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handlePresetAndSkip('low')}
                disabled={isLoading}
                title="Rellenar con scores bajos"
              >
                <Zap className="w-3 h-3 mr-1" />
                Bajos
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handlePresetAndSkip('high')}
                disabled={isLoading}
                title="Rellenar con scores altos"
              >
                <Zap className="w-3 h-3 mr-1" />
                Altos
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handlePresetAndSkip('mixed')}
                disabled={isLoading}
                title="Rellenar con scores mixtos"
              >
                <Zap className="w-3 h-3 mr-1" />
                Mixtos
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Progress Indicator */}
        <ProgressIndicator
          currentStep={currentQuestion}
          totalSteps={LikertQuestions.length}
        />

        {/* Wizard Content with Animations */}
        <div className="relative min-h-[400px] py-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {/* Competency Badge */}
              <div className="flex justify-center">
                <span
                  className="px-4 py-2 rounded-full text-sm font-medium text-white shadow-sm"
                  style={{ backgroundColor: CompetencyColors[currentQ.area] }}
                >
                  {currentQ.area.toUpperCase()}
                </span>
              </div>

              {/* Question Text */}
              <div className="text-center px-4">
                <h3 className="text-xl sm:text-2xl font-medium text-foreground">
                  {currentQ.text}
                </h3>
              </div>

              {/* LikertScale Component */}
              <div className="px-4">
                <LikertScale
                  value={formData[currentQ.id as keyof typeof formData]}
                  onChange={handleQuestionChange}
                  area={currentQ.area}
                  autoAdvance={true}
                  autoAdvanceDelay={500}
                  onAutoAdvance={handleNext}
                />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Footer */}
        <DialogFooter className="border-t pt-4">
          <div className="flex justify-between items-center w-full">
            {/* Back Button */}
            <Button
              type="button"
              variant="ghost"
              onClick={handlePrev}
              disabled={isFirstQuestion || isLoading}
              className={isFirstQuestion ? 'invisible' : ''}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Atrás
            </Button>

            {/* Submit Button (only on last question) */}
            {isLastQuestion && (
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
            )}

            {/* Optional: Manual next button (hidden since auto-advance handles it) */}
            {!isLastQuestion && (
              <Button
                type="button"
                variant="ghost"
                onClick={handleNext}
                disabled={isLoading}
                className="invisible"
              >
                Siguiente
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
