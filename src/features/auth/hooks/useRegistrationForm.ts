import { useState, useEffect, useCallback } from 'react';
import {
  RegistrationFormData,
  getAllFormSteps,
  FormStep,
  LikertValue,
  RegistrationFormService,
} from '@maity/shared';

interface UseRegistrationFormProps {
  userId: string;
  onComplete: () => void;
}

interface UseRegistrationFormReturn {
  currentStep: number;
  totalSteps: number;
  answeredSteps: number;
  formData: Partial<RegistrationFormData>;
  currentStepInfo: FormStep;
  isFirstStep: boolean;
  isLastStep: boolean;
  isSubmitting: boolean;
  error: string | null;
  setAnswer: (questionId: string, value: string | LikertValue) => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  submitForm: () => Promise<void>;
  canGoNext: boolean;
}

export function useRegistrationForm({
  userId,
  onComplete,
}: UseRegistrationFormProps): UseRegistrationFormReturn {
  const steps = getAllFormSteps();
  const totalSteps = steps.length; // 19

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Partial<RegistrationFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load saved progress on mount
  useEffect(() => {
    const savedProgress = RegistrationFormService.loadFormProgress(userId);
    if (savedProgress) {
      setFormData(savedProgress);
      console.log('[useRegistrationForm] Loaded saved progress');
    }
  }, [userId]);

  // Auto-save progress
  useEffect(() => {
    if (Object.keys(formData).length > 0) {
      RegistrationFormService.saveFormProgress(userId, formData);
    }
  }, [formData, userId]);

  const currentStepInfo = steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  // Calculate how many questions have been answered
  const answeredSteps = steps.filter((step) => {
    const answer = formData[step.questionId as keyof RegistrationFormData];
    return answer !== undefined && answer !== null && answer !== '';
  }).length;

  // Check if current question is answered
  const isCurrentQuestionAnswered = () => {
    const questionId = currentStepInfo.questionId;
    const answer = formData[questionId as keyof RegistrationFormData];
    return answer !== undefined && answer !== null && answer !== '';
  };

  const canGoNext = isCurrentQuestionAnswered();

  // Set answer for a question
  const setAnswer = useCallback((questionId: string, value: string | LikertValue) => {
    setFormData((prev) => ({
      ...prev,
      [questionId]: value,
    }));
    setError(null);
  }, []);

  // Go to next step
  const goToNextStep = useCallback(() => {
    if (!canGoNext) {
      setError('Por favor, responde la pregunta antes de continuar');
      return;
    }

    if (!isLastStep) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1));
      setError(null);
    }
  }, [canGoNext, isLastStep, totalSteps]);

  // Go to previous step
  const goToPreviousStep = useCallback(() => {
    if (!isFirstStep) {
      setCurrentStep((prev) => Math.max(prev - 1, 0));
      setError(null);
    }
  }, [isFirstStep]);

  // Auto-advance for Likert questions
  useEffect(() => {
    if (currentStepInfo.type === 'likert' && isCurrentQuestionAnswered()) {
      // Auto-advance after 500ms
      const timer = setTimeout(() => {
        if (!isLastStep) {
          goToNextStep();
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [currentStepInfo.type, isCurrentQuestionAnswered, isLastStep, goToNextStep]);

  // Submit form
  const submitForm = useCallback(async () => {
    if (isSubmitting) return;

    // Validate all fields are filled
    const requiredFields = steps.map((s) => s.questionId);
    const missingFields = requiredFields.filter(
      (field) =>
        formData[field as keyof RegistrationFormData] === undefined ||
        formData[field as keyof RegistrationFormData] === null ||
        formData[field as keyof RegistrationFormData] === ''
    );

    if (missingFields.length > 0) {
      setError(`Por favor, completa todas las preguntas antes de enviar (faltantes: ${missingFields.length})`);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await RegistrationFormService.submitForm(
        userId,
        formData as RegistrationFormData
      );

      if (result.success) {
        // Clear saved progress
        RegistrationFormService.clearFormProgress(userId);
        console.log('[useRegistrationForm] ✅ Form submitted successfully');
        onComplete();
      } else {
        setError(result.error || 'Error al enviar el formulario');
        setIsSubmitting(false);
      }
    } catch (err: any) {
      console.error('[useRegistrationForm] ❌ Error submitting form:', err);
      setError(err.message || 'Ocurrió un error inesperado. Por favor, intenta de nuevo.');
      setIsSubmitting(false);
    }
  }, [formData, userId, onComplete, isSubmitting, steps]);

  return {
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
  };
}
