// src/utils/storage.js

/**
 * Safe wrapper untuk localStorage dengan error handling dan expiry
 */

const STORAGE_PREFIX = 'carrot_academy_';

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
        console.error('Error setting localStorage:', error);
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
        console.error('Error getting localStorage:', error);
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
        console.error('Error removing localStorage:', error);
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
        console.error('Error clearing localStorage:', error);
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
    setUser: (user) => setItem(STORAGE_KEYS.USER, user),
    getUser: () => getItem(STORAGE_KEYS.USER),
    removeUser: () => removeItem(STORAGE_KEYS.USER),
    
    setToken: (token, expiryInMinutes = 60) => setItem(STORAGE_KEYS.AUTH_TOKEN, token, expiryInMinutes),
    getToken: () => getItem(STORAGE_KEYS.AUTH_TOKEN),
    removeToken: () => removeItem(STORAGE_KEYS.AUTH_TOKEN),
    
    isAuthenticated: () => {
        const user = getItem(STORAGE_KEYS.USER);
        const token = getItem(STORAGE_KEYS.AUTH_TOKEN);
        return !!(user && token);
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
