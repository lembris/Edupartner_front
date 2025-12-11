import { API_BASE_URL } from "../../../../../../Costants";
import api from "../../../../../../api";

const API_URL = `${API_BASE_URL}/api`;

const config = {
    headers: {
        "Content-Type": "application/json",
    },
};

// Get University Courses
export const getUniversityCourses = async ({ uid = "", search = "", universityUid = "", pagination = {} }) => {
    try {
        let url = `${API_URL}/unisync360-academic/university-courses/`;

        if (uid) {
            url += `${uid}/`;
        } else {
            const params = new URLSearchParams();
            if (search) params.append("search", search);
            if (universityUid) params.append("university", universityUid);
            Object.keys(pagination).forEach(key => params.append(key, pagination[key]));

            if (params.toString()) {
                url += `?${params.toString()}`;
            }
        }

        const response = await api.get(url);
        return response.data;
    } catch (error) {
        console.error("Error fetching university courses:", error);
        throw error;
    }
};

// Create University Course
export const createUniversityCourse = async (data) => {
    try {
        const response = await api.post(`${API_URL}/unisync360-academic/university-courses/`, data, config);
        return response.data;
    } catch (error) {
        console.error("Error creating university course:", error);
        throw error;
    }
};

// Update University Course
export const updateUniversityCourse = async (uid, data) => {
    try {
        const response = await api.patch(`${API_URL}/unisync360-academic/university-courses/${uid}/`, data, config);
        return response.data;
    } catch (error) {
        console.error("Error updating university course:", error);
        throw error;
    }
};

// Delete University Course
export const deleteUniversityCourse = async (uid) => {
    try {
        const response = await api.delete(`${API_URL}/unisync360-academic/university-courses/${uid}/`);
        return response.data;
    } catch (error) {
        console.error("Error deleting university course:", error);
        throw error;
    }
};

// Get Courses (for selection)
export const getCourses = async ({ uid = "", search = "", pagination = {} } = {}) => {
    try {
        let url = `${API_URL}/unisync360-academic/courses/`;
        
        if (uid) {
            url += `${uid}/`;
            const response = await api.get(url);
            return response.data;
        }

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
        console.error("Error fetching courses:", error);
        throw error;
    }
};

// Get Universities (for selection)
export const getUniversities = async ({ uid = "", search = "", pagination = {} } = {}) => {
    try {
        let url = `${API_URL}/unisync360-institutions/universities/`;
        
        if (uid) {
            url += `${uid}/`;
            const response = await api.get(url);
            return response.data;
        }

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
        console.error("Error fetching universities:", error);
        throw error;
    }
};
