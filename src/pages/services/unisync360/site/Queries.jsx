import { API_BASE_URL } from "../../../../Costants";
import api from "../../../../api";

const API_URL = `${API_BASE_URL}/api`;

/**
 * CONSENT REQUESTS
 */

export const fetchConsentRequests = async (params = {}) => {
    try {
        const response = await api.get(`${API_URL}/unisync360-consent-requests/`, { params });
        return response.data;
    } catch (error) {
        console.error("Error fetching consent requests:", error);
        throw error;
    }
};

export const fetchConsentRequest = async (uid) => {
    try {
        const response = await api.get(`${API_URL}/unisync360-consent-requests/${uid}/`);
        return response.data;
    } catch (error) {
        console.error("Error fetching consent request:", error);
        throw error;
    }
};

export const createConsentRequest = async (data) => {
    try {
        const response = await api.post(`${API_URL}/unisync360-consent-requests/`, data);
        return response.data;
    } catch (error) {
        console.error("Error creating consent request:", error);
        throw error.response?.data || error;
    }
};

export const updateConsentRequest = async (uid, data) => {
    try {
        const response = await api.patch(`${API_URL}/unisync360-consent-requests/${uid}/`, data);
        return response.data;
    } catch (error) {
        console.error("Error updating consent request:", error);
        throw error;
    }
};

export const deleteConsentRequest = async (uid) => {
    try {
        const response = await api.delete(`${API_URL}/unisync360-consent-requests/${uid}/`);
        return response.data;
    } catch (error) {
        console.error("Error deleting consent request:", error);
        throw error;
    }
};

export const approveConsentRequest = async (uid) => {
    try {
        const response = await api.patch(`${API_URL}/unisync360-consent-requests/${uid}/`, {
            request_status: "approved"
        });
        return response.data;
    } catch (error) {
        console.error("Error approving consent request:", error);
        throw error;
    }
};

/**
 * CONSENT SERVICES
 */

export const fetchConsentServices = async (params = {}) => {
    try {
        const response = await api.get(`${API_URL}/unisync360-consent-services/`, { params });
        return response.data;
    } catch (error) {
        console.error("Error fetching consent services:", error);
        throw error;
    }
};

export const fetchConsentService = async (uid) => {
    try {
        const response = await api.get(`${API_URL}/unisync360-consent-services/${uid}/`);
        return response.data;
    } catch (error) {
        console.error("Error fetching consent service:", error);
        throw error;
    }
};

export const createConsentService = async (data) => {
    try {
        const response = await api.post(`${API_URL}/unisync360-consent-services/`, data);
        return response.data;
    } catch (error) {
        console.error("Error creating consent service:", error);
        throw error.response?.data || error;
    }
};

export const updateConsentService = async (uid, data) => {
    try {
        const response = await api.patch(`${API_URL}/unisync360-consent-services/${uid}/`, data);
        return response.data;
    } catch (error) {
        console.error("Error updating consent service:", error);
        throw error;
    }
};

export const deleteConsentService = async (uid) => {
    try {
        const response = await api.delete(`${API_URL}/unisync360-consent-services/${uid}/`);
        return response.data;
    } catch (error) {
        console.error("Error deleting consent service:", error);
        throw error;
    }
};

/**
 * CONSENT SERVICE SELECTIONS
 */

export const fetchConsentServiceSelections = async (params = {}) => {
    try {
        const response = await api.get(`${API_URL}/unisync360-consent-service-selections/`, { params });
        return response.data;
    } catch (error) {
        console.error("Error fetching service selections:", error);
        throw error;
    }
};

export const createConsentServiceSelection = async (data) => {
    try {
        const response = await api.post(`${API_URL}/unisync360-consent-service-selections/`, data);
        return response.data;
    } catch (error) {
        console.error("Error creating service selection:", error);
        throw error.response?.data || error;
    }
};

export const updateConsentServiceSelection = async (uid, data) => {
    try {
        const response = await api.patch(`${API_URL}/unisync360-consent-service-selections/${uid}/`, data);
        return response.data;
    } catch (error) {
        console.error("Error updating service selection:", error);
        throw error;
    }
};

export const deleteConsentServiceSelection = async (uid) => {
    try {
        const response = await api.delete(`${API_URL}/unisync360-consent-service-selections/${uid}/`);
        return response.data;
    } catch (error) {
        console.error("Error deleting service selection:", error);
        throw error;
    }
};

/**
 * SITE SETTINGS
 */

export const DEFAULT_SITE_SETTINGS = {
    siteName: 'Edupartners International',
    siteDescription: '',
    siteUrl: '',
    adminEmail: '',
    supportEmail: '',
    theme: 'light',
    logoUrl: '',
    faviconUrl: '',
    maintenanceMode: false,
    maintenanceMessage: '',
    emailProvider: 'smtp',
    smtpHost: '',
    smtpPort: '',
    smtpUsername: '',
    smtpPassword: '',
    emailFromName: '',
    emailFromAddress: '',
    enableSSL: true,
    enableTwoFactor: false,
    sessionTimeout: 30,
    passwordExpiry: 90,
    minPasswordLength: 8,
    requireSpecialChars: true,
    apiRateLimit: 1000,
    enableLogging: true,
    logRetention: 30,
};

export const SITE_SETTING_CATEGORIES = [
    { label: 'General', value: 'general' },
    { label: 'Appearance', value: 'appearance' },
    { label: 'Email Configuration', value: 'email' },
    { label: 'Security', value: 'security' },
    { label: 'Integration', value: 'integration' },
    { label: 'Branding', value: 'branding' },
    { label: 'Performance', value: 'performance' },
    { label: 'API', value: 'api' },
];

export const fetchSiteSettings = async () => {
    try {
        const response = await api.get(`${API_URL}/unisync360-site-settings/`);
        return response.data;
    } catch (error) {
        console.error("Error fetching site settings:", error);
        // Return default settings if endpoint doesn't exist
        return { data: DEFAULT_SITE_SETTINGS };
    }
};

export const updateSiteSettings = async (data) => {
    try {
        const response = await api.patch(`${API_URL}/unisync360-site-settings/`, data);
        return response.data;
    } catch (error) {
        console.error("Error updating site settings:", error);
        throw error;
    }
};
