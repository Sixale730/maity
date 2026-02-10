import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/ui/components/ui/button';
import { Input } from '@/ui/components/ui/input';
import { Textarea } from '@/ui/components/ui/textarea';
import { Label } from '@/ui/components/ui/label';
import { Alert, AlertDescription } from '@/ui/components/ui/alert';
import { Checkbox } from '@/ui/components/ui/checkbox';
import { ArrowLeft, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { LikertScale } from './LikertScale';
import { ProgressIndicator } from './ProgressIndicator';
import { PhoneInput } from './PhoneInput';
import { useRegistrationForm } from '../../hooks/useRegistrationForm';
import {
  PersonalInfoQuestions,
  LikertQuestions,
  OpenQuestions,
  ConsentQuestion,
  LikertValue,
  CompetencyArea,
} from '@maity/shared';

interface NativeRegistrationFormProps {
  userId: string;
  onComplete: () => void;
}

export function NativeRegistrationForm({
  userId,
  onComplete,
}: NativeRegistrationFormProps) {
  const {
    currentStep,
    totalSteps,
    answeredSteps,
    formData,
    currentStepInfo,
    isFirstStep,
    isLastStep,
    isSubmitting,
    error,
    setAnswer,
    goToNextStep,
    goToPreviousStep,
    submitForm,
    canGoNext,
  } = useRegistrationForm({ userId, onComplete });

  const { questionId, type } = currentStepInfo;

  // Render Personal Info Question
  const renderPersonalInfo = () => {
    const question = PersonalInfoQuestions.find((q) => q.id === questionId);
    if (!question) return null;

    const value = (formData[questionId as keyof typeof formData] as string) || '';

    // Special handling for phone number (q3)
    const isPhoneQuestion = questionId === 'q3';

    return (
      <motion.div
        key={questionId}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        {isPhoneQuestion ? (
          <PhoneInput
            id={questionId}
            label={question.label}
            placeholder={question.placeholder}
            value={value}
            onChange={(val) => setAnswer(questionId, val)}
          />
        ) : (
          <div className="space-y-3">
            <Label htmlFor={questionId} className="text-lg font-medium">
              {question.label}
            </Label>
            <Input
              id={questionId}
              type={question.type}
              placeholder={question.placeholder}
              value={value}
              onChange={(e) => setAnswer(questionId, e.target.value)}
              className="text-base h-12"
              autoFocus
            />
          </div>
        )}

        <div className="flex gap-3 justify-end">
          {!isFirstStep && (
            <Button
              type="button"
              variant="outline"
              onClick={goToPreviousStep}
              disabled={isSubmitting}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Atrás
            </Button>
          )}
          <Button
            type="button"
            onClick={goToNextStep}
            disabled={!canGoNext || isSubmitting}
          >
            Siguiente
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </motion.div>
    );
  };

  // Render Likert Question
  const renderLikertQuestion = () => {
    const question = LikertQuestions.find((q) => q.id === questionId);
    if (!question) return null;

    const value = formData[questionId as keyof typeof formData] as
      | LikertValue
      | undefined;

    return (
      <motion.div
        key={questionId}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        className="space-y-8"
      >
        {/* Area Badge */}
        <div className="flex items-center gap-2">
          <span
            className="px-3 py-1 rounded-full text-sm font-medium text-white"
            style={{
              backgroundColor:
                question.area === CompetencyArea.CLARIDAD
                  ? '#485df4'
                  : question.area === CompetencyArea.ADAPTACION
                  ? '#1bea9a'
                  : question.area === CompetencyArea.PERSUASION
                  ? '#9b4dca'
                  : question.area === CompetencyArea.ESTRUCTURA
                  ? '#ff8c42'
                  : question.area === CompetencyArea.PROPOSITO
                  ? '#ffd93d'
                  : '#8b4513',
            }}
          >
            {question.area.toUpperCase()}
          </span>
        </div>

        {/* Question Text */}
        <div>
          <h3 className="text-xl sm:text-2xl font-medium text-foreground">
            {question.text}
          </h3>
        </div>

        {/* Likert Scale */}
        <LikertScale
          value={value}
          onChange={(val) => setAnswer(questionId, val)}
          area={question.area}
          autoAdvance={true}
          autoAdvanceDelay={500}
        />

        {/* Back Button (only for manual control) */}
        {!isFirstStep && (
          <div className="flex justify-start">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={goToPreviousStep}
              disabled={isSubmitting}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Atrás
            </Button>
          </div>
        )}
      </motion.div>
    );
  };

  // Render Open Question
  const renderOpenQuestion = () => {
    const question = OpenQuestions.find((q) => q.id === questionId);
    if (!question) return null;

    const value = (formData[questionId as keyof typeof formData] as string) || '';

    return (
      <motion.div
        key={questionId}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        <div className="space-y-3">
          <Label htmlFor={questionId} className="text-lg font-medium">
            {question.text}
          </Label>
          <Textarea
            id={questionId}
            placeholder={question.placeholder}
            value={value}
            onChange={(e) => setAnswer(questionId, e.target.value)}
            className="text-base min-h-[150px] resize-none"
            autoFocus
          />
          <p className="text-xs text-muted-foreground">
            {value.length} caracteres
          </p>
        </div>

        <div className="flex gap-3 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={goToPreviousStep}
            disabled={isSubmitting}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Atrás
          </Button>
          <Button
            type="button"
            onClick={goToNextStep}
            disabled={!canGoNext || isSubmitting}
          >
            Siguiente
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </motion.div>
    );
  };

  // Render Consent Question
  const renderConsentQuestion = () => {
    const value = formData[questionId as keyof typeof formData] as boolean;

    return (
      <motion.div
        key={questionId}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        className="space-y-8"
      >
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <Checkbox
              id={questionId}
              checked={value || false}
              onCheckedChange={(checked) => setAnswer(questionId, checked as boolean)}
              className="mt-1"
            />
            <Label
              htmlFor={questionId}
              className="text-base font-medium text-foreground cursor-pointer leading-relaxed"
            >
              {ConsentQuestion.text}
            </Label>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={goToPreviousStep}
            disabled={isSubmitting}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Atrás
          </Button>
          <Button
            type="button"
            onClick={submitForm}
            disabled={!canGoNext || isSubmitting}
            className="min-w-[120px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              'Finalizar'
            )}
          </Button>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8 p-4 sm:p-6">
      {/* Progress Indicator */}
      <ProgressIndicator
        currentStep={currentStep}
        totalSteps={totalSteps}
        answeredSteps={answeredSteps}
      />

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Question Content */}
      <AnimatePresence mode="wait">
        {type === 'personal' && renderPersonalInfo()}
        {type === 'likert' && renderLikertQuestion()}
        {type === 'open' && renderOpenQuestion()}
        {type === 'consent' && renderConsentQuestion()}
      </AnimatePresence>
    </div>
  );
}
