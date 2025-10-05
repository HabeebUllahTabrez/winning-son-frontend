/**
 * Migration utility to handle the transition from localStorage token-based auth
 * to httpOnly cookie-based auth.
 *
 * This ensures users with old tokens are automatically logged out and can
 * log back in with the new secure cookie system.
 */

const OLD_TOKEN_KEY = 'token';

/**
 * Checks for and removes old localStorage token if it exists.
 * Should be called on app initialization.
 */
export function migrateFromOldAuth(): void {
  if (typeof window === 'undefined') return;

  try {
    const oldToken = localStorage.getItem(OLD_TOKEN_KEY);

    if (oldToken) {
      // Remove the old token
      localStorage.removeItem(OLD_TOKEN_KEY);

      console.log('Migrated from old token-based auth. Please log in again.');

      // Optional: You could also clear any other old auth-related data here
      // For example: sessionStorage.clear() or remove specific keys
    }
  } catch (error) {
    console.error('Error during auth migration:', error);
  }
}

/**
 * Checks if user has old token (for displaying migration messages)
 */
export function hasOldAuthToken(): boolean {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem(OLD_TOKEN_KEY);
}
