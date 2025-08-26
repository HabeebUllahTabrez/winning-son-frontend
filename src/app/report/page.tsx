"use client";

import { useEffect, useState } from "react";

type Entry = { date: string; amount: number };

export default function Report() {
	const [data, setData] = useState<Entry[]>([]);
	const [error, setError] = useState("");

	function authHeader() {
		const token = localStorage.getItem("token");
		return { Authorization: `Bearer ${token}` } as const;
	}

	useEffect(() => {
		(async () => {
			try {
				const res = await fetch("/api/progress/report", { headers: authHeader() });
				if (!res.ok) throw new Error(await res.text());
				const body: Entry[] = await res.json();
				setData(body);
			} catch (e: unknown) {
				const message = e instanceof Error ? e.message : "Failed to load";
				setError(message);
			}
		})();
	}, []);

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-semibold">Report</h1>
			{error && <p className="text-red-600 text-sm">{error}</p>}
			<div className="space-y-2">
				{data.map((e) => (
					<div key={e.date} className="flex justify-between bg-white border rounded px-3 py-2">
						<span>{e.date}</span>
						<span className="font-medium">{e.amount}</span>
					</div>
				))}
				{data.length === 0 && <p className="text-sm text-gray-600">No entries yet.</p>}
			</div>
		</div>
	);
}
