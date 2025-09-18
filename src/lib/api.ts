import axios, { AxiosRequestConfig } from 'axios';
import { isGuestUser } from '@/lib/guest'; // 1. IMPORT the guest check function

const apiClient = axios.create({
    baseURL: (process.env.NEXT_PUBLIC_API_BASE || "").replace(/\/$/, ""),
});

// --- Interceptors ---

// Request Interceptor: Injects the auth token into every outgoing request.
apiClient.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem("token");
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor: Handles token expiration and other 401 errors.
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        // Check for a 401 Unauthorized response
        if (error.response && error.response.status === 401) {
            const responseData = error.response.data;
            const errorMessage = typeof responseData === 'string' ? responseData : JSON.stringify(responseData);

            if (errorMessage.includes("Invalid token") || errorMessage.includes("invalid token")) {
                // This logic runs only on the client-side
                // 2. ADD a check to ensure the user is NOT a guest before redirecting
                if (typeof window !== 'undefined' && !isGuestUser()) { 
                    console.error("Invalid token for logged-in user. Logging out.");
                    localStorage.removeItem("token");
                    window.location.href = "/"; // Redirect to login page
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
 * Centralized logout function that clears the token and redirects to the login page.
 */
export function logout() {
    if (typeof window !== 'undefined') {
        localStorage.removeItem("token");
        // Also clear guest status on manual logout
        localStorage.removeItem("isGuest"); 
        window.location.href = "/";
    }
}

export default apiClient;
