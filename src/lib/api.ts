import axios, { AxiosRequestConfig } from 'axios';

/**
 * Create a pre-configured instance of axios.
 * This instance automatically handles the base URL and authentication.
 */
const apiClient = axios.create({
    baseURL: (process.env.NEXT_PUBLIC_API_BASE || "").replace(/\/$/, ""),
});

// --- Interceptors ---

// Request Interceptor: Injects the auth token into every outgoing request.
apiClient.interceptors.request.use(
    (config) => {
        // This logic runs only on the client-side
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
    (response) => response, // Simply return successful responses
    (error) => {
        // Check for a 401 Unauthorized response
        if (error.response && error.response.status === 401) {
            // The response body is in `error.response.data`
            const responseData = error.response.data;
            const errorMessage = typeof responseData === 'string' ? responseData : JSON.stringify(responseData);

            if (errorMessage.includes("Invalid token") || errorMessage.includes("invalid token")) {
                // This logic runs only on the client-side
                if (typeof window !== 'undefined') {
                    console.error("Invalid token detected. Logging out.");
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
 * It automatically handles the base URL, authentication, and token expiration.
 *
 * @param path - The API endpoint path (e.g., "/users").
 * @param config - The axios request config (e.g., method, data).
 */
export function apiFetch(path: string, config?: AxiosRequestConfig) {
    return apiClient(path, config);
}

/**
 * Centralized logout function that clears the token and redirects to the login page.
 * Use this function for manual logout actions.
 */
export function logout() {
    if (typeof window !== 'undefined') {
        localStorage.removeItem("token");
        window.location.href = "/";
    }
}

// You can also export the apiClient instance directly for more idiomatic usage
// e.g., apiClient.get('/users'), apiClient.post('/data', { foo: 'bar' })
export default apiClient;
