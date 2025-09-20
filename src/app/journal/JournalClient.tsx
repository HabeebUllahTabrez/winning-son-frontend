"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { formatDateForAPI } from "@/lib/dateUtils";
import { getGuestEntries, isGuestUser, saveGuestEntry  } from "@/lib/guest";

export default function Journal() {
    // State for the form
    const [topics, setTopics] = useState("");
    const [rating, setRating] = useState(5);
    
    // State for the specific date of the journal entry
    const [journalDate, setJournalDate] = useState<string | null>(null);

    // UI/UX states
    const [loading, setLoading] = useState(false); // Start loading to fetch existing data
    const [successMsg, setSuccessMsg] = useState("");
    const [errorMsg, setErrorMsg] = useState("");

    const searchParams = useSearchParams();
    const isGuest = isGuestUser();

    // Effect to set the journal date from URL or default to today
    useEffect(() => {
        const dateParam = searchParams.get('date');
        const targetDate = dateParam || formatDateForAPI(new Date());
        setJournalDate(targetDate);
    }, [searchParams]);

    // Effect to fetch existing entry for the date
    useEffect(() => {
        if (!journalDate) return;

        const fetchEntry = async () => {
            setLoading(true);
            if (isGuest) {
                const entries = getGuestEntries();
                const entry = entries.find(e => e.createdAt.startsWith(journalDate));
                if (entry) {
                    setTopics(entry.content);
                    setRating(entry.rating);
                } else {
                    setTopics("");
                    setRating(5);
                }
                setLoading(false);
                return;
            }
            try {
                const res = await apiFetch(`/api/journal?local_date=${journalDate}`);
                if (res.status === 200 && res.data) {
                    setTopics(res.data.content);
                    setRating(res.data.rating);
                } else if (res.status === 404) {
                    // No entry for this date, so clear fields
                    setTopics("");
                    setRating(5);
                } else {
                    throw new Error(`Failed to fetch entry: ${res.statusText}`);
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

        if (isGuest) {
            try {
                saveGuestEntry({ content: topics, rating, createdAt: journalDate });
                setSuccessMsg(`Saved entry for ${formatDisplayDate(journalDate)} successfully!`);
            } catch (e: unknown) {
                setErrorMsg(e instanceof Error ? e.message : "An unknown error occurred.");
            } finally {
                setLoading(false);
            }
            return;
        }

        try {
            const res = await apiFetch("/api/journal", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                data: { topics, rating, local_date: journalDate },
            });
            if (res.status < 200 || res.status >= 300) throw new Error(res.statusText);
            setSuccessMsg(`Saved entry for ${formatDisplayDate(journalDate)} successfully!`);
        } catch (e: unknown) {
            setErrorMsg(e instanceof Error ? e.message : "An unknown error occurred.");
        } finally {
            setLoading(false);
        }
    }

    const formatDisplayDate = (dateString: string | null) => {
        if (!dateString) return "Today";
        const today = formatDateForAPI(new Date());
        if (dateString === today) return "Today";
        const date = new Date(dateString + 'T00:00:00');
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const ratingOptions = Array.from({ length: 10 }, (_, i) => i + 1);

    return (
        <div className="max-w-5xl mx-auto px-4 py-10">
            <div className="space-y-8">
                <header>
                    {/* <h1 className="text-4xl font-bold">Journal for {formatDisplayDate(journalDate)}</h1> */}
                    <h1 className="text-4xl font-bold">
                    {journalDate ? `Journal for ${formatDisplayDate(journalDate)}` : "Loading Journal..."}
                    </h1>
                    <p className="text-lg text-gray-600">Log your progress and how you felt about it.</p>
                </header>

                <div className="card space-y-6">
                    {/* Topics Covered Section */}
                    <div>
                        <label htmlFor="topics" className="block text-2xl font-bold mb-2">
                            Topics Covered
                        </label>
                        <textarea
                            id="topics"
                            className="input w-full min-h-[150px] text-lg"
                            value={topics}
                            onChange={(e) => setTopics(e.target.value)}
                            placeholder="What did you work on? e.g., Next.js routing, database schemas..."
                            disabled={loading}
                        />
                    </div>

                    {/* Satisfaction Rating Section */}
                    <div>
                        <label className="block text-2xl font-bold mb-3">
                            Satisfaction Rating ({rating}/10)
                        </label>
                        <div className="flex flex-wrap items-center gap-2">
                            {ratingOptions.map((num) => (
                                <button
                                    key={num}
                                    onClick={() => setRating(num)}
                                    disabled={loading}
                                    className={`w-12 h-12 text-lg font-bold border-2 border-black rounded-full transition-colors duration-200
                                        ${rating === num
                                            ? 'bg-black text-white'
                                            : 'bg-white text-black hover:bg-gray-100'
                                        }`}
                                >
                                    {num}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-4 pt-4">
                        <button className="btn text-lg" onClick={submit} disabled={loading || !topics || !rating}>
                            {loading ? "Loading..." : "Save Entry"}
                        </button>
                        <Link className="text-lg underline" href="/submissions">
                            Back to Submissions
                        </Link>
                    </div>

                    {/* Success and Error Messages */}
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
        </div>
    );
}
