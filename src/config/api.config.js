// src/config/api.config.js
export const API_CONFIG = {
    baseURL: import.meta.env.VITE_API_BASE_URL,
    endpoints: {
        csoBersama: import.meta.env.VITE_API_CSO_BERSAMA_ENDPOINT,
        csoPersonal: import.meta.env.VITE_API_CSO_PERSONAL_ENDPOINT,
        esoPersonal: import.meta.env.VITE_API_ESO_PERSONAL_ENDPOINT,
        auth: import.meta.env.VITE_API_AUTH_ENDPOINT,
    },
    timeout: 150000, // 2.5 minutes
    retryAttempts: 3,
    retryDelay: 1000,
};

export const APP_CONFIG = {
    name: import.meta.env.VITE_APP_NAME || 'CarrotAcademy Dashboard',
    version: import.meta.env.VITE_APP_VERSION || '1.1.0',
    isDebugMode: import.meta.env.VITE_ENABLE_DEBUG_MODE === 'true',
    isProduction: import.meta.env.MODE === 'production',
};

// Query Client Configuration
export const QUERY_CONFIG = {
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            cacheTime: 10 * 60 * 1000, // 10 minutes
            retry: 3,
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
            refetchOnWindowFocus: false,
        },
        mutations: {
            retry: 1,
        },
    },
};

// Validation Rules
export const VALIDATION_RULES = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phone: /^(\+62|62|0)[0-9]{9,12}$/,
    minPasswordLength: 6,
};

export default API_CONFIG;
