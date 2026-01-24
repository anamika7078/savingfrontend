import apiClient from './apiClient';

export const loansApi = {
    getAll: (params) => apiClient.get('/loans', { params }),
    getById: (id) => apiClient.get(`/loans/${id}`),
    create: (loanData) => apiClient.post('/loans', loanData),
    approve: (id) => apiClient.put(`/loans/${id}/approve`),
    disburse: (id, data) => apiClient.put(`/loans/${id}/disburse`, data),
    makeRepayment: (repaymentId, data) => apiClient.post(`/loans/repayments/${repaymentId}`, data),
    getStatistics: () => apiClient.get('/loans/statistics'),
};

export default loansApi;
