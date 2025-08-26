"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

export default function Home() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [mode, setMode] = useState<"login" | "signup">("login");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [isAuthed, setIsAuthed] = useState(false);

	useEffect(() => {
		const t = typeof window !== "undefined" ? localStorage.getItem("token") : null;
		setIsAuthed(Boolean(t));
	}, []);

	async function submit() {
		setError("");
		setLoading(true);
		try {
			const res = await apiFetch(`/api/auth/${mode}`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, password }),
			});
			if (!res.ok) throw new Error(await res.text());
			const data: { token: string } = await res.json();
			localStorage.setItem("token", data.token);
			setIsAuthed(true);
			window.location.href = "/dashboard";
		} catch (e: unknown) {
			const message = e instanceof Error ? e.message : "Failed";
			setError(message);
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="space-y-8">
			<h1 className="text-3xl font-bold">Daily Progress</h1>

			<div className="flex justify-center">
				<img src="/are-ya-winning.jpeg" alt="Are ya winning, son?" className="max-h-48 w-auto object-contain" />
			</div>

			<div className="space-y-3 card">
				<label className="block text-sm">Email</label>
				<input className="w-full input rounded px-3 py-2" value={email} onChange={(e) => setEmail(e.target.value)} />
				<label className="block text-sm mt-3">Password</label>
				<input type="password" className="w-full input rounded px-3 py-2" value={password} onChange={(e) => setPassword(e.target.value)} />
				{error && <p className="text-red-600 text-sm mt-2">{error}</p>}
				<div className="flex items-center gap-3 mt-3">
					<button disabled={loading} onClick={submit} className="btn">
						{loading ? "Please wait…" : mode === "login" ? "Login" : "Sign up"}
					</button>
					<button className="text-sm underline" onClick={() => setMode(mode === "login" ? "signup" : "login")}>Switch to {mode === "login" ? "Sign up" : "Login"}</button>
				</div>
			</div>

			{isAuthed && (
				<div className="space-y-4">
					<a href="/journal" className="btn inline-block">Add Today&apos;s Submission</a>
					<div className="flex gap-4">
						<a href="/submissions" className="underline">View Submissions</a>
						<a href="/analyzer" className="underline">Analyzer</a>
					</div>
				</div>
			)}
		</div>
	);
}
