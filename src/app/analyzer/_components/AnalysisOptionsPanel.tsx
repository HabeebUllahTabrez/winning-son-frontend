// src/app/analyzer/_components/AnalysisOptionsPanel.tsx
"use client";

import { AnalysisOptionKey } from '../_types/analyzer';
import { ANALYSIS_OPTIONS, SMART_PRESETS } from '../_lib/presets';

interface AnalysisOptionsPanelProps {
  selectedOptions: Set<AnalysisOptionKey>;
  onToggleOption: (option: AnalysisOptionKey) => void;
  onApplyPreset: (presetName: string) => void;
  hidePresets?: boolean;
}

export function AnalysisOptionsPanel({
  selectedOptions,
  onToggleOption,
  onApplyPreset,
  hidePresets = false,
}: AnalysisOptionsPanelProps) {
  return (
    <div className="space-y-4">
      <label className="block text-lg font-semibold">Analysis Options</label>

      {/* Smart Presets - only show if not hidden */}
      {!hidePresets && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Smart Presets:</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {SMART_PRESETS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => onApplyPreset(preset.name)}
                className="p-3 rounded-lg border-2 border-gray-300 bg-white hover:border-black hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 text-center"
              >
                <div className="text-2xl mb-1">{preset.icon}</div>
                <div className="font-bold text-xs">{preset.name}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Custom Options */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700">{hidePresets ? 'Choose what to analyze:' : 'Custom Options:'}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {ANALYSIS_OPTIONS.map((option) => {
            const isSelected = selectedOptions.has(option.key);

            return (
              <label
                key={option.key}
                className={`
                  flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
                  ${
                    isSelected
                      ? 'border-black bg-gray-50 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                      : 'border-gray-300 bg-white hover:border-gray-400'
                  }
                `}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onToggleOption(option.key)}
                  className="mt-1 h-5 w-5 rounded border-gray-300 text-black focus:ring-black cursor-pointer"
                />
                <div className="flex-1">
                  <div className="font-semibold text-sm mb-1">{option.label}</div>
                  <div className="text-xs text-gray-600">{option.description}</div>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* Selection Count */}
      <div className="text-center p-2 bg-gray-100 rounded-lg border border-gray-200">
        <span className="text-sm font-medium text-gray-700">
          {selectedOptions.size} {selectedOptions.size === 1 ? 'option' : 'options'} selected
        </span>
      </div>
    </div>
  );
}
