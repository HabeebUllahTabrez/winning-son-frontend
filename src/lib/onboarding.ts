import { FeatureStatus } from "@/types/user";

// Key names for localStorage
export const ONBOARDING_STATUS_KEY = 'onboardingStatus';

// Default onboarding status for new users
const DEFAULT_ONBOARDING_STATUS: FeatureStatus = {
  has_created_first_log: false,
  first_log_created_at: null,
  has_used_analyzer: false,
  first_analyzer_used_at: null,
};

/**
 * Retrieves onboarding status from localStorage.
 * Handles migration for users who don't have this data yet.
 */
export function getOnboardingStatus(): FeatureStatus {
  if (typeof window === 'undefined') return DEFAULT_ONBOARDING_STATUS;

  try {
    const statusJson = localStorage.getItem(ONBOARDING_STATUS_KEY);
    if (!statusJson) {
      // No stored status - return default for new users
      return DEFAULT_ONBOARDING_STATUS;
    }

    const storedStatus = JSON.parse(statusJson);

    // Ensure all fields exist (migration safety)
    return {
      has_created_first_log: storedStatus.has_created_first_log ?? false,
      first_log_created_at: storedStatus.first_log_created_at ?? null,
      has_used_analyzer: storedStatus.has_used_analyzer ?? false,
      first_analyzer_used_at: storedStatus.first_analyzer_used_at ?? null,
    };
  } catch (error) {
    console.error('Failed to parse onboarding status from localStorage', error);
    return DEFAULT_ONBOARDING_STATUS;
  }
}

/**
 * Saves onboarding status to localStorage.
 */
export function saveOnboardingStatus(status: FeatureStatus): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(ONBOARDING_STATUS_KEY, JSON.stringify(status));
  } catch (error) {
    console.error('Failed to save onboarding status to localStorage', error);
  }
}

/**
 * Marks that the user has created their first log entry.
 */
export function markFirstLogCreated(): void {
  const currentStatus = getOnboardingStatus();

  // Only mark once
  if (currentStatus.has_created_first_log) return;

  saveOnboardingStatus({
    ...currentStatus,
    has_created_first_log: true,
    first_log_created_at: new Date().toISOString(),
  });
}

/**
 * Marks that the user has used the analyzer feature.
 */
export function markAnalyzerUsed(): void {
  const currentStatus = getOnboardingStatus();

  // Only mark once
  if (currentStatus.has_used_analyzer) return;

  saveOnboardingStatus({
    ...currentStatus,
    has_used_analyzer: true,
    first_analyzer_used_at: new Date().toISOString(),
  });
}

/**
 * Syncs onboarding status from API response to localStorage.
 * This ensures guest data is properly migrated when they sign up.
 */
export function syncOnboardingStatusFromAPI(apiStatus: FeatureStatus): void {
  saveOnboardingStatus(apiStatus);
}

/**
 * Clears onboarding status from localStorage.
 * Used when user logs out or switches accounts.
 */
export function clearOnboardingStatus(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(ONBOARDING_STATUS_KEY);
  } catch (error) {
    console.error('Failed to clear onboarding status from localStorage', error);
  }
}

/**
 * Checks if the user should see the first log onboarding cue.
 */
export function shouldShowFirstLogCue(): boolean {
  const status = getOnboardingStatus();
  return !status.has_created_first_log;
}

/**
 * Checks if the user should see the analyzer onboarding cue.
 */
export function shouldShowAnalyzerCue(): boolean {
  const status = getOnboardingStatus();
  return status.has_created_first_log && !status.has_used_analyzer;
}
