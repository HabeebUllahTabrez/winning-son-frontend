"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { formatDateForAPI } from "@/lib/dateUtils";
import { getGuestEntries, isGuestUser, saveGuestEntry } from "@/lib/guest";
import { markFirstLogCreated, shouldShowFirstLogCue } from "@/lib/onboarding";
import clsx from "clsx";
import { FaInfoCircle } from "react-icons/fa";
import toast from "react-hot-toast";
import { trackEvent } from "@/lib/mixpanel";

// --- NEW, THEMATICALLY ALIGNED RATING COMPONENT ---
const ThemedRatingScale = ({
  title,
  description,
  value,
  setValue,
  loading,
}: {
  title: string;
  description: string;
  value: number;
  setValue: (value: number) => void;
  loading: boolean;
}) => {
  const ratingOptions = Array.from({ length: 10 }, (_, i) => i + 1);

  return (
    <div>
      {/* The main changes are here */}
      <div className="mb-2">
        <label className="font-bold text-lg">{title}</label>
        {/* 1. The 'i' button has been removed */}
        {/* 2. The description is now a simple paragraph below the title */}
        <p className="text-sm text-gray-600">{description}</p>
      </div>

      <div className="flex w-full cursor-pointer">
        {ratingOptions.map((num) => (
          <button
            key={num}
            disabled={loading}
            onClick={() => setValue(num)}
            className={clsx(
              "h-10 flex-1 border-2 border-black -ml-px first:ml-0 first:rounded-l-lg last:rounded-r-lg transition-transform duration-150 focus:z-10",
              {
                "bg-black text-white": num <= value,
                "bg-white text-black": num > value,
              }
            )}
            aria-label={`Set ${title} rating to ${num}`}
          >
            {num}
          </button>
        ))}
      </div>
    </div>
  );
};

// --- MAIN JOURNAL PAGE COMPONENT ---
export default function Journal() {
  const [topics, setTopics] = useState("");
  const [alignmentRating, setAlignmentRating] = useState(0); // Default to 0 (unrated)
  const [contentmentRating, setContentmentRating] = useState(0); // Default to 0 (unrated)
  const [journalDate, setJournalDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [existingEntryFound, setExistingEntryFound] = useState(false); // Track if editing

  const searchParams = useSearchParams();
  const isGuest = isGuestUser();
  const router = useRouter();

  // (Simplified useEffect for date)
  useEffect(() => {
    const dateParam = searchParams.get("date");
    const targetDate = dateParam || formatDateForAPI(new Date());
    setJournalDate(targetDate);
    trackEvent("Journal Page Viewed", { date: targetDate, isGuest });
  }, [searchParams, isGuest]);

  // (Fetch logic remains the same, adjusted for 0 default)
  useEffect(() => {
    if (!journalDate) return;
    const fetchEntry = async () => {
      setLoading(true);
      setTopics("");
      setAlignmentRating(0);
      setContentmentRating(0);
      setSuccessMsg("");
      setErrorMsg("");
      setExistingEntryFound(false); // Reset editing state
      try {
        let entry;
        if (isGuest) {
          const entries = getGuestEntries();
          entry = entries.find((e) => e.createdAt.startsWith(journalDate));
        } else {
          const res = await apiFetch(
            `/api/journal?start_date=${journalDate}&end_date=${journalDate}`
          );
          if (res.status === 200 && res.data) entry = res.data[0];
        }
        if (entry) {
          setTopics(entry.topics || "");
          setAlignmentRating(entry.alignment_rating ?? 0);
          setContentmentRating(entry.contentment_rating ?? 0);
          setExistingEntryFound(true); // Mark as editing
          trackEvent("Existing Entry Loaded", { date: journalDate, isGuest });
        }
      } catch (e: unknown) {
        setErrorMsg(
          e instanceof Error ? e.message : "An unknown error occurred."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchEntry();
  }, [journalDate, isGuest]);

  async function submit() {
    if (!journalDate) return;
    setSuccessMsg("");
    setErrorMsg("");
    setLoading(true);

    const entryData = {
      topics,
      alignment_rating: alignmentRating,
      contentment_rating: contentmentRating,
      createdAt: journalDate,
      localDate: journalDate, // Use localDate instead of local_date
    };
    try {
      // Check if this is their first log before saving
      const isFirstLog = shouldShowFirstLogCue();

      if (isGuest) {
        saveGuestEntry(entryData);
      } else {
        const res = await apiFetch("/api/journal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          data: {
            topics,
            alignment_rating: alignmentRating,
            contentment_rating: contentmentRating,
            createdAt: journalDate,
            local_date: journalDate,
          },
        });
        if (res.status < 200 || res.status >= 300)
          throw new Error(res.statusText);
      }

      // Mark first log as created if this is their first entry
      if (isFirstLog && !existingEntryFound) {
        markFirstLogCreated();

        // Show special celebration for first log
        toast.success("🎉 Your first log is complete! The journey has begun!", {
          duration: 4000,
          style: {
            background: '#fef3c7',
            color: '#92400e',
            border: '2px solid #f59e0b',
            fontWeight: 'bold',
          },
        });
      }

      // Wait for tracking to complete before redirecting
      await trackEvent(existingEntryFound ? "Entry Updated" : "Entry Created", {
        date: journalDate,
        isGuest,
        alignment_rating: alignmentRating,
        contentment_rating: contentmentRating,
        topicsLength: topics.length,
        isFirstLog: isFirstLog && !existingEntryFound,
      });

      setSuccessMsg(
        `Saved entry for ${formatDisplayDate(journalDate)} successfully!`
      );
      router.push(`/submissions?date=${journalDate}`);
    } catch (e: unknown) {
      setErrorMsg(
        e instanceof Error ? e.message : "An unknown error occurred."
      );
    } finally {
      setLoading(false);
    }
  }

  const formatDisplayDate = (dateString: string | null) => {
    if (!dateString) return "Today";
    if (dateString === formatDateForAPI(new Date())) return "Today";
    const date = new Date(dateString + "T00:00:00");
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const dotPatternStyle = {
    backgroundImage:
      "radial-gradient(circle at 1px 1px, rgba(0,0,0,0.2) 1px, transparent 0)",
    backgroundSize: "12px 12px",
  };

  // Show skeleton while loading initial data
  if (loading && !topics && !alignmentRating && !contentmentRating) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10 animate-pulse">
        <div className="space-y-6">
          {/* Header Skeleton */}
          <header>
            <div className="h-10 bg-gray-200 rounded w-2/3 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          </header>

          {/* Main Card Skeleton */}
          <div className="border-2 border-gray-200 rounded-lg p-4 space-y-6">
            {/* Your Thoughts Section */}
            <div className="space-y-4">
              <div className="flex items-center text-center">
                <div className="flex-grow border-t-2 border-gray-200"></div>
                <div className="flex-shrink mx-4 h-4 w-32 bg-gray-200 rounded"></div>
                <div className="flex-grow border-t-2 border-gray-200"></div>
              </div>
              <div className="h-40 bg-gray-200 rounded-lg"></div>
            </div>

            {/* Your Ratings Section */}
            <div className="space-y-6">
              <div className="flex items-center text-center">
                <div className="flex-grow border-t-2 border-gray-200"></div>
                <div className="flex-shrink mx-4 h-4 w-32 bg-gray-200 rounded"></div>
                <div className="flex-grow border-t-2 border-gray-200"></div>
              </div>

              {/* Alignment Rating Skeleton */}
              <div className="space-y-2">
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="flex w-full gap-1">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className="h-10 flex-1 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>

              {/* Contentment Rating Skeleton */}
              <div className="space-y-2">
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="flex w-full gap-1">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className="h-10 flex-1 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Buttons Skeleton */}
          <div className="flex gap-4">
            <div className="h-12 w-32 bg-gray-200 rounded"></div>
            <div className="h-12 w-48 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="space-y-6">
        <header>
          <h1 className="text-4xl font-bold">
            {journalDate
              ? `Journal for ${formatDisplayDate(journalDate)}`
              : "Loading..."}
          </h1>
          <p className="text-lg text-gray-600">
            A quick reflection is all it takes.
          </p>
        </header>

        <div className="card space-y-6">
          <div className="border-2 border-black rounded-lg overflow-hidden">
            <div className="p-4 space-y-4">
              {" "}
              {/* Added space-y for consistent spacing */}
              {/* 1. Replaced the old label with the new divider style */}
              <div className="flex items-center text-center">
                <div className="flex-grow border-t-2 border-gray-200"></div>
                <span className="flex-shrink mx-4 text-xs uppercase font-bold tracking-widest text-gray-500">
                  Your Thoughts
                </span>
                <div className="flex-grow border-t-2 border-gray-200"></div>
              </div>
              <textarea
                id="topics"
                className="w-full min-h-[150px] text-lg border-2 border-gray-300 focus:border-black focus:outline-none rounded-lg p-3 resize-y"
                value={topics}
                onChange={(e) => setTopics(e.target.value)}
                placeholder="Jot down your wins, your worries, and your 'what-ifs'..."
                disabled={loading}
              />
            </div>

            {/* This "Your Ratings" section remains the same */}
            <div className="p-4 space-y-6">
              <div className="flex items-center text-center">
                <div className="flex-grow border-t-2 border-gray-200"></div>
                <span className="flex-shrink mx-4 text-xs uppercase font-bold tracking-widest text-gray-500">
                  Your Ratings
                </span>
                <div className="flex-grow border-t-2 border-gray-200"></div>
              </div>

              <ThemedRatingScale
                title="Alignment"
                description="How closely did this work reflect your main goals?"
                value={alignmentRating}
                setValue={setAlignmentRating}
                loading={loading}
              />
              <ThemedRatingScale
                title="Contentment"
                description="How at peace did you feel about this experience?"
                value={contentmentRating}
                setValue={setContentmentRating}
                loading={loading}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <button
            className="btn text-lg"
            onClick={submit}
            disabled={
              loading || !topics || !alignmentRating || !contentmentRating
            }
          >
            {loading ? "Saving..." : "Save Entry"}
          </button>
          <Link className="text-lg underline" href="/submissions">
            Back to Submissions
          </Link>
        </div>

        {successMsg && (
          <div className="p-4 border-2 border-green-700 bg-green-50 rounded-lg">
            <p className="text-green-800 font-bold">{successMsg}</p>
          </div>
        )}
        {errorMsg && (
          <div className="p-4 border-2 border-red-700 bg-red-50 rounded-lg">
            <p className="text-red-800 font-bold">{errorMsg}</p>
          </div>
        )}
      </div>
    </div>
  );
}
