/**
 * LevelsIntroPage
 * Welcome page showing the user the 5 levels they can achieve
 * Displayed after completing registration
 */

import { useNavigate } from 'react-router-dom';
import { Button } from '@/ui/components/ui/button';
import { LevelsTable } from '../components/LevelsTable';
import { LevelBadge } from '../components/LevelBadge';

export function LevelsIntroPage() {
  const navigate = useNavigate();

  const handleContinue = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            ¡Bienvenido a tu viaje de desarrollo!
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Maity te ayudará a pasar a través de estos niveles
          </p>
        </div>

        {/* Current Level Card */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-8 mb-8 border-2 border-blue-200">
          <div className="text-center">
            <p className="text-lg text-gray-700 mb-4">
              Comienzas tu viaje como:
            </p>
            <LevelBadge level={1} size="lg" showDescription={true} />
          </div>
        </div>

        {/* Levels Table */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Los niveles que alcanzarás
          </h2>
          <LevelsTable />
        </div>

        {/* Motivational Message */}
        <div className="text-center mb-8">
          <p className="text-lg text-gray-600 italic">
            "Cada práctica te acerca más a convertirte en una leyenda"
          </p>
        </div>

        {/* Continue Button */}
        <div className="flex justify-center">
          <Button
            onClick={handleContinue}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg"
          >
            Ir al Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
