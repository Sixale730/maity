import React, { useEffect } from 'react';
import Joyride, { Step, CallBackProps, STATUS, EVENTS, ACTIONS } from 'react-joyride';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '@/contexts/UserContext';
import { usePlatformTour } from '@/contexts/PlatformTourContext';
import { MAITY_COLORS } from '@/lib/colors';

interface PlatformTourProps {
  run: boolean;
  userRole: UserRole;
  onFinish: () => void;
  onSkip: () => void;
}

const getTourSteps = (role: UserRole): Step[] => {
  const baseSteps: Step[] = [
    {
      target: 'a[href="/dashboard"]',
      content: '¡Bienvenido a Maity! Aquí encontrarás tu panel principal con todas tus métricas y progreso.',
      placement: 'auto',
      disableBeacon: true,
    },
    {
      target: 'a[href="/roleplay"]',
      content: 'En la Sala de entrenamiento podrás practicar conversaciones con agentes de voz inteligentes.',
      placement: 'auto',
      disableBeacon: true,
    },
  ];

  if (role === 'admin') {
    return [
      ...baseSteps,
      {
        target: 'a[href="/demo"]',
        content: '¿Necesitas mostrar la plataforma? Usa esta sección Demo para reiniciar el tour cuando quieras.',
        placement: 'auto',
        disableBeacon: true,
      },
      {
        target: 'a[href="/progress"]',
        content: 'Visualiza tu progreso detallado y el avance en cada perfil de roleplay.',
        placement: 'auto',
        disableBeacon: true,
      },
      {
        target: 'a[href="/sessions"]',
        content: 'Accede al historial completo de todas tus sesiones de práctica.',
        placement: 'auto',
        disableBeacon: true,
      },
      {
        target: 'a[href="/analytics"]',
        content: 'Analiza métricas avanzadas y estadísticas de rendimiento.',
        placement: 'auto',
        disableBeacon: true,
      },
      {
        target: 'a[href="/usuarios"]',
        content: 'Gestiona usuarios y permisos de toda la plataforma.',
        placement: 'auto',
        disableBeacon: true,
      },
      {
        target: 'a[href="/organizations"]',
        content: 'Administra las organizaciones y sus configuraciones.',
        placement: 'auto',
        disableBeacon: true,
      },
    ];
  } else if (role === 'manager') {
    return [
      ...baseSteps,
      {
        target: 'a[href="/progress"]',
        content: 'Visualiza tu progreso detallado y el avance en cada perfil de roleplay.',
        placement: 'auto',
        disableBeacon: true,
      },
      {
        target: 'a[href="/sessions"]',
        content: 'Accede al historial completo de todas tus sesiones de práctica.',
        placement: 'auto',
        disableBeacon: true,
      },
      {
        target: 'a[href="/team"]',
        content: 'Gestiona y monitorea el progreso de tu equipo.',
        placement: 'auto',
        disableBeacon: true,
      },
      {
        target: 'a[href="/planes"]',
        content: 'Crea y asigna planes de desarrollo personalizados.',
        placement: 'auto',
        disableBeacon: true,
      },
    ];
  } else {
    // user role
    return [
      ...baseSteps,
      {
        target: 'a[href="/progress"]',
        content: 'Visualiza tu progreso detallado y el avance en cada perfil de roleplay.',
        placement: 'auto',
        disableBeacon: true,
      },
      {
        target: 'a[href="/sessions"]',
        content: 'Accede al historial completo de todas tus sesiones de práctica.',
        placement: 'auto',
        disableBeacon: true,
      },
      {
        target: 'a[href="/plan"]',
        content: 'Consulta tu plan de desarrollo personalizado.',
        placement: 'auto',
        disableBeacon: true,
      },
      {
        target: 'a[href="/logros"]',
        content: '¡Celebra tus logros! Aquí verás todas tus insignias y reconocimientos.',
        placement: 'auto',
        disableBeacon: true,
      },
    ];
  }
};

export function PlatformTour({ run, userRole, onFinish, onSkip }: PlatformTourProps) {
  const steps = getTourSteps(userRole);
  const navigate = useNavigate();

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, type, index } = data;

    // Cuando el tour termina o es saltado
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status as any)) {
      if (status === STATUS.SKIPPED) {
        onSkip();
      } else {
        onFinish();
      }
      // Regresar a dashboard al finalizar
      navigate('/dashboard');
      return;
    }

    // Si el usuario cierra el tooltip (X), tratarlo como skip
    if (type === EVENTS.TOOLTIP_CLOSE) {
      onSkip();
      return;
    }

    // Navegación automática ANTES de mostrar cada paso
    if (type === EVENTS.STEP_BEFORE) {
      const targetStep = steps[index];

      // Extraer URL del target (formato: 'a[href="/dashboard"]')
      const targetMatch = targetStep.target.toString().match(/href="([^"]+)"/);
      if (targetMatch && targetMatch[1]) {
        const targetUrl = targetMatch[1];
        navigate(targetUrl);
      }
    }

    // Personalizar el texto del botón para mostrar progreso en español
    if (type === EVENTS.TOOLTIP) {
      setTimeout(() => {
        const nextButton = document.querySelector('.react-joyride__tooltip button[data-action="primary"]');
        if (nextButton) {
          const currentStep = index + 1;
          const totalSteps = steps.length;
          const isLast = currentStep === totalSteps;
          nextButton.textContent = isLast ? 'Finalizar' : `Siguiente (${currentStep}/${totalSteps})`;
        }

        const backButton = document.querySelector('.react-joyride__tooltip button[data-action="back"]');
        if (backButton) {
          backButton.textContent = 'Atrás';
        }

        const skipButton = document.querySelector('.react-joyride__tooltip button[data-action="skip"]');
        if (skipButton) {
          skipButton.textContent = 'Saltar tour';
        }
      }, 10);
    }
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showProgress
      showSkipButton
      hideCloseButton
      callback={handleJoyrideCallback}
      scrollToFirstStep
      disableOverlayClose
      disableScrolling
      spotlightClicks={false}
      floaterProps={{
        disableAnimation: false,
        offset: 10,
        styles: {
          floater: {
            filter: 'none',
          }
        }
      }}
      locale={{
        back: 'Atrás',
        close: 'Cerrar',
        last: 'Finalizar',
        next: 'Siguiente',
        open: 'Abrir',
        skip: 'Saltar tour',
      }}
      styles={{
        options: {
          primaryColor: MAITY_COLORS.primary,
          backgroundColor: '#1a1a1a',
          textColor: '#e7e7e9',
          arrowColor: '#1a1a1a',
          overlayColor: 'rgba(0, 0, 0, 0.7)',
          zIndex: 10000,
        },
        tooltip: {
          borderRadius: 8,
          padding: 20,
        },
        tooltipContainer: {
          textAlign: 'left',
        },
        tooltipTitle: {
          fontSize: '18px',
          fontWeight: 'bold',
          marginBottom: 10,
        },
        tooltipContent: {
          fontSize: '14px',
          padding: '10px 0',
        },
        buttonNext: {
          backgroundColor: MAITY_COLORS.primary,
          borderRadius: 6,
          padding: '8px 16px',
          fontSize: '14px',
          fontWeight: '600',
        },
        buttonBack: {
          color: MAITY_COLORS.primary,
          marginRight: 10,
        },
        buttonSkip: {
          color: '#9ca3af',
        },
      }}
    />
  );
}
