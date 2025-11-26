// src/app/analyzer/_components/VoiceToneSelector.tsx
"use client";

import { VoiceTone } from '../_types/analyzer';
import { VOICE_TONE_INFO } from '../_lib/promptTemplates';
import { useState } from 'react';

interface VoiceToneSelectorProps {
  value: VoiceTone;
  onChange: (tone: VoiceTone) => void;
}

export function VoiceToneSelector({ value, onChange }: VoiceToneSelectorProps) {
  const [hoveredTone, setHoveredTone] = useState<VoiceTone | null>(null);

  const tones: VoiceTone[] = ['professional', 'friendly', 'motivational', 'sage', 'quirky'];

  return (
    <div className="space-y-3">
      <label className="block text-lg font-semibold">Voice & Tone</label>

      {/* Tone Selection Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {tones.map((tone) => {
          const info = VOICE_TONE_INFO[tone];
          const isSelected = value === tone;
          const isHovered = hoveredTone === tone;

          return (
            <button
              key={tone}
              type="button"
              onClick={() => onChange(tone)}
              onMouseEnter={() => setHoveredTone(tone)}
              onMouseLeave={() => setHoveredTone(null)}
              className={`
                p-4 rounded-lg border-2 transition-all duration-200
                flex flex-col items-center gap-2 text-center
                ${
                  isSelected
                    ? 'border-black bg-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                    : 'border-gray-300 bg-white hover:border-black hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                }
              `}
            >
              <span className="text-3xl">{info.emoji}</span>
              <span className="font-bold text-sm">{info.label}</span>
              <span className={`text-xs ${isSelected ? 'text-gray-200' : 'text-gray-600'}`}>
                {info.subtitle}
              </span>
            </button>
          );
        })}
      </div>

      {/* Preview Text */}
      {hoveredTone && (
        <div className="p-4 bg-gray-50 border-2 border-gray-200 rounded-lg animate-fade-in">
          <p className="text-sm font-semibold text-gray-700 mb-1">Preview:</p>
          <p className="text-sm text-gray-600 italic">{VOICE_TONE_INFO[hoveredTone].preview}</p>
        </div>
      )}
    </div>
  );
}
