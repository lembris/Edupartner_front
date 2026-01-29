import { API_BASE_URL } from "../../../../../Costants";
import api from "../../../../../api";

const API_URL = `${API_BASE_URL}/api`;

const config = {
    headers: {
        "Content-Type": "application/json",
    },
};

// Get Student Statuses
export const getStudentStatuses = async ({ search = "", pagination = {} } = {}) => {
    try {
        let url = `${API_URL}/unisync360-students/statuses/`;
        const params = new URLSearchParams();

        if (search) params.append("search", search);
        Object.keys(pagination).forEach(key => params.append(key, pagination[key]));

        const response = await api.get(url, { params });
        return response.data;
    } catch (error) {
        console.error("Error fetching student statuses:", error);
        throw error;
    }
};

// Create Student Status
export const createStudentStatus = async (data) => {
    try {
        const response = await api.post(`${API_URL}/unisync360-students/statuses/`, data, config);
        return response.data;
    } catch (error) {
        console.error("Error creating student status:", error);
        throw error;
    }
};

// Update Student Status
export const updateStudentStatus = async (uid, data) => {
    try {
        const response = await api.put(`${API_URL}/unisync360-students/statuses/${uid}/`, data, config);
        return response.data;
    } catch (error) {
        console.error("Error updating student status:", error);
        throw error;
    }
};

// Delete Student Status
export const deleteStudentStatus = async (uid) => {
    try {
        const response = await api.delete(`${API_URL}/unisync360-students/statuses/${uid}/`);
        return response.data;
    } catch (error) {
        console.error("Error deleting student status:", error);
        throw error;
    }
};
