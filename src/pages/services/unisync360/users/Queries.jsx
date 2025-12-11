import { API_BASE_URL } from "../../../../Costants";
import api from "../../../../api";

const API_URL = `${API_BASE_URL}/api`;

// Get Users
export const getUsers = async ({ search = "", role = "", status = "", is_active = "", pagination = {} } = {}) => {
    try {
        let url = `${API_URL}/unisync360-users/`;
        const params = new URLSearchParams();

        if (search) params.append("search", search);
        if (role) params.append("role", role);
        if (status) params.append("status", status);
        if (is_active !== "") params.append("is_active", is_active);
        Object.keys(pagination).forEach(key => params.append(key, pagination[key]));

        const response = await api.get(url, { params });
        return response.data;
    } catch (error) {
        console.error("Error fetching users:", error);
        throw error;
    }
};

// Get Single User
export const getUser = async (guid) => {
    try {
        const response = await api.get(`${API_URL}/unisync360-users/${guid}/`);
        return response.data;
    } catch (error) {
        console.error("Error fetching user:", error);
        throw error;
    }
};

// Create User
export const createUser = async (data) => {
    try {
        const response = await api.post(`${API_URL}/unisync360-users/`, data);
        return response.data;
    } catch (error) {
        console.error("Error creating user:", error);
        throw error;
    }
};

// Update User
export const updateUser = async (guid, data) => {
    try {
        const response = await api.patch(`${API_URL}/unisync360-users/${guid}/`, data);
        return response.data;
    } catch (error) {
        console.error("Error updating user:", error);
        throw error;
    }
};

// Delete User
export const deleteUser = async (guid) => {
    try {
        const response = await api.delete(`${API_URL}/unisync360-users/${guid}/`);
        return response.data;
    } catch (error) {
        console.error("Error deleting user:", error);
        throw error;
    }
};

// Get Roles
export const getRoles = async () => {
    try {
        const response = await api.get(`${API_URL}/unisync360-users/roles/`);
        return response.data;
    } catch (error) {
        console.error("Error fetching roles:", error);
        throw error;
    }
};

// Assign Roles
export const assignRoles = async (data) => {
    try {
        const response = await api.post(`${API_URL}/unisync360-users/roles/assign/`, data);
        return response.data;
    } catch (error) {
        console.error("Error assigning roles:", error);
        throw error;
    }
};

// Change Password
export const changePassword = async (guid, data) => {
    try {
        const response = await api.post(`${API_URL}/unisync360-users/${guid}/change-password/`, data);
        return response.data;
    } catch (error) {
        console.error("Error changing password:", error);
        throw error;
    }
};

// Toggle Activation
export const toggleActivation = async (guid, action = 'toggle') => {
    try {
        const response = await api.post(`${API_URL}/unisync360-users/${guid}/activation/`, { action });
        return response.data;
    } catch (error) {
        console.error("Error toggling activation:", error);
        throw error;
    }
};

// Bulk Action
export const bulkAction = async (data) => {
    try {
        const response = await api.post(`${API_URL}/unisync360-users/bulk-action/`, data);
        return response.data;
    } catch (error) {
        console.error("Error performing bulk action:", error);
        throw error;
    }
};

// Get User Stats
export const getUserStats = async () => {
    try {
        const response = await api.get(`${API_URL}/unisync360-users/stats/`);
        return response.data;
    } catch (error) {
        console.error("Error fetching user stats:", error);
        throw error;
    }
};

// Get Counselors List (for dropdowns)
export const getCounselors = async () => {
    try {
        const response = await api.get(`${API_URL}/unisync360-users/counselors/`);
        return response.data;
    } catch (error) {
        console.error("Error fetching counselors:", error);
        throw error;
    }
};

// Role constants (matching backend)
export const UNISYNC360_ROLES = {
    SUPER_ADMIN: 'unisync360_super_admin',
    FACILITATION_OFFICER: 'unisync360_facilitation_officer',
    ACCOUNTANT: 'unisync360_accountant',
    COUNSELOR: 'unisync360_counselor',
    LEAD_LANCER: 'unisync360_lead_lancer',
    EXTERNAL_COUNSELOR: 'unisync360_external_counselor',
};

export const ROLE_DISPLAY_NAMES = {
    [UNISYNC360_ROLES.SUPER_ADMIN]: 'Super Admin',
    [UNISYNC360_ROLES.FACILITATION_OFFICER]: 'Facilitation Officer',
    [UNISYNC360_ROLES.ACCOUNTANT]: 'Accountant',
    [UNISYNC360_ROLES.COUNSELOR]: 'Counselor',
    [UNISYNC360_ROLES.LEAD_LANCER]: 'Lead Lancer',
    [UNISYNC360_ROLES.EXTERNAL_COUNSELOR]: 'External Counselor',
};

export const ROLE_COLORS = {
    [UNISYNC360_ROLES.SUPER_ADMIN]: 'danger',
    [UNISYNC360_ROLES.FACILITATION_OFFICER]: 'primary',
    [UNISYNC360_ROLES.ACCOUNTANT]: 'success',
    [UNISYNC360_ROLES.COUNSELOR]: 'info',
    [UNISYNC360_ROLES.LEAD_LANCER]: 'warning',
    [UNISYNC360_ROLES.EXTERNAL_COUNSELOR]: 'purple',
};
