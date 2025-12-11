import { API_BASE_URL } from "../../../../../Costants";
import api from "../../../../../api";

const API_URL = `${API_BASE_URL}/api`;

const config = {
    headers: {
        "Content-Type": "application/json",
    },
};

// Get Student Sources
export const getStudentSources = async ({ search = "", pagination = {} } = {}) => {
    try {
        let url = `${API_URL}/unisync360-students/sources/`;
        const params = new URLSearchParams();

        if (search) params.append("search", search);
        Object.keys(pagination).forEach(key => params.append(key, pagination[key]));

        const response = await api.get(url, { params });
        return response.data;
    } catch (error) {
        console.error("Error fetching student sources:", error);
        throw error;
    }
};

// Create Student Source
export const createStudentSource = async (data) => {
    try {
        const response = await api.post(`${API_URL}/unisync360-students/sources/`, data, config);
        return response.data;
    } catch (error) {
        console.error("Error creating student source:", error);
        throw error;
    }
};

// Update Student Source
export const updateStudentSource = async (uid, data) => {
    try {
        const response = await api.patch(`${API_URL}/unisync360-students/sources/${uid}/`, data, config);
        return response.data;
    } catch (error) {
        console.error("Error updating student source:", error);
        throw error;
    }
};

// Delete Student Source
export const deleteStudentSource = async (uid) => {
    try {
        const response = await api.delete(`${API_URL}/unisync360-students/sources/${uid}/`);
        return response.data;
    } catch (error) {
        console.error("Error deleting student source:", error);
        throw error;
    }
};
