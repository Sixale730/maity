/**
 * LevelsTable Component
 * Displays all 5 levels in a visually appealing table format
 */

import { getAllLevels } from '../utils/levelHelpers';
import { Card, CardContent } from '@/ui/components/ui/card';

export function LevelsTable() {
  const levels = getAllLevels();

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="grid gap-4">
        {levels.map((levelInfo) => (
          <Card
            key={levelInfo.level}
            className="transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-6">
                {/* Level Number */}
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                  <span className="text-xl font-bold text-gray-700">
                    {levelInfo.level}
                  </span>
                </div>

                {/* Icon */}
                <div className="text-5xl flex-shrink-0">
                  {levelInfo.icon}
                </div>

                {/* Level Info */}
                <div className="flex-1">
                  <h3 className={`text-2xl font-bold ${levelInfo.color} mb-1`}>
                    {levelInfo.name}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {levelInfo.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
