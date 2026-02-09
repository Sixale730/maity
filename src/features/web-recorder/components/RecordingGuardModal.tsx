/**
 * Recording Guard Modal
 *
 * Modal that appears when user tries to navigate away during an active recording.
 * Offers to save the recording before leaving instead of losing it.
 */

import { Mic, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/ui/components/ui/alert-dialog';
import { Button } from '@/ui/components/ui/button';

interface RecordingGuardModalProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  isSaving?: boolean;
}

export function RecordingGuardModal({
  isOpen,
  onCancel,
  onConfirm,
  isSaving = false,
}: RecordingGuardModalProps) {
  const { t } = useLanguage();

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/30">
              <Mic className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <AlertDialogTitle>
              {t('recorder.guard_title')}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            {t('recorder.guard_description')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isSaving}
          >
            {t('recorder.guard_cancel')}
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('recorder.guard_saving')}
              </>
            ) : (
              t('recorder.guard_confirm')
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
