import api from "../../api";
import { API_BASE_URL } from "../../Costants";

const BASE_URL = `${API_BASE_URL}/api/clinic360`;

const clinic360Api = {
  // Patient APIs
  getPatients: (params = {}) => api.get(`${BASE_URL}/patients/`, { params }),
  getPatient: (uid) => api.get(`${BASE_URL}/patients/${uid}/`),
  createPatient: (data) => api.post(`${BASE_URL}/patients/`, data),
  updatePatient: (uid, data) => api.put(`${BASE_URL}/patients/${uid}/`, data),
  deletePatient: (uid) => api.delete(`${BASE_URL}/patients/${uid}/`),

  // Visit APIs
  getVisits: (params = {}) => api.get(`${BASE_URL}/visits/`, { params }),
  getVisit: (uid) => api.get(`${BASE_URL}/visits/${uid}/`),
  createVisit: (data) => api.post(`${BASE_URL}/visits/`, data),
  updateVisit: (uid, data) => api.put(`${BASE_URL}/visits/${uid}/`, data),

  // Vital Signs APIs
  getVitals: (params = {}) => api.get(`${BASE_URL}/vitals/`, { params }),
  getVital: (uid) => api.get(`${BASE_URL}/vitals/${uid}/`),
  createVital: (data) => api.post(`${BASE_URL}/vitals/`, data),
  updateVital: (uid, data) => api.put(`${BASE_URL}/vitals/${uid}/`, data),

  // Diagnosis APIs
  getDiagnoses: (params = {}) => api.get(`${BASE_URL}/diagnoses/`, { params }),
  getDiagnosis: (uid) => api.get(`${BASE_URL}/diagnoses/${uid}/`),
  createDiagnosis: (data) => api.post(`${BASE_URL}/diagnoses/`, data),
  updateDiagnosis: (uid, data) => api.put(`${BASE_URL}/diagnoses/${uid}/`, data),

  // Consultation APIs
  getConsultations: (params = {}) => api.get(`${BASE_URL}/consultations/`, { params }),
  getConsultation: (uid) => api.get(`${BASE_URL}/consultations/${uid}/`),
  createConsultation: (data) => api.post(`${BASE_URL}/consultations/`, data),

  // Lab Order APIs
  getLabOrders: (params = {}) => api.get(`${BASE_URL}/lab-orders/`, { params }),
  getLabOrder: (uid) => api.get(`${BASE_URL}/lab-orders/${uid}/`),
  createLabOrder: (data) => api.post(`${BASE_URL}/lab-orders/`, data),
  updateLabOrder: (uid, data) => api.put(`${BASE_URL}/lab-orders/${uid}/`, data),

  getLabOrderItems: (params = {}) => api.get(`${BASE_URL}/lab-order-items/`, { params }),
  getLabOrderItem: (uid) => api.get(`${BASE_URL}/lab-order-items/${uid}/`),
  createLabOrderItem: (data) => api.post(`${BASE_URL}/lab-order-items/`, data),
  updateLabOrderItem: (uid, data) => api.put(`${BASE_URL}/lab-order-items/${uid}/`, data),

  getLabResults: (params = {}) => api.get(`${BASE_URL}/lab-results/`, { params }),
  getLabResult: (uid) => api.get(`${BASE_URL}/lab-results/${uid}/`),
  createLabResult: (data) => api.post(`${BASE_URL}/lab-results/`, data),
  updateLabResult: (uid, data) => api.put(`${BASE_URL}/lab-results/${uid}/`, data),

  // Prescription APIs
  getPrescriptions: (params = {}) => api.get(`${BASE_URL}/prescriptions/`, { params }),
  getPrescription: (uid) => api.get(`${BASE_URL}/prescriptions/${uid}/`),
  createPrescription: (data) => api.post(`${BASE_URL}/prescriptions/`, data),
  updatePrescription: (uid, data) => api.put(`${BASE_URL}/prescriptions/${uid}/`, data),

  getPrescriptionItems: (params = {}) => api.get(`${BASE_URL}/prescription-items/`, { params }),
  getPrescriptionItem: (uid) => api.get(`${BASE_URL}/prescription-items/${uid}/`),
  createPrescriptionItem: (data) => api.post(`${BASE_URL}/prescription-items/`, data),
  updatePrescriptionItem: (uid, data) => api.put(`${BASE_URL}/prescription-items/${uid}/`, data),

  getDispensations: (params = {}) => api.get(`${BASE_URL}/dispensations/`, { params }),
  getDispensation: (uid) => api.get(`${BASE_URL}/dispensations/${uid}/`),
  createDispensation: (data) => api.post(`${BASE_URL}/dispensations/`, data),
  updateDispensation: (uid, data) => api.put(`${BASE_URL}/dispensations/${uid}/`, data),

  // Queue APIs
  getQueueStations: (params = {}) => api.get(`${BASE_URL}/queue-stations/`, { params }),
  getQueueStation: (uid) => api.get(`${BASE_URL}/queue-stations/${uid}/`),
  createQueueStation: (data) => api.post(`${BASE_URL}/queue-stations/`, data),
  updateQueueStation: (uid, data) => api.put(`${BASE_URL}/queue-stations/${uid}/`, data),

  getQueueEntries: (params = {}) => api.get(`${BASE_URL}/queue-entries/`, { params }),
  getQueueEntry: (uid) => api.get(`${BASE_URL}/queue-entries/${uid}/`),
  createQueueEntry: (data) => api.post(`${BASE_URL}/queue-entries/`, data),
  updateQueueEntry: (uid, data) => api.put(`${BASE_URL}/queue-entries/${uid}/`, data),

  getQueueTokens: (params = {}) => api.get(`${BASE_URL}/queue-tokens/`, { params }),
  getQueueToken: (uid) => api.get(`${BASE_URL}/queue-tokens/${uid}/`),
  createQueueToken: (data) => api.post(`${BASE_URL}/queue-tokens/`, data),
  updateQueueToken: (uid, data) => api.put(`${BASE_URL}/queue-tokens/${uid}/`, data),

  // Insurance APIs
  getInsuranceProviders: (params = {}) => api.get(`${BASE_URL}/insurance-providers/`, { params }),
  getInsuranceProvider: (uid) => api.get(`${BASE_URL}/insurance-providers/${uid}/`),
  createInsuranceProvider: (data) => api.post(`${BASE_URL}/insurance-providers/`, data),
  updateInsuranceProvider: (uid, data) => api.put(`${BASE_URL}/insurance-providers/${uid}/`, data),

  getInsurancePlans: (params = {}) => api.get(`${BASE_URL}/insurance-plans/`, { params }),
  getInsurancePlan: (uid) => api.get(`${BASE_URL}/insurance-plans/${uid}/`),
  createInsurancePlan: (data) => api.post(`${BASE_URL}/insurance-plans/`, data),
  updateInsurancePlan: (uid, data) => api.put(`${BASE_URL}/insurance-plans/${uid}/`, data),

  getInsurancePolicies: (params = {}) => api.get(`${BASE_URL}/insurance-policies/`, { params }),
  getInsurancePolicy: (uid) => api.get(`${BASE_URL}/insurance-policies/${uid}/`),
  createInsurancePolicy: (data) => api.post(`${BASE_URL}/insurance-policies/`, data),
  updateInsurancePolicy: (uid, data) => api.put(`${BASE_URL}/insurance-policies/${uid}/`, data),

  getInsuranceClaims: (params = {}) => api.get(`${BASE_URL}/insurance-claims/`, { params }),
  getInsuranceClaim: (uid) => api.get(`${BASE_URL}/insurance-claims/${uid}/`),
  createInsuranceClaim: (data) => api.post(`${BASE_URL}/insurance-claims/`, data),
  updateInsuranceClaim: (uid, data) => api.put(`${BASE_URL}/insurance-claims/${uid}/`, data),

  getPreAuthorizations: (params = {}) => api.get(`${BASE_URL}/pre-authorizations/`, { params }),
  getPreAuthorization: (uid) => api.get(`${BASE_URL}/pre-authorizations/${uid}/`),
  createPreAuthorization: (data) => api.post(`${BASE_URL}/pre-authorizations/`, data),
  updatePreAuthorization: (uid, data) => api.put(`${BASE_URL}/pre-authorizations/${uid}/`, data),

  // Billing APIs
  getPayments: (params = {}) => api.get(`${BASE_URL}/payments/`, { params }),
  getPayment: (uid) => api.get(`${BASE_URL}/payments/${uid}/`),
  createPayment: (data) => api.post(`${BASE_URL}/payments/`, data),
  updatePayment: (uid, data) => api.put(`${BASE_URL}/payments/${uid}/`, data),

  // Configuration APIs
  getCodeFormats: (params = {}) => api.get(`${BASE_URL}/code-formats/`, { params }),
  getCodeFormat: (uid) => api.get(`${BASE_URL}/code-formats/${uid}/`),
  createCodeFormat: (data) => api.post(`${BASE_URL}/code-formats/`, data),
  updateCodeFormat: (uid, data) => api.put(`${BASE_URL}/code-formats/${uid}/`, data),
};

export default clinic360Api;
