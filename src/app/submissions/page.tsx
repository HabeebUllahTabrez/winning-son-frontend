"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

type Entry = { date: string; topics: string; rating: number };

export default function Submissions() {
	const [data, setData] = useState<Entry[]>([]);
	const [err, setErr] = useState("");

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
				const raw = await res.json();
				const body: Entry[] = Array.isArray(raw) ? raw : [];
				setData(body);
			} catch (e: unknown) {
				setErr(e instanceof Error ? e.message : "Failed");
			}
		})();
	}, []);

	return (
		<div className="space-y-5">
			<h1 className="text-3xl font-bold">Submissions</h1>
			{err && <p className="text-red-700 text-base">{err}</p>}
			<div className="space-y-3">
				{data.map((e) => (
					<div className="card" key={e.date}>
						<div className="flex justify-between text-base">
							<span className="font-semibold">{e.date}</span>
							<span>Rating: {e.rating}</span>
						</div>
						<p className="mt-3 whitespace-pre-wrap text-base leading-7">{e.topics}</p>
					</div>
				))}
				{data.length === 0 && <p className="text-base">No submissions yet.</p>}
			</div>
		</div>
	);
}
