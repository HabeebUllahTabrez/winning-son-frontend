import axios, { AxiosRequestConfig } from 'axios';
import { isGuestUser } from '@/lib/guest';

// Create API client that uses the Next.js proxy routes
const apiClient = axios.create({
    baseURL: typeof window !== 'undefined' ? '' : process.env.NEXT_PUBLIC_API_BASE || '',
    withCredentials: true, // Important: This sends cookies with requests
});

// --- Interceptors ---

// Request Interceptor: Routes backend API calls through proxy
apiClient.interceptors.request.use(
    (config) => {
        // Only rewrite URLs that need to go to backend (not Next.js API routes)
        if (config.url && config.url.startsWith('/api/')) {
            // Don't proxy auth routes - they're handled by Next.js directly
            if (config.url.startsWith('/api/auth/')) {
                // Keep as is - these are Next.js API routes
                return config;
            }
            // Proxy all other /api/* calls to backend
            const path = config.url.replace('/api/', '');
            config.url = `/api/proxy/${path}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor: Handles 401 errors and redirects to login
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        // Check for a 401 Unauthorized response
        if (error.response && error.response.status === 401) {
            const responseData = error.response.data;
            const errorMessage = typeof responseData === 'string' ? responseData : JSON.stringify(responseData);

            if (errorMessage.includes("Invalid token") || errorMessage.includes("invalid token") || errorMessage.includes("authenticated")) {
                // Only redirect authenticated users (not guests)
                if (typeof window !== 'undefined' && !isGuestUser()) {
                    console.error("Invalid or expired token. Logging out.");
                    // Call logout endpoint to clear cookie
                    logout();
                }
            }
        }
        return Promise.reject(error);
    }
);

/**
 * Enhanced API fetch function that uses the configured axios client.
 */
export function apiFetch(path: string, config?: AxiosRequestConfig) {
    return apiClient(path, config);
}

/**
 * Centralized logout function that clears the auth cookie and redirects to the login page.
 */
export async function logout() {
    if (typeof window !== 'undefined') {
        try {
            // Call logout endpoint to clear httpOnly cookie
            await apiFetch('/api/auth/logout', { method: 'POST' });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Also clear guest status on manual logout
            localStorage.removeItem("isGuest");
            window.location.href = "/";
        }
    }
}

export function exitGuestMode() {
    if (typeof window !== 'undefined') {
        localStorage.removeItem("guestId");
        localStorage.removeItem("guestProfileData");
        localStorage.removeItem("guestJournalEntries");
        localStorage.removeItem("guestStats");
        localStorage.removeItem("isGuest"); // Clear guest status
        window.location.href = "/";
    }
}

/**
 * Fetches submission history for a date range (max 365 days)
 */
export async function fetchSubmissionHistory(startDate: string, endDate: string) {
    try {
        const res = await apiFetch(`/api/dashboard/submission-history?start_date=${startDate}&end_date=${endDate}`);
        return res.data;
    } catch (error) {
        console.error("Error fetching submission history:", error);
        return { history: [] }; // Return empty history on error
    }
}

export default apiClient;
