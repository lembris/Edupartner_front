import { API_BASE_URL } from "../../../../../Costants";
import api from "../../../../../api";

const API_URL = `${API_BASE_URL}/api`;

const config = {
    headers: {
        "Content-Type": "application/json",
    },
};

export const getCourseAllocations = async ({ search = "", pagination = {}, filters = {} } = {}) => {
    try {
        const params = new URLSearchParams();
        if (search) params.append("search", search);
        if (pagination.page) params.append("page", pagination.page);
        if (pagination.page_size) params.append("page_size", pagination.page_size);

        // Add filter params
        if (filters.status) params.append("status", filters.status);
        if (filters.student) params.append("student", filters.student);
        if (filters.university_course) params.append("university_course", filters.university_course);
        if (filters.intake_year) params.append("intake_year", filters.intake_year);

        const response = await api.get(`${API_URL}/unisync360-applications/course-allocations/?${params.toString()}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching course allocations:", error);
        throw error;
    }
};

export const getCourseAllocation = async (uid) => {
    try {
        const response = await api.get(`${API_URL}/unisync360-applications/course-allocations/${uid}/`);
        return response.data;
    } catch (error) {
        console.error("Error fetching course allocation:", error);
        throw error;
    }
};

export const createCourseAllocation = async (data) => {
    try {
        const response = await api.post(`${API_URL}/unisync360-applications/course-allocations/`, data);
        return response.data;
    } catch (error) {
        console.error("Error creating course allocation:", error);
        throw error;
    }
};

export const updateCourseAllocation = async (uid, data) => {
    try {
        const response = await api.patch(`${API_URL}/unisync360-applications/course-allocations/${uid}/`, data);
        return response.data;
    } catch (error) {
        console.error("Error updating course allocation:", error);
        throw error;
    }
};

export const deleteCourseAllocation = async (uid) => {
    try {
        const response = await api.delete(`${API_URL}/unisync360-applications/course-allocations/${uid}/`);
        return response.data;
    } catch (error) {
        console.error("Error deleting course allocation:", error);
        throw error;
    }
};

export const updateCourseAllocationStatus = async (uid, status) => {
    try {
        const response = await api.patch(`${API_URL}/unisync360-applications/course-allocations/${uid}/`, { status });
        return response.data;
    } catch (error) {
        console.error("Error updating course allocation status:", error);
        throw error;
    }
};

export const getCourseAllocationTimeline = async (uid) => {
    try {
        const response = await api.get(`${API_URL}/unisync360-applications/course-allocations/${uid}/timeline/`);
        return response.data;
    } catch (error) {
        console.error("Error fetching course allocation timeline:", error);
        throw error;
    }
};

// Status options for Course Allocations
export const ALLOCATION_STATUS_OPTIONS = [
    { value: 'pending', label: 'Pending', color: 'warning' },
    { value: 'submitted', label: 'Submitted', color: 'info' },
    { value: 'under_review', label: 'Under Review', color: 'primary' },
    { value: 'approved', label: 'Approved', color: 'success' },
    { value: 'rejected', label: 'Rejected', color: 'danger' },
    { value: 'offer_received', label: 'Offer Received', color: 'success' },
    { value: 'offer_accepted', label: 'Offer Accepted', color: 'success' },
    { value: 'offer_declined', label: 'Offer Declined', color: 'secondary' },
    { value: 'enrolled', label: 'Enrolled', color: 'success' },
    { value: 'deferred', label: 'Deferred', color: 'warning' },
    { value: 'withdrawn', label: 'Withdrawn', color: 'dark' },
    { value: 'waiting_list', label: 'Waiting List', color: 'info' },
];

export const getStatusColor = (status) => {
    const option = ALLOCATION_STATUS_OPTIONS.find(opt => opt.value === status);
    return option?.color || 'secondary';
};

export const getStatusLabel = (status) => {
    const option = ALLOCATION_STATUS_OPTIONS.find(opt => opt.value === status);
    return option?.label || status;
};

// Course Comparison APIs
export const getCourseComparisonData = async (courseUids = []) => {
    try {
        const params = new URLSearchParams();
        courseUids.forEach(uid => params.append('courses', uid));

        const response = await api.get(`${API_URL}/unisync360-analytics/course-comparison/?${params.toString()}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching course comparison:", error);
        throw error;
    }
};

export const getCourseStats = async (courseUid) => {
    try {
        const response = await api.get(`${API_URL}/unisync360-analytics/course-stats/${courseUid}/`);
        return response.data;
    } catch (error) {
        console.error("Error fetching course stats:", error);
        throw error;
    }
};
