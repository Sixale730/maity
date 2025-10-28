import { useNavigate } from 'react-router-dom';
import { Button } from '@/ui/components/ui/button';
import { ArrowLeft } from 'lucide-react';

/**
 * TechWeekSessionsPage - List of Tech Week practice sessions
 *
 * TODO: Implement session history list using RoleplayService.getSessions()
 * filtered by Tech Week profile.
 */
export function TechWeekSessionsPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/tech-week')}
              className="hover:bg-gray-800"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <h1 className="text-2xl font-bold" style={{ color: '#FF69B4' }}>
              Historial de Sesiones - Tech Week
            </h1>
          </div>

          <div className="text-center py-12">
            <p className="text-gray-400">
              Historial de sesiones próximamente...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
