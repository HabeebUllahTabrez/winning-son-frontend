"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { formatDateForAPI } from "@/lib/dateUtils";
import { getGuestEntries, isGuestUser, saveGuestEntry } from "@/lib/guest";
import clsx from "clsx";
import { FaInfoCircle } from "react-icons/fa";

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
      <div className="flex items-center gap-2 mb-2 font-bold text-lg">
        <label>{title}</label>
        <button title={description} className="text-gray-400 hover:text-black">
          <FaInfoCircle />
        </button>
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

  const searchParams = useSearchParams();
  const isGuest = isGuestUser();

  // (Simplified useEffect for date)
  useEffect(() => {
    const dateParam = searchParams.get("date");
    const targetDate = dateParam || formatDateForAPI(new Date());
    setJournalDate(targetDate);
  }, [searchParams]);

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
      try {
        let entry;
        if (isGuest) {
          const entries = getGuestEntries();
          entry = entries.find((e) => e.createdAt.startsWith(journalDate));
        } else {
          const res = await apiFetch(`/api/journal?local_date=${journalDate}`);
          if (res.status === 200 && res.data) entry = res.data;
        }
        if (entry) {
          setTopics(entry.content);
          setAlignmentRating(entry.alignment_rating ?? 0);
          setContentmentRating(entry.contentment_rating ?? 0);
        }
      } catch (e: unknown) {
        setErrorMsg(e instanceof Error ? e.message : "An unknown error occurred.");
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
      local_date: journalDate,
    };
    try {
      if (isGuest) {
        saveGuestEntry(entryData);
      } else {
        const res = await apiFetch("/api/journal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          data: entryData,
        });
        if (res.status < 200 || res.status >= 300)
          throw new Error(res.statusText);
      }
      setSuccessMsg(
        `Saved entry for ${formatDisplayDate(journalDate)} successfully!`
      );
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
    return date.toLocaleDateString("en-US", { month: 'long', day: 'numeric', year: 'numeric' });
  };
  
  const dotPatternStyle = {
    backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.2) 1px, transparent 0)',
    backgroundSize: '12px 12px',
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="space-y-6">
        <header>
          <h1 className="text-4xl font-bold">
            {journalDate ? `Journal for ${formatDisplayDate(journalDate)}` : "Loading..."}
          </h1>
          <p className="text-lg text-gray-600">A quick reflection is all it takes.</p>
        </header>

        <div className="card space-y-6">
          <div className="border-2 border-black rounded-lg overflow-hidden">
            <div className="p-4">
              <label className="text-xs uppercase font-bold tracking-widest text-gray-500">Your Thoughts</label>
              <textarea
                id="topics"
                className="w-full min-h-[150px] mt-1 text-lg border-none focus:ring-0 p-0 resize-y"
                value={topics}
                onChange={(e) => setTopics(e.target.value)}
                placeholder="Jot down your wins, your worries, and your 'what-ifs'..."
                disabled={loading}
              />
            </div>
            <div className="p-4 border-t-2 border-dashed border-gray-300 space-y-4" style={dotPatternStyle}>
              <label className="text-xs uppercase font-bold tracking-widest text-gray-500">Your Ratings</label>
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

          <div className="flex flex-wrap items-center gap-4">
            <button className="btn text-lg" onClick={submit} disabled={loading || !topics || !alignmentRating || !contentmentRating}>
              {loading ? "Saving..." : "Save Entry"}
            </button>
            <Link className="text-lg underline" href="/submissions">Back to Submissions</Link>
          </div>

          {successMsg && <div className="p-4 border-2 border-green-700 bg-green-50 rounded-lg"><p className="text-green-800 font-bold">{successMsg}</p></div>}
          {errorMsg && <div className="p-4 border-2 border-red-700 bg-red-50 rounded-lg"><p className="text-red-800 font-bold">{errorMsg}</p></div>}
        </div>
      </div>
    </div>
  );
}
