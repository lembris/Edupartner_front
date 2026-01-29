import api from "../../../../api";
import { API_BASE_URL } from "../../../../Costants";

const API_URL = `${API_BASE_URL}/api`;

const config = {
    headers: {
        "Content-Type": "application/json",
    },
};

// Get custom permissions
export const getCustomPermissions = async () => {
    try {
        const response = await api.get(`${API_URL}/unisync360-permissions/`);
        return response.data;
    } catch (error) {
        console.error("Error fetching custom permissions:", error);
        throw error;
    }
};

// Get Django permissions (read-only)
export const getDjangoPermissions = async () => {
    try {
        const response = await api.get(`${API_URL}/unisync360-permissions/django/`);
        return response.data;
    } catch (error) {
        console.error("Error fetching Django permissions:", error);
        throw error;
    }
};

// Create custom permission
export const createPermission = async (data) => {
    try {
        const response = await api.post(
            `${API_URL}/unisync360-permissions/`,
            data,
            config
        );
        return response.data;
    } catch (error) {
        console.error("Error creating permission:", error);
        throw error;
    }
};

// Update custom permission
export const updatePermission = async (id, data) => {
    try {
        const response = await api.patch(
            `${API_URL}/unisync360-permissions/${id}/`,
            data,
            config
        );
        return response.data;
    } catch (error) {
        console.error("Error updating permission:", error);
        throw error;
    }
};

// Delete custom permission
export const deletePermission = async (id) => {
    try {
        const response = await api.delete(
            `${API_URL}/unisync360-permissions/${id}/`,
            config
        );
        return response.data;
    } catch (error) {
        console.error("Error deleting permission:", error);
        throw error;
    }
};
