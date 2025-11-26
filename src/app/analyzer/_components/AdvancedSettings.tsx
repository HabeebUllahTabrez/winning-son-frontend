// src/app/analyzer/_components/AdvancedSettings.tsx
"use client";

import { useState } from 'react';
import { AdvancedSettings as AdvancedSettingsType } from '../_types/analyzer';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

interface AdvancedSettingsProps {
  settings: AdvancedSettingsType;
  onUpdate: (settings: AdvancedSettingsType) => void;
}

export function AdvancedSettings({ settings, onUpdate }: AdvancedSettingsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const updateSetting = <K extends keyof AdvancedSettingsType>(
    key: K,
    value: AdvancedSettingsType[K]
  ) => {
    onUpdate({
      ...settings,
      [key]: value,
    });
  };

  return (
    <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
      {/* Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <span className="font-semibold text-lg">Advanced Settings</span>
          <span className="text-xs text-gray-500">(Optional)</span>
        </div>
        {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="p-4 space-y-4 bg-white">
          {/* Compare with Previous Period */}
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.compareWithPrevious}
              onChange={(e) => updateSetting('compareWithPrevious', e.target.checked)}
              className="mt-1 h-5 w-5 rounded border-gray-300 text-black focus:ring-black"
            />
            <div>
              <div className="font-semibold text-sm">Compare with Previous Period</div>
              <div className="text-xs text-gray-600">
                Analyze changes from the equivalent previous time period
              </div>
            </div>
          </label>

          {/* Include Karma Analysis */}
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.includeKarmaAnalysis}
              onChange={(e) => updateSetting('includeKarmaAnalysis', e.target.checked)}
              className="mt-1 h-5 w-5 rounded border-gray-300 text-black focus:ring-black"
            />
            <div>
              <div className="font-semibold text-sm">Include Karma Score Analysis</div>
              <div className="text-xs text-gray-600">
                Show combined karma metrics in the analysis
              </div>
            </div>
          </label>

          {/* Focus Area */}
          <div className="space-y-2">
            <label className="font-semibold text-sm block">Focus Area</label>
            <div className="grid grid-cols-3 gap-2">
              {(['alignment', 'contentment', 'both'] as const).map((area) => (
                <button
                  key={area}
                  type="button"
                  onClick={() => updateSetting('focusArea', area)}
                  className={`
                    p-2 rounded-lg border-2 text-sm font-medium transition-all
                    ${
                      settings.focusArea === area
                        ? 'border-black bg-black text-white'
                        : 'border-gray-300 bg-white hover:border-gray-400'
                    }
                  `}
                >
                  {area === 'both' ? 'Both' : area.charAt(0).toUpperCase() + area.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Output Format */}
          <div className="space-y-2">
            <label className="font-semibold text-sm block">Output Format</label>
            <div className="grid grid-cols-2 gap-2">
              {(['markdown', 'plain'] as const).map((format) => (
                <button
                  key={format}
                  type="button"
                  onClick={() => updateSetting('outputFormat', format)}
                  className={`
                    p-2 rounded-lg border-2 text-sm font-medium transition-all
                    ${
                      settings.outputFormat === format
                        ? 'border-black bg-black text-white'
                        : 'border-gray-300 bg-white hover:border-gray-400'
                    }
                  `}
                >
                  {format === 'markdown' ? 'Markdown' : 'Plain Text'}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
