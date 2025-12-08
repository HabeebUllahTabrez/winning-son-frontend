"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { toast } from "react-hot-toast";
import { getStartOfWeek, formatDateForAPI, formatDateRangeForDisplay } from "@/lib/dateUtils";
import { isGuestUser, getGuestEntries, deleteGuestEntry } from "@/lib/guest";
import clsx from "clsx";
import { trackEvent } from "@/lib/mixpanel";

// --- (SVG Icons remain the same) ---
const PencilIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.033-2.134H8.033C6.91 2.75 6 3.704 6 4.884v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>;
const ChevronLeftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" /></svg>;
const ChevronRightIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>;

// --- Type Definitions ---
type Entry = {
  local_date: string;
  topics: string;
  alignment_rating: number;
  contentment_rating: number;
  id?: string;
};

// ✨ Define a specific type for guest entries from localStorage
type GuestEntry = {
  createdAt: string;
  topics: string;
  alignment_rating: number;
  contentment_rating: number;
  id: string;
};


type ViewMode = 'daily' | 'weekly';

type SubmissionsClientProps = {
  viewMode: ViewMode;
};

export default function SubmissionsClient({ viewMode }: SubmissionsClientProps) {
  const searchParams = useSearchParams();
  const highlightedDate = searchParams.get("highlighted");

  // Calculate initial week start based on highlighted date or current week
  const [weekStartDate, setWeekStartDate] = useState(() => {
    if (highlightedDate) {
      // If there's a highlighted date, show the week containing that date
      return getStartOfWeek(new Date(highlightedDate + 'T00:00:00'));
    }
    // Otherwise, show the current week
    return getStartOfWeek(new Date());
  });

  // For daily view, track the current day
  const [currentDay, setCurrentDay] = useState(() => {
    if (highlightedDate) {
      return new Date(highlightedDate + 'T00:00:00');
    }
    return new Date();
  });

  const [data, setData] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const router = useRouter();
  const isGuest = isGuestUser();
  const entryRefs = useRef(new Map<string, HTMLDivElement>());

  useEffect(() => {
    const fetchSubmissions = async () => {
      setLoading(true);

      // For weekly view, fetch the entire week
      const endDate = new Date(weekStartDate);
      endDate.setDate(weekStartDate.getDate() + 6);
      const startDateStr = formatDateForAPI(weekStartDate);
      const endDateStr = formatDateForAPI(endDate);

      try {
        let entries: Entry[] = [];
        if (isGuest) {
          // ✨ Use the GuestEntry type for the data from getGuestEntries()
          const guestEntries: GuestEntry[] = getGuestEntries();
          entries = guestEntries.filter(entry => {
            const entryDate = entry.createdAt.split('T')[0];
            return entryDate >= startDateStr && entryDate <= endDateStr;
          }).map(entry => ({
            local_date: entry.createdAt.split('T')[0],
            topics: entry.topics,
            alignment_rating: entry.alignment_rating,
            contentment_rating: entry.contentment_rating,
            id: entry.id
          }));
        } else {
          const params = new URLSearchParams({ start_date: startDateStr, end_date: endDateStr });
          const res = await apiFetch(`/api/journal?${params.toString()}`);
          // Assuming res.data is already correctly typed from apiFetch
          entries = res.data || [];
        }
        setData(entries || []);
        trackEvent("Submissions Page Viewed", { isGuest, viewMode, weekStart: startDateStr, entryCount: entries.length });
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to load submissions.");
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [weekStartDate, isGuest]);

  useEffect(() => {
    if (loading || !highlightedDate || !entryRefs.current.has(highlightedDate)) return;

    const node = entryRefs.current.get(highlightedDate);
    if (node) {
      setTimeout(() => node.scrollIntoView({ behavior: "smooth", block: "center" }), 100);
    }
  }, [highlightedDate, loading, data]);

  // --- (All memoized values, week handlers, and delete handlers remain the same) ---
  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => { const day = new Date(weekStartDate); day.setDate(weekStartDate.getDate() + i); return day; }), [weekStartDate]);
  const entriesByDate = useMemo(() => (data && Array.isArray(data)) ? new Map(data.map(e => [e.local_date, e])) : new Map(), [data]);
  const isNextWeekInFuture = useMemo(() => { const nextWeekStart = new Date(weekStartDate); nextWeekStart.setDate(weekStartDate.getDate() + 7); return nextWeekStart > new Date(); }, [weekStartDate]);
  const handlePreviousWeek = () => {
    const newDate = new Date(weekStartDate);
    newDate.setDate(weekStartDate.getDate() - 7);
    setWeekStartDate(newDate);
    // Clear highlight when navigating
    if (highlightedDate) {
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('highlighted');
      router.replace(newUrl.pathname + newUrl.search);
    }
  };
  const handleNextWeek = () => {
    const newDate = new Date(weekStartDate);
    newDate.setDate(weekStartDate.getDate() + 7);
    setWeekStartDate(newDate);
    // Clear highlight when navigating
    if (highlightedDate) {
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('highlighted');
      router.replace(newUrl.pathname + newUrl.search);
    }
  };
  const handleGoToToday = () => {
    if (viewMode === 'daily') {
      setCurrentDay(new Date());
    } else {
      setWeekStartDate(getStartOfWeek(new Date()));
    }
    // Clear highlight when navigating
    if (highlightedDate) {
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('highlighted');
      router.replace(newUrl.pathname + newUrl.search);
    }
  };

  // Daily view navigation handlers
  const handlePreviousDay = () => {
    const newDate = new Date(currentDay);
    newDate.setDate(currentDay.getDate() - 1);
    setCurrentDay(newDate);

    // Update week if we've moved outside current week
    const newWeekStart = getStartOfWeek(newDate);
    if (newWeekStart.getTime() !== weekStartDate.getTime()) {
      setWeekStartDate(newWeekStart);
    }

    // Clear highlight when navigating
    if (highlightedDate) {
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('highlighted');
      router.replace(newUrl.pathname + newUrl.search);
    }
  };

  const handleNextDay = () => {
    const newDate = new Date(currentDay);
    newDate.setDate(currentDay.getDate() + 1);
    setCurrentDay(newDate);

    // Update week if we've moved outside current week
    const newWeekStart = getStartOfWeek(newDate);
    if (newWeekStart.getTime() !== weekStartDate.getTime()) {
      setWeekStartDate(newWeekStart);
    }

    // Clear highlight when navigating
    if (highlightedDate) {
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('highlighted');
      router.replace(newUrl.pathname + newUrl.search);
    }
  };

  const isNextDayInFuture = useMemo(() => {
    const nextDay = new Date(currentDay);
    nextDay.setDate(currentDay.getDate() + 1);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    nextDay.setHours(0, 0, 0, 0);
    return nextDay > today;
  }, [currentDay]);
  const handleDeleteClick = (date: string) => {
    setEntryToDelete(date);
    setIsConfirmOpen(true);
    // Clear highlight from URL to prevent z-index conflicts
    if (highlightedDate) {
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('highlighted');
      router.replace(newUrl.pathname + newUrl.search);
    }
  };
  const handleConfirmDelete = async () => {
    if (!entryToDelete) return;
    setIsDeleting(true);
    try {
      if (isGuest) {
        const entry = data.find(e => e.local_date === entryToDelete);
        if (entry && entry.id) deleteGuestEntry(entry.id);
      } else {
        await apiFetch('/api/journal', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          data: { local_date: entryToDelete }
        });
      }
      setData(prev => prev.filter(e => e.local_date !== entryToDelete));
      trackEvent("Entry Deleted", { isGuest, date: entryToDelete });
      toast.success("Entry deleted successfully.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete entry.");
    } finally {
      setIsDeleting(false);
      setIsConfirmOpen(false);
      setEntryToDelete(null);
    }
  };

  // --- JSX ---
  return (
      <>
          <ConfirmDialog isOpen={isConfirmOpen} onCancel={() => setIsConfirmOpen(false)} onConfirm={handleConfirmDelete} title="Confirm Deletion" isConfirming={isDeleting} confirmText="Delete">
              Are you sure you want to delete this journal entry? This action cannot be undone.
          </ConfirmDialog>

          {/* Navigation Card */}
          <div className="card mb-8 p-4">
              <div className="flex justify-between items-center">
                  <button
                      onClick={viewMode === 'daily' ? handlePreviousDay : handlePreviousWeek}
                      className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                      aria-label={viewMode === 'daily' ? "Previous day" : "Previous week"}
                  >
                      <ChevronLeftIcon />
                  </button>
                  <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
                      <h2 className="text-xl sm:text-2xl font-bold text-center">
                          {viewMode === 'daily'
                              ? currentDay.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
                              : formatDateRangeForDisplay(weekStartDate)
                          }
                      </h2>
                      <button onClick={handleGoToToday} className="btn bg-white text-black text-sm !py-1 !px-3">Today</button>
                  </div>
                  <button
                      onClick={viewMode === 'daily' ? handleNextDay : handleNextWeek}
                      disabled={viewMode === 'daily' ? isNextDayInFuture : isNextWeekInFuture}
                      className="p-2 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      aria-label={viewMode === 'daily' ? "Next day" : "Next week"}
                  >
                      <ChevronRightIcon />
                  </button>
              </div>
          </div>

          {loading ? (
              <div className="text-center p-8 text-gray-500">Loading entries...</div>
          ) : viewMode === 'daily' ? (
              // Daily View - Content-focused layout
              <div>
                  {(() => {
                      const dateString = formatDateForAPI(currentDay);
                      const entry = entriesByDate.get(dateString);
                      return (
                          <div ref={(node) => { if (node) entryRefs.current.set(dateString, node); else entryRefs.current.delete(dateString); }}>
                              {entry ? (
                                  <div className={clsx(
                                      "bg-white border-2 border-black p-8 sm:p-10 md:p-12 lg:p-16",
                                      { 'highlight': dateString === highlightedDate }
                                  )}
                                  style={{
                                      boxShadow: '12px 12px 0px var(--color-card-shadow)',
                                      borderRadius: '4px 5px 3px 6px'
                                  }}>
                                      {/* Journal Content - The main focus */}
                                      <div className="mb-8">
                                          <p className="whitespace-pre-wrap text-lg sm:text-xl md:text-2xl leading-relaxed sm:leading-relaxed md:leading-loose text-gray-900 font-normal">
                                              {entry.topics}
                                          </p>
                                      </div>

                                      {/* Compact footer with ratings and actions */}
                                      <div className="pt-6 border-t-2 border-black/10">
                                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                              {/* Compact Ratings */}
                                              <div className="flex flex-wrap items-center gap-3">
                                                  <span className="inline-flex items-center gap-2 bg-purple-100 text-purple-800 py-2 px-4 rounded-full text-sm font-bold">
                                                      <span className="text-xs uppercase tracking-wide">Alignment</span>
                                                      <span className="text-lg">{entry.alignment_rating}/10</span>
                                                  </span>
                                                  <span className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-800 py-2 px-4 rounded-full text-sm font-bold">
                                                      <span className="text-xs uppercase tracking-wide">Contentment</span>
                                                      <span className="text-lg">{entry.contentment_rating}/10</span>
                                                  </span>
                                              </div>

                                              {/* Action Buttons */}
                                              <div className="flex items-center gap-2">
                                                  <button
                                                      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-700"
                                                      onClick={() => {
                                                          trackEvent("Edit Entry Clicked", { date: entry.local_date, isGuest });
                                                          router.push(`/journal?date=${entry.local_date}`);
                                                      }}
                                                      aria-label="Edit entry"
                                                  >
                                                      <PencilIcon />
                                                      <span className="text-sm font-medium">Edit</span>
                                                  </button>
                                                  <button
                                                      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors text-gray-700"
                                                      onClick={() => handleDeleteClick(entry.local_date)}
                                                      aria-label="Delete entry"
                                                  >
                                                      <TrashIcon />
                                                      <span className="text-sm font-medium">Delete</span>
                                                  </button>
                                              </div>
                                          </div>
                                      </div>
                                  </div>
                              ) : (
                                  <Link href={`/journal?date=${dateString}`} className="block" onClick={() => {
                                    trackEvent("Add Entry Clicked", { date: dateString, isGuest });
                                  }}>
                                      <div
                                          className="border-2 border-dashed border-gray-300 rounded-lg p-16 sm:p-20 md:p-24 text-center text-gray-500 hover:bg-gray-50 hover:border-gray-400 transition-all cursor-pointer"
                                      >
                                          <div className="max-w-md mx-auto">
                                              <div className="text-6xl sm:text-7xl mb-6">📝</div>
                                              <p className="text-2xl sm:text-3xl font-bold text-gray-700 mb-4">No entry for this day</p>
                                              <p className="text-lg sm:text-xl text-gray-500">Click here to create your journal entry</p>
                                          </div>
                                      </div>
                                  </Link>
                              )}
                          </div>
                      );
                  })()}
              </div>
          ) : (
              // Weekly View
              <div className="space-y-8">
                  {weekDays.map(day => {
                      const dateString = formatDateForAPI(day);
                      const entry = entriesByDate.get(dateString);
                      return (
                          <div key={dateString} ref={(node) => { if (node) entryRefs.current.set(dateString, node); else entryRefs.current.delete(dateString); }}>
                              <h3 className="text-2xl font-bold border-b-2 border-black/10 pb-2 mb-4">
                                  {day.toLocaleDateString('en-US', { weekday: 'long' })}, <span className="text-gray-600">{day.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</span>
                              </h3>
                              {entry ? (
                                  <div className={clsx("card", { 'highlight': dateString === highlightedDate })}>
                                      <div>
                                          <div className="flex flex-wrap justify-between items-start gap-2 border-b-2 border-black/10 pb-3 mb-3">
                                              <div className="flex flex-wrap items-center gap-2 text-sm font-bold">
                                                  <span className="bg-purple-100 text-purple-800 py-1 px-3 rounded-full">Alignment: {entry.alignment_rating}/10</span>
                                                  <span className="bg-yellow-100 text-yellow-800 py-1 px-3 rounded-full">Contentment: {entry.contentment_rating}/10</span>
                                              </div>
                                              <div className="flex items-center gap-2">
                                                  <button className="p-2 rounded-full hover:bg-gray-200 transition-colors" onClick={() => {
                                                    trackEvent("Edit Entry Clicked", { date: entry.local_date, isGuest });
                                                    router.push(`/journal?date=${entry.local_date}`);
                                                  }} aria-label="Edit"><PencilIcon /></button>
                                                  <button className="p-2 rounded-full hover:bg-red-100 hover:text-red-600 transition-colors" onClick={() => handleDeleteClick(entry.local_date)} aria-label="Delete"><TrashIcon /></button>
                                              </div>
                                          </div>
                                          <p className="whitespace-pre-wrap text-lg leading-relaxed pt-2">{entry.topics}</p>
                                      </div>
                                  </div>
                              ) : (
                                  <Link href={`/journal?date=${dateString}`} className="block" onClick={() => {
                                    trackEvent("Add Entry Clicked", { date: dateString, isGuest });
                                  }}>
                                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center text-gray-500 hover:bg-gray-50 hover:border-gray-400 transition-colors cursor-pointer">
                                          <p className="font-semibold">No entry for this day</p>
                                          <p className="text-sm">Click to add an entry.</p>
                                      </div>
                                  </Link>
                              )}
                          </div>
                      );
                  })}
              </div>
          )}
      </>
  );
}
