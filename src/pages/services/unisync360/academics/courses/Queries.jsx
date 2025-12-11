import { API_BASE_URL } from "../../../../../Costants";
import api from "../../../../../api";

const API_URL = `${API_BASE_URL}/api`;

const config = {
    headers: {
        "Content-Type": "application/json",
    },
};

// Get Courses
export const getCourses = async ({ uid = "", search = "", pagination = {} }) => {
    try {
        let url = `${API_URL}/unisync360-academic/courses/`;

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
        console.error("Error fetching courses:", error);
        throw error;
    }
};

// Create Course
export const createCourse = async (data) => {
    try {
        const response = await api.post(`${API_URL}/unisync360-academic/courses/`, data, config);
        return response.data;
    } catch (error) {
        console.error("Error creating course:", error);
        throw error;
    }
};

// Update Course
export const updateCourse = async (uid, data) => {
    try {
        const response = await api.patch(`${API_URL}/unisync360-academic/courses/${uid}/`, data, config);
        return response.data;
    } catch (error) {
        console.error("Error updating course:", error);
        throw error;
    }
};

// Delete Course
export const deleteCourse = async (uid) => {
    try {
        const response = await api.delete(`${API_URL}/unisync360-academic/courses/${uid}/`);
        return response.data;
    } catch (error) {
        console.error("Error deleting course:", error);
        throw error;
    }
};

// Get Course Categories
export const getCourseCategories = async ({ search = "", pagination = {} } = {}) => {
    try {
        let url = `${API_URL}/unisync360-academic/course-categories/`;
        const params = new URLSearchParams();

        if (search) params.append("search", search);
        // Default pagination if not provided, or handle all items if needed for dropdowns
        // Often for dropdowns we want all items or a large page size
        if (Object.keys(pagination).length === 0) {
             params.append("page_size", 1000); 
        } else {
             Object.keys(pagination).forEach(key => params.append(key, pagination[key]));
        }

        const response = await api.get(url, { params });
        return response.data;
    } catch (error) {
        console.error("Error fetching course categories:", error);
        throw error;
    }
};

// Get Course Levels
export const getCourseLevels = async ({ search = "", pagination = {} } = {}) => {
    try {
        let url = `${API_URL}/unisync360-academic/course-levels/`;
        const params = new URLSearchParams();

        if (search) params.append("search", search);
        if (Object.keys(pagination).length === 0) {
             params.append("page_size", 1000);
        } else {
             Object.keys(pagination).forEach(key => params.append(key, pagination[key]));
        }

        const response = await api.get(url, { params });
        return response.data;
    } catch (error) {
        console.error("Error fetching course levels:", error);
        throw error;
    }
};
