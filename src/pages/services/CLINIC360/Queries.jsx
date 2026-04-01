import { API_BASE_URL } from "../../../Costants";
import api from "../../../api";

const API_URL = `${API_BASE_URL}/api`;

const setConfig = (filter = {}, signal = null) => {
  const cleanedFilter = Object.fromEntries(
    Object.entries(filter).filter(
      ([_, value]) => value !== "" && value !== null && value !== undefined
    )
  );

  const config = {
    headers: { "Content-Type": "application/json" },
    params: cleanedFilter,
  };

  if (signal) {
    config.signal = signal;
  }

  return config;
};

export const fetchData = async ({
  url = "/",
  uid = "",
  filter = {},
  isFullPath = false,
  signal = null,
}) => {
  if (!url) {
    throw new Error("URL is required for fetching data");
  }

  try {
    const response = await api.get(
      `${isFullPath ? API_BASE_URL : API_URL}${url}${uid ? `/${uid}` : ""}`,
      uid ? (signal ? { signal } : {}) : setConfig(filter, signal)
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createUpdateData = async ({
  url = "/",
  uid = "",
  formData = {},
  filter = {},
  isFullPath = false,
}) => {
  if (!url) {
    throw new Error("URL is required for fetching data");
  }
  if (!formData) {
    throw new Error("Form data is required for creating or updating");
  }
  try {
    const response = await api.post(
      `${isFullPath ? API_BASE_URL : API_URL}${url}${uid ? `/${uid}` : ""}`,
      formData,
      setConfig(filter)
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteData = async ({
  url = "/",
  uid = "",
  filter = {},
  isFullPath = false,
}) => {
  if (!url) {
    throw new Error("URL is required for Delete data");
  }

  try {
    const response = await api.delete(
      `${isFullPath ? API_BASE_URL : API_URL}${url}${uid ? `/${uid}` : ""}`,
      uid ? {} : setConfig(filter)
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ============ Dashboard API ============
export const clinicDashboardService = {
  getAllDashboardData: async () => {
    try {
      const response = await api.get(`${API_URL}/clinic360-dashboard/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching clinic dashboard data:', error);
      throw error;
    }
  },
};

// ============ Generic CRUD Helper ============
const createCRUD = (endpoint) => ({
  getAll: async (params = {}) => {
    const queryParams = new URLSearchParams(params);
    const response = await api.get(`${API_URL}/${endpoint}/`, { params: queryParams });
    return response.data;
  },
  get: async (uid) => {
    const response = await api.get(`${API_URL}/${endpoint}/${uid}/`);
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

// ============ Patient API ============
export const PatientAPI = createCRUD('clinic360-patients');

export const getPatients = async ({ search = "", pagination = {} } = {}) => {
  try {
    let url = `${API_URL}/clinic360-patients/`;
    const params = new URLSearchParams();

    if (search) params.append("search", search);
    Object.keys(pagination).forEach(key => params.append(key, pagination[key]));

    const response = await api.get(url, { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching patients:", error);
    throw error;
  }
};

export const getPatient = async (uid) => {
  try {
    const response = await api.get(`${API_URL}/clinic360-patients/${uid}/`);
    return response.data;
  } catch (error) {
    console.error("Error fetching patient:", error);
    if (error.response?.data) {
      return error.response.data;
    }
    throw error;
  }
};

export const createPatient = async (data) => {
  try {
    const response = await api.post(`${API_URL}/clinic360-patients/`, data);
    return response.data;
  } catch (error) {
    console.error("Error creating patient:", error);
    if (error.response?.data) {
      return error.response.data;
    }
    throw error;
  }
};

export const updatePatient = async (uid, data) => {
  try {
    const response = await api.patch(`${API_URL}/clinic360-patients/${uid}/`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating patient:", error);
    if (error.response?.data) {
      return error.response.data;
    }
    throw error;
  }
};

export const deletePatient = async (uid) => {
  try {
    const response = await api.delete(`${API_URL}/clinic360-patients/${uid}/`);
    return response.data;
  } catch (error) {
    console.error("Error deleting patient:", error);
    throw error;
  }
};

// ============ Visit API ============
export const VisitAPI = createCRUD('clinic360-visits');

export const getVisits = async ({ search = "", pagination = {} } = {}) => {
  try {
    let url = `${API_URL}/clinic360-visits/`;
    const params = new URLSearchParams();

    if (search) params.append("search", search);
    Object.keys(pagination).forEach(key => params.append(key, pagination[key]));

    const response = await api.get(url, { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching visits:", error);
    throw error;
  }
};

export const createVisit = async (data) => {
  try {
    const response = await api.post(`${API_URL}/clinic360-visits/`, data);
    return response.data;
  } catch (error) {
    console.error("Error creating visit:", error);
    if (error.response?.data) {
      return error.response.data;
    }
    throw error;
  }
};

export const updateVisit = async (uid, data) => {
  try {
    const response = await api.patch(`${API_URL}/clinic360-visits/${uid}/`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating visit:", error);
    if (error.response?.data) {
      return error.response.data;
    }
    throw error;
  }
};

// ============ Queue Station API ============
export const QueueStationAPI = createCRUD('clinic360-queue/stations');

export const getQueueStations = async ({ search = "", pagination = {} } = {}) => {
  try {
    let url = `${API_URL}/clinic360-queue/stations/`;
    const params = new URLSearchParams();

    if (search) params.append("search", search);
    Object.keys(pagination).forEach(key => params.append(key, pagination[key]));

    const response = await api.get(url, { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching queue stations:", error);
    throw error;
  }
};

export const createQueueStation = async (data) => {
  try {
    const response = await api.post(`${API_URL}/clinic360-queue/stations/`, data);
    return response.data;
  } catch (error) {
    console.error("Error creating queue station:", error);
    if (error.response?.data) {
      return error.response.data;
    }
    throw error;
  }
};

export const updateQueueStation = async (uid, data) => {
  try {
    const response = await api.patch(`${API_URL}/clinic360-queue/stations/${uid}/`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating queue station:", error);
    if (error.response?.data) {
      return error.response.data;
    }
    throw error;
  }
};

// ============ Queue Entry API ============
export const QueueEntryAPI = createCRUD('clinic360-queue/entries');

export const getQueueEntries = async ({ search = "", pagination = {} } = {}) => {
  try {
    let url = `${API_URL}/clinic360-queue/entries/`;
    const params = new URLSearchParams();

    if (search) params.append("search", search);
    Object.keys(pagination).forEach(key => params.append(key, pagination[key]));

    const response = await api.get(url, { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching queue entries:", error);
    throw error;
  }
};

export const createQueueEntry = async (data) => {
  try {
    const response = await api.post(`${API_URL}/clinic360-queue/entries/`, data);
    return response.data;
  } catch (error) {
    console.error("Error creating queue entry:", error);
    if (error.response?.data) {
      return error.response.data;
    }
    throw error;
  }
};

export const updateQueueEntry = async (uid, data) => {
  try {
    const response = await api.patch(`${API_URL}/clinic360-queue/entries/${uid}/`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating queue entry:", error);
    if (error.response?.data) {
      return error.response.data;
    }
    throw error;
  }
};

// ============ Queue Token API ============
export const QueueTokenAPI = createCRUD('clinic360-queue/tokens');

// ============ Vital Signs API ============
export const VitalSignAPI = createCRUD('clinic360-clinical/vitals');

export const getVitals = async ({ search = "", pagination = {} } = {}) => {
  try {
    let url = `${API_URL}/clinic360-clinical/vitals/`;
    const params = new URLSearchParams();

    if (search) params.append("search", search);
    Object.keys(pagination).forEach(key => params.append(key, pagination[key]));

    const response = await api.get(url, { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching vital signs:", error);
    throw error;
  }
};

export const createVital = async (data) => {
  try {
    const response = await api.post(`${API_URL}/clinic360-clinical/vitals/`, data);
    return response.data;
  } catch (error) {
    console.error("Error creating vital sign:", error);
    if (error.response?.data) {
      return error.response.data;
    }
    throw error;
  }
};

export const updateVital = async (uid, data) => {
  try {
    const response = await api.patch(`${API_URL}/clinic360-clinical/vitals/${uid}/`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating vital sign:", error);
    if (error.response?.data) {
      return error.response.data;
    }
    throw error;
  }
};

// ============ Diagnosis API ============
export const DiagnosisAPI = createCRUD('clinic360-clinical/diagnoses');

export const getDiagnoses = async ({ search = "", pagination = {} } = {}) => {
  try {
    let url = `${API_URL}/clinic360-clinical/diagnoses/`;
    const params = new URLSearchParams();

    if (search) params.append("search", search);
    Object.keys(pagination).forEach(key => params.append(key, pagination[key]));

    const response = await api.get(url, { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching diagnoses:", error);
    throw error;
  }
};

export const createDiagnosis = async (data) => {
  try {
    const response = await api.post(`${API_URL}/clinic360-clinical/diagnoses/`, data);
    return response.data;
  } catch (error) {
    console.error("Error creating diagnosis:", error);
    if (error.response?.data) {
      return error.response.data;
    }
    throw error;
  }
};

export const updateDiagnosis = async (uid, data) => {
  try {
    const response = await api.patch(`${API_URL}/clinic360-clinical/diagnoses/${uid}/`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating diagnosis:", error);
    if (error.response?.data) {
      return error.response.data;
    }
    throw error;
  }
};

// ============ Consultation API ============
export const ConsultationAPI = createCRUD('clinic360-clinical/consultations');

export const getConsultations = async ({ search = "", pagination = {} } = {}) => {
  try {
    let url = `${API_URL}/clinic360-clinical/consultations/`;
    const params = new URLSearchParams();

    if (search) params.append("search", search);
    Object.keys(pagination).forEach(key => params.append(key, pagination[key]));

    const response = await api.get(url, { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching consultations:", error);
    throw error;
  }
};

export const createConsultation = async (data) => {
  try {
    const response = await api.post(`${API_URL}/clinic360-clinical/consultations/`, data);
    return response.data;
  } catch (error) {
    console.error("Error creating consultation:", error);
    if (error.response?.data) {
      return error.response.data;
    }
    throw error;
  }
};

export const updateConsultation = async (uid, data) => {
  try {
    const response = await api.patch(`${API_URL}/clinic360-clinical/consultations/${uid}/`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating consultation:", error);
    if (error.response?.data) {
      return error.response.data;
    }
    throw error;
  }
};

// ============ Lab Order API ============
export const LabOrderAPI = createCRUD('clinic360-lab/lab-orders');

export const getLabOrders = async ({ search = "", pagination = {} } = {}) => {
  try {
    let url = `${API_URL}/clinic360-lab/lab-orders/`;
    const params = new URLSearchParams();

    if (search) params.append("search", search);
    Object.keys(pagination).forEach(key => params.append(key, pagination[key]));

    const response = await api.get(url, { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching lab orders:", error);
    throw error;
  }
};

export const createLabOrder = async (data) => {
  try {
    const response = await api.post(`${API_URL}/clinic360-lab/lab-orders/`, data);
    return response.data;
  } catch (error) {
    console.error("Error creating lab order:", error);
    if (error.response?.data) {
      return error.response.data;
    }
    throw error;
  }
};

export const createLabOrderItem = async (data) => {
  try {
    const response = await api.post(`${API_URL}/clinic360-lab/lab-order-items/`, data);
    return response.data;
  } catch (error) {
    console.error("Error creating lab order item:", error);
    if (error.response?.data) {
      return error.response.data;
    }
    throw error;
  }
};

// ============ Lab Order Item API ============
export const LabOrderItemAPI = createCRUD('clinic360-lab/lab-order-items');

export const getLabOrderItems = async ({ search = "", pagination = {} } = {}) => {
  try {
    let url = `${API_URL}/clinic360-lab/lab-order-items/`;
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    Object.keys(pagination).forEach(key => params.append(key, pagination[key]));
    const response = await api.get(url, { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching lab order items:", error);
    throw error;
  }
};

// ============ Lab Result API ============
export const LabResultAPI = createCRUD('clinic360-lab/lab-results');

export const getLabResults = async ({ search = "", pagination = {} } = {}) => {
  try {
    let url = `${API_URL}/clinic360-lab/lab-results/`;
    const params = new URLSearchParams();

    if (search) params.append("search", search);
    Object.keys(pagination).forEach(key => params.append(key, pagination[key]));

    const response = await api.get(url, { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching lab results:", error);
    throw error;
  }
};

// ============ Prescription API ============
export const PrescriptionAPI = createCRUD('clinic360-pharmacy/prescriptions');

export const getPrescriptions = async ({ search = "", pagination = {} } = {}) => {
  try {
    let url = `${API_URL}/clinic360-pharmacy/prescriptions/`;
    const params = new URLSearchParams();

    if (search) params.append("search", search);
    Object.keys(pagination).forEach(key => params.append(key, pagination[key]));

    const response = await api.get(url, { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching prescriptions:", error);
    throw error;
  }
};

export const createPrescription = async (data) => {
  try {
    const response = await api.post(`${API_URL}/clinic360-pharmacy/prescriptions/`, data);
    return response.data;
  } catch (error) {
    console.error("Error creating prescription:", error);
    if (error.response?.data) {
      return error.response.data;
    }
    throw error;
  }
};

export const createPrescriptionItem = async (data) => {
  try {
    const response = await api.post(`${API_URL}/clinic360-pharmacy/prescription-items/`, data);
    return response.data;
  } catch (error) {
    console.error("Error creating prescription item:", error);
    if (error.response?.data) {
      return error.response.data;
    }
    throw error;
  }
};

// ============ Prescription Item API ============
export const PrescriptionItemAPI = createCRUD('clinic360-pharmacy/prescription-items');

export const getPrescriptionItems = async ({ search = "", pagination = {} } = {}) => {
  try {
    let url = `${API_URL}/clinic360-pharmacy/prescription-items/`;
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    Object.keys(pagination).forEach(key => params.append(key, pagination[key]));
    const response = await api.get(url, { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching prescription items:", error);
    throw error;
  }
};

// ============ Dispensation API ============
export const DispensationAPI = createCRUD('clinic360-pharmacy/dispensations');

export const getDispensations = async ({ search = "", pagination = {} } = {}) => {
  try {
    let url = `${API_URL}/clinic360-pharmacy/dispensations/`;
    const params = new URLSearchParams();

    if (search) params.append("search", search);
    Object.keys(pagination).forEach(key => params.append(key, pagination[key]));

    const response = await api.get(url, { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching dispensations:", error);
    throw error;
  }
};

// ============ Pharmacy Inventory API ============
export const ProductAPI = createCRUD('clinic360-pharmacy/products');

export const getPharmacyProducts = async ({ search = "", pagination = {} } = {}) => {
  try {
    const url = `${API_URL}/clinic360-pharmacy/products/`;
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    Object.keys(pagination).forEach((key) => params.append(key, pagination[key]));
    const response = await api.get(url, { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching pharmacy products:", error);
    throw error;
  }
};

// ============ Insurance API ============
export const InsuranceProviderAPI = createCRUD('clinic360-insurance/providers');
export const InsurancePlanAPI = createCRUD('clinic360-insurance/plans');
export const InsurancePolicyAPI = createCRUD('clinic360-insurance/policies');
export const InsuranceClaimAPI = createCRUD('clinic360-insurance/claims');
export const PreAuthorizationAPI = createCRUD('clinic360-insurance/pre-authorizations');

export const getInsuranceProviders = async ({ search = "", pagination = {} } = {}) => {
  try {
    let url = `${API_URL}/clinic360-insurance/providers/`;
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    Object.keys(pagination).forEach(key => params.append(key, pagination[key]));
    const response = await api.get(url, { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching insurance providers:", error);
    throw error;
  }
};

export const getInsurancePlans = async ({ search = "", pagination = {} } = {}) => {
  try {
    let url = `${API_URL}/clinic360-insurance/plans/`;
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    Object.keys(pagination).forEach(key => params.append(key, pagination[key]));
    const response = await api.get(url, { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching insurance plans:", error);
    throw error;
  }
};

export const getInsurancePolicies = async ({ search = "", pagination = {} } = {}) => {
  try {
    let url = `${API_URL}/clinic360-insurance/policies/`;
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    Object.keys(pagination).forEach(key => params.append(key, pagination[key]));
    const response = await api.get(url, { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching insurance policies:", error);
    throw error;
  }
};

export const getInsuranceClaims = async ({ search = "", pagination = {} } = {}) => {
  try {
    let url = `${API_URL}/clinic360-insurance/claims/`;
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    Object.keys(pagination).forEach(key => params.append(key, pagination[key]));
    const response = await api.get(url, { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching insurance claims:", error);
    throw error;
  }
};

// ============ Payment API ============
export const PaymentAPI = createCRUD('clinic360-billing/payments');

export const getPayments = async ({ search = "", pagination = {} } = {}) => {
  try {
    let url = `${API_URL}/clinic360-billing/payments/`;
    const params = new URLSearchParams();

    if (search) params.append("search", search);
    Object.keys(pagination).forEach(key => params.append(key, pagination[key]));

    const response = await api.get(url, { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching payments:", error);
    throw error;
  }
};

export const createPayment = async (data) => {
  try {
    const response = await api.post(`${API_URL}/clinic360-billing/payments/`, data);
    return response.data;
  } catch (error) {
    console.error("Error creating payment:", error);
    if (error.response?.data) {
      return error.response.data;
    }
    throw error;
  }
};

export const updatePayment = async (uid, data) => {
  try {
    const response = await api.patch(`${API_URL}/clinic360-billing/payments/${uid}/`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating payment:", error);
    if (error.response?.data) {
      return error.response.data;
    }
    throw error;
  }
};

// ============ Configuration API ============
export const CodeFormatAPI = createCRUD('clinic360-settings/code-formats');

export const getCodeFormats = async ({ search = "", pagination = {} } = {}) => {
  try {
    let url = `${API_URL}/clinic360-settings/code-formats/`;
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    Object.keys(pagination).forEach(key => params.append(key, pagination[key]));
    const response = await api.get(url, { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching code formats:", error);
    throw error;
  }
};

// ============ Service Price / Lab Test Catalog API ============
export const ServicePriceAPI = createCRUD('clinic360-services/prices');

export const getServicePrices = async ({ search = "", service_type = "", pagination = {} } = {}) => {
  try {
    let url = `${API_URL}/clinic360-services/prices/`;
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (service_type) params.append("service_type", service_type);
    Object.keys(pagination).forEach(key => params.append(key, pagination[key]));
    const response = await api.get(url, { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching service prices:", error);
    throw error;
  }
};

// ============ Lab Test Catalog (LabTest model) ============
export const LabTestAPI = createCRUD('clinic360-lab/lab-tests');

export const getLabTests = async ({ search = "", category = "", pagination = {} } = {}) => {
  try {
    let url = `${API_URL}/clinic360-lab/lab-tests/`;
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (category) params.append("category", category);
    Object.keys(pagination).forEach(key => params.append(key, pagination[key]));
    const response = await api.get(url, { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching lab tests:", error);
    throw error;
  }
};

export default {
  fetchData,
  createUpdateData,
  deleteData,
  clinicDashboardService,
  PatientAPI,
  VisitAPI,
  QueueStationAPI,
  QueueEntryAPI,
  QueueTokenAPI,
  VitalSignAPI,
  DiagnosisAPI,
  ConsultationAPI,
  LabOrderAPI,
  LabOrderItemAPI,
  LabResultAPI,
  LabTestAPI,
  PrescriptionAPI,
  PrescriptionItemAPI,
  DispensationAPI,
  ProductAPI,
  InsuranceProviderAPI,
  InsurancePlanAPI,
  InsurancePolicyAPI,
  InsuranceClaimAPI,
  PreAuthorizationAPI,
  PaymentAPI,
  CodeFormatAPI,
  ServicePriceAPI,
};
