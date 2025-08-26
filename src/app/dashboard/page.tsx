"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

type Summary = { today: number; thisWeek: number; thisMonth: number };

export default function Dashboard() {
	const [summary, setSummary] = useState<Summary | null>(null);
	const [amount, setAmount] = useState(0);
	const [error, setError] = useState("");

	const authHeader = useCallback(() => {
		const token = localStorage.getItem("token");
		return { Authorization: `Bearer ${token}` } as const;
	}, []);

	const load = useCallback(async () => {
		try {
			const res = await apiFetch("/api/progress", { headers: authHeader() });
			if (!res.ok) throw new Error(await res.text());
			const data: Summary = await res.json();
			setSummary(data);
		} catch (e: unknown) {
			const message = e instanceof Error ? e.message : "Failed to load";
			setError(message);
		}
	}, [authHeader]);

	useEffect(() => {
		load();
	}, [load]);

	async function add() {
		setError("");
		try {
			const res = await apiFetch("/api/progress", {
				method: "POST",
				headers: { "Content-Type": "application/json", ...authHeader() },
				body: JSON.stringify({ amount }),
			});
			if (!res.ok) throw new Error(await res.text());
			setAmount(0);
			load();
		} catch (e: unknown) {
			const message = e instanceof Error ? e.message : "Failed to add";
			setError(message);
		}
	}

	return (
		<div className="space-y-8">
			<h1 className="text-3xl font-bold">Dashboard</h1>
			{error && <p className="text-red-600 text-base">{error}</p>}

			<section className="card space-y-4">
				<p className="text-base">Today&apos;s progress</p>
				<div className="w-full bg-gray-200 h-4 rounded">
					<div className="bg-black h-4 rounded" style={{ width: `${Math.min(100, summary?.today ?? 0)}%` }} />
				</div>
				<p className="text-sm">{summary?.today ?? 0} / 100</p>
			</section>

			<section className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div className="p-4 card">This week: {summary?.thisWeek ?? 0}</div>
				<div className="p-4 card">This month: {summary?.thisMonth ?? 0}</div>
			</section>

			<section className="card">
				<div className="flex flex-wrap items-center gap-4">
					<input type="number" min={0} className="input rounded px-3 py-2 w-32 text-base" value={amount} onChange={(e) => setAmount(parseInt(e.target.value || "0"))} />
					<button onClick={add} className="btn text-base">Add Today&apos;s Progress</button>
					<a href="/journal" className="btn text-base">Today&apos;s Submission</a>
					<a href="/submissions" className="btn text-base">Submissions</a>
					<a href="/analyzer" className="btn text-base">Analyzer</a>
				</div>
			</section>
		</div>
	);
}
