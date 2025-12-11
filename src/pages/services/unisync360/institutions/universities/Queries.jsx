// Queries.jsx
import { API_BASE_URL } from "../../../../../Costants";
import api from "../../../../../api";

const API_URL = `${API_BASE_URL}/api`;

const config = {
    headers: {
        "Content-Type": "application/json",
    },
};

const setConfig = (pagination = {}) => ({
    headers: { "Content-Type": "application/json" },
    params: { ...pagination },
});

// Get Universities (with optional search, pagination, and single by UID)
export const getUniversities = async ({ uid = "", search = "", pagination = {} }) => {
    try {
        let url = `${API_URL}/unisync360-institutions/universities/`;

        if (uid) {
            url += `${uid}/`;
        } else {
            // If search params exist, append them
            const params = new URLSearchParams();
            if (search) params.append("search", search);
            // Add pagination params
            Object.keys(pagination).forEach(key => params.append(key, pagination[key]));

            if (params.toString()) {
                url += `?${params.toString()}`;
            }
        }

        const response = await api.get(url);
        return response.data;
    } catch (error) {
        console.error("Error fetching universities:", error);
        throw error;
    }
};

// Create University
export const createUniversity = async (data) => {
    try {
        // If there's a logo, we might need to use FormData, but assuming JSON for now unless specified otherwise.
        // The factory/model suggests logo is an ImageField.
        // If data contains file objects, we should use FormData.

        const isFormData = data instanceof FormData;
        const requestConfig = isFormData ? {
            headers: { "Content-Type": "multipart/form-data" }
        } : config;

        const response = await api.post(`${API_URL}/unisync360-institutions/universities/`, data, requestConfig);
        return response.data;
    } catch (error) {
        console.error("Error creating university:", error);
        throw error;
    }
};

// Update University
export const updateUniversity = async (uid, data) => {
    try {
        const isFormData = data instanceof FormData;
        const requestConfig = isFormData ? {
            headers: { "Content-Type": "multipart/form-data" }
        } : config;

        const response = await api.patch(`${API_URL}/unisync360-institutions/universities/${uid}/`, data, requestConfig);
        return response.data;
    } catch (error) {
        console.error("Error updating university:", error);
        throw error;
    }
};

// Delete University
export const deleteUniversity = async (uid) => {
    try {
        const response = await api.delete(`${API_URL}/unisync360-institutions/universities/${uid}/`);
        return response.data;
    } catch (error) {
        console.error("Error deleting university:", error);
        throw error;
    }
};

// Get Countries
export const getCountries = async ({ search = "", pagination = {} }) => {
    try {
        let url = `${API_URL}/countries/`;
        const params = new URLSearchParams();
        
        if (search) params.append("search", search);
        Object.keys(pagination).forEach(key => params.append(key, pagination[key]));
        
        const response = await api.get(url, { params });
        return response.data;
    } catch (error) {
        console.error("Error fetching countries:", error);
        throw error;
    }
};

// Get University Accommodations
export const getUniversityAccommodations = async ({ universityUid = "", pagination = {} }) => {
    try {
        let url = `${API_URL}/unisync360-institutions/accommodations/`;
        const params = new URLSearchParams();

        if (universityUid) params.append("university", universityUid);
        Object.keys(pagination).forEach(key => params.append(key, pagination[key]));

        const response = await api.get(url, { params });
        return response.data;
    } catch (error) {
        console.error("Error fetching accommodations:", error);
        throw error;
    }
};

// Get University Gallery
export const getUniversityGallery = async ({ universityUid = "", pagination = {} }) => {
    try {
        let url = `${API_URL}/unisync360-institutions/gallery/`;
        const params = new URLSearchParams();

        if (universityUid) params.append("university", universityUid);
        Object.keys(pagination).forEach(key => params.append(key, pagination[key]));

        const response = await api.get(url, { params });
        return response.data;
    } catch (error) {
        console.error("Error fetching gallery:", error);
        throw error;
    }
};
export const getUniversityCourses = async ({ universityUid = "", search = "", pagination = {} }) => {
    try {
        let url = `${API_URL}/unisync360-academic/university-courses/`;
        const params = new URLSearchParams();

        if (universityUid) params.append("university", universityUid);
        if (search) params.append("search", search);
        Object.keys(pagination).forEach(key => params.append(key, pagination[key]));

        const response = await api.get(url, { params });
        return response.data;
    } catch (error) {
        console.error("Error fetching university courses:", error);
        throw error;
    }
};

// Get Course Allocations (Applications)
export const getCourseAllocations = async ({ universityUid = "", studentUid = "", search = "", status = "", pagination = {} }) => {
    try {
        let url = `${API_URL}/unisync360-applications/course-allocations/`;
        const params = new URLSearchParams();

        if (universityUid) params.append("university", universityUid);
        if (studentUid) params.append("student", studentUid);
        if (search) params.append("search", search);
        if (status) params.append("status", status);
        Object.keys(pagination).forEach(key => params.append(key, pagination[key]));

        const response = await api.get(url, { params });
        return response.data;
    } catch (error) {
        console.error("Error fetching course allocations:", error);
        throw error;
    }
};

// Get University Expenses
export const getUniversityExpenses = async ({ universityUid = "", categoryUid = "", isPaid = "", search = "", pagination = {} }) => {
    try {
        let url = `${API_URL}/unisync360-institutions/expenses/`;
        const params = new URLSearchParams();

        if (universityUid) params.append("university", universityUid);
        if (categoryUid) params.append("category", categoryUid);
        if (isPaid !== "") params.append("is_paid", isPaid);
        if (search) params.append("search", search);
        Object.keys(pagination).forEach(key => params.append(key, pagination[key]));

        const response = await api.get(url, { params });
        return response.data;
    } catch (error) {
        console.error("Error fetching expenses:", error);
        throw error;
    }
};

// Create University Expense
export const createUniversityExpense = async (data) => {
    try {
        const isFormData = data instanceof FormData;
        const requestConfig = isFormData ? {
            headers: { "Content-Type": "multipart/form-data" }
        } : config;

        const response = await api.post(`${API_URL}/unisync360-institutions/expenses/`, data, requestConfig);
        return response.data;
    } catch (error) {
        console.error("Error creating expense:", error);
        throw error;
    }
};

// Update University Expense
export const updateUniversityExpense = async (uid, data) => {
    try {
        const isFormData = data instanceof FormData;
        const requestConfig = isFormData ? {
            headers: { "Content-Type": "multipart/form-data" }
        } : config;

        const response = await api.patch(`${API_URL}/unisync360-institutions/expenses/${uid}/`, data, requestConfig);
        return response.data;
    } catch (error) {
        console.error("Error updating expense:", error);
        throw error;
    }
};

// Delete University Expense
export const deleteUniversityExpense = async (uid) => {
    try {
        const response = await api.delete(`${API_URL}/unisync360-institutions/expenses/${uid}/`);
        return response.data;
    } catch (error) {
        console.error("Error deleting expense:", error);
        throw error;
    }
};

// Get Expense Categories
export const getExpenseCategories = async ({ search = "", pagination = {} }) => {
    try {
        let url = `${API_URL}/unisync360-institutions/expense-categories/`;
        const params = new URLSearchParams();

        if (search) params.append("search", search);
        Object.keys(pagination).forEach(key => params.append(key, pagination[key]));

        const response = await api.get(url, { params });
        return response.data;
    } catch (error) {
        console.error("Error fetching expense categories:", error);
        throw error;
    }
};

// Create Expense Category
export const createExpenseCategory = async (data) => {
    try {
        const response = await api.post(`${API_URL}/unisync360-institutions/expense-categories/`, data, config);
        return response.data;
    } catch (error) {
        console.error("Error creating expense category:", error);
        throw error;
    }
};
