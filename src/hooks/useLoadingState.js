// src/hooks/useLoadingState.js
import { useState, useCallback } from 'react';

/**
 * Custom hook untuk manage loading state dengan multiple operations
 */
export const useLoadingState = () => {
    const [loadingStates, setLoadingStates] = useState({});

    const startLoading = useCallback((key) => {
        setLoadingStates(prev => ({ ...prev, [key]: true }));
    }, []);

    const stopLoading = useCallback((key) => {
        setLoadingStates(prev => ({ ...prev, [key]: false }));
    }, []);

    const isLoading = useCallback((key) => {
        return loadingStates[key] || false;
    }, [loadingStates]);

    const isAnyLoading = useCallback(() => {
        return Object.values(loadingStates).some(state => state === true);
    }, [loadingStates]);

    return {
        startLoading,
        stopLoading,
        isLoading,
        isAnyLoading,
        loadingStates,
    };
};

/**
 * Custom hook untuk async operations dengan loading state
 */
export const useAsyncOperation = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);

    const execute = useCallback(async (asyncFn) => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await asyncFn();
            setData(result);
            return result;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const reset = useCallback(() => {
        setIsLoading(false);
        setError(null);
        setData(null);
    }, []);

    return {
        isLoading,
        error,
        data,
        execute,
        reset,
    };
};

/**
 * Contoh penggunaan:
 * 
 * const { startLoading, stopLoading, isLoading } = useLoadingState();
 * 
 * const handleSubmit = async () => {
 *     startLoading('submit');
 *     try {
 *         await submitData();
 *     } finally {
 *         stopLoading('submit');
 *     }
 * };
 * 
 * <Button isLoading={isLoading('submit')}>Submit</Button>
 */

export default useLoadingState;
