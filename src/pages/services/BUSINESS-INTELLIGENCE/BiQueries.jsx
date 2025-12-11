/**
 * Business Intelligence API Service
 * Handles all API calls for the BI module
 */

import api from "../../../api";

import { API_BASE_URL } from "../../../Costants";

const API_URL = `${API_BASE_URL}/api/`;




// ============ Dashboard ============
export const dashboardService = {
    getDashboard: async () => {
        const response = await api.get(`${API_URL}bi-dashboard`);
        return response.data;
    },

    getTrends: async (days = 30) => {
        const response = await api.get(`${API_URL}bi-dashboard/trends?days=${days}`);
        return response.data;
    },

    getPlatformStats: async (uid = null) => {
        const url = uid ? `/bi-dashboard/platforms/${uid}` : "/bi-dashboard/platforms";
        const response = await api.get(url);
        return response.data;
    },

    getSectorStats: async (uid = null) => {
        const url = uid ? `/bi-dashboard/sectors/${uid}` : "/bi-dashboard/sectors";
        const response = await api.get(url);
        return response.data;
    },
};

// ============ Platforms ============
export const platformService = {
    getAll: async () => {
        const response = await api.get(`${API_URL}bi-platforms`);
        return response.data;
    },

    getOne: async (uid) => {
        const response = await api.get(`${API_URL}bi-platforms/${uid}`);
        return response.data;
    },

    create: async (data) => {
        const response = await api.post(`${API_URL}bi-platforms/create`, data);
        return response.data;
    },

    update: async (uid, data) => {
        const response = await api.put(`${API_URL}bi-platforms/${uid}/update`, data);
        return response.data;
    },

    delete: async (uid) => {
        const response = await api.delete(`${API_URL}bi-platforms/${uid}/delete`);
        return response.data;
    },
};

// ============ Sectors ============
export const sectorService = {
    getAll: async (parentOnly = false) => {
        const response = await api.get(`${API_URL}bi-sectors?parent_only=${parentOnly}`);
        return response.data;
    },

    getOne: async (uid) => {
        const response = await api.get(`${API_URL}bi-sectors/${uid}`);
        return response.data;
    },

    create: async (data) => {
        const response = await api.post(`${API_URL}bi-sectors/create`, data);
        return response.data;
    },

    update: async (uid, data) => {
        const response = await api.put(`${API_URL}bi-sectors/${uid}/update`, data);
        return response.data;
    },

    delete: async (uid) => {
        const response = await api.delete(`${API_URL}bi-sectors/${uid}/delete`);
        return response.data;
    },
};

// ============ Business Accounts ============
export const accountService = {
    getAll: async (params = {}) => {
        const queryParams = new URLSearchParams();

        if (params.page) queryParams.append("page", params.page);
        if (params.page_size) queryParams.append("page_size", params.page_size);
        if (params.platform) queryParams.append("platform", params.platform);
        if (params.sector) queryParams.append("sector", params.sector);
        if (params.activity_status) queryParams.append("activity_status", params.activity_status);
        if (params.is_verified !== undefined) queryParams.append("is_verified", params.is_verified);
        if (params.search) queryParams.append("search", params.search);
        if (params.sort_by) queryParams.append("sort_by", params.sort_by);
        if (params.sort_order) queryParams.append("sort_order", params.sort_order);

        const response = await api.get(`${API_URL}bi-accounts?${queryParams.toString()}`);
        return response.data;
    },

    getOne: async (uid) => {
        const response = await api.get(`${API_URL}bi-accounts/${uid}`);
        return response.data;
    },

    create: async (data) => {
        const response = await api.post(`${API_URL}bi-accounts/create`, data);
        return response.data;
    },

    update: async (uid, data) => {
        const response = await api.put(`${API_URL}bi-accounts/${uid}/update`, data);
        return response.data;
    },

    delete: async (uid) => {
        const response = await api.delete(`${API_URL}bi-accounts/${uid}/delete`);
        return response.data;
    },

    fetch: async (platform, username, options = {}) => {
        const response = await api.post(`${API_URL}bi-accounts/fetch`, {
            platform,
            username,
            force_refresh: options.forceRefresh || false,
            async: options.async !== false,
            sector: options.sector || null,
        });
        return response.data;
    },

    compare: async (accountUids) => {
        const response = await api.post(`${API_URL}bi-accounts/compare`, {
            accounts: accountUids,
        });
        return response.data;
    },

    getTrends: async (uid, days = 30) => {
        const response = await api.get(`${API_URL}bi-accounts/${uid}/trends?days=${days}`);
        return response.data;
    },
};

// ============ Scrape Tasks ============
export const taskService = {
    getAll: async (params = {}) => {
        const queryParams = new URLSearchParams();

        if (params.page) queryParams.append("page", params.page);
        if (params.page_size) queryParams.append("page_size", params.page_size);
        if (params.status) queryParams.append("status", params.status);
        if (params.task_type) queryParams.append("task_type", params.task_type);
        if (params.platform) queryParams.append("platform", params.platform);

        const response = await api.get(`${API_URL}bi-tasks?${queryParams.toString()}`);
        return response.data;
    },

    getOne: async (uid) => {
        const response = await api.get(`${API_URL}bi-tasks/${uid}`);
        return response.data;
    },

    create: async (data) => {
        const response = await api.post(`${API_URL}bi-tasks/create`, data);
        return response.data;
    },

    retry: async (uid) => {
        const response = await api.post(`${API_URL}bi-tasks/${uid}/retry`);
        return response.data;
    },

    delete: async (uid) => {
        const response = await api.delete(`${API_URL}bi-tasks/${uid}/delete`);
        return response.data;
    },

    getStats: async () => {
        const response = await api.get(`${API_URL}bi-tasks/stats`);
        return response.data;
    },
};

// Export all services
export default {
    dashboard: dashboardService,
    platforms: platformService,
    sectors: sectorService,
    accounts: accountService,
    tasks: taskService,
};
