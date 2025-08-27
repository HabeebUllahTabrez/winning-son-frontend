// src/app/analyzer/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { apiFetch } from "@/lib/api";
import toast from "react-hot-toast";
import { FaCopy, FaMagic } from "react-icons/fa";
import clsx from "clsx";

// --- Type Definitions ---
type UserProfile = {
  goal: string | null;
  start_date: string | null;
  end_date: string | null;
};
type JournalEntry = { local_date: string; topics: string; rating: number };
type LoadingState = "idle" | "fetching" | "analyzing" | "done";

// --- Constants ---
const ANALYSIS_OPTIONS = {
  "Key Themes": "Recurring activities, topics, or skills from my recent log.",
  "Progress Analysis": "How far I am from achieving my goal, with a short explanation.",
  "3 Concrete Tasks for Tomorrow": "Specific, actionable, and achievable steps.",
  "Upcoming Days Strategy": "What I should focus on in the coming days to reach my goal more easily.",
  "Suggested Resources": "High-quality references, tools, or techniques that align with my goal.",
};
type AnalysisOptionKey = keyof typeof ANALYSIS_OPTIONS;

// --- Helper Functions ---
const formatDateForInput = (dateString: string | null) => {
  if (!dateString) return "";
  return dateString.split("T")[0];
};

// --- Main Component ---
export default function AnalyzerPage() {
  // Form State
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

  // Data & Control State
  const [finalPrompt, setFinalPrompt] = useState("");
  const [analysisResult, setAnalysisResult] = useState("");
  const [loadingState, setLoadingState] = useState<LoadingState>("idle");
  const [error, setError] = useState<string>("");
  const [noEntriesMessage, setNoEntriesMessage] = useState<string>(""); // State for the funny message

  const authHeader = useCallback(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    return { Authorization: `Bearer ${token}` };
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      setLoadingState("fetching");
      try {
        const res = await apiFetch("/api/me", { headers: authHeader() });
        if (!res.ok) throw new Error("Could not fetch your profile data.");
        const user: UserProfile = await res.json();
        setGoal(user.goal || "Achieve my personal best");
        setStartDate(formatDateForInput(user.start_date));
        setEndDate(formatDateForInput(user.end_date));
      } catch (e) {
        setError(e instanceof Error ? e.message : "An unknown error occurred.");
        toast.error("Could not load user data.");
      } finally {
        setLoadingState("idle");
      }
    };
    fetchUser();
  }, [authHeader]);

  const handleCheckboxChange = (option: AnalysisOptionKey) => {
    setSelectedOptions(prev => ({ ...prev, [option]: !prev[option] }));
  };

  const handleGeneratePrompt = async () => {
    if (!startDate || !endDate) {
      toast.error("Please select a start and end date.");
      return;
    }
    const activeOptions = Object.keys(selectedOptions).filter(key => selectedOptions[key as AnalysisOptionKey]);
    if (activeOptions.length === 0) {
      toast.error("Please select at least one analysis option.");
      return;
    }

    setLoadingState("fetching");
    setError("");
    setFinalPrompt("");
    setNoEntriesMessage(""); // Reset the message on each attempt
    try {
      const res = await apiFetch(`/api/journal?start_date=${startDate}&end_date=${endDate}`, { headers: authHeader() });
      if (!res.ok) throw new Error("Failed to fetch journal entries for the selected dates.");
      
      // The API might return null if no entries are found
      const entries: JournalEntry[] | null = await res.json();
      
      if (!entries || entries.length === 0) {
        // Set the funny message instead of a toast
        setNoEntriesMessage("Looks like your journal took a vacation! 🌴 Write some entries to get an analysis.");
        setLoadingState("idle");
        return;
      }

      const entryLines = entries.map(e => `- ${e.local_date} | rating: ${e.rating} | topics: ${e.topics}`).join("\n");
      const returnItems = activeOptions.map(key => `- ${key} – ${ANALYSIS_OPTIONS[key as AnalysisOptionKey]}`).join("\n");

      const generatedPrompt = `You are my personal progress assistant.
My Goal: ${goal}
Timeframe: ${startDate} to ${endDate}

Analyze my recent activities to identify patterns, strengths, and areas for improvement. Based on this, create the following:

Recent Data (most recent first):
${entryLines}

Return:
${returnItems}

Tone: Practical, motivating, and tailored to the user’s data. Avoid generic suggestions.`;

      setFinalPrompt(generatedPrompt);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "An error occurred.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoadingState("idle");
    }
  };

  const handleAnalyze = async () => {
    setLoadingState("analyzing");
    setError("");
    try {
      const res = await apiFetch("/api/analyzer", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify({ prompt: finalPrompt }),
      });
      if (!res.ok) throw new Error(await res.text());
      const result = await res.json();
      setAnalysisResult(result.analysis);
      setLoadingState("done");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to get analysis.";
      setError(msg);
      toast.error(msg);
      setLoadingState("idle");
    }
  };
  
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="space-y-8">
        <header>
          <h1 className="text-4xl font-bold">Progress Analyzer</h1>
          <p className="text-lg text-gray-600">Generate a personalized plan based on your journal entries.</p>
        </header>

        {error && (
          <div className="card border-red-500 text-red-700">
            <p className="font-bold">An error occurred:</p>
            <p>{error}</p>
          </div>
        )}

        <div className="card p-6 space-y-4">
          <h2 className="text-2xl font-bold">Step 1: Define Your Analysis</h2>
          <div className="form-group">
            <label htmlFor="goal">Your Goal</label>
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
            <label>What should the AI include in the analysis?</label>
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
          <button className="btn text-lg w-full sm:w-auto" onClick={handleGeneratePrompt} disabled={loadingState === 'fetching'}>
            {loadingState === 'fetching' ? "Fetching entries..." : "Generate Prompt"}
          </button>
          
          {/* Display the funny message if no entries are found */}
          {noEntriesMessage && (
            <div className="text-center p-4 mt-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
              <p className="text-lg font-semibold text-yellow-800">{noEntriesMessage}</p>
            </div>
          )}
        </div>

        {finalPrompt && (
          <div className="card p-6 space-y-4">
            <h2 className="text-2xl font-bold">Step 2: Review and Analyze</h2>
            <textarea className="w-full input min-h-[200px] text-base bg-gray-50" value={finalPrompt} readOnly />
            <div className="flex flex-wrap gap-4">
              <button className="btn text-lg flex items-center gap-2" onClick={handleAnalyze} disabled={loadingState === 'analyzing'}>
                <FaMagic /> {loadingState === 'analyzing' ? "Analyzing..." : "Get My Analysis"}
              </button>
              <button className="btn-secondary text-lg flex items-center gap-2" onClick={() => handleCopy(finalPrompt)}>
                <FaCopy /> Copy Prompt
              </button>
            </div>
          </div>
        )}

        {loadingState === "done" && analysisResult && (
          <div className="card p-6 space-y-4">
            <h2 className="text-3xl font-bold">Your Personalized Plan</h2>
            <div className="prose max-w-none">
                <div dangerouslySetInnerHTML={{ __html: analysisResult.replace(/\n/g, '<br />') }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
