// src/app/analyzer/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { apiFetch, markAnalyzerUsed as apiMarkAnalyzerUsed } from "@/lib/api";
import toast from "react-hot-toast";
import { FaCopy, FaUndo } from "react-icons/fa";
import { isGuestUser, getGuestEntries } from "@/lib/guest";
import { trackEvent } from "@/lib/mixpanel";
import { markAnalyzerUsed, shouldShowAnalyzerCue } from "@/lib/onboarding";
import { AnalyzerSkeleton } from "./_components/AnalyzerSkeleton";
import { AnalyzerControls, useAnalyzerPreferences } from "./_components/AnalyzerControls";
import { enrichJournalData } from "./_lib/dataEnrichment";
import { composePrompt, validatePreferences } from "./_lib/promptComposer";
import { UserProfile, JournalEntry } from "./_types/analyzer";

// --- Type Definitions ---
type LoadingState = "idle" | "fetching" | "summoning";

// --- Helper Functions (Unchanged) ---
const formatDateForInput = (dateString: string | null) => {
  if (!dateString) return "";
  return dateString.split("T")[0];
};

// --- Main Component ---
export default function AnalyzerPage() {
  // --- State Management ---
  const [goal, setGoal] = useState("");
  const [firstName, setFirstName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [finalPrompt, setFinalPrompt] = useState("");
  const [loadingState, setLoadingState] = useState<LoadingState>("idle");
  const [error, setError] = useState<string>("");
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [dateValidationError, setDateValidationError] = useState<string>("");
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showNoEntriesDialog, setShowNoEntriesDialog] = useState(false);
  const [generatedEntryCount, setGeneratedEntryCount] = useState<number>(0);

  const isGuest = isGuestUser();

  // Get analyzer preferences from the hook
  const { preferences } = useAnalyzerPreferences();

  // Auth header no longer needed - httpOnly cookies handle authentication
  const authHeader = useCallback(() => {
    return {};
  }, []);

  // --- Data Fetching ---
  useEffect(() => {
    const fetchUser = async () => {
      setIsInitialLoading(true);
      if (isGuest) {
        const guestProfile = JSON.parse(localStorage.getItem("guestProfileData") || "{}");
        setGoal(guestProfile.goal || "Achieve my personal best");
        setFirstName(guestProfile.first_name || "");
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
        setFirstName(user.first_name || "");
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

  // --- Event Handlers ---

  // Date validation
  const validateDates = (start: string, end: string): boolean => {
    setDateValidationError("");

    if (!start || !end) {
      return false;
    }

    const startDateObj = new Date(start);
    const endDateObj = new Date(end);

    if (endDateObj < startDateObj) {
      setDateValidationError("End date must be after start date");
      return false;
    }

    return true;
  };

  // Handle date changes with validation
  const handleStartDateChange = (value: string) => {
    setStartDate(value);
    if (endDate) {
      validateDates(value, endDate);
    }
  };

  const handleEndDateChange = (value: string) => {
    setEndDate(value);
    if (startDate) {
      validateDates(startDate, value);
    }
  };

  const handleSummonBlueprint = async () => {
    if (!startDate || !endDate) {
      toast.error("🎯 Hold on! Please select both start and end dates to generate your prompt.");
      return;
    }

    // Validate dates
    if (!validateDates(startDate, endDate)) {
      toast.error("⏰ Wait! Your end date needs to be after your start date.");
      return;
    }

    // Validate preferences
    const validation = validatePreferences(preferences);
    if (!validation.valid) {
      toast.error(validation.error || "Invalid preferences");
      return;
    }

    setLoadingState("summoning");
    setError("");
    setFinalPrompt("");

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
        if (res.status < 200 || res.status >= 300) throw new Error("Failed to fetch journal entries. Please try again.");
        entries = res.data;
      }

      if (!entries || entries.length === 0) {
        setShowNoEntriesDialog(true);
        setLoadingState("idle");
        return;
      }

      // Store entry count for success dialog
      setGeneratedEntryCount(entries.length);

      // Enrich journal data with analytics
      const enrichedData = enrichJournalData(entries, startDate, endDate);
      if (!enrichedData) {
        throw new Error("Failed to process journal data");
      }

      // Build user profile for prompt composition
      const userProfile: UserProfile = {
        goal,
        first_name: firstName,
        start_date: startDate,
        end_date: endDate,
      };

      // Compose the prompt using the new engine
      const generatedPrompt = composePrompt(preferences, enrichedData, userProfile);
      setFinalPrompt(generatedPrompt);

      // Show success dialog
      setShowSuccessDialog(true);

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
        toast.success("🎉 Your first AI prompt generated successfully! Copy and paste it into any AI assistant.", {
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
        voiceTone: preferences.voiceTone,
        honestyLevel: preferences.honestyLevel,
        responseType: preferences.responseType,
        selectedOptionsCount: preferences.selectedOptions.size,
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
      setError("");
      setDateValidationError("");
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    trackEvent("Prompt Copied", { isGuest });
    toast.success("✅ Prompt copied! Now paste it into your AI assistant.");
  };

  if (isInitialLoading) return <AnalyzerSkeleton />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/20">
      <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
        <header className="text-center mb-8 sm:mb-12">
          {/* Hero Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-200 mb-6">
            <span className="text-2xl">🎯</span>
            <span className="text-sm font-semibold text-purple-900">AI Prompt Generator</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight mb-4 sm:mb-6">
            <span className="block bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent animate-gradient">
              Transform Your Journey
            </span>
            <span className="block text-gray-800 text-3xl sm:text-5xl lg:text-6xl mt-2">
              Into Powerful Insights
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-4">
            Generate intelligent AI prompts from your journal entries. Get personalized analysis,
            actionable insights, and strategic guidance tailored to your goals.
          </p>

          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            <div className="px-4 py-2 rounded-full bg-white border border-purple-200 shadow-sm">
              <span className="text-sm font-medium text-gray-700">📊 Data-Driven Analysis</span>
            </div>
            <div className="px-4 py-2 rounded-full bg-white border border-purple-200 shadow-sm">
              <span className="text-sm font-medium text-gray-700">⚡ Instant Generation</span>
            </div>
            <div className="px-4 py-2 rounded-full bg-white border border-purple-200 shadow-sm">
              <span className="text-sm font-medium text-gray-700">🎨 Fully Customizable</span>
            </div>
          </div>
        </header>

        {error && (
          <div className="max-w-3xl mx-auto mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
            <p className="font-bold text-red-900">Something went wrong:</p>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* No Entries Dialog - Dramatic & Fun */}
        {showNoEntriesDialog && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl shadow-2xl max-w-md w-full p-8 border-4 border-yellow-300 animate-scale-in">
              {/* Dramatic Icon */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-yellow-100 mb-4 animate-bounce">
                  <span className="text-6xl">📭</span>
                </div>
                <h2 className="text-3xl font-black text-gray-900 mb-2">Son, We Have a Problem!</h2>
                <p className="text-lg text-yellow-900 font-bold">No Entries Found</p>
              </div>

              {/* Dramatic Message */}
              <div className="bg-white/80 backdrop-blur rounded-xl p-5 mb-6 border-2 border-yellow-200">
                <p className="text-gray-800 text-center leading-relaxed mb-4">
                  🎭 <span className="font-bold">*Dramatic gasp*</span> Your journal is empty for this date range!
                  The AI can&apos;t analyze what doesn&apos;t exist... yet!
                </p>
                <div className="bg-yellow-100 rounded-lg p-3 border border-yellow-300">
                  <p className="text-sm text-yellow-900 text-center">
                    <span className="font-bold">Date Range:</span> {new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} → {new Date(endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </div>

              {/* Fun Suggestions */}
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-4 mb-6 border-2 border-purple-200">
                <p className="text-sm font-bold text-purple-900 mb-2">💡 Here&apos;s what you can do:</p>
                <ul className="text-sm text-purple-800 space-y-1">
                  <li>✍️ Create your first journal entry</li>
                  <li>📅 Try a different date range</li>
                  <li>🚀 Start your journey today!</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <a
                  href="/journal"
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <span className="text-xl">✍️</span>
                  Create Your First Entry
                </a>
                <button
                  onClick={() => {
                    setShowNoEntriesDialog(false);
                    setStartDate("");
                    setEndDate("");
                  }}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-xl border-2 border-gray-300 hover:border-gray-400 transition-all"
                >
                  <span className="text-xl">📅</span>
                  Try Different Dates
                </button>
                <button
                  onClick={() => setShowNoEntriesDialog(false)}
                  className="w-full px-6 py-2 text-gray-600 hover:text-gray-800 font-medium transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success Dialog/Modal */}
        {showSuccessDialog && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-scale-in">
              {/* Success Icon */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 mb-4">
                  <span className="text-5xl">✨</span>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Prompt Generated!</h2>
                <p className="text-gray-600">Your personalized AI prompt is ready</p>
              </div>

              {/* Stats */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                      <span className="text-2xl">📊</span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Analyzed</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {generatedEntryCount} {generatedEntryCount === 1 ? 'Entry' : 'Entries'}
                      </p>
                    </div>
                  </div>
                  <div className="text-4xl">🎯</div>
                </div>
              </div>

              {/* Date Range */}
              <div className="bg-gray-50 rounded-lg p-3 mb-6">
                <p className="text-xs text-gray-500 mb-1">Date Range</p>
                <p className="text-sm font-semibold text-gray-700">
                  {new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  {' → '}
                  {new Date(endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setShowSuccessDialog(false);
                    handleCopy(finalPrompt);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <FaCopy className="text-lg" />
                  Copy Prompt & Continue
                </button>
                <button
                  onClick={() => setShowSuccessDialog(false)}
                  className="w-full px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all"
                >
                  View Prompt
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {!finalPrompt ? (
            <>
              {/* Goal & Date Selection */}
              <div className="card bg-white rounded-2xl p-6 sm:p-8 space-y-6 border-2 border-gray-200 shadow-lg shadow-purple-100/50">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                    <span className="text-2xl">🎯</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Configure Your Analysis</h2>
                </div>
                <p className="text-gray-600">Set your goal and date range to analyze your journal entries</p>
                <div className="form-group">
                  <label htmlFor="goal" className="text-sm font-semibold text-gray-700 mb-2 block">
                    What are you working towards?
                  </label>
                  <input
                    type="text"
                    id="goal"
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    className="input w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                    placeholder="e.g., Launch my SaaS product by March"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="form-group">
                    <label htmlFor="start_date" className="text-sm font-semibold text-gray-700 mb-2 block">
                      Start Date
                    </label>
                    <input
                      type="date"
                      id="start_date"
                      value={startDate}
                      onChange={(e) => handleStartDateChange(e.target.value)}
                      className={`input w-full px-4 py-3 rounded-lg border-2 transition-all ${
                        dateValidationError
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                          : 'border-gray-300 focus:border-purple-500 focus:ring-purple-200'
                      } focus:ring-2`}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="end_date" className="text-sm font-semibold text-gray-700 mb-2 block">
                      End Date
                    </label>
                    <input
                      type="date"
                      id="end_date"
                      value={endDate}
                      onChange={(e) => handleEndDateChange(e.target.value)}
                      className={`input w-full px-4 py-3 rounded-lg border-2 transition-all ${
                        dateValidationError
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                          : 'border-gray-300 focus:border-purple-500 focus:ring-purple-200'
                      } focus:ring-2`}
                    />
                  </div>
                </div>

                {/* Date Validation Error */}
                {dateValidationError && (
                  <div className="flex items-center gap-2 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                    <span className="text-2xl">⚠️</span>
                    <p className="text-red-700 font-medium">{dateValidationError}</p>
                  </div>
                )}
              </div>

            {/* Analyzer Controls */}
            <AnalyzerControls />

              {/* Generate Button - More Prominent */}
              <div className="flex flex-col items-center gap-3 py-4">
                <button
                  className="group relative btn text-lg sm:text-xl px-8 sm:px-16 py-4 sm:py-6 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-700 hover:via-pink-700 hover:to-purple-700 text-white font-bold rounded-2xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  onClick={handleSummonBlueprint}
                  disabled={loadingState === 'summoning' || !!dateValidationError || !startDate || !endDate}
                >
                  {loadingState === 'summoning' ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      <span>Generating Your Prompt...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span>Generate AI Prompt</span>
                      <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </>
                  )}
                </button>

                {/* Helpful hint when button is disabled */}
                {loadingState !== 'summoning' && (
                  <>
                    {dateValidationError && (
                      <p className="text-sm text-red-600 text-center max-w-md font-medium">
                        {dateValidationError}
                      </p>
                    )}
                    {!dateValidationError && (!startDate || !endDate) && (
                      <p className="text-sm text-gray-500 text-center max-w-md">
                        Please select both start and end dates to continue
                      </p>
                    )}
                  </>
                )}
              </div>
          </>
          ) : (
            <div className="animate-fade-in space-y-6">
                {/* Success Banner */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6 sm:p-8 text-center shadow-lg">
                  <div className="text-6xl mb-4">✨</div>
                  <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Your AI Prompt is Ready!</h2>
                  <p className="text-lg text-gray-700 max-w-2xl mx-auto">
                    Copy the prompt below and paste it into any AI assistant (ChatGPT, Claude, Gemini, etc.) to get personalized insights about your journey.
                  </p>
                </div>

              {/* Prompt Display Card */}
              <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-xl overflow-hidden">
                {/* Header with copy button */}
                <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="ml-3 text-gray-400 text-sm font-mono">generated-prompt.txt</span>
                  </div>
                  <button
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-semibold text-sm"
                    onClick={() => handleCopy(finalPrompt)}
                  >
                    <FaCopy className="text-sm" />
                    Copy to Clipboard
                  </button>
                </div>

                {/* Prompt Content */}
                <div className="p-6">
                  <textarea
                    className="w-full min-h-[400px] sm:min-h-[500px] text-sm font-mono bg-gray-50 border-2 border-gray-200 rounded-lg p-4 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all resize-y"
                    value={finalPrompt}
                    readOnly
                  />
                </div>

                {/* Instructions */}
                <div className="bg-blue-50 border-t-2 border-blue-100 px-6 py-4">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl mt-1">💡</div>
                    <div>
                      <h3 className="font-bold text-blue-900 mb-1">How to use this prompt:</h3>
                      <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                        <li>Click the &quot;Copy to Clipboard&quot; button above</li>
                        <li>Open your favorite AI assistant (ChatGPT, Claude, Gemini, etc.)</li>
                        <li>Paste the entire prompt and send it</li>
                        <li>Get personalized insights and actionable advice!</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  className="btn text-lg px-8 py-4 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
                  onClick={() => handleCopy(finalPrompt)}
                >
                  <FaCopy />
                  Copy Prompt
                </button>
                <button
                  className="btn-secondary text-lg px-8 py-4 flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-xl border-2 border-gray-300 hover:border-gray-400 transition-all"
                  onClick={handleReset}
                >
                  <FaUndo />
                  Generate Another
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
