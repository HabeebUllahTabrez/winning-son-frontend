// src/app/analyzer/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { apiFetch, markAnalyzerUsed as apiMarkAnalyzerUsed } from "@/lib/api";
import toast from "react-hot-toast";
import { FaCopy, FaFlask, FaMagic, FaUndo, } from "react-icons/fa";
import { isGuestUser, getGuestEntries } from "@/lib/guest";
import { trackEvent } from "@/lib/mixpanel";
import { markAnalyzerUsed, shouldShowAnalyzerCue } from "@/lib/onboarding";
import { AnalyzerSkeleton } from "./_components/AnalyzerSkeleton";

// --- Type Definitions (Updated) ---
type UserProfile = {
  goal: string | null;
  start_date: string | null;
  end_date: string | null;
};
// Note: JournalEntry type now correctly reflects the data structure
type JournalEntry = { 
  local_date: string; 
  topics: string; 
  alignment_rating: number; 
  contentment_rating: number; 
  createdAt?: string // Optional for API responses that might not have it
};
type LoadingState = "idle" | "fetching" | "summoning";

// --- Constants (Unchanged) ---
const ANALYSIS_OPTIONS = {
  "Key Themes": "Recurring activities, topics, or skills from my recent log.",
  "Progress Analysis": "How far I am from achieving my goal, with a short explanation.",
  "3 Concrete Tasks for Tomorrow": "Specific, actionable, and achievable steps.",
  "Upcoming Days Strategy": "What I should focus on in the coming days to reach my goal more easily.",
  "Suggested Resources": "High-quality references, tools, or techniques that align with my goal.",
};
type AnalysisOptionKey = keyof typeof ANALYSIS_OPTIONS;

// --- Helper Functions (Unchanged) ---
const formatDateForInput = (dateString: string | null) => {
  if (!dateString) return "";
  return dateString.split("T")[0];
};

// --- Main Component ---
export default function AnalyzerPage() {
  // --- State Management (Unchanged) ---
  const [goal, setGoal] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedOptions, setSelectedOptions] = useState<Record<AnalysisOptionKey, boolean>>({
    "Key Themes": true,
    "Progress Analysis": true,
    "3 Concrete Tasks for Tomorrow": true,
    "Upcoming Days Strategy": false,
    "Suggested Resources": true,
  });

  const [finalPrompt, setFinalPrompt] = useState("");
  const [loadingState, setLoadingState] = useState<LoadingState>("idle");
  const [error, setError] = useState<string>("");
  const [noEntriesMessage, setNoEntriesMessage] = useState<string>("");
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const isGuest = isGuestUser();

  // Auth header no longer needed - httpOnly cookies handle authentication
  const authHeader = useCallback(() => {
    return {};
  }, []);

  // --- Data Fetching (Unchanged) ---
  useEffect(() => {
    const fetchUser = async () => {
      setIsInitialLoading(true);
      if (isGuest) {
        const guestProfile = JSON.parse(localStorage.getItem("guestProfileData") || "{}");
        setGoal(guestProfile.goal || "Achieve my personal best");
        setStartDate(formatDateForInput(guestProfile.start_date));
        setEndDate(formatDateForInput(guestProfile.end_date));
        setIsInitialLoading(false);
        return;
      }
      try {
        const res = await apiFetch("/api/me", { headers: authHeader() });
        if (res.status < 200 || res.status >= 300) throw new Error("Could not fetch your profile data.");
        const user: UserProfile = res.data;
        setGoal(user.goal || "Achieve my personal best");
        setStartDate(formatDateForInput(user.start_date));
        setEndDate(formatDateForInput(user.end_date));
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Could not load user data.");
      } finally {
        setIsInitialLoading(false);
      }
    };
    fetchUser();
    trackEvent("Analyzer Page Viewed", { isGuest });
  }, [authHeader, isGuest]);

  // --- Event Handlers (Unchanged) ---
  const handleCheckboxChange = (option: AnalysisOptionKey) => {
    setSelectedOptions(prev => ({ ...prev, [option]: !prev[option] }));
  };

  const handleSummonBlueprint = async () => {
    if (!startDate || !endDate) {
      toast.error("An alchemist needs a timeframe. Select your dates!");
      return;
    }
    const activeOptions = Object.keys(selectedOptions).filter(key => selectedOptions[key as AnalysisOptionKey]);
    if (activeOptions.length === 0) {
      toast.error("You must ask a question to get an answer. Select an option!");
      return;
    }

    setLoadingState("summoning");
    setError("");
    setFinalPrompt("");
    setNoEntriesMessage("");
    try {
      let entries: JournalEntry[] = [];
      if (isGuest) {
        // Guest entries are filtered and mapped to ensure they have the correct shape
        entries = getGuestEntries()
          .filter(entry => {
            const entryDate = entry.createdAt.split('T')[0];
            return entryDate >= startDate && entryDate <= endDate;
          })
          .map(entry => ({
            local_date: entry.createdAt.split('T')[0],
            topics: entry.topics,
            alignment_rating: entry.alignment_rating ?? 0,
            contentment_rating: entry.contentment_rating ?? 0,
          }));
      } else {
        const res = await apiFetch(`/api/journal?start_date=${startDate}&end_date=${endDate}`, { headers: authHeader() });
        if (res.status < 200 || res.status >= 300) throw new Error("The archives are sealed! Failed to fetch journal entries.");
        entries = res.data;
      }

      if (!entries || entries.length === 0) {
        setNoEntriesMessage("No journal entries found for the selected date range. The crystal ball is cloudy.");
        setLoadingState("idle");
        return;
      }

      // MODIFIED: The prompt now includes both alignment_rating and contentment_rating.
      const entryLines = entries.map(e => 
        `- ${e.local_date} | alignment: ${e.alignment_rating}/10 | contentment: ${e.contentment_rating}/10 | topics: ${e.topics}`
      ).join("\n");
      
      const returnItems = activeOptions.map(key => `- ${key} – ${ANALYSIS_OPTIONS[key as AnalysisOptionKey]}`).join("\n");

      const generatedPrompt = `You are my personal progress assistant.
My Grand Quest: ${goal}
Timeframe: ${startDate} to ${endDate}

Analyze my recent activities to identify patterns, strengths, and areas for improvement. Based on this, create the following:

Recent Data (most recent first):
${entryLines}

Return:
${returnItems}

Tone: Practical, motivating, and brutally honest. Avoid generic fluff.`;

      setFinalPrompt(generatedPrompt);

      // Track analyzer usage
      const isFirstAnalyzerUse = shouldShowAnalyzerCue();
      if (isFirstAnalyzerUse) {
        markAnalyzerUsed();

        // Also call API to mark analyzer as used (for authenticated users)
        if (!isGuest) {
          apiMarkAnalyzerUsed().catch(err =>
            console.error("Failed to mark analyzer as used on server:", err)
          );
        }

        // Show special celebration for first analyzer use
        toast.success("✨ You've unlocked the power of the analyzer! Welcome to enlightenment!", {
          duration: 4000,
          style: {
            background: '#f3e8ff',
            color: '#581c87',
            border: '2px solid #a855f7',
            fontWeight: 'bold',
          },
        });
      }

      trackEvent("Prompt Generated", {
        isGuest,
        entryCount: entries.length,
        selectedOptionsCount: activeOptions.length,
        dateRange: `${startDate} to ${endDate}`,
        isFirstUse: isFirstAnalyzerUse,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "An unknown error occurred.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoadingState("idle");
    }
  };
  
  // --- (Remaining event handlers and JSX are unchanged) ---
  const handleReset = () => {
      setFinalPrompt("");
      setNoEntriesMessage("");
      setError("");
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    trackEvent("Prompt Copied", { isGuest });
    toast.success("And just like that… the text is yours! ✨");
  };

  if (isInitialLoading) return <AnalyzerSkeleton />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <header className="text-center mb-10">
        <h1 className="text-5xl font-bold tracking-tighter">The Alchemist&apos;s Console</h1>
        <p className="text-xl text-gray-500 mt-2">Distill your journal into a potent action plan.</p>
      </header>

      {error && (
        <div className="card border-red-500 text-red-700 mb-6">
          <p className="font-bold">A magical mishap occurred:</p>
          <p>{error}</p>
        </div>
      )}

      <div className="card p-8 space-y-6 transition-all duration-500">
        {!finalPrompt ? (
          <>
             <h2 className="text-2xl font-bold flex items-center gap-2"><FaFlask /> Tweak the Ingredients</h2>
            <div className="form-group">
              <label htmlFor="goal">Your Ultimate Goal</label>
              <input type="text" id="goal" value={goal} onChange={(e) => setGoal(e.target.value)} className="input" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="form-group">
                <label htmlFor="start_date">Start Date</label>
                <input type="date" id="start_date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="input" />
              </div>
              <div className="form-group">
                <label htmlFor="end_date">End Date</label>
                <input type="date" id="end_date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="input" />
              </div>
            </div>
            <div className="form-group">
              <label>Distill My Chaos Into...</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 mt-2">
                {Object.keys(ANALYSIS_OPTIONS).map((option) => (
                  <label key={option} className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedOptions[option as AnalysisOptionKey]}
                      onChange={() => handleCheckboxChange(option as AnalysisOptionKey)}
                      className="h-5 w-5 rounded border-gray-300 text-black focus:ring-black"
                    />
                    <span className="text-lg">{option}</span>
                  </label>
                ))}
              </div>
            </div>
            <button className="btn text-lg w-full sm:w-auto flex items-center justify-center gap-2" onClick={handleSummonBlueprint} disabled={loadingState === 'summoning'}>
              <FaMagic />
              {loadingState === 'summoning' ? "Brewing..." : "Conjure My Prompt"}
            </button>
            {noEntriesMessage && (
              <div className="text-center p-4 mt-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
                <p className="text-lg font-semibold text-yellow-800">{noEntriesMessage}</p>
              </div>
            )}
          </>
        ) : (
          <div className="animate-fade-in space-y-4">
            <h2 className="text-3xl font-bold text-center">Your Magic Formula!</h2>
            <div className="p-4 bg-gray-900 text-white rounded-lg shadow-inner">
                <p className="text-center text-md font-mono mb-4 text-yellow-300 mt-4">Your Spell is Ready! Now, to the Wizard...</p>
                <p className="text-center text-gray-300 italic mb-1">We&apos;ve mixed your data with a dash of digital magic. Now, copy this masterpiece and paste it into your favourite AI Wizard.</p>
                <p className="text-center text-sm text-gray-300 italic mb-4">(Our own crystal ball is, uh... buffering. Let&apos;s just say our LLM budget went into buying this cool font.)</p>
            </div>
            <textarea className="w-full input min-h-[250px] text-base bg-gray-50 font-mono" value={finalPrompt} readOnly />
            <div className="flex flex-wrap gap-4 justify-center">
              <button className="btn text-lg flex items-center gap-2" onClick={() => handleCopy(finalPrompt)}>
                <FaCopy /> Copy Magic Formula
              </button>
              <button className="btn-secondary text-lg flex items-center gap-2" onClick={handleReset}>
                <FaUndo /> Start Over
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
