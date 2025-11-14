import { useState } from 'react';
import { Button } from '@/ui/components/ui/button';
import { TestTube2 } from 'lucide-react';
import { AdminSelfAssessmentTest } from './AdminSelfAssessmentTest';

/**
 * Button that opens admin self-assessment testing dialog
 * Displays in admin dashboard for quick testing access
 */
export function AdminTestingButton() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsDialogOpen(true)}
        variant="outline"
        className="w-full sm:w-auto"
      >
        <TestTube2 className="w-4 h-4 mr-2" />
        Probar Autoevaluación
      </Button>

      <AdminSelfAssessmentTest
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
    </>
  );
}
