import { v4 as uuidv4 } from 'uuid';
import { format, subDays, getDay, getMonth, getYear, startOfDay } from 'date-fns';

// Define the shape of a user profile for type safety
export interface UserProfile {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  avatar_id: number;
  goal: string;
  start_date: string; // Using string for easy serialization
  end_date: string;   // Using string for easy serialization
  is_admin: boolean;
}

// Define the shape of a journal entry for type safety
export interface JournalEntry {
  id: string;
  content: string;
  rating: number;
  createdAt: string; // Format: 'yyyy-MM-dd'
}

// Define the shape of the calculated stats object
export interface DashboardStats {
    has_today_entry: boolean;
    day_points: number;
    week_points: number;
    month_points: number;
    year_points: number;
    entries_this_week: number;
    entries_this_year: number;
    average_month_rating: number;
    current_streak_days: number;
    last7_days_trend: { local_date: string; points: number }[];
}


// Key names for localStorage
export const GUEST_ID_KEY = 'guestId';
export const JOURNAL_ENTRIES_KEY = 'guestJournalEntries';
export const GUEST_STATS_KEY = 'guestStats';

const DEFAULT_GUEST_STATS = {
  has_today_entry: false,
  day_points: 0,
  week_points: 0,
  month_points: 0,
  year_points: 0,
  entries_this_week: 0,
  entries_this_year: 0,
  average_month_rating: 0,
  current_streak_days: 0,
  last7_days_trend: Array.from({ length: 7 }, (_, i) => ({
    local_date: format(subDays(new Date(), i), "yyyy-MM-dd"),
    points: 0
  })).reverse(),
  user: {
    id: 3,
    email: "",
    first_name: "Guest",
    last_name: "User",
    avatar_id: 1,
    goal: "Try out the app!",
    start_date: format(new Date(), "yyyy-MM-dd"),
    end_date: "",
    is_admin: false
  }
};


/**
 * Calculates dashboard statistics from a list of journal entries.
 * It processes all entries to compute daily, weekly, monthly, yearly, and streak data.
 * @param journalEntries - An array of journal entry objects.
 * @returns An object containing the calculated dashboard statistics.
 */
const calculateDashboardStats = (journalEntries: JournalEntry[]): DashboardStats => {
    const today = startOfDay(new Date());
    const todayStr = format(today, 'yyyy-MM-dd');

    const entriesMap = new Map(journalEntries.map(entry => [entry.createdAt, entry]));

    // --- Define Time Boundaries for Calculations ---
    const currentYear = getYear(today);
    const currentMonth = getMonth(today);
    // Get the start of the week (Sunday)
    const startOfWeek = subDays(today, getDay(today));

    // --- Initialize Statistic Variables ---
    let week_points = 0;
    let month_points = 0;
    let year_points = 0;
    let entries_this_week = 0;
    let entries_this_year = 0;
    let monthEntriesCount = 0;

    // --- Calculate Aggregated Stats by Iterating Through All Entries ---
    for (const entry of journalEntries) {
        const entryDate = new Date(entry.createdAt);
        
        if (getYear(entryDate) === currentYear) {
            year_points += entry.rating;
            entries_this_year++;

            if (getMonth(entryDate) === currentMonth) {
                month_points += entry.rating;
                monthEntriesCount++;
            }
        }
        
        if (entryDate >= startOfWeek) {
            week_points += entry.rating;
            entries_this_week++;
        }
    }

    // --- Calculate Day-Specific and Trend Stats ---
    const todayEntry = entriesMap.get(todayStr);
    const has_today_entry = !!todayEntry;
    const day_points = todayEntry ? todayEntry.rating : 0;

    const last7_days_trend = Array.from({ length: 7 }, (_, i) => {
        const date = subDays(today, i);
        const dateString = format(date, 'yyyy-MM-dd');
        const entry = entriesMap.get(dateString);
        return {
            local_date: dateString,
            points: entry ? entry.rating : 0,
        };
    }).reverse();

    // --- Calculate Current Streak ---
    let current_streak_days = 0;
    let streakDate = today;

    if (!has_today_entry) {
        streakDate = subDays(streakDate, 1);
    }
    
    while (entriesMap.has(format(streakDate, 'yyyy-MM-dd'))) {
        current_streak_days++;
        streakDate = subDays(streakDate, 1);
    }

    return {
        has_today_entry,
        day_points,
        week_points,
        month_points,
        year_points,
        entries_this_week,
        entries_this_year,
        average_month_rating: monthEntriesCount > 0 ? (month_points / monthEntriesCount) : 0,
        current_streak_days,
        last7_days_trend,
    };
};

/**
 * Recalculates all guest stats based on journal entries and saves to localStorage.
 */
function updateGuestStats(): void {
    if (typeof window === 'undefined') return;

    const allEntries = getGuestEntries();
    const calculatedStats = calculateDashboardStats(allEntries);
    const currentStats = getGuestStats(); // Preserves the user profile

    const newStats = {
        ...currentStats,
        ...calculatedStats,
    };
    
    localStorage.setItem(GUEST_STATS_KEY, JSON.stringify(newStats));
}

// ===================================================================
// EXPORTED GUEST UTILITY FUNCTIONS
// ===================================================================


/**
 * Ensures a unique guest ID exists in localStorage.
 * If one doesn't exist, it generates and stores a new one.
 * @returns The unique guest ID.
 */
export function getGuestId(): string {
  if (typeof window === 'undefined') return '';

  let guestId = localStorage.getItem(GUEST_ID_KEY);
  if (!guestId) {
    guestId = uuidv4();
    localStorage.setItem(GUEST_ID_KEY, guestId);
    localStorage.setItem(GUEST_STATS_KEY, JSON.stringify(DEFAULT_GUEST_STATS));
  }
  return guestId;
}

/**
 * Checks if the current user is a guest (i.e., no auth token).
 * @returns True if the user is a guest, false otherwise.
 */
export function isGuestUser(): boolean {
  if (typeof window === 'undefined') return false;
  return !localStorage.getItem('token') && !!localStorage.getItem(GUEST_ID_KEY);
}

/**
 * Retrieves guest dashboard stats from localStorage.
 * @returns The guest stats object.
 */
export function getGuestStats() {
  if (typeof window === 'undefined') return DEFAULT_GUEST_STATS;

  try {
    const statsJson = localStorage.getItem(GUEST_STATS_KEY);
    return statsJson ? JSON.parse(statsJson) : DEFAULT_GUEST_STATS;
  } catch (error) {
    console.error('Failed to parse guest stats from localStorage', error);
    return DEFAULT_GUEST_STATS;
  }
}

/**
 * Retrieves all journal entries for the current guest from localStorage.
 * @returns An array of JournalEntry objects.
 */
export function getGuestEntries(): JournalEntry[] {
  if (typeof window === 'undefined') return [];

  try {
    const entriesJson = localStorage.getItem(JOURNAL_ENTRIES_KEY);
    return entriesJson ? JSON.parse(entriesJson) : [];
  } catch (error) {
    console.error('Failed to parse guest journal entries from localStorage', error);
    return [];
  }
}

/**
 * Saves or updates a journal entry and recalculates all stats.
 * @param entry - The entry content, rating, and date.
 * @returns The newly created or updated JournalEntry object.
 */
export function saveGuestEntry(entry: { content: string; rating: number; createdAt: string }): JournalEntry | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const entries = getGuestEntries();
    const existingEntryIndex = entries.findIndex(e => e.createdAt === entry.createdAt);
    let savedEntry: JournalEntry;

    if (existingEntryIndex > -1) {
      // Update existing entry
      const updatedEntry = { ...entries[existingEntryIndex], ...entry };
      entries[existingEntryIndex] = updatedEntry;
      savedEntry = updatedEntry;
    } else {
      // Add new entry
      const newEntry: JournalEntry = { id: uuidv4(), ...entry };
      entries.push(newEntry);
      savedEntry = newEntry;
    }
    
    localStorage.setItem(JOURNAL_ENTRIES_KEY, JSON.stringify(entries));
    updateGuestStats(); // Recalculate and save stats after any change
    return savedEntry;
  } catch (error) {
    console.error('Failed to save guest journal entry to localStorage', error);
    return null;
  }
}

/**
 * Deletes a journal entry and recalculates all stats.
 * @param entryId The ID of the entry to delete.
 */
export function deleteGuestEntry(entryId: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    const entries = getGuestEntries();
    const updatedEntries = entries.filter(entry => entry.id !== entryId);
    localStorage.setItem(JOURNAL_ENTRIES_KEY, JSON.stringify(updatedEntries));
    updateGuestStats(); // Recalculate and save stats after any change
  } catch (error) {
    console.error('Failed to delete guest journal entry from localStorage', error);
  }
}

/**
 * Clears all guest data from localStorage.
 * This should be called after a successful migration to a real user.
 */
export function clearGuestData(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(GUEST_ID_KEY);
    localStorage.removeItem(JOURNAL_ENTRIES_KEY);
    localStorage.removeItem(GUEST_STATS_KEY);
  } catch (error) {
    console.error('Failed to clear guest data from localStorage', error);
  }
}
