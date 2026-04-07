// src/utils/storage.js

/**
 * Safe wrapper untuk localStorage dengan error handling dan expiry
 */

const isDebugLoggingEnabled = import.meta.env.DEV || import.meta.env.VITE_ENABLE_DEBUG_MODE === 'true';
const debugLog = (...args) => {
    if (isDebugLoggingEnabled) console.log(...args);
};
const debugError = (...args) => {
    if (isDebugLoggingEnabled) console.error(...args);
};

const STORAGE_PREFIX = 'carrot_academy_';

// Migration: Fix old sessions yang tidak punya expiry (unlimited)
// Jalankan sekali saat app load untuk force re-login user dengan session lama
(() => {
    try {
        const userKey = STORAGE_PREFIX + 'user';
        const item = localStorage.getItem(userKey);
        debugLog('[Storage Migration] Checking for old session...', item ? 'Found' : 'Not found');
        
        if (item) {
            const data = JSON.parse(item);
            debugLog('[Storage Migration] Session data:', {
                hasExpiry: !!data.expiry,
                expiry: data.expiry,
                expiryInHours: data.expiry ? ((data.expiry - Date.now()) / (60 * 60 * 1000)).toFixed(2) : 'N/A'
            });
            
            // Jika session tidak punya expiry atau expiry di masa depan terlalu jauh (> 10 jam)
            if (!data.expiry || (data.expiry - Date.now() > 10 * 60 * 60 * 1000)) {
                debugLog('[Storage Migration] Clearing old unlimited session...');
                localStorage.removeItem(userKey);
                localStorage.removeItem(STORAGE_PREFIX + 'auth_token');
            } else {
                debugLog('[Storage Migration] Session is valid, keeping it.');
            }
        }
    } catch (error) {
        debugError('[Storage Migration] Error during session migration:', error);
    }
})();

/**
 * Set item ke localStorage dengan optional expiry
 */
export const setItem = (key, value, expiryInMinutes = null) => {
    try {
        const prefixedKey = STORAGE_PREFIX + key;
        const data = {
            value,
            timestamp: Date.now(),
            expiry: expiryInMinutes ? Date.now() + (expiryInMinutes * 60 * 1000) : null,
        };
        
        localStorage.setItem(prefixedKey, JSON.stringify(data));
        return true;
    } catch (error) {
        debugError('Error setting localStorage:', error);
        return false;
    }
};

/**
 * Get item dari localStorage dengan expiry check
 */
export const getItem = (key, defaultValue = null) => {
    try {
        const prefixedKey = STORAGE_PREFIX + key;
        const item = localStorage.getItem(prefixedKey);
        
        if (!item) return defaultValue;
        
        const data = JSON.parse(item);
        
        // Check expiry
        if (data.expiry && Date.now() > data.expiry) {
            removeItem(key);
            return defaultValue;
        }
        
        return data.value;
    } catch (error) {
        debugError('Error getting localStorage:', error);
        return defaultValue;
    }
};

/**
 * Remove item dari localStorage
 */
export const removeItem = (key) => {
    try {
        const prefixedKey = STORAGE_PREFIX + key;
        localStorage.removeItem(prefixedKey);
        return true;
    } catch (error) {
        debugError('Error removing localStorage:', error);
        return false;
    }
};

/**
 * Clear all items dengan prefix
 */
export const clearAll = () => {
    try {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith(STORAGE_PREFIX)) {
                localStorage.removeItem(key);
            }
        });
        return true;
    } catch (error) {
        debugError('Error clearing localStorage:', error);
        return false;
    }
};

/**
 * Check if localStorage is available
 */
export const isAvailable = () => {
    try {
        const testKey = '__storage_test__';
        localStorage.setItem(testKey, 'test');
        localStorage.removeItem(testKey);
        return true;
    } catch {
        return false;
    }
};

/**
 * Get storage size (approximate)
 */
export const getStorageSize = () => {
    try {
        let total = 0;
        for (let key in localStorage) {
            if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
                total += localStorage[key].length + key.length;
            }
        }
        return (total / 1024).toFixed(2) + ' KB';
    } catch {
        return 'Unknown';
    }
};

/**
 * Storage keys constants
 */
export const STORAGE_KEYS = {
    USER: 'user',
    AUTH_TOKEN: 'auth_token',
    THEME: 'theme',
    LANGUAGE: 'language',
    PREFERENCES: 'preferences',
};

/**
 * Specialized functions untuk common operations
 */
export const auth = {
    // Set user dengan expiry 9 jam (540 menit) - 8 jam kerja + 1 jam break
    setUser: (user, expiryInMinutes = 540) => setItem(STORAGE_KEYS.USER, user, expiryInMinutes),
    getUser: () => getItem(STORAGE_KEYS.USER),
    removeUser: () => removeItem(STORAGE_KEYS.USER),
    
    setToken: (token, expiryInMinutes = 540) => setItem(STORAGE_KEYS.AUTH_TOKEN, token, expiryInMinutes),
    getToken: () => getItem(STORAGE_KEYS.AUTH_TOKEN),
    removeToken: () => removeItem(STORAGE_KEYS.AUTH_TOKEN),
    
    isAuthenticated: () => {
        const user = getItem(STORAGE_KEYS.USER);
        return !!user; // getItem sudah check expiry secara otomatis
    },
    
    // Check apakah token akan expired dalam waktu dekat (15 menit)
    isTokenExpiringSoon: () => {
        try {
            const prefixedKey = STORAGE_PREFIX + STORAGE_KEYS.USER;
            const item = localStorage.getItem(prefixedKey);
            if (!item) return false;
            
            const data = JSON.parse(item);
            if (!data.expiry) return false;
            
            const timeLeft = data.expiry - Date.now();
            const fifteenMinutes = 15 * 60 * 1000;
            
            return timeLeft > 0 && timeLeft < fifteenMinutes;
        } catch {
            return false;
        }
    },
    
    // Get remaining time in minutes
    getTokenRemainingTime: () => {
        try {
            const prefixedKey = STORAGE_PREFIX + STORAGE_KEYS.USER;
            const item = localStorage.getItem(prefixedKey);
            if (!item) return 0;
            
            const data = JSON.parse(item);
            if (!data.expiry) return 0; // No expiry = expired (force re-login)
            
            const timeLeft = data.expiry - Date.now();
            return Math.max(0, Math.floor(timeLeft / (60 * 1000)));
        } catch {
            return 0;
        }
    },
    
    // Extend token expiry (refresh session) - 9 jam (8 jam kerja + 1 jam break)
    extendToken: (additionalMinutes = 540) => {
        const user = getItem(STORAGE_KEYS.USER);
        if (user) {
            setItem(STORAGE_KEYS.USER, user, additionalMinutes);
            return true;
        }
        return false;
    },
    
    logout: () => {
        removeItem(STORAGE_KEYS.USER);
        removeItem(STORAGE_KEYS.AUTH_TOKEN);
    },
};

/**
 * Contoh penggunaan:
 * 
 * import { setItem, getItem, auth } from '@/utils/storage';
 * 
 * // Set user dengan expiry 60 menit
 * auth.setUser(userData);
 * 
 * // Get user
 * const user = auth.getUser();
 * 
 * // Check authentication
 * if (auth.isAuthenticated()) {
 *     // User is logged in
 * }
 */

export default {
    setItem,
    getItem,
    removeItem,
    clearAll,
    isAvailable,
    getStorageSize,
    STORAGE_KEYS,
    auth,
};
