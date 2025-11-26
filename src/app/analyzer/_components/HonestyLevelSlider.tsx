// src/app/analyzer/_components/HonestyLevelSlider.tsx
"use client";

import { HonestyLevel } from '../_types/analyzer';
import { HONESTY_LEVEL_LABELS } from '../_lib/promptTemplates';

interface HonestyLevelSliderProps {
  value: HonestyLevel;
  onChange: (level: HonestyLevel) => void;
}

export function HonestyLevelSlider({ value, onChange }: HonestyLevelSliderProps) {
  const levels: HonestyLevel[] = [1, 2, 3, 4, 5, 6];
  const currentLabel = HONESTY_LEVEL_LABELS[value];

  // Color based on honesty level
  const getColor = (level: HonestyLevel) => {
    if (level <= 2) return 'text-green-600';
    if (level <= 4) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSliderColor = () => {
    if (value <= 2) return 'bg-green-500';
    if (value <= 4) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-lg font-semibold">Honesty Level</label>
        <div className={`flex items-center gap-2 ${getColor(value)}`}>
          <span className="text-2xl">{currentLabel.emoji}</span>
          <span className="font-bold text-lg">{currentLabel.label}</span>
        </div>
      </div>

      {/* Slider */}
      <div className="relative">
        <input
          type="range"
          min="1"
          max="6"
          step="1"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value) as HonestyLevel)}
          className="w-full h-3 rounded-lg appearance-none cursor-pointer slider"
          style={{
            background: `linear-gradient(to right,
              #10b981 0%,
              #10b981 ${((value - 1) / 5) * 100}%,
              #d1d5db ${((value - 1) / 5) * 100}%,
              #d1d5db 100%)`,
          }}
        />

        {/* Tick marks */}
        <div className="flex justify-between mt-2 px-1">
          {levels.map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => onChange(level)}
              className={`
                text-xs font-medium transition-all
                ${value === level ? 'text-black scale-110' : 'text-gray-400 hover:text-gray-600'}
              `}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
        {currentLabel.description}
      </p>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: black;
          border: 3px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          cursor: pointer;
        }

        .slider::-moz-range-thumb {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: black;
          border: 3px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          cursor: pointer;
        }

        .slider:focus {
          outline: none;
        }

        .slider::-webkit-slider-thumb:hover {
          transform: scale(1.1);
        }

        .slider::-moz-range-thumb:hover {
          transform: scale(1.1);
        }
      `}</style>
    </div>
  );
}
