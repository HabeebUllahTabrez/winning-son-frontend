// src/app/analyzer/_components/AnalyzerControls.tsx
"use client";

import { useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { FaWandMagicSparkles } from 'react-icons/fa6';
import { VoiceToneSelector } from './VoiceToneSelector';
import { HonestyLevelSlider } from './HonestyLevelSlider';
import { ResponseTypeToggle } from './ResponseTypeToggle';
import { AnalysisOptionsPanel } from './AnalysisOptionsPanel';
import { useAnalyzerPreferences } from '../_lib/analyzerState';
import { SMART_PRESETS } from '../_lib/presets';
import { VoiceTone, HonestyLevel, ResponseType, AnalysisOptionKey } from '../_types/analyzer';
import toast from 'react-hot-toast';

interface AnalyzerControlsProps {
  onPreferencesChange?: () => void;
}

export function AnalyzerControls({ onPreferencesChange }: AnalyzerControlsProps) {
  const [showCustomization, setShowCustomization] = useState(false);
  const [activePreset, setActivePreset] = useState<string | null>(null);

  const { preferences, updatePreference, toggleOption, setPreferences } =
    useAnalyzerPreferences();

  // Handler for voice/tone change
  const handleVoiceToneChange = (tone: VoiceTone) => {
    updatePreference('voiceTone', tone);
    setActivePreset(null); // Clear active preset when manually customizing
    onPreferencesChange?.();
  };

  // Handler for honesty level change
  const handleHonestyLevelChange = (level: HonestyLevel) => {
    updatePreference('honestyLevel', level);
    setActivePreset(null);
    onPreferencesChange?.();
  };

  // Handler for response type change
  const handleResponseTypeChange = (type: ResponseType) => {
    updatePreference('responseType', type);
    setActivePreset(null);
    onPreferencesChange?.();
  };

  // Handler for toggling individual options
  const handleToggleOption = (option: AnalysisOptionKey) => {
    toggleOption(option);
    setActivePreset(null);
    onPreferencesChange?.();
  };

  // Handler for applying presets
  const handleApplyPreset = (presetName: string) => {
    const preset = SMART_PRESETS.find((p) => p.name === presetName);
    if (!preset) return;

    // Apply preset preferences
    setPreferences((prev) => ({
      voiceTone: preset.preferences.voiceTone || prev.voiceTone,
      honestyLevel: preset.preferences.honestyLevel || prev.honestyLevel,
      responseType: preset.preferences.responseType || prev.responseType,
      selectedOptions: preset.preferences.selectedOptions || prev.selectedOptions,
      advancedSettings: preset.preferences.advancedSettings || prev.advancedSettings,
    }));

    setActivePreset(presetName);
    toast.success(`${preset.icon} ${presetName} preset applied!`, {
      style: {
        background: '#f3e8ff',
        color: '#581c87',
        border: '2px solid #a855f7',
      },
    });
    onPreferencesChange?.();
  };

  return (
    <div className="space-y-6">
      {/* Presets Section */}
      <div className="card bg-white rounded-2xl p-6 sm:p-8 border-2 border-gray-200 shadow-lg shadow-purple-100/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
            <FaWandMagicSparkles className="text-purple-600 text-xl" />
          </div>
          <div>
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">Choose Your Style</h3>
            <p className="text-sm text-gray-600">
              Quick presets for different types of insights
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {SMART_PRESETS.map((preset) => {
            const isActive = activePreset === preset.name;
            return (
              <button
                key={preset.name}
                type="button"
                onClick={() => handleApplyPreset(preset.name)}
                className={`
                  group relative p-4 sm:p-5 rounded-xl border-2 transition-all duration-200 text-center
                  ${
                    isActive
                      ? 'border-purple-500 bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg scale-105'
                      : 'border-gray-200 bg-white hover:border-purple-400 hover:shadow-md hover:scale-102'
                  }
                `}
              >
                <div className="text-3xl sm:text-4xl mb-2">{preset.icon}</div>
                <div className={`font-bold text-sm sm:text-base mb-1 ${isActive ? 'text-white' : 'text-gray-900'}`}>
                  {preset.name}
                </div>
                <div className={`text-xs ${isActive ? 'text-purple-100' : 'text-gray-600'}`}>
                  {preset.description}
                </div>
                {isActive && (
                  <div className="absolute top-2 right-2">
                    <div className="w-6 h-6 rounded-full bg-white/90 flex items-center justify-center">
                      <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Customization Toggle */}
      <div className="text-center">
        <button
          type="button"
          onClick={() => setShowCustomization(!showCustomization)}
          className="inline-flex items-center gap-3 px-6 py-3 rounded-xl border-2 border-gray-300 bg-white hover:border-purple-400 hover:bg-purple-50 transition-all duration-200 font-semibold text-gray-700 hover:text-purple-700"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          <span>
            {showCustomization ? 'Hide' : 'Show'} Advanced Settings
          </span>
          {showCustomization ? <FaChevronUp className="text-sm" /> : <FaChevronDown className="text-sm" />}
        </button>
      </div>

      {/* Collapsible Customization Section */}
      {showCustomization && (
        <div className="space-y-6 animate-fade-in">
          <div className="card bg-white rounded-2xl p-6 sm:p-8 border-2 border-gray-200 shadow-lg">
            <VoiceToneSelector value={preferences.voiceTone} onChange={handleVoiceToneChange} />
          </div>

          <div className="card bg-white rounded-2xl p-6 sm:p-8 border-2 border-gray-200 shadow-lg">
            <HonestyLevelSlider
              value={preferences.honestyLevel}
              onChange={handleHonestyLevelChange}
            />
          </div>

          <div className="card bg-white rounded-2xl p-6 sm:p-8 border-2 border-gray-200 shadow-lg">
            <ResponseTypeToggle
              value={preferences.responseType}
              onChange={handleResponseTypeChange}
            />
          </div>

          <div className="card bg-white rounded-2xl p-6 sm:p-8 border-2 border-gray-200 shadow-lg">
            <AnalysisOptionsPanel
              selectedOptions={preferences.selectedOptions}
              onToggleOption={handleToggleOption}
              onApplyPreset={handleApplyPreset}
              hidePresets={true}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Export preferences accessor for use in parent component
export { useAnalyzerPreferences };
