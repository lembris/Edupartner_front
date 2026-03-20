// Commission Portal Queries
import axiosInstance from "../../../../api.jsx";

const BASE_URL = "api/unisync360-commission";

// Commission Portal Queries








export const commissionPortalService = {
    // Student Registration
    registerStudent: async (data) => {
        const response = await axiosInstance.post(`${BASE_URL}/register-student/`, data);
        return response.data;
    },

    getMyStudents: async (params = {}) => {
        const response = await axiosInstance.get(`${BASE_URL}/my-students/`, { params });
        return response.data;
    },

    // Student Status
    getStudentStatus: async (studentUid) => {
        const response = await axiosInstance.get(`${BASE_URL}/student-status/${studentUid}/`);
        return response.data;
    },

    updateStudentStatus: async (studentUid, data) => {
        const response = await axiosInstance.post(`${BASE_URL}/student-status/${studentUid}/`, data);
        return response.data;
    },

    // Commissions
    getMyCommissions: async (params = {}) => {
        const response = await axiosInstance.get(`${BASE_URL}/my-commissions/`, { params });
        return response.data;
    },

    getAllCommissions: async (params = {}) => {
        const response = await axiosInstance.get(`${BASE_URL}/commissions/`, { params });
        return response.data;
    },

    createCommission: async (data) => {
        const response = await axiosInstance.post(`${BASE_URL}/commissions/`, data);
        return response.data;
    },

    updateCommission: async (uid, data) => {
        const response = await axiosInstance.patch(`${BASE_URL}/commissions/${uid}/`, data);
        return response.data;
    },

    // Payments
    getPayments: async (params = {}) => {
        const response = await axiosInstance.get(`${BASE_URL}/payments/`, { params });
        return response.data;
    },

    createPayment: async (data) => {
        const response = await axiosInstance.post(`${BASE_URL}/payments/`, data);
        return response.data;
    },

    // Targets
    getMyTargets: async (params = {}) => {
        const response = await axiosInstance.get(`${BASE_URL}/my-targets/`, { params });
        return response.data;
    },

    getAllTargets: async (params = {}) => {
        const response = await axiosInstance.get(`${BASE_URL}/targets/`, { params });
        return response.data;
    },

    createTarget: async (data) => {
        const response = await axiosInstance.post(`${BASE_URL}/targets/`, data);
        return response.data;
    },

    updateTarget: async (uid, data) => {
        const response = await axiosInstance.patch(`${BASE_URL}/targets/${uid}/`, data);
        return response.data;
    },

    getTargetProgress: async () => {
        const response = await axiosInstance.get(`${BASE_URL}/target-progress/`);
        return response.data;
    },

    // Dashboard
    getDashboard: async () => {
        const response = await axiosInstance.get(`${BASE_URL}/dashboard/`);
        return response.data;
    },

    getCommissionBoard: async (params = {}) => {
        const response = await axiosInstance.get(`${BASE_URL}/my-commissions/`, { params });
        return response.data;
    },

    getMyCommissionDetails: async () => {
        const response = await axiosInstance.get(`${BASE_URL}/commission-board/`);
        return response.data;
    },

    getLeaderboard: async (params = {}) => {
        const response = await axiosInstance.get(`${BASE_URL}/leaderboard/`, { params });
        return response.data;
    },

    getBadges: async () => {
        const response = await axiosInstance.get(`${BASE_URL}/badges/`);
        return response.data;
    },

    getActivities: async (params = {}) => {
        const response = await axiosInstance.get(`${BASE_URL}/activities/`, { params });
        return response.data;
    },

    // ===== External Counselor Specific Functions =====

    // Get student documents for recruiter's students
    getMyStudentDocuments: async (params = {}) => {
        const response = await axiosInstance.get(`${BASE_URL}/my-student-documents/`, { params });
        return response.data;
    },

    // Get course applications for recruiter's students
    getMyStudentApplications: async (params = {}) => {
        const response = await axiosInstance.get(`${BASE_URL}/my-student-applications/`, { params });
        return response.data;
    },

    // Upload document for a student
    uploadStudentDocument: async (studentUid, formData) => {
        const response = await axiosInstance.post(
            `unisync360-applications/students/${studentUid}/documents/`,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );
        return response.data;
    },

    // Create course application for a student
    createCourseApplication: async (data) => {
        const response = await axiosInstance.post(
            "unisync360-applications/course-allocations/",
            data
        );
        return response.data;
    },

    // Get document requirements list
    getDocumentRequirements: async (params = {}) => {
        const response = await axiosInstance.get("unisync360-applications/document-requirements/", { params });
        return response.data;
    },

    // Get universities list
    getUniversities: async (params = {}) => {
        const response = await axiosInstance.get("unisync360/universities/", { params });
        return response.data;
    },

    // Get university courses
    getUniversityCourses: async (params = {}) => {
        const response = await axiosInstance.get("unisync360/university-courses/", { params });
        return response.data;
    },

    // Get student details
    getStudentDetails: async (studentUid) => {
        const response = await axiosInstance.get(`unisync360/students/${studentUid}/`);
        return response.data;
    },

    // Get student documents
    getStudentDocuments: async (studentUid, params = {}) => {
        const response = await axiosInstance.get(
            `unisync360-applications/students/${studentUid}/documents/`,
            { params }
        );
        return response.data;
    },

    // Get student course applications
    getStudentApplications: async (studentUid, params = {}) => {
        const response = await axiosInstance.get(
            "unisync360-applications/course-allocations/",
            { params: { ...params, student: studentUid } }
        );
        return response.data;
    },

    // Update student information
    updateStudent: async (studentUid, data) => {
        const response = await axiosInstance.patch(`unisync360/students/${studentUid}/`, data);
        return response.data;
    },
};

export const recruiterService = commissionPortalService;
export default commissionPortalService;
