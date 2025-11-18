// src/hooks/useDebounce.js
import { useState, useEffect } from 'react';

/**
 * Hook untuk debounce value
 * Berguna untuk search, filter, dll
 */
export const useDebounce = (value, delay = 500) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
};

/**
 * Contoh penggunaan:
 * 
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearch = useDebounce(searchTerm, 300);
 * 
 * useEffect(() => {
 *     if (debouncedSearch) {
 *         // API call hanya setelah user stop typing 300ms
 *         searchAPI(debouncedSearch);
 *     }
 * }, [debouncedSearch]);
 */

export default useDebounce;
