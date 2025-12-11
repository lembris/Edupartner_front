import { API_BASE_URL } from "../../../../../Costants";
import api from "../../../../../api";

const API_URL = `${API_BASE_URL}/api`;

// AI Course Recommendations
export const getAICourseRecommendations = async (studentUid) => {
    try {
        const response = await api.get(`${API_URL}/unisync360-ai/course-recommendations/${studentUid}/`);
        return response.data;
    } catch (error) {
        console.error("Error fetching AI course recommendations:", error);
        throw error;
    }
};

// AI Eligibility Check
export const checkAIEligibility = async (data) => {
    try {
        const response = await api.post(`${API_URL}/unisync360-ai/eligibility-check/`, data);
        return response.data;
    } catch (error) {
        console.error("Error checking AI eligibility:", error);
        throw error;
    }
};

// AI Departure Plan
export const getAIDeparturePlan = async (studentUid) => {
    try {
        const response = await api.get(`${API_URL}/unisync360-ai/departure-plan/${studentUid}/`);
        return response.data;
    } catch (error) {
        console.error("Error fetching AI departure plan:", error);
        throw error;
    }
};

// Regenerate AI Departure Plan
export const regenerateAIDeparturePlan = async (studentUid) => {
    try {
        const response = await api.post(`${API_URL}/unisync360-ai/departure-plan/${studentUid}/`);
        return response.data;
    } catch (error) {
        console.error("Error regenerating AI departure plan:", error);
        throw error;
    }
};

// Update Departure Checklist Item
export const updateDepartureChecklistItem = async (itemUid, data) => {
    try {
        const response = await api.patch(`${API_URL}/unisync360-ai/departure-checklist/${itemUid}/`, data);
        return response.data;
    } catch (error) {
        console.error("Error updating departure checklist item:", error);
        throw error;
    }
};

// AI Document Check
export const getAIDocumentCheck = async (studentUid) => {
    try {
        const response = await api.get(`${API_URL}/unisync360-ai/document-check/${studentUid}/`);
        return response.data;
    } catch (error) {
        console.error("Error fetching AI document check:", error);
        throw error;
    }
};

// AI Risk Assessment
export const getAIRiskAssessment = async (studentUid) => {
    try {
        const response = await api.get(`${API_URL}/unisync360-ai/risk-assessment/${studentUid}/`);
        return response.data;
    } catch (error) {
        console.error("Error fetching AI risk assessment:", error);
        throw error;
    }
};

// AI Fee Estimation
export const getAIFeeEstimation = async (data) => {
    try {
        const response = await api.post(`${API_URL}/unisync360-ai/fee-estimation/`, data);
        return response.data;
    } catch (error) {
        console.error("Error fetching AI fee estimation:", error);
        throw error;
    }
};

// AI Student Success Score
export const getAIStudentSuccessScore = async (studentUid) => {
    try {
        const response = await api.get(`${API_URL}/unisync360-ai/success-score/${studentUid}/`);
        return response.data;
    } catch (error) {
        console.error("Error fetching AI student success score:", error);
        throw error;
    }
};

// Get all AI insights for a student (batch call)
export const getAllAIInsights = async (studentUid) => {
    try {
        const [
            courseRecommendations,
            documentCheck,
            riskAssessment,
            successScore
        ] = await Promise.allSettled([
            getAICourseRecommendations(studentUid),
            getAIDocumentCheck(studentUid),
            getAIRiskAssessment(studentUid),
            getAIStudentSuccessScore(studentUid)
        ]);

        return {
            courseRecommendations: courseRecommendations.status === 'fulfilled' ? courseRecommendations.value : null,
            documentCheck: documentCheck.status === 'fulfilled' ? documentCheck.value : null,
            riskAssessment: riskAssessment.status === 'fulfilled' ? riskAssessment.value : null,
            successScore: successScore.status === 'fulfilled' ? successScore.value : null,
        };
    } catch (error) {
        console.error("Error fetching all AI insights:", error);
        throw error;
    }
};
