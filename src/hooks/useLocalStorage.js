// src/hooks/useLocalStorage.js
import { useState, useCallback } from 'react';
import { setItem, getItem, removeItem } from '@/utils/storage';

/**
 * Hook untuk sync state dengan localStorage
 */
export const useLocalStorage = (key, initialValue) => {
    // Get initial value dari localStorage atau gunakan initialValue
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const item = getItem(key);
            return item !== null ? item : initialValue;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return initialValue;
        }
    });

    // Update localStorage dan state
    const setValue = useCallback((value) => {
        try {
            // Allow value to be a function (untuk functional updates)
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            
            setStoredValue(valueToStore);
            setItem(key, valueToStore);
        } catch (error) {
            console.error('Error setting localStorage:', error);
        }
    }, [key, storedValue]);

    // Remove value dari localStorage
    const removeValue = useCallback(() => {
        try {
            removeItem(key);
            setStoredValue(initialValue);
        } catch (error) {
            console.error('Error removing from localStorage:', error);
        }
    }, [key, initialValue]);

    return [storedValue, setValue, removeValue];
};

/**
 * Contoh penggunaan:
 * 
 * const [theme, setTheme, removeTheme] = useLocalStorage('theme', 'light');
 * 
 * // Set value
 * setTheme('dark');
 * 
 * // Remove value
 * removeTheme();
 */

export default useLocalStorage;
