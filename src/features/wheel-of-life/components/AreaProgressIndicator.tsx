import { WHEEL_AREAS } from '@maity/shared';

interface AreaProgressIndicatorProps {
  currentIndex: number;
  areas: { area_id: string; current_score: number }[];
}

export function AreaProgressIndicator({ currentIndex, areas }: AreaProgressIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-1.5 flex-wrap">
      {WHEEL_AREAS.map((area, i) => {
        const isCurrent = i === currentIndex;
        const isCompleted = i < currentIndex;
        const areaData = areas[i];
        const hasScore = areaData && areaData.current_score !== 5;

        return (
          <div
            key={area.id}
            className={`
              w-3 h-3 rounded-full transition-all duration-300
              ${isCurrent ? 'ring-2 ring-offset-1 ring-offset-[#050505] scale-125' : ''}
            `}
            style={{
              backgroundColor: isCurrent
                ? area.color
                : isCompleted || hasScore
                  ? `${area.color}80`
                  : '#2a2a3e',
              ringColor: isCurrent ? area.color : undefined,
            }}
            title={area.id}
          />
        );
      })}
    </div>
  );
}
