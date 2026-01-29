import api from "../../../../api";
import { API_BASE_URL } from "../../../../Costants";

const config = {
    headers: {
        "Content-Type": "application/json",
    },
};

const API_URL = `${API_BASE_URL}/api`;

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

// Toggle role active status
export const toggleRoleStatus = async (id, is_active) => {
    try {
        const response = await api.patch(
            `${API_URL}/unisync360-users/roles/${id}/`,
            { is_active: !is_active },
            config
        );
        return response.data;
    } catch (error) {
        console.error("Error toggling role status:", error);
        throw error;
    }
};

// Get all available permissions
export const getPermissions = async () => {
    try {
        const response = await api.get(
            `${API_URL}/unisync360-users/permissions/`
        );
        return response.data;
    } catch (error) {
        console.error("Error fetching permissions:", error);
        throw error;
    }
};

// Assign permissions to role
export const assignPermissionsToRole = async (id, permissionIds) => {
    try {
        const response = await api.patch(
            `${API_URL}/unisync360-users/roles/${id}/`,
            { permissions: permissionIds },
            config
        );
        return response.data;
    } catch (error) {
        console.error("Error assigning permissions:", error);
        throw error;
    }
};
