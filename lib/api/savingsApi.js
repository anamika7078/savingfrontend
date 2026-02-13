import apiClient from './apiClient';

export const savingsApi = {
    getAll: (params) => apiClient.get('/savings', { params }),
    getById: (id) => apiClient.get(`/savings/${id}`),
    create: (savingsData) => apiClient.post('/savings', savingsData),
    getAllMonthlySavings: (params) => apiClient.get('/savings/monthly/all', { params }),
    checkDuplicate: (data) => apiClient.post('/savings/check-duplicate', data),
    getMemberMonthSavings: (memberId, month, year) => apiClient.get(`/savings/member/${memberId}/month/${month}/year/${year}`),
    createMonthlyEntry: (data) => apiClient.post('/savings/monthly', data),
    update: (id, savingsData) => apiClient.put(`/savings/${id}`, savingsData),
    deposit: (id, data) => apiClient.post(`/savings/${id}/deposit`, data),
    withdraw: (id, data) => apiClient.post(`/savings/${id}/withdraw`, data),
    calculateInterest: (id) => apiClient.post(`/savings/${id}/calculate-interest`),
    getStatistics: () => apiClient.get('/savings/statistics'),
};

export default savingsApi;
