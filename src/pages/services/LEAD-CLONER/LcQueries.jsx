/**
 * Lead Cloner API Service
 * Handles all API calls for the Lead Cloner module
 */
import api from "../../../api";
import { API_BASE_URL } from "../../../Costants";

const API_URL = `${API_BASE_URL}/api/`;

// ============ Dashboard ============
export const dashboardService = {
    getDashboard: async () => {
        const response = await api.get(`${API_URL}lc-dashboard`);
        return response.data;
    },
};

// ============ Searches ============
export const searchService = {
    getAll: async (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append("page", params.page);
        if (params.page_size) queryParams.append("page_size", params.page_size);
        if (params.status) queryParams.append("status", params.status);
        if (params.search) queryParams.append("search", params.search);
        const response = await api.get(`${API_URL}lc-searches?${queryParams.toString()}`);
        return response.data;
    },
    getOne: async (uid) => {
        const response = await api.get(`${API_URL}lc-searches/${uid}`);
        return response.data;
    },
    create: async (data) => {
        const response = await api.post(`${API_URL}lc-searches/create`, data);
        return response.data;
    },
    update: async (uid, data) => {
        const response = await api.put(`${API_URL}lc-searches/${uid}/update`, data);
        return response.data;
    },
    delete: async (uid) => {
        const response = await api.delete(`${API_URL}lc-searches/${uid}/delete`);
        return response.data;
    },
    getResults: async (uid, params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append("page", params.page);
        if (params.page_size) queryParams.append("page_size", params.page_size);
        const response = await api.get(`${API_URL}lc-searches/${uid}/results?${queryParams.toString()}`);
        return response.data;
    },
};

// ============ Results ============
export const resultService = {
    getAll: async (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append("page", params.page);
        if (params.page_size) queryParams.append("page_size", params.page_size);
        if (params.search) queryParams.append("search_uid", params.search);
        const response = await api.get(`${API_URL}lc-results?${queryParams.toString()}`);
        return response.data;
    },
    getOne: async (uid) => {
        const response = await api.get(`${API_URL}lc-results/${uid}`);
        return response.data;
    },
};

// ============ Exports ============
export const exportService = {
    getAll: async (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.search) queryParams.append("search_uid", params.search);
        const response = await api.get(`${API_URL}lc-exports?${queryParams.toString()}`);
        return response.data;
    },
    create: async (data) => {
        const response = await api.post(`${API_URL}lc-exports/create`, data);
        return response.data;
    },
    getOne: async (uid) => {
        const response = await api.get(`${API_URL}lc-exports/${uid}`);
        return response.data;
    },
};

export default {
    dashboard: dashboardService,
    searches: searchService,
    results: resultService,
    exports: exportService,
};
