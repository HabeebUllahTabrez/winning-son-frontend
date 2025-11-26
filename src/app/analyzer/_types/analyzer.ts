// src/app/analyzer/_types/analyzer.ts

export type VoiceTone = 'professional' | 'friendly' | 'motivational' | 'sage' | 'quirky';
export type HonestyLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type ResponseType = 'action-focused' | 'pattern-focused';

export type AnalysisOptionKey =
  | 'key-themes'
  | 'progress-analysis'
  | 'concrete-tasks'
  | 'week-strategy'
  | 'resources'
  | 'energy-trends'
  | 'time-management'
  | 'blockers';

export interface AnalysisOption {
  key: AnalysisOptionKey;
  label: string;
  description: string;
  promptFragment: string;
}

export interface AnalyzerPreferences {
  voiceTone: VoiceTone;
  honestyLevel: HonestyLevel;
  responseType: ResponseType;
  selectedOptions: Set<AnalysisOptionKey>;
  advancedSettings: AdvancedSettings;
}

export interface AdvancedSettings {
  compareWithPrevious: boolean;
  includeKarmaAnalysis: boolean;
  focusArea: 'alignment' | 'contentment' | 'both';
  outputFormat: 'markdown' | 'plain';
}

export interface SmartPreset {
  name: string;
  description: string;
  icon: string;
  preferences: Partial<AnalyzerPreferences>;
}

export interface JournalEntry {
  local_date: string;
  topics: string;
  alignment_rating: number;
  contentment_rating: number;
  createdAt?: string;
}

export interface EnrichedJournalData {
  entries: JournalEntry[];
  dateRange: { start: string; end: string };
  analytics: {
    entryCount: number;
    avgAlignmentRating: number;
    avgContentmentRating: number;
    avgKarma: number;
    highestEntry: (JournalEntry & { karma: number }) | null;
    lowestEntry: (JournalEntry & { karma: number }) | null;
    trendAnalysis: {
      direction: 'improving' | 'declining' | 'stable';
      changePercentage: number;
    };
    temporalPatterns: {
      bestDayOfWeek?: string;
      mostProductiveTime?: 'weekday' | 'weekend';
    };
  };
}

export interface PromptTemplate {
  systemContext: string;
  toneModifier: string;
  honestyModifier: string;
  analysisType: string;
  dataFormat: string;
  outputInstructions: string;
}

export interface UserProfile {
  goal: string | null;
  start_date: string | null;
  end_date: string | null;
  first_name?: string | null;
}
