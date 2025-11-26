// src/app/analyzer/_components/ResponseTypeToggle.tsx
"use client";

import { ResponseType } from '../_types/analyzer';

interface ResponseTypeToggleProps {
  value: ResponseType;
  onChange: (type: ResponseType) => void;
}

export function ResponseTypeToggle({ value, onChange }: ResponseTypeToggleProps) {
  const options: { value: ResponseType; label: string; icon: string; description: string }[] = [
    {
      value: 'action-focused',
      label: 'Action-Focused',
      icon: '⚡',
      description: 'Concrete next steps and tactical advice',
    },
    {
      value: 'pattern-focused',
      label: 'Pattern-Focused',
      icon: '🔍',
      description: 'Behavioral insights and self-awareness',
    },
  ];

  return (
    <div className="space-y-3">
      <label className="block text-lg font-semibold">Response Type</label>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {options.map((option) => {
          const isSelected = value === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`
                p-4 rounded-lg border-2 transition-all duration-200
                text-left
                ${
                  isSelected
                    ? 'border-black bg-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                    : 'border-gray-300 bg-white hover:border-black hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                }
              `}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{option.icon}</span>
                <div className="flex-1">
                  <div className="font-bold text-base mb-1">{option.label}</div>
                  <div
                    className={`text-sm ${isSelected ? 'text-gray-200' : 'text-gray-600'}`}
                  >
                    {option.description}
                  </div>
                </div>
                {isSelected && (
                  <span className="text-xl">✓</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
