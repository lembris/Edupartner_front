import { API_BASE_URL } from "../../../../Costants";
import api from "../../../../api";

const API_URL = `${API_BASE_URL}/api`;

const config = {
    headers: {
        "Content-Type": "multipart/form-data",
    },
};

// Get Students
export const getStudents = async ({ search = "", pagination = {} } = {}) => {
    try {
        let url = `${API_URL}/unisync360-students/`;
        const params = new URLSearchParams();

        if (search) params.append("search", search);
        Object.keys(pagination).forEach(key => params.append(key, pagination[key]));

        const response = await api.get(url, { params });
        return response.data;
    } catch (error) {
        console.error("Error fetching students:", error);
        throw error;
    }
};

// Create Student
export const createStudent = async (data) => {
    try {
        const response = await api.post(`${API_URL}/unisync360-students/`, data);
        return response.data;
    } catch (error) {
        console.error("Error creating student:", error);
        // Return error data if available (for validation errors, etc.)
        if (error.response?.data) {
            return error.response.data;
        }
        throw error;
    }
};

// Update Student
export const updateStudent = async (uid, data) => {
    try {
        const response = await api.patch(`${API_URL}/unisync360-students/${uid}/`, data);
        return response.data;
    } catch (error) {
        console.error("Error updating student:", error);
        // Return error data if available (for validation errors, etc.)
        if (error.response?.data) {
            return error.response.data;
        }
        throw error;
    }
};

// Delete Student
export const deleteStudent = async (uid) => {
    try {
        const response = await api.delete(`${API_URL}/unisync360-students/${uid}/`);
        return response.data;
    } catch (error) {
        console.error("Error deleting student:", error);
        throw error;
    }
};

// Get Single Student
export const getStudent = async (uid) => {
    try {
        const response = await api.get(`${API_URL}/unisync360-students/${uid}/`);
        return response.data;
    } catch (error) {
        console.error("Error fetching student:", error);
        throw error;
    }
};

// Get Student Sources
export const getStudentSources = async () => {
    try {
        const response = await api.get(`${API_URL}/unisync360-students/sources/?page_size=100`);
        return response.data;
    } catch (error) {
        console.error("Error fetching student sources:", error);
        throw error;
    }
};

// Get Student Statuses
export const getStudentStatuses = async () => {
    try {
        const response = await api.get(`${API_URL}/unisync360-students/statuses/?page_size=100`);
        return response.data;
    } catch (error) {
        console.error("Error fetching student statuses:", error);
        throw error;
    }
};

// --- Generic CRUD Helper ---
const createCRUD = (endpoint) => ({
    getAll: async (params = {}) => {
        const queryParams = new URLSearchParams(params);
        const response = await api.get(`${API_URL}/${endpoint}/`, { params: queryParams });
        return response.data;
    },
    create: async (data) => {
        const response = await api.post(`${API_URL}/${endpoint}/`, data);
        return response.data;
    },
    update: async (uid, data) => {
        const response = await api.patch(`${API_URL}/${endpoint}/${uid}/`, data);
        return response.data;
    },
    delete: async (uid) => {
        const response = await api.delete(`${API_URL}/${endpoint}/${uid}/`);
        return response.data;
    }
});

// Create specific helper for endpoints with student ID in the URL
const createStudentNestedCRUD = (baseEndpoint) => ({
    getAll: async (params = {}) => {
        if (!params.student) throw new Error("Student ID is required");
        const queryParams = new URLSearchParams(params);
        const response = await api.get(`${API_URL}/unisync360-applications/${params.student}/${baseEndpoint}/`, { params: queryParams });
        return response.data;
    },
    create: async (data) => {
        let studentId;
        if (data instanceof FormData) {
            studentId = data.get('student');
        } else {
            studentId = data.student;
        }
        
        if (!studentId) throw new Error("Student ID is required");
        const response = await api.post(`${API_URL}/unisync360-applications/${studentId}/${baseEndpoint}/`, data);
        return response.data;
    },
    update: async (uid, data) => {
        let studentId;
        if (data instanceof FormData) {
            studentId = data.get('student');
        } else {
            studentId = data.student;
        }

         if (!studentId) throw new Error("Student ID is required");
        const response = await api.patch(`${API_URL}/unisync360-applications/${studentId}/${baseEndpoint}/${uid}/`, data);
        return response.data;
    },
    delete: async (uid, studentId) => { // We might need studentId here if URL requires it
        // ... existing delete code
        throw new Error("Delete operation requires student ID for nested resources");
    }
});


// Fixing endpoints based on urls.py
export const CommunicationAPI = createCRUD('unisync360-students/communications');
export const AppointmentAPI = createCRUD('unisync360-students/appointments');
export const ReminderAPI = createCRUD('unisync360-students/reminders');
export const FacilitationAPI = createCRUD('unisync360-facilitation/requests');
export const FacilitationStepAPI = createCRUD('unisync360-facilitation/steps');
export const FacilitationProgressAPI = createCRUD('unisync360-facilitation/progress');
export const ContactAPI = createCRUD('unisync360-students/contacts');
export const ContractAPI = createCRUD('unisync360-students/contracts');
export const TaskAPI = createCRUD('unisync360-students/tasks');
export const AlertAPI = createCRUD('unisync360-students/alerts');

// These seem to be nested in urls.py under unisync360-applications/ or unisync360-students/
// path('<uuid:student_uid>/documents/', ... )
// path('<uuid:student_uid>/academic-history/', ... )

// We need custom CRUDs for these nested resources
const createNestedCRUD = (prefix, suffix) => ({
    getAll: async (params = {}) => {
        if (!params.student) return { results: [] };
        const queryParams = new URLSearchParams(params);
        // Remove student from query params since it's in URL? Or keep it?
        // Usually if it's in URL, we don't need it in params, but it doesn't hurt.
        const response = await api.get(`${API_URL}/${prefix}/${params.student}/${suffix}/`, { params: queryParams });
        return response.data;
    },
    create: async (data) => {
        let studentId;
        if (data instanceof FormData) {
            studentId = data.get('student');
        } else {
            studentId = data.student;
        }
        
        if (!studentId) throw new Error("Student ID required");
        const response = await api.post(`${API_URL}/${prefix}/${studentId}/${suffix}/`, data);
        return response.data;
    },
    update: async (uid, data) => {
        let studentId;
        if (data instanceof FormData) {
            studentId = data.get('student');
        } else {
            studentId = data.student;
        }

         if (!studentId) throw new Error("Student ID required");
        const response = await api.patch(`${API_URL}/${prefix}/${studentId}/${suffix}/${uid}/`, data);
        return response.data;
    },
    delete: async (uid) => {
        // This is tricky because the URL requires student_uid: .../<student_uid>/.../<uid>/
        // But standard delete(uid) doesn't have it.
        // We have to hack this or fix the backend to have a flat detail route.
        // OR we change the UI to pass student ID.
        
        // For now, let's assume we can't easily call this without the student ID.
        // However, the deleteStudent function (for student deletion) is simple.
        // Nested resources are painful for generic deletion.
        
        // Workaround: We will fetch the item first to get the student ID? No, too slow.
        // We will rely on the caller passing `studentId` if we modify the handleItemDelete?
        // But handleItemDelete is generic.
        
        // Let's try to implement a "smart" delete that might fail if we don't have context.
        // But actually, we can create a closure or object that "knows" the student ID if we initialize it per student page?
        // No, these are exported constants.
        
        // Let's change how we define these APIs. They function, but DELETE is broken for nested.
        // READ/CREATE/UPDATE work if we pass data.student.
        
        console.error("Delete not fully supported for nested resources without context");
        // Try to use a direct URL if we can, but we can't.
        throw new Error("Delete requires context");
    },
    // Custom delete that accepts context
    deleteWithContext: async (uid, contextId) => {
        const response = await api.delete(`${API_URL}/${prefix}/${contextId}/${suffix}/${uid}/`);
        return response.data;
    }
});

export const DocumentAPI = createNestedCRUD('unisync360-applications', 'documents');
export const AcademicHistoryAPI = createNestedCRUD('unisync360-students', 'academic-history');

export const CourseAllocationAPI = createCRUD('unisync360-applications/course-allocations');

// ============ Bulk Import API ============
const BULK_IMPORT_URL = `${API_URL}/unisync360-bulk-import`;

export const BulkImportAPI = {
    // Upload file for import
    upload: async (file, options = {}) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('chunk_size', options.chunkSize || 100);
        formData.append('skip_duplicates', options.skipDuplicates !== false);
        formData.append('update_existing', options.updateExisting || false);
        
        const response = await api.post(`${BULK_IMPORT_URL}/upload/`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },
    
    // Get list of import jobs
    getJobs: async (params = {}) => {
        const queryParams = new URLSearchParams(params);
        const response = await api.get(`${BULK_IMPORT_URL}/jobs/`, { params: queryParams });
        return response.data;
    },
    
    // Get single job details
    getJob: async (jobId) => {
        const response = await api.get(`${BULK_IMPORT_URL}/jobs/${jobId}/`);
        return response.data;
    },
    
    // Get job progress
    getProgress: async (jobId) => {
        const response = await api.get(`${BULK_IMPORT_URL}/jobs/${jobId}/progress/`);
        return response.data;
    },
    
    // Get job errors
    getErrors: async (jobId, params = {}) => {
        const queryParams = new URLSearchParams(params);
        const response = await api.get(`${BULK_IMPORT_URL}/jobs/${jobId}/errors/`, { params: queryParams });
        return response.data;
    },
    
    // Download error report
    downloadErrorReport: async (jobId) => {
        const response = await api.get(`${BULK_IMPORT_URL}/jobs/${jobId}/error-report/`, {
            responseType: 'blob'
        });
        return response.data;
    },
    
    // Delete/cancel job
    deleteJob: async (jobId) => {
        const response = await api.delete(`${BULK_IMPORT_URL}/jobs/${jobId}/`);
        return response.data;
    },
    
    // Retry failed job
    retryJob: async (jobId) => {
        const response = await api.post(`${BULK_IMPORT_URL}/jobs/${jobId}/retry/`);
        return response.data;
    },
    
    // Download template
    downloadTemplate: async (format = 'csv') => {
        try {
            const response = await api.get(`${BULK_IMPORT_URL}/template/`, {
                params: { format },
                responseType: 'blob'
            });
            return response.data;
        } catch (error) {
            console.error('API Error downloading template:', error);
            throw error;
        }
    }
};
