import api from "../../../../api";
import { API_BASE_URL } from "../../../../Costants";

const config = {
    headers: {
        "Content-Type": "application/json",
    },
};

const API_URL = `${API_BASE_URL}/api/v1`;

// Get all roles
export const getRoles = async (params = {}) => {
    try {
        const response = await api.get(
            `${API_URL}/unisync360-users/roles/`,
            { params }
        );
        return response.data;
    } catch (error) {
        console.error("Error fetching roles:", error);
        throw error;
    }
};

// Create a new role
export const createRole = async (data) => {
    try {
        const response = await api.post(
            `${API_URL}/unisync360-users/roles/`,
            data,
            config
        );
        return response.data;
    } catch (error) {
        console.error("Error creating role:", error);
        throw error;
    }
};

// Update a role
export const updateRole = async (id, data) => {
    try {
        const response = await api.patch(
            `${API_URL}/unisync360-users/roles/${id}/`,
            data,
            config
        );
        return response.data;
    } catch (error) {
        console.error("Error updating role:", error);
        throw error;
    }
};

// Delete a role
export const deleteRole = async (id) => {
    try {
        const response = await api.delete(
            `${API_URL}/unisync360-users/roles/${id}/`,
            config
        );
        return response.data;
    } catch (error) {
        console.error("Error deleting role:", error);
        throw error;
    }
};
