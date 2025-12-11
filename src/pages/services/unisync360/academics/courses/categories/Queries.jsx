import { API_BASE_URL } from "../../../../../../Costants";
import api from "../../../../../../api";

const API_URL = `${API_BASE_URL}/api`;

const config = {
    headers: {
        "Content-Type": "application/json",
    },
};

// Get Course Categories
export const getCourseCategories = async ({ search = "", pagination = {} } = {}) => {
    try {
        let url = `${API_URL}/unisync360-academic/course-categories/`;
        const params = new URLSearchParams();

        if (search) params.append("search", search);
        Object.keys(pagination).forEach(key => params.append(key, pagination[key]));

        const response = await api.get(url, { params });
        return response.data;
    } catch (error) {
        console.error("Error fetching course categories:", error);
        throw error;
    }
};

// Create Course Category
export const createCourseCategory = async (data) => {
    try {
        const response = await api.post(`${API_URL}/unisync360-academic/course-categories/`, data, config);
        return response.data;
    } catch (error) {
        console.error("Error creating course category:", error);
        throw error;
    }
};

// Update Course Category
export const updateCourseCategory = async (uid, data) => {
    try {
        const response = await api.patch(`${API_URL}/unisync360-academic/course-categories/${uid}/`, data, config);
        return response.data;
    } catch (error) {
        console.error("Error updating course category:", error);
        throw error;
    }
};

// Delete Course Category
export const deleteCourseCategory = async (uid) => {
    try {
        const response = await api.delete(`${API_URL}/unisync360-academic/course-categories/${uid}/`);
        return response.data;
    } catch (error) {
        console.error("Error deleting course category:", error);
        throw error;
    }
};
