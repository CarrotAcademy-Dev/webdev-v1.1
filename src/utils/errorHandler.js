// src/utils/errorHandler.js

/**
 * Custom Error Classes untuk different error types
 */
export class ApiError extends Error {
    constructor(message, statusCode, data = null) {
        super(message);
        this.name = 'ApiError';
        this.statusCode = statusCode;
        this.data = data;
        this.timestamp = new Date().toISOString();
    }
}

export class ValidationError extends Error {
    constructor(message, fields = {}) {
        super(message);
        this.name = 'ValidationError';
        this.fields = fields;
    }
}

export class NetworkError extends Error {
    constructor(message = 'Network connection failed') {
        super(message);
        this.name = 'NetworkError';
    }
}

/**
 * Parse error dari berbagai sumber
 */
export const parseError = (error) => {
    // Axios error
    if (error.response) {
        return new ApiError(
            error.response.data?.message || 'Server error',
            error.response.status,
            error.response.data
        );
    }

    // Network error
    if (error.request) {
        return new NetworkError('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.');
    }

    // Validation error
    if (error instanceof ValidationError) {
        return error;
    }

    // Generic error
    return new Error(error.message || 'Terjadi kesalahan yang tidak diketahui');
};

/**
 * Get user-friendly error message
 */
export const getErrorMessage = (error) => {
    const parsedError = parseError(error);

    const errorMessages = {
        NetworkError: 'Koneksi internet bermasalah. Silakan coba lagi.',
        ValidationError: parsedError.message,
        ApiError: parsedError.statusCode === 500 
            ? 'Server sedang bermasalah. Silakan coba lagi nanti.'
            : parsedError.message,
    };

    return errorMessages[parsedError.name] || parsedError.message || 'Terjadi kesalahan. Silakan coba lagi.';
};

/**
 * Log error untuk debugging (development only)
 */
export const logError = (error, context = '') => {
    if (import.meta.env.MODE === 'development') {
        console.group(`🔴 Error ${context ? `in ${context}` : ''}`);
        console.error('Error:', error);
        console.error('Stack:', error.stack);
        console.error('Timestamp:', new Date().toISOString());
        console.groupEnd();
    }

    // Dalam production, kirim ke error tracking service (Sentry, LogRocket, etc)
    // if (import.meta.env.MODE === 'production') {
    //     sendToErrorTracking(error, context);
    // }
};

/**
 * Handle error dengan toast notification
 */
export const handleError = (error, toast, context = '') => {
    logError(error, context);
    
    const message = getErrorMessage(error);
    
    toast({
        title: 'Error',
        description: message,
        status: 'error',
        duration: 5000,
        isClosable: true,
    });
};

/**
 * Retry mechanism untuk failed requests
 */
export const retry = async (fn, retries = 3, delay = 1000) => {
    try {
        return await fn();
    } catch (error) {
        if (retries > 0) {
            await new Promise(resolve => setTimeout(resolve, delay));
            return retry(fn, retries - 1, delay * 2);
        }
        throw error;
    }
};

export default {
    ApiError,
    ValidationError,
    NetworkError,
    parseError,
    getErrorMessage,
    logError,
    handleError,
    retry,
};
