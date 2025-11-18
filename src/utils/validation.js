// src/utils/validation.js

/**
 * Validation helper functions
 */

export const validators = {
    /**
     * Validasi email
     */
    email: (value) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value);
    },

    /**
     * Validasi nomor HP Indonesia
     */
    phone: (value) => {
        const phoneRegex = /^(\+62|62|0)[0-9]{9,12}$/;
        return phoneRegex.test(value.replace(/\s|-/g, ''));
    },

    /**
     * Validasi password (min 6 karakter)
     */
    password: (value) => {
        return value && value.length >= 6;
    },

    /**
     * Validasi required field
     */
    required: (value) => {
        if (typeof value === 'string') {
            return value.trim().length > 0;
        }
        return value != null && value !== '';
    },

    /**
     * Validasi tanggal (format YYYY-MM-DD)
     */
    date: (value) => {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(value)) return false;
        
        const date = new Date(value);
        return date instanceof Date && !isNaN(date);
    },

    /**
     * Validasi URL
     */
    url: (value) => {
        try {
            new URL(value);
            return true;
        } catch {
            return false;
        }
    },

    /**
     * Validasi NIS (contoh: 8 digit angka)
     */
    nis: (value) => {
        return /^\d{8}$/.test(value);
    },

    /**
     * Validasi PSID
     */
    psid: (value) => {
        return validators.required(value) && value.length > 0;
    },
};

/**
 * Validate form dengan multiple fields
 */
export const validateForm = (data, rules) => {
    const errors = {};

    Object.keys(rules).forEach((field) => {
        const fieldRules = rules[field];
        const value = data[field];

        fieldRules.forEach((rule) => {
            if (typeof rule === 'function') {
                if (!rule(value)) {
                    errors[field] = errors[field] || [];
                    errors[field].push('Invalid value');
                }
            } else if (typeof rule === 'object') {
                const { validator, message } = rule;
                if (!validator(value)) {
                    errors[field] = errors[field] || [];
                    errors[field].push(message);
                }
            }
        });
    });

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
    };
};

/**
 * Sanitize input untuk mencegah XSS
 */
export const sanitizeInput = (value) => {
    if (typeof value !== 'string') return value;
    
    return value
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
};

/**
 * Format nomor HP ke format standar
 */
export const formatPhone = (phone) => {
    const cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.startsWith('0')) {
        return '62' + cleaned.slice(1);
    }
    if (cleaned.startsWith('62')) {
        return cleaned;
    }
    return '62' + cleaned;
};

/**
 * Validasi dengan custom message
 */
export const createValidator = (validatorFn, message) => {
    return (value) => {
        const isValid = validatorFn(value);
        return {
            isValid,
            message: isValid ? null : message,
        };
    };
};

/**
 * Contoh penggunaan di komponen
 * 
 * const handleSubmit = () => {
 *     const { isValid, errors } = validateForm(formData, {
 *         email: [
 *             { validator: validators.required, message: 'Email harus diisi' },
 *             { validator: validators.email, message: 'Format email tidak valid' }
 *         ],
 *         phone: [
 *             { validator: validators.required, message: 'Nomor HP harus diisi' },
 *             { validator: validators.phone, message: 'Format nomor HP tidak valid' }
 *         ]
 *     });
 *     
 *     if (!isValid) {
 *         // Show errors
 *         return;
 *     }
 *     
 *     // Submit form
 * };
 */

export default {
    validators,
    validateForm,
    sanitizeInput,
    formatPhone,
    createValidator,
};
