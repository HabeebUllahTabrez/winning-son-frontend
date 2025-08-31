// src/lib/dateUtils.ts

/**
 * Gets the start of the week (Sunday) for a given date.
 */
export function getStartOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // Sunday - 0, Monday - 1, ...
  const diff = d.getDate() - day;
  return new Date(d.setDate(diff));
}

/**
 * Formats a date into YYYY-MM-DD for API calls.
 */

export function formatDateForAPI(date: Date):string {
  return date.getFullYear() + '-' +
    String(date.getMonth() + 1).padStart(2, '0') + '-' +
    String(date.getDate()).padStart(2, '0');
}


/**
 * Formats a date range for display, e.g., "August 25 – 31, 2025".
 */
export function formatDateRangeForDisplay(startDate: Date): string {
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);

  const startOptions: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric' };
  const endOptions: Intl.DateTimeFormatOptions = { ...startOptions, year: 'numeric' };

  // Handle cases where the week spans across different months or years
  if (startDate.getMonth() !== endDate.getMonth()) {
    startOptions.month = 'long';
    return `${startDate.toLocaleDateString('en-US', startOptions)} – ${endDate.toLocaleDateString('en-US', endOptions)}`;
  }

  return `${startDate.toLocaleDateString('en-US', { month: 'long' })} ${startDate.getDate()} – ${endDate.getDate()}, ${startDate.getFullYear()}`;
}
