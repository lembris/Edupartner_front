import { API_BASE_URL } from "../../../../Costants";
import api from "../../../../api";

const API_URL = `${API_BASE_URL}/api`;

// Recommendation Engines
export const getRecommendationEngines = async ({ search = "", pagination = {}, filters = {} } = {}) => {
    try {
        const params = new URLSearchParams();
        if (search) params.append("search", search);
        if (pagination.page) params.append("page", pagination.page);
        if (pagination.page_size) params.append("page_size", pagination.page_size);
        if (filters.student) params.append("student", filters.student);

        const response = await api.get(`${API_URL}/unisync360-recommendations/engines/?${params.toString()}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching recommendation engines:", error);
        throw error;
    }
};

export const getRecommendationEngine = async (uid) => {
    try {
        const response = await api.get(`${API_URL}/unisync360-recommendations/engines/${uid}/`);
        return response.data;
    } catch (error) {
        console.error("Error fetching recommendation engine:", error);
        throw error;
    }
};

export const createRecommendationEngine = async (data) => {
    try {
        const response = await api.post(`${API_URL}/unisync360-recommendations/engines/`, data);
        return response.data;
    } catch (error) {
        console.error("Error creating recommendation engine:", error);
        throw error;
    }
};

export const deleteRecommendationEngine = async (uid) => {
    try {
        const response = await api.delete(`${API_URL}/unisync360-recommendations/engines/${uid}/`);
        return response.data;
    } catch (error) {
        console.error("Error deleting recommendation engine:", error);
        throw error;
    }
};

// Recommended Courses
export const getRecommendedCourses = async ({ search = "", pagination = {}, filters = {} } = {}) => {
    try {
        const params = new URLSearchParams();
        if (search) params.append("search", search);
        if (pagination.page) params.append("page", pagination.page);
        if (pagination.page_size) params.append("page_size", pagination.page_size);
        if (filters.engine) params.append("engine", filters.engine);
        if (filters.student) params.append("student", filters.student);
        if (filters.min_score) params.append("min_score", filters.min_score);

        const response = await api.get(`${API_URL}/unisync360-recommendations/recommended-courses/?${params.toString()}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching recommended courses:", error);
        throw error;
    }
};

export const getRecommendedCourse = async (uid) => {
    try {
        const response = await api.get(`${API_URL}/unisync360-recommendations/recommended-courses/${uid}/`);
        return response.data;
    } catch (error) {
        console.error("Error fetching recommended course:", error);
        throw error;
    }
};

export const deleteRecommendedCourse = async (uid) => {
    try {
        const response = await api.delete(`${API_URL}/unisync360-recommendations/recommended-courses/${uid}/`);
        return response.data;
    } catch (error) {
        console.error("Error deleting recommended course:", error);
        throw error;
    }
};

// Weight Configurations
export const getWeightConfigs = async ({ search = "", pagination = {} } = {}) => {
    try {
        const params = new URLSearchParams();
        if (search) params.append("search", search);
        if (pagination.page) params.append("page", pagination.page);
        if (pagination.page_size) params.append("page_size", pagination.page_size);

        const response = await api.get(`${API_URL}/unisync360-recommendations/weight-config/?${params.toString()}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching weight configurations:", error);
        throw error;
    }
};

export const getWeightConfig = async (uid) => {
    try {
        const response = await api.get(`${API_URL}/unisync360-recommendations/weight-config/${uid}/`);
        return response.data;
    } catch (error) {
        console.error("Error fetching weight configuration:", error);
        throw error;
    }
};

export const createWeightConfig = async (data) => {
    try {
        const response = await api.post(`${API_URL}/unisync360-recommendations/weight-config/`, data);
        return response.data;
    } catch (error) {
        console.error("Error creating weight configuration:", error);
        throw error;
    }
};

export const updateWeightConfig = async (uid, data) => {
    try {
        const response = await api.patch(`${API_URL}/unisync360-recommendations/weight-config/${uid}/`, data);
        return response.data;
    } catch (error) {
        console.error("Error updating weight configuration:", error);
        throw error;
    }
};

export const deleteWeightConfig = async (uid) => {
    try {
        const response = await api.delete(`${API_URL}/unisync360-recommendations/weight-config/${uid}/`);
        return response.data;
    } catch (error) {
        console.error("Error deleting weight configuration:", error);
        throw error;
    }
};

// Generate Recommendations
export const generateRecommendations = async (data) => {
    try {
        const response = await api.post(`${API_URL}/unisync360-recommendations/generate-recommendations/`, data);
        return response.data;
    } catch (error) {
        console.error("Error generating recommendations:", error);
        throw error;
    }
};

// Climate preferences
export const CLIMATE_OPTIONS = [
    { value: 'cold', label: 'Cold' },
    { value: 'moderate', label: 'Moderate' },
    { value: 'warm', label: 'Warm' },
    { value: 'any', label: 'Any' },
];

// City size preferences
export const CITY_SIZE_OPTIONS = [
    { value: 'small', label: 'Small Town' },
    { value: 'medium', label: 'Medium City' },
    { value: 'large', label: 'Large City' },
    { value: 'any', label: 'Any' },
];

// Qualification levels
export const QUALIFICATION_LEVELS = [
    { value: 'high_school', label: 'High School' },
    { value: 'a_level', label: 'A-Level' },
    { value: 'diploma', label: 'Diploma' },
    { value: 'bachelor', label: "Bachelor's Degree" },
    { value: 'master', label: "Master's Degree" },
    { value: 'phd', label: 'PhD' },
];

// Score color helper
export const getScoreColor = (score) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'info';
    if (score >= 40) return 'warning';
    return 'danger';
};

export const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent Match';
    if (score >= 60) return 'Good Match';
    if (score >= 40) return 'Fair Match';
    return 'Low Match';
};
