export function apiFetch(path: string, init?: RequestInit) {
	const base = process.env.NEXT_PUBLIC_API_BASE || "";
	const url = base.replace(/\/$/, "") + path;
	return fetch(url, init);
}
