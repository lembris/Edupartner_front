import { API_BASE_URL } from "../../../../Costants";
import api from "../../../../api";

const API_URL = `${API_BASE_URL}/api`;

// Generic CRUD Helper
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

// Account Types API
export const AccountTypeAPI = createCRUD('unisync360-accounts/account-types');

// Chart of Accounts API
export const ChartOfAccountsAPI = createCRUD('unisync360-accounts/chart-of-accounts');

// Transactions API
export const TransactionAPI = createCRUD('unisync360-accounts/transactions');

// Invoices API
export const InvoiceAPI = createCRUD('unisync360-accounts/invoices');

// Payments API
export const PaymentAPI = createCRUD('unisync360-accounts/payments');

// ============ Transaction Functions ============
export const getTransactions = async (params = {}) => TransactionAPI.getAll(params);
export const getTransaction = async (uid) => TransactionAPI.get(uid);
export const createTransaction = async (data) => TransactionAPI.create(data);
export const updateTransaction = async (uid, data) => TransactionAPI.update(uid, data);
export const deleteTransaction = async (uid) => TransactionAPI.delete(uid);

export const approveTransaction = async (uid, data = {}) => {
    const response = await api.post(`${API_URL}/unisync360-accounts/transactions/${uid}/approve/`, data);
    return response.data;
};

export const rejectTransaction = async (uid, data) => {
    const response = await api.post(`${API_URL}/unisync360-accounts/transactions/${uid}/reject/`, data);
    return response.data;
};

export const postTransaction = async (uid, data = {}) => {
    const response = await api.post(`${API_URL}/unisync360-accounts/transactions/${uid}/post/`, data);
    return response.data;
};

// ============ Invoice Functions ============
export const getInvoices = async (params = {}) => InvoiceAPI.getAll(params);
export const getInvoice = async (uid) => InvoiceAPI.get(uid);
export const createInvoice = async (data) => InvoiceAPI.create(data);
export const updateInvoice = async (uid, data) => InvoiceAPI.update(uid, data);
export const deleteInvoice = async (uid) => InvoiceAPI.delete(uid);

export const sendInvoice = async (uid) => {
    const response = await api.post(`${API_URL}/unisync360-accounts/invoices/${uid}/send/`);
    return response.data;
};

// ============ Payment Functions ============
export const getPayments = async (params = {}) => PaymentAPI.getAll(params);
export const getPayment = async (uid) => PaymentAPI.get(uid);
export const createPayment = async (data) => PaymentAPI.create(data);
export const updatePayment = async (uid, data) => PaymentAPI.update(uid, data);
export const deletePayment = async (uid) => PaymentAPI.delete(uid);

// ============ Chart of Accounts Functions ============
export const getAccounts = async (params = {}) => ChartOfAccountsAPI.getAll(params);
export const getAccount = async (uid) => ChartOfAccountsAPI.get(uid);
export const createAccount = async (data) => ChartOfAccountsAPI.create(data);
export const updateAccount = async (uid, data) => ChartOfAccountsAPI.update(uid, data);
export const deleteAccount = async (uid) => ChartOfAccountsAPI.delete(uid);

// ============ Financial Reports API ============
export const getFinancialReports = async (reportType, params = {}) => {
    const queryParams = new URLSearchParams(params);
    const response = await api.get(`${API_URL}/unisync360-accounts/reports/${reportType}/`, { params: queryParams });
    return response.data;
};

export const exportFinancialReport = async (reportType, params = {}) => {
    const queryParams = new URLSearchParams({ ...params, format: 'csv' });
    const response = await api.get(`${API_URL}/unisync360-accounts/reports/${reportType}/`, {
        params: queryParams,
        responseType: 'blob'
    });
    return response.data;
};
