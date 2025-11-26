// src/app/analyzer/_lib/promptComposer.ts

import {
  AnalyzerPreferences,
  EnrichedJournalData,
  UserProfile,
  AnalysisOptionKey,
} from '../_types/analyzer';
import {
  VOICE_TONE_TEMPLATES,
  HONESTY_LEVEL_TEMPLATES,
  RESPONSE_TYPE_TEMPLATES,
} from './promptTemplates';
import { ANALYSIS_OPTIONS } from './presets';
import { formatEntriesForPrompt, formatDateRange } from './dataEnrichment';

// ===============================
// VARIABLE INTERPOLATION
// ===============================

interface PromptVariables {
  goal: string;
  timeframe: string;
  entryCount: number;
  avgKarma: string;
  avgAlignment: string;
  avgContentment: string;
  trendDirection: string;
  trendPercentage: string;
  userName: string;
  bestDay?: string;
  productiveTime?: string;
  highestKarma?: string;
  lowestKarma?: string;
}

/**
 * Extract variables from enriched data for template interpolation
 */
function extractVariables(
  data: EnrichedJournalData,
  userProfile: UserProfile
): PromptVariables {
  const { analytics, dateRange } = data;

  return {
    goal: userProfile.goal || 'Personal growth and achievement',
    timeframe: formatDateRange(dateRange.start, dateRange.end),
    entryCount: analytics.entryCount,
    avgKarma: analytics.avgKarma.toFixed(1),
    avgAlignment: analytics.avgAlignmentRating.toFixed(1),
    avgContentment: analytics.avgContentmentRating.toFixed(1),
    trendDirection: analytics.trendAnalysis.direction,
    trendPercentage: Math.abs(analytics.trendAnalysis.changePercentage).toFixed(1),
    userName: userProfile.first_name || 'friend',
    bestDay: analytics.temporalPatterns.bestDayOfWeek,
    productiveTime: analytics.temporalPatterns.mostProductiveTime,
    highestKarma: analytics.highestEntry
      ? analytics.highestEntry.karma.toFixed(1)
      : undefined,
    lowestKarma: analytics.lowestEntry
      ? analytics.lowestEntry.karma.toFixed(1)
      : undefined,
  };
}

/**
 * Interpolate variables in template string
 */
function interpolateTemplate(template: string, variables: PromptVariables): string {
  let result = template;

  // Replace all {{variable}} patterns
  Object.entries(variables).forEach(([key, value]) => {
    if (value !== undefined) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, String(value));
    }
  });

  return result;
}

// ===============================
// PROMPT COMPOSITION
// ===============================

/**
 * Build the complete prompt based on preferences and data
 */
export function composePrompt(
  preferences: AnalyzerPreferences,
  data: EnrichedJournalData,
  userProfile: UserProfile
): string {
  const variables = extractVariables(data, userProfile);

  // Get template segments based on preferences
  const voiceTone = VOICE_TONE_TEMPLATES[preferences.voiceTone];
  const honestyLevel = HONESTY_LEVEL_TEMPLATES[preferences.honestyLevel];
  const responseType = RESPONSE_TYPE_TEMPLATES[preferences.responseType];

  // Format journal entries
  const formattedEntries = formatEntriesForPrompt(data.entries);

  // Build selected analysis options text
  const selectedOptionsText = Array.from(preferences.selectedOptions)
    .map((optionKey) => {
      const option = ANALYSIS_OPTIONS.find((opt) => opt.key === optionKey);
      return option ? option.promptFragment : '';
    })
    .filter(Boolean)
    .join('\n');

  // Build metrics section
  const metricsSection = buildMetricsSection(data, preferences);

  // Build advanced settings section (if applicable)
  const advancedSection = buildAdvancedSection(preferences);

  // Compose the final prompt
  const prompt = `${voiceTone}

${honestyLevel}

${responseType}

═══════════════════════════════════════════════════

MY GRAND QUEST: ${variables.goal}

TIMEFRAME: ${variables.timeframe}

═══════════════════════════════════════════════════

RECENT DATA (${variables.entryCount} entries, most recent first):

${formattedEntries}

${metricsSection}

═══════════════════════════════════════════════════

PROVIDE THE FOLLOWING ANALYSIS:

${selectedOptionsText}

${advancedSection}

═══════════════════════════════════════════════════

FORMAT INSTRUCTIONS:
- Use clear headings and bullet points
- Be specific and evidence-based
- Reference actual entries and dates when making observations
- ${preferences.advancedSettings.outputFormat === 'markdown' ? 'Use Markdown formatting' : 'Use plain text'}
- Keep it practical and actionable

Now, analyze my journey and provide the insights I need.`;

  return prompt.trim();
}

/**
 * Build the metrics section of the prompt
 */
function buildMetricsSection(
  data: EnrichedJournalData,
  preferences: AnalyzerPreferences
): string {
  const { analytics } = data;
  const { avgKarma, avgAlignmentRating, avgContentmentRating, trendAnalysis } =
    analytics;

  let section = '\nKEY METRICS:\n';

  if (preferences.advancedSettings.includeKarmaAnalysis) {
    section += `- Average Karma Score: ${avgKarma.toFixed(1)}/10\n`;
  }

  // Focus area specific metrics
  if (
    preferences.advancedSettings.focusArea === 'alignment' ||
    preferences.advancedSettings.focusArea === 'both'
  ) {
    section += `- Average Alignment: ${avgAlignmentRating.toFixed(1)}/10\n`;
  }

  if (
    preferences.advancedSettings.focusArea === 'contentment' ||
    preferences.advancedSettings.focusArea === 'both'
  ) {
    section += `- Average Contentment: ${avgContentmentRating.toFixed(1)}/10\n`;
  }

  // Trend information
  const trendEmoji =
    trendAnalysis.direction === 'improving'
      ? '📈'
      : trendAnalysis.direction === 'declining'
      ? '📉'
      : '➡️';
  section += `- Performance Trend: ${trendAnalysis.direction} ${trendEmoji} (${Math.abs(
    trendAnalysis.changePercentage
  ).toFixed(1)}% change)\n`;

  // Temporal patterns
  if (analytics.temporalPatterns.bestDayOfWeek) {
    section += `- Best Day of Week: ${analytics.temporalPatterns.bestDayOfWeek}\n`;
  }

  if (analytics.temporalPatterns.mostProductiveTime) {
    section += `- Most Productive: ${analytics.temporalPatterns.mostProductiveTime}s\n`;
  }

  return section;
}

/**
 * Build advanced settings section if applicable
 */
function buildAdvancedSection(preferences: AnalyzerPreferences): string {
  let section = '';

  if (preferences.advancedSettings.compareWithPrevious) {
    section +=
      '\nADDITIONAL REQUEST:\n- Compare this period to the previous equivalent time period, if you have access to historical data. Highlight key differences and progress.\n';
  }

  return section;
}

/**
 * Generate a quick preview of how settings affect the prompt
 */
export function generatePromptPreview(preferences: AnalyzerPreferences): string {
  const voiceTone = VOICE_TONE_TEMPLATES[preferences.voiceTone];
  const honestyLevel = HONESTY_LEVEL_TEMPLATES[preferences.honestyLevel];
  const responseType = RESPONSE_TYPE_TEMPLATES[preferences.responseType];

  const selectedCount = preferences.selectedOptions.size;

  return `This prompt will use a ${preferences.voiceTone} tone with ${
    preferences.honestyLevel === 1
      ? 'gentle'
      : preferences.honestyLevel === 6
      ? 'brutal'
      : 'balanced'
  } honesty, focused on ${
    preferences.responseType === 'action-focused' ? 'actionable steps' : 'behavioral patterns'
  }. It will include ${selectedCount} analysis ${selectedCount === 1 ? 'option' : 'options'}.`;
}

/**
 * Validate that preferences are complete for prompt generation
 */
export function validatePreferences(preferences: AnalyzerPreferences): {
  valid: boolean;
  error?: string;
} {
  if (preferences.selectedOptions.size === 0) {
    return {
      valid: false,
      error: 'Please select at least one analysis option.',
    };
  }

  return { valid: true };
}
