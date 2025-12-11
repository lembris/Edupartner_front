// Utility formatters for the application

export const formatCurrency = (amount, currency = 'TZS') => {
    if (amount === null || amount === undefined) return '-';
    
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) return '-';
    
    const formatter = new Intl.NumberFormat('en-TZ', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });
    
    return formatter.format(numAmount);
};

export const formatNumber = (num) => {
    if (num === null || num === undefined) return '-';
    
    const numValue = parseFloat(num);
    if (isNaN(numValue)) return '-';
    
    return new Intl.NumberFormat('en-US').format(numValue);
};

export const formatDate = (dateString, options = {}) => {
    if (!dateString) return '-';
    
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '-';
        
        const defaultOptions = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        };
        
        return new Intl.DateTimeFormat('en-US', { ...defaultOptions, ...options }).format(date);
    } catch (error) {
        return '-';
    }
};

export const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '-';
        
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    } catch (error) {
        return '-';
    }
};

export const formatPercentage = (value, decimals = 1) => {
    if (value === null || value === undefined) return '-';
    
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return '-';
    
    return `${numValue.toFixed(decimals)}%`;
};

export const truncateText = (text, maxLength = 50) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return `${text.substring(0, maxLength)}...`;
};

export const formatPhoneNumber = (phone) => {
    if (!phone) return '-';
    
    // Remove non-numeric characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Format for Tanzania numbers
    if (cleaned.length === 12 && cleaned.startsWith('255')) {
        return `+${cleaned.substring(0, 3)} ${cleaned.substring(3, 6)} ${cleaned.substring(6, 9)} ${cleaned.substring(9)}`;
    }
    
    return phone;
};

export const getInitials = (name) => {
    if (!name) return '?';
    
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    
    return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
};

export const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

export default {
    formatCurrency,
    formatNumber,
    formatDate,
    formatDateTime,
    formatPercentage,
    truncateText,
    formatPhoneNumber,
    getInitials,
    formatFileSize,
};
