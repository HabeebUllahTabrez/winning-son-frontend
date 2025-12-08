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

// --- SVG Icons ---
const PencilIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.033-2.134H8.033C6.91 2.75 6 3.704 6 4.884v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>;
const ChevronLeftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" /></svg>;
const ChevronRightIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>;
const SparklesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" /></svg>;

// --- Type Definitions ---
type Entry = {
  local_date: string;
  topics: string;
  alignment_rating: number;
  contentment_rating: number;
  id?: string;
};

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

// --- Helper: Get mood based on ratings ---
function getMood(alignment: number, contentment: number): { emoji: string; label: string; className: string } {
  const avg = (alignment + contentment) / 2;
  if (avg >= 8) return { emoji: '🔥', label: 'Excellent', className: 'mood-excellent' };
  if (avg >= 6) return { emoji: '✨', label: 'Good', className: 'mood-good' };
  if (avg >= 4) return { emoji: '💭', label: 'Okay', className: 'mood-okay' };
  return { emoji: '🌱', label: 'Growing', className: 'mood-growing' };
}

// --- Rating Progress Bar Component ---
function RatingBar({ label, value, type }: { label: string; value: number; type: 'alignment' | 'contentment' }) {
  const [width, setWidth] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => setWidth(value * 10), 100);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-bold uppercase tracking-wider text-gray-500 w-24">{label}</span>
      <div className="rating-bar flex-1">
        <div 
          className={`rating-bar-fill ${type}`} 
          style={{ width: `${width}%` }}
        />
      </div>
      <span className="text-sm font-bold text-gray-700 w-8">{value}/10</span>
    </div>
  );
}

// --- Timeline Day Dot Component ---
function TimelineDot({ 
  day, 
  hasEntry, 
  isCurrentDay, 
  isSelected,
  onClick 
}: { 
  day: Date; 
  hasEntry: boolean; 
  isCurrentDay: boolean;
  isSelected: boolean;
  onClick: () => void;
}) {
  const dayName = day.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0);
  const dayNum = day.getDate();
  
  return (
    <button
      onClick={onClick}
      className={clsx(
        "timeline-dot",
        hasEntry ? "has-entry" : "no-entry",
        isCurrentDay && "current",
        isSelected && "ring-2 ring-purple-500 ring-offset-2"
      )}
      title={day.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
    >
      <span className="flex flex-col items-center leading-none">
        <span className="text-[10px] opacity-70">{dayName}</span>
        <span className="text-sm">{dayNum}</span>
      </span>
    </button>
  );
}

export default function SubmissionsClient({ viewMode }: SubmissionsClientProps) {
  const searchParams = useSearchParams();
  const highlightedDate = searchParams.get("highlighted");

  const [weekStartDate, setWeekStartDate] = useState(() => {
    if (highlightedDate) {
      return getStartOfWeek(new Date(highlightedDate + 'T00:00:00'));
    }
    return getStartOfWeek(new Date());
  });

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

  // Fetch submissions
  useEffect(() => {
    const fetchSubmissions = async () => {
      setLoading(true);

      const endDate = new Date(weekStartDate);
      endDate.setDate(weekStartDate.getDate() + 6);
      const startDateStr = formatDateForAPI(weekStartDate);
      const endDateStr = formatDateForAPI(endDate);

      try {
        let entries: Entry[] = [];
        if (isGuest) {
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
  }, [weekStartDate, isGuest, viewMode]);

  // Scroll to highlighted entry
  useEffect(() => {
    if (loading || !highlightedDate || !entryRefs.current.has(highlightedDate)) return;

    const node = entryRefs.current.get(highlightedDate);
    if (node) {
      setTimeout(() => node.scrollIntoView({ behavior: "smooth", block: "center" }), 100);
    }
  }, [highlightedDate, loading, data]);

  // Memoized values
  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => { const day = new Date(weekStartDate); day.setDate(weekStartDate.getDate() + i); return day; }), [weekStartDate]);
  const entriesByDate = useMemo(() => (data && Array.isArray(data)) ? new Map(data.map(e => [e.local_date, e])) : new Map(), [data]);
  const isNextWeekInFuture = useMemo(() => { const nextWeekStart = new Date(weekStartDate); nextWeekStart.setDate(weekStartDate.getDate() + 7); return nextWeekStart > new Date(); }, [weekStartDate]);
  
  const todayStr = useMemo(() => formatDateForAPI(new Date()), []);
  const currentDayStr = useMemo(() => formatDateForAPI(currentDay), [currentDay]);

  // Week stats
  const weekStats = useMemo(() => {
    const total = weekDays.length;
    const completed = weekDays.filter(day => entriesByDate.has(formatDateForAPI(day))).length;
    return { total, completed, percentage: Math.round((completed / total) * 100) };
  }, [weekDays, entriesByDate]);

  // Navigation handlers
  const handlePreviousWeek = () => {
    const newDate = new Date(weekStartDate);
    newDate.setDate(weekStartDate.getDate() - 7);
    setWeekStartDate(newDate);
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
    if (highlightedDate) {
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('highlighted');
      router.replace(newUrl.pathname + newUrl.search);
    }
  };

  const handleGoToToday = () => {
    if (viewMode === 'daily') {
      setCurrentDay(new Date());
    }
    setWeekStartDate(getStartOfWeek(new Date()));
    if (highlightedDate) {
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('highlighted');
      router.replace(newUrl.pathname + newUrl.search);
    }
  };

  const handleDayClick = (day: Date) => {
    setCurrentDay(day);
    const dayWeekStart = getStartOfWeek(day);
    if (dayWeekStart.getTime() !== weekStartDate.getTime()) {
      setWeekStartDate(dayWeekStart);
    }
  };

  const handlePreviousDay = () => {
    const newDate = new Date(currentDay);
    newDate.setDate(currentDay.getDate() - 1);
    setCurrentDay(newDate);

    const newWeekStart = getStartOfWeek(newDate);
    if (newWeekStart.getTime() !== weekStartDate.getTime()) {
      setWeekStartDate(newWeekStart);
    }

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

    const newWeekStart = getStartOfWeek(newDate);
    if (newWeekStart.getTime() !== weekStartDate.getTime()) {
      setWeekStartDate(newWeekStart);
    }

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

  // Delete handlers
  const handleDeleteClick = (date: string) => {
    setEntryToDelete(date);
    setIsConfirmOpen(true);
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

  // --- RENDER ---
  return (
    <>
      <ConfirmDialog isOpen={isConfirmOpen} onCancel={() => setIsConfirmOpen(false)} onConfirm={handleConfirmDelete} title="Confirm Deletion" isConfirming={isDeleting} confirmText="Delete">
        Are you sure you want to delete this journal entry? This action cannot be undone.
      </ConfirmDialog>

      {/* Timeline Navigation Card */}
      <div className="entry-card p-6 mb-8">
        {/* Main Navigation Row */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={viewMode === 'daily' ? handlePreviousDay : handlePreviousWeek}
            className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-all hover:scale-110 active:scale-95"
            aria-label={viewMode === 'daily' ? "Previous day" : "Previous week"}
          >
            <ChevronLeftIcon />
          </button>
          
          <div className="flex flex-col items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-center">
              {viewMode === 'daily'
                ? currentDay.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
                : formatDateRangeForDisplay(weekStartDate)
              }
            </h2>
            <button 
              onClick={handleGoToToday} 
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black text-white text-sm font-bold hover:scale-105 transition-transform"
            >
              <SparklesIcon />
              Today
            </button>
          </div>
          
          <button
            onClick={viewMode === 'daily' ? handleNextDay : handleNextWeek}
            disabled={viewMode === 'daily' ? isNextDayInFuture : isNextWeekInFuture}
            className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-all hover:scale-110 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
            aria-label={viewMode === 'daily' ? "Next day" : "Next week"}
          >
            <ChevronRightIcon />
          </button>
        </div>

        {/* Timeline Dots */}
        <div className="flex justify-center items-center gap-2 sm:gap-3 flex-wrap">
          {weekDays.map((day) => {
            const dateStr = formatDateForAPI(day);
            return (
              <TimelineDot
                key={dateStr}
                day={day}
                hasEntry={entriesByDate.has(dateStr)}
                isCurrentDay={dateStr === todayStr}
                isSelected={viewMode === 'daily' && dateStr === currentDayStr}
                onClick={() => handleDayClick(day)}
              />
            );
          })}
        </div>

        {/* Week Stats */}
        <div className="mt-6 flex justify-center">
          <div className="stats-pill">
            <span className="text-lg">{weekStats.completed === weekStats.total ? '🎉' : '📝'}</span>
            <span>
              <strong>{weekStats.completed}</strong> of {weekStats.total} days journaled
            </span>
            <span className="text-purple-600 font-bold">({weekStats.percentage}%)</span>
          </div>
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="text-6xl mb-4 animate-bounce-slow">📖</div>
            <p className="text-gray-500 text-lg">Loading your entries...</p>
          </div>
        </div>
      ) : viewMode === 'daily' ? (
        // ===== DAILY VIEW =====
        <div>
          {(() => {
            const dateString = formatDateForAPI(currentDay);
            const entry = entriesByDate.get(dateString);
            const mood = entry ? getMood(entry.alignment_rating, entry.contentment_rating) : null;
            
            return (
              <div 
                ref={(node) => { if (node) entryRefs.current.set(dateString, node); else entryRefs.current.delete(dateString); }}
                className="animate-entry-slide"
              >
                {entry ? (
                  <div className={clsx(
                    "entry-card p-8 sm:p-10 lg:p-12",
                    { 'highlight': dateString === highlightedDate }
                  )}>
                    {/* Mood Badge */}
                    <div className="flex justify-between items-start mb-6">
                      <div className={clsx("mood-badge", mood?.className)}>
                        <span className="text-xl">{mood?.emoji}</span>
                        <span>{mood?.label} Day</span>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          className="action-btn edit"
                          onClick={() => {
                            trackEvent("Edit Entry Clicked", { date: entry.local_date, isGuest });
                            router.push(`/journal?date=${entry.local_date}`);
                          }}
                          aria-label="Edit entry"
                          title="Edit entry"
                        >
                          <PencilIcon />
                        </button>
                        <button
                          className="action-btn delete"
                          onClick={() => handleDeleteClick(entry.local_date)}
                          aria-label="Delete entry"
                          title="Delete entry"
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </div>

                    {/* Journal Content */}
                    <div className="mb-8">
                      <p className="whitespace-pre-wrap text-lg sm:text-xl lg:text-2xl leading-relaxed text-gray-800">
                        {entry.topics}
                      </p>
                    </div>

                    {/* Rating Bars */}
                    <div className="pt-6 border-t-2 border-black/10 space-y-4">
                      <RatingBar label="Alignment" value={entry.alignment_rating} type="alignment" />
                      <RatingBar label="Contentment" value={entry.contentment_rating} type="contentment" />
                    </div>
                  </div>
                ) : (
                  <Link href={`/journal?date=${dateString}`} className="block" onClick={() => {
                    trackEvent("Add Entry Clicked", { date: dateString, isGuest });
                  }}>
                    <div className="empty-state p-12 sm:p-16 lg:p-20 cursor-pointer group">
                      <div className="max-w-md mx-auto">
                        <div className="text-7xl sm:text-8xl mb-6 animate-float-bounce group-hover:animate-write-wiggle">✏️</div>
                        <p className="text-2xl sm:text-3xl font-bold text-gray-700 mb-3">
                          No entry yet
                        </p>
                        <p className="text-lg text-gray-500 mb-6">
                          Every day is a new page. What will you write?
                        </p>
                        <span className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white font-bold rounded-full group-hover:scale-105 transition-transform">
                          <SparklesIcon />
                          Start Writing
                        </span>
                      </div>
                    </div>
                  </Link>
                )}
              </div>
            );
          })()}
        </div>
      ) : (
        // ===== WEEKLY VIEW =====
        <div className="space-y-6">
          {weekDays.map((day, index) => {
            const dateString = formatDateForAPI(day);
            const entry = entriesByDate.get(dateString);
            const mood = entry ? getMood(entry.alignment_rating, entry.contentment_rating) : null;
            const isToday = dateString === todayStr;
            
            return (
              <div 
                key={dateString} 
                ref={(node) => { if (node) entryRefs.current.set(dateString, node); else entryRefs.current.delete(dateString); }}
                className={`animate-entry-slide stagger-${index + 1}`}
              >
                {/* Day Header */}
                <div className="flex items-center gap-3 mb-3">
                  <div className={clsx(
                    "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm",
                    entry ? "bg-black text-white" : "bg-gray-100 text-gray-400",
                    isToday && "ring-2 ring-purple-500 ring-offset-2"
                  )}>
                    {day.getDate()}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">
                      {day.toLocaleDateString('en-US', { weekday: 'long' })}
                      {isToday && <span className="ml-2 text-sm font-normal text-purple-600">(Today)</span>}
                    </h3>
                    <p className="text-sm text-gray-500">{day.toLocaleDateString('en-US', { month: 'long' })}</p>
                  </div>
                  {entry && mood && (
                    <span className={clsx("mood-badge ml-auto", mood.className)}>
                      <span>{mood.emoji}</span>
                      <span className="hidden sm:inline">{mood.label}</span>
                    </span>
                  )}
                </div>

                {/* Entry Card */}
                {entry ? (
                  <div className={clsx(
                    "entry-card p-6",
                    { 'highlight': dateString === highlightedDate }
                  )}>
                    {/* Content Preview */}
                    <p className="whitespace-pre-wrap text-base leading-relaxed text-gray-700 mb-4 line-clamp-3">
                      {entry.topics}
                    </p>

                    {/* Footer */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-4 text-sm">
                        <span className="inline-flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-400 to-purple-600"></span>
                          <span className="text-gray-600">Align: <strong>{entry.alignment_rating}</strong></span>
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded-full bg-gradient-to-r from-amber-400 to-amber-600"></span>
                          <span className="text-gray-600">Content: <strong>{entry.contentment_rating}</strong></span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          className="action-btn edit" 
                          onClick={() => {
                            trackEvent("Edit Entry Clicked", { date: entry.local_date, isGuest });
                            router.push(`/journal?date=${entry.local_date}`);
                          }} 
                          aria-label="Edit"
                          title="Edit entry"
                        >
                          <PencilIcon />
                        </button>
                        <button 
                          className="action-btn delete" 
                          onClick={() => handleDeleteClick(entry.local_date)} 
                          aria-label="Delete"
                          title="Delete entry"
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link href={`/journal?date=${dateString}`} className="block" onClick={() => {
                    trackEvent("Add Entry Clicked", { date: dateString, isGuest });
                  }}>
                    <div className="empty-state p-6 flex items-center justify-between cursor-pointer group">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl group-hover:animate-bounce-slow">📝</span>
                        <span className="text-gray-500">No entry yet</span>
                      </div>
                      <span className="text-sm font-bold text-gray-400 group-hover:text-black transition-colors">
                        Add entry →
                      </span>
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
