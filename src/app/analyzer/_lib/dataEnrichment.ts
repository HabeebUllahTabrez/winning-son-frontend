// src/app/analyzer/_lib/dataEnrichment.ts

import { JournalEntry, EnrichedJournalData } from '../_types/analyzer';

/**
 * Calculate comprehensive analytics from journal entries
 */
export function calculateAnalytics(entries: JournalEntry[]): {
  entryCount: number;
  avgAlignmentRating: number;
  avgContentmentRating: number;
  avgKarma: number;
  highestEntry: (JournalEntry & { karma: number }) | null;
  lowestEntry: (JournalEntry & { karma: number }) | null;
} {
  if (entries.length === 0) {
    return {
      entryCount: 0,
      avgAlignmentRating: 0,
      avgContentmentRating: 0,
      avgKarma: 0,
      highestEntry: null,
      lowestEntry: null,
    };
  }

  const totalEntries = entries.length;

  // Calculate averages
  const avgAlignment =
    entries.reduce((sum, e) => sum + e.alignment_rating, 0) / totalEntries;
  const avgContentment =
    entries.reduce((sum, e) => sum + e.contentment_rating, 0) / totalEntries;
  const avgKarma = (avgAlignment + avgContentment) / 2;

  // Sort by karma score
  const sortedByKarma = entries
    .map((e) => ({
      ...e,
      karma: (e.alignment_rating + e.contentment_rating) / 2,
    }))
    .sort((a, b) => b.karma - a.karma);

  return {
    entryCount: totalEntries,
    avgAlignmentRating: avgAlignment,
    avgContentmentRating: avgContentment,
    avgKarma,
    highestEntry: sortedByKarma[0],
    lowestEntry: sortedByKarma[sortedByKarma.length - 1],
  };
}

/**
 * Analyze trends by comparing first half vs second half of entries
 */
export function analyzeTrends(entries: JournalEntry[]) {
  if (entries.length < 2) {
    return {
      direction: 'stable' as const,
      changePercentage: 0,
    };
  }

  const midpoint = Math.floor(entries.length / 2);
  const firstHalf = entries.slice(0, midpoint);
  const secondHalf = entries.slice(midpoint);

  const firstAvg =
    firstHalf.reduce(
      (sum, e) => sum + (e.alignment_rating + e.contentment_rating) / 2,
      0
    ) / firstHalf.length;

  const secondAvg =
    secondHalf.reduce(
      (sum, e) => sum + (e.alignment_rating + e.contentment_rating) / 2,
      0
    ) / secondHalf.length;

  const change = ((secondAvg - firstAvg) / firstAvg) * 100;

  return {
    direction:
      change > 5 ? ('improving' as const) : change < -5 ? ('declining' as const) : ('stable' as const),
    changePercentage: change,
  };
}

/**
 * Identify temporal patterns (best day of week, weekday vs weekend)
 */
export function identifyTemporalPatterns(entries: JournalEntry[]) {
  if (entries.length === 0) {
    return {
      bestDayOfWeek: undefined,
      mostProductiveTime: undefined,
    };
  }

  // Calculate karma by day of week
  const dayOfWeekScores: Record<string, { total: number; count: number }> = {};
  let weekdayTotal = 0;
  let weekdayCount = 0;
  let weekendTotal = 0;
  let weekendCount = 0;

  entries.forEach((entry) => {
    const date = new Date(entry.local_date);
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
    const karma = (entry.alignment_rating + entry.contentment_rating) / 2;

    // Track by day of week
    if (!dayOfWeekScores[dayOfWeek]) {
      dayOfWeekScores[dayOfWeek] = { total: 0, count: 0 };
    }
    dayOfWeekScores[dayOfWeek].total += karma;
    dayOfWeekScores[dayOfWeek].count += 1;

    // Track weekday vs weekend
    const dayNum = date.getDay();
    if (dayNum === 0 || dayNum === 6) {
      // Weekend
      weekendTotal += karma;
      weekendCount += 1;
    } else {
      // Weekday
      weekdayTotal += karma;
      weekdayCount += 1;
    }
  });

  // Find best day of week
  let bestDay = '';
  let bestAvg = 0;
  Object.entries(dayOfWeekScores).forEach(([day, { total, count }]) => {
    const avg = total / count;
    if (avg > bestAvg) {
      bestAvg = avg;
      bestDay = day;
    }
  });

  // Determine weekday vs weekend preference
  const weekdayAvg = weekdayCount > 0 ? weekdayTotal / weekdayCount : 0;
  const weekendAvg = weekendCount > 0 ? weekendTotal / weekendCount : 0;
  const mostProductiveTime =
    weekdayAvg > weekendAvg ? ('weekday' as const) : ('weekend' as const);

  return {
    bestDayOfWeek: bestDay || undefined,
    mostProductiveTime: weekdayCount > 0 && weekendCount > 0 ? mostProductiveTime : undefined,
  };
}

/**
 * Enrich journal data with comprehensive analytics
 */
export function enrichJournalData(
  entries: JournalEntry[],
  startDate: string,
  endDate: string
): EnrichedJournalData | null {
  if (entries.length === 0) {
    return null;
  }

  const analytics = calculateAnalytics(entries);
  const trendAnalysis = analyzeTrends(entries);
  const temporalPatterns = identifyTemporalPatterns(entries);

  return {
    entries,
    dateRange: { start: startDate, end: endDate },
    analytics: {
      ...analytics,
      trendAnalysis,
      temporalPatterns,
    },
  };
}

/**
 * Format entries for prompt display
 */
export function formatEntriesForPrompt(entries: JournalEntry[]): string {
  return entries
    .sort(
      (a, b) =>
        new Date(b.local_date).getTime() - new Date(a.local_date).getTime()
    )
    .map((entry) => {
      const karma = (entry.alignment_rating + entry.contentment_rating) / 2;
      return `- ${entry.local_date} | Karma: ${karma.toFixed(1)}/10 (Alignment: ${
        entry.alignment_rating
      }, Contentment: ${entry.contentment_rating}) | ${entry.topics}`;
    })
    .join('\n');
}

/**
 * Format date range for human-readable display
 */
export function formatDateRange(start: string, end: string): string {
  const startDate = new Date(start);
  const endDate = new Date(end);

  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  };

  return `${startDate.toLocaleDateString('en-US', options)} to ${endDate.toLocaleDateString(
    'en-US',
    options
  )}`;
}

/**
 * Calculate number of days in a date range
 */
export function calculateDaysBetween(start: string, end: string): number {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1; // Include both start and end days
}
