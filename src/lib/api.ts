/**
 * Enhanced API fetch function that automatically handles authentication and token expiration.
 * 
 * Features:
 * - Automatically adds Authorization header with token if available
 * - Detects "Invalid token" responses and automatically logs out user
 * - Redirects to login page when token expires
 */
export function apiFetch(path: string, init?: RequestInit) {
	const base = process.env.NEXT_PUBLIC_API_BASE || "";
	const url = base.replace(/\/$/, "") + path;
	
	// Add token to headers if it exists
	const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
	const headers = {
		...init?.headers,
		...(token && { Authorization: `Bearer ${token}` }),
	};

	return fetch(url, { ...init, headers }).then(async (response) => {
		// Check if the response indicates an invalid token
		if (response.status === 401) {
			const text = await response.text();
			if (text.includes("Invalid token") || text.includes("invalid token")) {
				// Clear token and redirect to login
				if (typeof window !== 'undefined') {
					localStorage.removeItem("token");
					window.location.href = "/";
				}
			}
		}
		return response;
	});
}

/**
 * Centralized logout function that clears the token and redirects to login page.
 * Use this function for manual logout actions.
 */
export function logout() {
	if (typeof window !== 'undefined') {
		localStorage.removeItem("token");
		window.location.href = "/";
	}
}
