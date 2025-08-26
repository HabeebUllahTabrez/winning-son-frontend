"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

type Entry = { date: string; topics: string; rating: number };

export default function Analyzer() {
	const [prompt, setPrompt] = useState("");
	const [err, setErr] = useState<string>("");

	function authHeader(): Record<string, string> {
		const headers: Record<string, string> = {};
		const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
		if (token) headers["Authorization"] = `Bearer ${token}`;
		return headers;
	}

	useEffect(() => {
		(async () => {
			try {
				const token = localStorage.getItem("token");
				if (!token) {
					setErr("Please login first.");
					return;
				}
				const res = await apiFetch("/api/journal", { headers: authHeader() });
				if (!res.ok) throw new Error(await res.text());
				const body: Entry[] = await res.json();
				const lines = body.map((e) => `- ${e.date} | rating: ${e.rating} | topics: ${e.topics}`);
				const p = `You are my coding progress assistant. Analyze my recent submissions and suggest a focused plan for tomorrow. Data (most recent first):\n${lines.join("\n")}\n\nReturn: (1) key themes, (2) 3 concrete tasks, (3) suggested resources.`;
				setPrompt(p);
			} catch (e: unknown) {
				setErr(e instanceof Error ? e.message : "Failed");
			}
		})();
	}, []);

	return (
		<div className="space-y-5">
			<h1 className="text-3xl font-bold">Analyzer</h1>
			{err && <p className="text-red-700 text-base">{err}</p>}
			<textarea className="w-full input rounded px-4 py-3 min-h-[260px] text-base" value={prompt} readOnly />
			<div className="flex gap-4">
				<button className="btn" onClick={() => navigator.clipboard.writeText(prompt)}>Copy prompt</button>
				<a className="underline" href="/submissions">View submissions</a>
			</div>
		</div>
	);
}
