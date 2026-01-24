import apiClient from './apiClient';

export const repaymentApi = {
    getAll: (params) => apiClient.get('/repayments', { params }),
    getById: (id) => apiClient.get(`/repayments/${id}`),
    create: (repaymentData) => apiClient.post('/repayments', repaymentData),
    update: (id, repaymentData) => apiClient.put(`/repayments/${id}`, repaymentData),
    delete: (id) => apiClient.delete(`/repayments/${id}`),
    getByLoanId: (loanId) => apiClient.get(`/repayments/loan/${loanId}`),
    getHistory: (memberId) => apiClient.get(`/repayments/history/${memberId}`),
};

export default repaymentApi;
