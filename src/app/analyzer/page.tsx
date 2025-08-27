// src/app/analyzer/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { apiFetch } from "@/lib/api";

type Entry = { local_date: string; topics: string; rating: number };
type LoadingState = "fetching" | "ready" | "analyzing" | "done";

// A simple component to format the AI's text response
function AnalysisResult({ content }: { content: string }) {
    const sections = content.split(/\n\s*\n/); // Split by one or more empty lines
    return (
        <div className="space-y-4 text-lg">
            {sections.map((section, index) => {
                const lines = section.split('\n');
                const title = lines[0];
                const items = lines.slice(1);
                return (
                    <div key={index}>
                        <h3 className="text-2xl font-bold mb-2">{title}</h3>
                        {items.length > 0 && (
                            <ul className="list-disc list-inside space-y-1">
                                {items.map((item, i) => <li key={i}>{item.replace(/^- /, '')}</li>)}
                            </ul>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

export default function Analyzer() {
    const [prompt, setPrompt] = useState("");
    const [analysis, setAnalysis] = useState("");
    const [loadingState, setLoadingState] = useState<LoadingState>("fetching");
    const [error, setError] = useState<string>("");

    const authHeader = useCallback(() => {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        return { Authorization: `Bearer ${token}` } as const;
    }, []);

    // Fetch journal entries and construct the prompt
    useEffect(() => {
        const fetchEntries = async () => {
            try {
                const res = await apiFetch("/api/journal", { headers: authHeader() });
                if (!res.ok) throw new Error(await res.text());
                const body: Entry[] = await res.json();
                
                if (body.length === 0) {
                    setError("No journal entries found. Please add some entries first.");
                    setLoadingState("ready");
                    return;
                }

                const lines = body.map((e) => `- ${e.local_date} | rating: ${e.rating} | topics: ${e.topics}`);
                const p = `You are my coding progress assistant. Analyze my recent submissions and suggest a focused plan for tomorrow. Data (most recent first):\n${lines.join("\n")}\n\nReturn: (1) key themes, (2) 3 concrete tasks, (3) suggested resources. Format each section with a title on its own line, followed by a list.`;
                setPrompt(p);
                setLoadingState("ready");
            } catch (e: unknown) {
                setError(e instanceof Error ? e.message : "Failed to fetch journal entries.");
                setLoadingState("ready");
            }
        };
        fetchEntries();
    }, [authHeader]);

    // Handle the analysis request
    async function handleAnalyze() {
        setLoadingState("analyzing");
        setError("");
        try {
            const res = await apiFetch("/api/analyzer", {
                method: "POST",
                headers: { "Content-Type": "application/json", ...authHeader() },
                body: JSON.stringify({ prompt }),
            });
            if (!res.ok) throw new Error(await res.text());
            const result = await res.json();
            setAnalysis(result.analysis);
            setLoadingState("done");
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Failed to get analysis.");
            setLoadingState("ready");
        }
    }

    return (
        <div className="max-w-5xl mx-auto px-4 py-10">
            <div className="space-y-8">
                <header>
                    <h1 className="text-4xl font-bold">Progress Analyzer</h1>
                    <p className="text-lg text-gray-600">Let&apos;s reflect on your work and plan your next steps.</p>
                </header>

                {error && (
                    <div className="card border-red-500 text-red-700">
                        <p className="font-bold">An error occurred:</p>
                        <p>{error}</p>
                    </div>
                )}

                {loadingState === "fetching" && <p className="text-lg">Fetching your journal entries...</p>}

                {prompt && (
                    <div className="card space-y-4">
                        <h2 className="text-2xl font-bold">Analysis Prompt</h2>
                        <p className="text-gray-600">We&apos;ve prepared the following prompt based on your journal. Click the button below to get your analysis.</p>
                        <textarea className="w-full input min-h-[160px] text-base bg-gray-50" value={prompt} readOnly />
                        <div className="flex flex-wrap gap-4">
                             <button 
                                className="btn text-lg" 
                                onClick={handleAnalyze} 
                                disabled={loadingState === 'analyzing' || !prompt}
                            >
                                {loadingState === 'analyzing' ? "Analyzing..." : "Analyze My Progress"}
                            </button>
                            <button className="btn text-lg bg-white text-black" onClick={() => navigator.clipboard.writeText(prompt)}>
                                Copy Prompt
                            </button>
                        </div>
                    </div>
                )}

                {loadingState === "done" && analysis && (
                    <div className="card space-y-4">
                        <h2 className="text-3xl font-bold">Your Personalized Plan</h2>
                        <AnalysisResult content={analysis} />
                    </div>
                )}
            </div>
        </div>
    );
}
