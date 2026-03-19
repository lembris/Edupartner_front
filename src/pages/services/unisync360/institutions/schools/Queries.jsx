// Queries.jsx
import { API_BASE_URL } from "../../../../../Costants";
import api from "../../../../../api";

const API_URL = `${API_BASE_URL}/api`;

const config = {
    headers: {
        "Content-Type": "application/json",
    },
};

// Get Schools
export const getSchools = async ({ uid = "", search = "", pagination = {} }) => {
    try {
        let url = `${API_URL}/unisync360-institutions/schools/`;

        if (uid) {
            url += `${uid}/`;
        } else {
            const params = new URLSearchParams();
            if (search) params.append("search", search);
            Object.keys(pagination).forEach(key => params.append(key, pagination[key]));

            if (params.toString()) {
                url += `?${params.toString()}`;
            }
        }

        const response = await api.get(url);
        return response.data;
    } catch (error) {
        console.error("Error fetching schools:", error);
        throw error;
    }
};

// Create School
export const createSchool = async (data) => {
    try {
        const isFormData = data instanceof FormData;
        const requestConfig = isFormData ? {
            headers: { "Content-Type": "multipart/form-data" }
        } : config;

        const response = await api.post(`${API_URL}/unisync360-institutions/schools/`, data, requestConfig);
        return response.data;
    } catch (error) {
        console.error("Error creating school:", error);
        throw error;
    }
};

// Update School
export const updateSchool = async (uid, data) => {
    try {
        const isFormData = data instanceof FormData;
        const requestConfig = isFormData ? {
            headers: { "Content-Type": "multipart/form-data" }
        } : config;

        const response = await api.patch(`${API_URL}/unisync360-institutions/schools/${uid}/`, data, requestConfig);
        return response.data;
    } catch (error) {
        console.error("Error updating school:", error);
        throw error;
    }
};

// Delete School
export const deleteSchool = async (uid) => {
    try {
        const response = await api.delete(`${API_URL}/unisync360-institutions/schools/${uid}/`);
        return response.data;
    } catch (error) {
        console.error("Error deleting school:", error);
        throw error;
    }
};

// Scrape NECTA Results
export const scrapeNectaSchool = async (data) => {
    try {
        const response = await api.post(`${API_URL}/unisync360-institutions/scrape-necta/`, data, config);
        return response.data;
    } catch (error) {
        console.error("Error scraping school:", error);
        throw error;
    }
};

// Get NECTA History
export const getNectaHistory = async (schoolUid) => {
    try {
        const response = await api.get(`${API_URL}/unisync360-institutions/scrape-necta/?school_uid=${schoolUid}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching NECTA history:", error);
        throw error;
    }
};

// Get NECTA Details (Single Record)
export const getNectaDetails = async (nectaUid) => {
    try {
        const response = await api.get(`${API_URL}/unisync360-institutions/scrape-necta/?necta_uid=${nectaUid}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching NECTA details:", error);
        throw error;
    }
};

// Delete NECTA History
export const deleteNectaHistory = async (nectaUid) => {
    try {
        const response = await api.delete(`${API_URL}/unisync360-institutions/scrape-necta/?necta_uid=${nectaUid}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting NECTA history:", error);
        throw error;
    }
};

// Get Regions
export const getRegions = async (pagination = {}) => {
    try {
        let url = `${API_URL}/unisync360-core/regions/`;
        const params = new URLSearchParams();
        Object.keys(pagination).forEach(key => params.append(key, pagination[key]));

        if (params.toString()) {
            url += `?${params.toString()}`;
        }

        const response = await api.get(url);
        return response.data;
    } catch (error) {
        console.error("Error fetching regions:", error);
        throw error;
    }
};

// Get Districts
export const getDistricts = async (pagination = {}) => {
    try {
        let url = `${API_URL}/unisync360-core/districts/`;
        const params = new URLSearchParams();
        Object.keys(pagination).forEach(key => params.append(key, pagination[key]));

        if (params.toString()) {
            url += `?${params.toString()}`;
        }

        const response = await api.get(url);
        return response.data;
    } catch (error) {
        console.error("Error fetching districts:", error);
        throw error;
    }
};
