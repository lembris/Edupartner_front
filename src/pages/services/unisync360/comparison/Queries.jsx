import { API_BASE_URL } from "../../../../Costants";
import api from "../../../../api";

const API_URL = `${API_BASE_URL}/api`;

const config = {
    headers: {
        "Content-Type": "application/json",
    },
};

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

export const getPopularCourses = async ({ limit = 10, country = null, university = null } = {}) => {
    try {
        const params = new URLSearchParams();
        params.append('limit', limit);
        if (country) params.append('country', country);
        if (university) params.append('university', university);

        const response = await api.get(`${API_URL}/unisync360-analytics/popular-courses/?${params.toString()}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching popular courses:", error);
        throw error;
    }
};

export const getCourseApplicationStats = async (courseUid) => {
    try {
        const response = await api.get(`${API_URL}/unisync360-analytics/course-stats/${courseUid}/`);
        return response.data;
    } catch (error) {
        console.error("Error fetching course stats:", error);
        throw error;
    }
};

export const getCountryComparison = async (countryUids = []) => {
    try {
        const params = new URLSearchParams();
        countryUids.forEach(uid => params.append('countries', uid));

        const response = await api.get(`${API_URL}/unisync360-analytics/country-comparison/?${params.toString()}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching country comparison:", error);
        throw error;
    }
};

export const getUniversityComparison = async (universityUids = []) => {
    try {
        const params = new URLSearchParams();
        universityUids.forEach(uid => params.append('universities', uid));

        const response = await api.get(`${API_URL}/unisync360-analytics/university-comparison/?${params.toString()}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching university comparison:", error);
        throw error;
    }
};

export const getApplicationTrends = async ({ period = 'monthly', year = null } = {}) => {
    try {
        const params = new URLSearchParams();
        params.append('period', period);
        if (year) params.append('year', year);

        const response = await api.get(`${API_URL}/unisync360-analytics/application-trends/?${params.toString()}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching application trends:", error);
        throw error;
    }
};
