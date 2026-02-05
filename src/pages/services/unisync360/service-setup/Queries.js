import api from '../../../../api';

// Consent Services API - All endpoints use /api/ prefix
const CONSENT_SERVICES_ENDPOINT = '/api/unisync360-consent-services';

export const fetchConsentServices = async (params = {}) => {
  try {
    const response = await api.get(CONSENT_SERVICES_ENDPOINT + '/', {
      params,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching consent services:', error);
    throw error;
  }
};

export const getConsentService = async (uid) => {
  try {
    const response = await api.get(`${CONSENT_SERVICES_ENDPOINT}/${uid}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching consent service ${uid}:`, error);
    throw error;
  }
};

export const createConsentService = async (data) => {
  try {
    const response = await api.post(CONSENT_SERVICES_ENDPOINT + '/', data);
    return response.data;
  } catch (error) {
    console.error('Error creating consent service:', error);
    throw error;
  }
};

export const updateConsentService = async (uid, data) => {
  try {
    const response = await api.put(`${CONSENT_SERVICES_ENDPOINT}/${uid}/`, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating consent service ${uid}:`, error);
    throw error;
  }
};

export const deleteConsentService = async (uid) => {
  try {
    const response = await api.delete(`${CONSENT_SERVICES_ENDPOINT}/${uid}/`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting consent service ${uid}:`, error);
    throw error;
  }
};

export const bulkDeleteConsentServices = async (uids) => {
  try {
    const promises = uids.map(uid => deleteConsentService(uid));
    return await Promise.all(promises);
  } catch (error) {
    console.error('Error bulk deleting consent services:', error);
    throw error;
  }
};
