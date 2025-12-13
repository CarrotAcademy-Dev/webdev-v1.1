import axios from 'axios';
import { API_CONFIG } from '@/config/api.config';

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
 */
export const registerUser = async (userData) => {
    const params = new URLSearchParams({
        action: 'register',
        nama: userData.nama || '',
        email: userData.email || '',
        password: userData.password || '',
        jabatan: userData.jabatan || '',
        role: userData.role || '',
        aktif: userData.aktif || 'ya'
    });

    try {
        const response = await authClient.post(`${AUTH_ENDPOINT}?${params.toString()}`);
        const result = response.data;

        if (result.status === 'success') {
            return result;
        } else {
            throw new Error(result.message || 'Failed to register user');
        }
    } catch (error) {
        console.error("Error registering user:", error);
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
