// src/app/analyzer/_lib/analyzerState.ts

import { useState, useEffect } from 'react';
import { AnalyzerPreferences, AnalysisOptionKey } from '../_types/analyzer';
import { DEFAULT_PREFERENCES } from './presets';

// ===============================
// STORAGE KEYS
// ===============================

const STORAGE_KEYS = {
  ANALYZER_PREFERENCES: 'winningSonAnalyzerPreferences',
  ANALYZER_LAST_USED: 'winningSonAnalyzerLastUsed',
} as const;

// ===============================
// SERIALIZATION HELPERS
// ===============================

/**
 * Convert Set to Array for JSON serialization
 */
function serializePreferences(prefs: AnalyzerPreferences): string {
  return JSON.stringify({
    ...prefs,
    selectedOptions: Array.from(prefs.selectedOptions),
  });
}

/**
 * Convert Array back to Set after JSON parsing
 */
function deserializePreferences(json: string): AnalyzerPreferences {
  const parsed = JSON.parse(json);
  return {
    ...parsed,
    selectedOptions: new Set(parsed.selectedOptions),
  };
}

// ===============================
// PERSISTENCE FUNCTIONS
// ===============================

/**
 * Load preferences from localStorage
 */
export function loadPreferences(): AnalyzerPreferences {
  if (typeof window === 'undefined') {
    return DEFAULT_PREFERENCES;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.ANALYZER_PREFERENCES);
    if (!stored) {
      return DEFAULT_PREFERENCES;
    }

    const loaded = deserializePreferences(stored);

    // Validate and merge with defaults to handle any missing fields
    return {
      voiceTone: loaded.voiceTone || DEFAULT_PREFERENCES.voiceTone,
      honestyLevel: loaded.honestyLevel || DEFAULT_PREFERENCES.honestyLevel,
      responseType: loaded.responseType || DEFAULT_PREFERENCES.responseType,
      selectedOptions:
        loaded.selectedOptions.size > 0
          ? loaded.selectedOptions
          : DEFAULT_PREFERENCES.selectedOptions,
      advancedSettings: {
        ...DEFAULT_PREFERENCES.advancedSettings,
        ...loaded.advancedSettings,
      },
    };
  } catch (error) {
    console.error('Failed to load analyzer preferences:', error);
    return DEFAULT_PREFERENCES;
  }
}

/**
 * Save preferences to localStorage
 */
export function savePreferences(prefs: AnalyzerPreferences): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const serialized = serializePreferences(prefs);
    localStorage.setItem(STORAGE_KEYS.ANALYZER_PREFERENCES, serialized);
    localStorage.setItem(STORAGE_KEYS.ANALYZER_LAST_USED, new Date().toISOString());
  } catch (error) {
    console.error('Failed to save analyzer preferences:', error);
  }
}

/**
 * Clear all analyzer preferences
 */
export function clearPreferences(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.removeItem(STORAGE_KEYS.ANALYZER_PREFERENCES);
    localStorage.removeItem(STORAGE_KEYS.ANALYZER_LAST_USED);
  } catch (error) {
    console.error('Failed to clear analyzer preferences:', error);
  }
}

// ===============================
// REACT HOOKS
// ===============================

/**
 * React hook for managing analyzer preferences with localStorage persistence
 */
export function useAnalyzerPreferences() {
  const [preferences, setPreferencesState] = useState<AnalyzerPreferences>(() =>
    loadPreferences()
  );

  // Update preferences and persist to localStorage
  const setPreferences = (
    newPrefs: AnalyzerPreferences | ((prev: AnalyzerPreferences) => AnalyzerPreferences)
  ) => {
    setPreferencesState((prev) => {
      const updated = typeof newPrefs === 'function' ? newPrefs(prev) : newPrefs;
      savePreferences(updated);
      return updated;
    });
  };

  // Update a single preference field
  const updatePreference = <K extends keyof AnalyzerPreferences>(
    key: K,
    value: AnalyzerPreferences[K]
  ) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Toggle a specific analysis option
  const toggleOption = (option: AnalysisOptionKey) => {
    setPreferences((prev) => {
      const newOptions = new Set(prev.selectedOptions);
      if (newOptions.has(option)) {
        newOptions.delete(option);
      } else {
        newOptions.add(option);
      }
      return {
        ...prev,
        selectedOptions: newOptions,
      };
    });
  };

  // Set multiple options at once
  const setOptions = (options: Set<AnalysisOptionKey>) => {
    setPreferences((prev) => ({
      ...prev,
      selectedOptions: options,
    }));
  };

  // Reset to default preferences
  const resetPreferences = () => {
    setPreferences(DEFAULT_PREFERENCES);
  };

  return {
    preferences,
    setPreferences,
    updatePreference,
    toggleOption,
    setOptions,
    resetPreferences,
  };
}

/**
 * Check if localStorage is available
 */
export function isLocalStorageAvailable(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    const testKey = '__localStorage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}
