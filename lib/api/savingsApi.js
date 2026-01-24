import apiClient from './apiClient';

export const savingsApi = {
    getAll: (params) => apiClient.get('/savings', { params }),
    getById: (id) => apiClient.get(`/savings/${id}`),
    create: (savingsData) => apiClient.post('/savings', savingsData),
    update: (id, savingsData) => apiClient.put(`/savings/${id}`, savingsData),
    deposit: (id, data) => apiClient.post(`/savings/${id}/deposit`, data),
    withdraw: (id, data) => apiClient.post(`/savings/${id}/withdraw`, data),
    calculateInterest: (id) => apiClient.post(`/savings/${id}/calculate-interest`),
    getStatistics: () => apiClient.get('/savings/statistics'),
};

export default savingsApi;
