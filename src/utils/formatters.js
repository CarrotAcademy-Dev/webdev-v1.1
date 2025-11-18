// src/utils/formatters.js

/**
 * Format tanggal ke berbagai format
 */
export const formatDate = {
    /**
     * Format ke DD/MM/YYYY
     */
    toShortDate: (date) => {
        if (!date) return '-';
        const d = new Date(date);
        if (isNaN(d.getTime())) return '-';
        
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
    },

    /**
     * Format ke DD MMM YYYY (01 Jan 2025)
     */
    toLongDate: (date) => {
        if (!date) return '-';
        const d = new Date(date);
        if (isNaN(d.getTime())) return '-';
        
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        const day = String(d.getDate()).padStart(2, '0');
        const month = months[d.getMonth()];
        const year = d.getFullYear();
        return `${day} ${month} ${year}`;
    },

    /**
     * Format ke relative time (2 jam yang lalu)
     */
    toRelativeTime: (date) => {
        if (!date) return '-';
        const d = new Date(date);
        if (isNaN(d.getTime())) return '-';
        
        const now = new Date();
        const diffMs = now - d;
        const diffSeconds = Math.floor(diffMs / 1000);
        const diffMinutes = Math.floor(diffSeconds / 60);
        const diffHours = Math.floor(diffMinutes / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffSeconds < 60) return 'Baru saja';
        if (diffMinutes < 60) return `${diffMinutes} menit yang lalu`;
        if (diffHours < 24) return `${diffHours} jam yang lalu`;
        if (diffDays < 7) return `${diffDays} hari yang lalu`;
        
        return formatDate.toShortDate(date);
    },

    /**
     * Format ke YYYY-MM-DD (untuk input date)
     */
    toInputValue: (date) => {
        if (!date) return '';
        const d = new Date(date);
        if (isNaN(d.getTime())) return '';
        
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    /**
     * Parse dari berbagai format
     */
    parse: (dateString) => {
        if (!dateString) return null;
        const d = new Date(dateString);
        return isNaN(d.getTime()) ? null : d;
    },
};

/**
 * Format currency (Rupiah)
 */
export const formatCurrency = (amount, options = {}) => {
    const {
        locale = 'id-ID',
        currency = 'IDR',
        minimumFractionDigits = 0,
        maximumFractionDigits = 0,
    } = options;

    if (amount == null || isNaN(amount)) return 'Rp 0';

    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        minimumFractionDigits,
        maximumFractionDigits,
    }).format(amount);
};

/**
 * Format number dengan separator
 */
export const formatNumber = (num, decimals = 0) => {
    if (num == null || isNaN(num)) return '0';
    
    return new Intl.NumberFormat('id-ID', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(num);
};

/**
 * Format file size
 */
export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Format phone number
 */
export const formatPhoneNumber = (phone) => {
    if (!phone) return '-';
    
    const cleaned = phone.replace(/\D/g, '');
    
    // Format: +62 812-3456-7890
    if (cleaned.startsWith('62')) {
        const withoutPrefix = cleaned.slice(2);
        return `+62 ${withoutPrefix.slice(0, 3)}-${withoutPrefix.slice(3, 7)}-${withoutPrefix.slice(7)}`;
    }
    
    // Format: 0812-3456-7890
    if (cleaned.startsWith('0')) {
        return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 8)}-${cleaned.slice(8)}`;
    }
    
    return phone;
};

/**
 * Truncate text dengan ellipsis
 */
export const truncateText = (text, maxLength = 50, suffix = '...') => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    
    return text.slice(0, maxLength - suffix.length) + suffix;
};

/**
 * Capitalize first letter
 */
export const capitalize = (text) => {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

/**
 * Title case (capitalize each word)
 */
export const titleCase = (text) => {
    if (!text) return '';
    return text
        .split(' ')
        .map(word => capitalize(word))
        .join(' ');
};

/**
 * Format percentage
 */
export const formatPercentage = (value, decimals = 1) => {
    if (value == null || isNaN(value)) return '0%';
    return `${formatNumber(value, decimals)}%`;
};

/**
 * Format NIS (add leading zeros)
 */
export const formatNIS = (nis) => {
    if (!nis) return '-';
    return String(nis).padStart(8, '0');
};

/**
 * Parse query params dari URL
 */
export const parseQueryParams = (search) => {
    const params = new URLSearchParams(search);
    const result = {};
    
    for (let [key, value] of params.entries()) {
        result[key] = value;
    }
    
    return result;
};

/**
 * Build query string dari object
 */
export const buildQueryString = (params) => {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
        if (value != null && value !== '') {
            searchParams.append(key, value);
        }
    });
    
    return searchParams.toString();
};

export default {
    formatDate,
    formatCurrency,
    formatNumber,
    formatFileSize,
    formatPhoneNumber,
    truncateText,
    capitalize,
    titleCase,
    formatPercentage,
    formatNIS,
    parseQueryParams,
    buildQueryString,
};
