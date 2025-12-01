import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/ui/components/ui/dialog';
import { Button } from '@/ui/components/ui/button';
import { MAITY_COLORS } from '@maity/shared';

interface RoleplayInstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartPractice: () => void;
}

export function RoleplayInstructionsModal({
  isOpen,
  onClose,
  onStartPractice,
}: RoleplayInstructionsModalProps) {
  const handleStartPractice = () => {
    onStartPractice();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white">
            Preparación para la Práctica
          </DialogTitle>
          <DialogDescription className="text-base text-gray-300">
            Mira este video antes de comenzar tu sesión de roleplay
          </DialogDescription>
        </DialogHeader>

        {/* YouTube Video */}
        <div className="w-full">
          <div className="aspect-video w-full rounded-lg overflow-hidden shadow-lg">
            <iframe
              src="https://www.youtube.com/embed/gCfLZJHGfjU"
              title="Instrucciones para Roleplay"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleStartPractice}
            className="w-full text-white font-semibold py-6 text-base hover:opacity-90 transition-opacity"
            style={{
              background: `linear-gradient(to right, ${MAITY_COLORS.primary}, ${MAITY_COLORS.secondary})`,
            }}
          >
            Comenzar Práctica
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
