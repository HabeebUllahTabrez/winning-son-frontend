// src/app/analyzer/_lib/presets.ts

import { AnalysisOption, SmartPreset, AnalyzerPreferences } from '../_types/analyzer';

// ===============================
// ANALYSIS OPTIONS
// ===============================

export const ANALYSIS_OPTIONS: AnalysisOption[] = [
  {
    key: 'key-themes',
    label: 'Key Themes & Patterns',
    description: 'Recurring activities, topics, or skills from recent entries',
    promptFragment: '- Key Themes & Patterns: Identify recurring activities, topics, or skills from my recent log.',
  },
  {
    key: 'progress-analysis',
    label: 'Progress vs Goal',
    description: 'How far I am from achieving my goal',
    promptFragment: '- Progress Analysis: Assess how far I am from achieving my goal, with a short explanation.',
  },
  {
    key: 'concrete-tasks',
    label: '3 Concrete Tasks for Tomorrow',
    description: 'Specific, actionable steps I can take',
    promptFragment: '- 3 Concrete Tasks for Tomorrow: Provide specific, actionable, and achievable steps.',
  },
  {
    key: 'week-strategy',
    label: 'Week-Ahead Strategy',
    description: 'What to focus on in coming days',
    promptFragment: '- Week-Ahead Strategy: Suggest what I should focus on in the coming days to reach my goal more easily.',
  },
  {
    key: 'resources',
    label: 'Resource Recommendations',
    description: 'Tools, techniques, or references aligned with my goal',
    promptFragment: '- Suggested Resources: Recommend high-quality references, tools, or techniques that align with my goal.',
  },
  {
    key: 'energy-trends',
    label: 'Energy & Contentment Trends',
    description: 'Patterns in alignment and contentment over time',
    promptFragment: '- Energy & Contentment Trends: Analyze my energy levels (alignment) and contentment patterns. When am I most aligned? When do I feel most content? Identify correlations between activities and these metrics.',
  },
  {
    key: 'time-management',
    label: 'Time Management Analysis',
    description: 'How I allocate time and where to optimize',
    promptFragment: '- Time Management Analysis: Based on my entries, evaluate my time management patterns. Are there patterns in how I allocate time? Where am I overcommitted? Suggest time optimization strategies.',
  },
  {
    key: 'blockers',
    label: 'Blockers & Challenges',
    description: 'Obstacles holding me back with solutions',
    promptFragment: '- Blockers & Challenges: Identify obstacles and challenges mentioned or implied in my entries. What\'s consistently holding me back? What patterns of resistance appear? Provide strategies to overcome these blockers.',
  },
];

// ===============================
// DEFAULT PREFERENCES
// ===============================

export const DEFAULT_PREFERENCES: AnalyzerPreferences = {
  voiceTone: 'friendly',
  honestyLevel: 3,
  responseType: 'action-focused',
  selectedOptions: new Set(['key-themes', 'progress-analysis', 'concrete-tasks']),
  advancedSettings: {
    compareWithPrevious: false,
    includeKarmaAnalysis: true,
    focusArea: 'both',
    outputFormat: 'markdown',
  },
};

// ===============================
// SMART PRESETS
// ===============================

export const SMART_PRESETS: SmartPreset[] = [
  {
    name: 'Quick Check',
    description: 'Fast overview with actionable next steps',
    icon: '🚀',
    preferences: {
      voiceTone: 'friendly',
      honestyLevel: 3,
      responseType: 'action-focused',
      selectedOptions: new Set(['key-themes', 'progress-analysis', 'concrete-tasks']),
    },
  },
  {
    name: 'Deep Dive',
    description: 'Comprehensive analysis with all insights',
    icon: '🔍',
    preferences: {
      voiceTone: 'sage',
      honestyLevel: 4,
      responseType: 'pattern-focused',
      selectedOptions: new Set([
        'key-themes',
        'progress-analysis',
        'concrete-tasks',
        'week-strategy',
        'resources',
        'energy-trends',
        'time-management',
        'blockers',
      ]),
      advancedSettings: {
        compareWithPrevious: true,
        includeKarmaAnalysis: true,
        focusArea: 'both',
        outputFormat: 'markdown',
      },
    },
  },
  {
    name: 'Goal Sprint',
    description: 'Focus on progress and momentum',
    icon: '🎯',
    preferences: {
      voiceTone: 'motivational',
      honestyLevel: 5,
      responseType: 'action-focused',
      selectedOptions: new Set(['progress-analysis', 'week-strategy', 'blockers', 'concrete-tasks']),
    },
  },
  {
    name: 'Reflection Mode',
    description: 'Understand patterns and self-awareness',
    icon: '🧘',
    preferences: {
      voiceTone: 'sage',
      honestyLevel: 3,
      responseType: 'pattern-focused',
      selectedOptions: new Set(['key-themes', 'energy-trends', 'time-management']),
    },
  },
];
