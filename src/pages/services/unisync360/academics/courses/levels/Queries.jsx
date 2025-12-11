import { API_BASE_URL } from "../../../../../../Costants";
import api from "../../../../../../api";

const API_URL = `${API_BASE_URL}/api`;

const config = {
    headers: {
        "Content-Type": "application/json",
    },
};

// Get Course Levels
export const getCourseLevels = async ({ search = "", pagination = {} } = {}) => {
    try {
        let url = `${API_URL}/unisync360-academic/course-levels/`;
        const params = new URLSearchParams();

        if (search) params.append("search", search);
        Object.keys(pagination).forEach(key => params.append(key, pagination[key]));

        const response = await api.get(url, { params });
        return response.data;
    } catch (error) {
        console.error("Error fetching course levels:", error);
        throw error;
    }
};

// Create Course Level
export const createCourseLevel = async (data) => {
    try {
        const response = await api.post(`${API_URL}/unisync360-academic/course-levels/`, data, config);
        return response.data;
    } catch (error) {
        console.error("Error creating course level:", error);
        throw error;
    }
};

// Update Course Level
export const updateCourseLevel = async (uid, data) => {
    try {
        const response = await api.patch(`${API_URL}/unisync360-academic/course-levels/${uid}/`, data, config);
        return response.data;
    } catch (error) {
        console.error("Error updating course level:", error);
        throw error;
    }
};

// Delete Course Level
export const deleteCourseLevel = async (uid) => {
    try {
        const response = await api.delete(`${API_URL}/unisync360-academic/course-levels/${uid}/`);
        return response.data;
    } catch (error) {
        console.error("Error deleting course level:", error);
        throw error;
    }
};
