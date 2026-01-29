import { BACKGROUND_OPTIONS, type BackgroundId } from './background-options';

interface BackgroundSelectorProps {
  value: BackgroundId;
  onChange: (id: BackgroundId) => void;
}

export function BackgroundSelector({ value, onChange }: BackgroundSelectorProps) {
  return (
    <div className="flex items-center gap-1.5 self-center mb-2">
      <span className="text-[10px] text-[#a0a0b0] uppercase tracking-wider mr-1">BG</span>
      {BACKGROUND_OPTIONS.map((opt) => (
        <button
          key={opt.id}
          onClick={() => onChange(opt.id)}
          title={opt.label}
          className={`w-7 h-7 rounded border-2 transition-all overflow-hidden ${
            value === opt.id
              ? 'border-[#f15bb5] scale-110'
              : 'border-[#2a2a3a] hover:border-[#4a4a5a]'
          }`}
        >
          {opt.src ? (
            <img
              src={opt.src}
              alt={opt.label}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-[#0a0a12] flex items-center justify-center">
              <span className="text-[8px] text-[#666]">OFF</span>
            </div>
          )}
        </button>
      ))}
    </div>
  );
}
