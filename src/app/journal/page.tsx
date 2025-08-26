"use client";

import { useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

export default function Journal() {
	const [topics, setTopics] = useState("");
	const [rating, setRating] = useState(5);
	const [msg, setMsg] = useState("");
	const [err, setErr] = useState("");

	function authHeader() {
		const token = localStorage.getItem("token");
		return { Authorization: `Bearer ${token}` } as const;
	}

	async function submit() {
		setMsg("");
		setErr("");
		try {
			const res = await apiFetch("/api/journal", {
				method: "POST",
				headers: { "Content-Type": "application/json", ...authHeader() },
				body: JSON.stringify({ topics, rating }),
			});
			if (!res.ok) throw new Error(await res.text());
			setMsg("Saved today’s entry.");
			setTopics("");
			setRating(5);
		} catch (e: unknown) {
			setErr(e instanceof Error ? e.message : "Failed");
		}
	}

	return (
		<div className="space-y-4">
			<h1 className="text-2xl font-bold">Today&apos;s Submission</h1>
			<div className="card space-y-3">
				<label className="block text-sm">Topics covered</label>
				<textarea className="w-full input rounded px-3 py-2 min-h-[120px]" value={topics} onChange={(e) => setTopics(e.target.value)} />
				<label className="block text-sm">Satisfaction (1-10)</label>
				<input type="number" min={1} max={10} className="w-24 input rounded px-3 py-2" value={rating} onChange={(e) => setRating(parseInt(e.target.value || "5"))} />
				<div className="flex gap-3">
					<button className="btn" onClick={submit}>Save</button>
					<Link className="underline" href="/">Back</Link>
				</div>
				{msg && <p className="text-green-700 text-sm">{msg}</p>}
				{err && <p className="text-red-700 text-sm">{err}</p>}
			</div>
		</div>
	);
}
