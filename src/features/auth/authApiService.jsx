import axios from 'axios';
import { API_CONFIG } from '@/config/api.config';

const isDebugLoggingEnabled = import.meta.env.DEV || import.meta.env.VITE_ENABLE_DEBUG_MODE === 'true';
const debugLog = (...args) => {
    if (isDebugLoggingEnabled) console.log(...args);
};
const debugError = (...args) => {
    if (isDebugLoggingEnabled) console.error(...args);
};

const authClient = axios.create({
    baseURL: API_CONFIG.baseURL,
    withCredentials: false,
    timeout: API_CONFIG.timeout,
    validateStatus: function () {
        return true; 
    }
});

const AUTH_ENDPOINT = API_CONFIG.endpoints.auth;

/**
 * Register new user account
 * Only accessible by admin/super_admin
 * V2.0: Use POST with URLSearchParams body (avoid preflight OPTIONS)
 */
export const registerUser = async (userData) => {
    const params = new URLSearchParams();
    params.append('action', 'register');
    params.append('nama', userData.nama || '');
    params.append('email', userData.email || '');
    params.append('password', userData.password || '');
    params.append('jabatan', userData.jabatan || '');
    params.append('role', userData.role || '');
    params.append('aktif', userData.aktif || 'ya');

    try {
        // V2.0: POST body (not query params)
        const response = await authClient.post(AUTH_ENDPOINT, params);
        const result = response.data;

        if (result.status === 'success') {
            return result;
        } else {
            throw new Error(result.message || 'Failed to register user');
        }
    } catch (error) {
        debugError("Error registering user:", error);
        throw error;
    }
};

/**
 * Validate password strength
 * Must be 8-20 characters, contain uppercase, lowercase, number, and symbol
 */
export const validatePassword = (password) => {
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,20}$/;
    return passwordPattern.test(password);
};

/**
 * Get password validation message
 */
export const getPasswordValidationMessage = () => {
    return 'Password harus 8-20 karakter, mengandung huruf besar, kecil, angka, dan simbol.';
};

/**
 * Update user password (self-service)
 * User can change their own password
 * V2.0: Use POST with URLSearchParams body
 */
export const updatePassword = async (email, oldPassword, newPassword) => {
    const params = new URLSearchParams();
    params.append('action', 'update-password');
    params.append('email', email || '');
    params.append('old_password', oldPassword || '');
    params.append('new_password', newPassword || '');

    debugLog('[Update Password] Sending password update request');

    try {
        const response = await authClient.post(AUTH_ENDPOINT, params);
        const result = response.data;

        debugLog('[Update Password] Backend response received');

        if (result.status === 'success') {
            return result;
        } else {
            // Return backend error message directly
            throw new Error(result.message || 'Failed to update password');
        }
    } catch (error) {
        debugError("[Update Password] Error:", error);
        // If error has response data, use that message
        if (error.response?.data?.message) {
            throw new Error(error.response.data.message);
        }
        // Otherwise throw the original error
        throw error.message ? new Error(error.message) : error;
    }
};

/**
 * Request password reset
 * Backend will generate temporary password and send via email
 * V2.0: Use POST with URLSearchParams body
 */
export const forgotPassword = async (email) => {
    const params = new URLSearchParams();
    params.append('action', 'forgot-password');
    params.append('email', email);

    try {
        const response = await authClient.post(AUTH_ENDPOINT, params);
        const result = response.data;

        if (result.status === 'success') {
            return result;
        } else {
            throw new Error(result.message || 'Failed to process forgot password request');
        }
    } catch (error) {
        debugError("Error processing forgot password:", error);
        throw error;
    }
};
