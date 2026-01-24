import apiClient from './apiClient';

export const fineApi = {
    getAll: (params) => apiClient.get('/fines', { params }),
    getById: (id) => apiClient.get(`/fines/${id}`),
    create: (fineData) => apiClient.post('/fines', fineData),
    update: (id, fineData) => apiClient.put(`/fines/${id}`, fineData),
    pay: (id, data) => apiClient.post(`/fines/${id}/pay`, data),
    waive: (id, data) => apiClient.post(`/fines/${id}/waive`, data),
    calculateLateFines: () => apiClient.post('/fines/calculate-late-fines'),
    getStatistics: () => apiClient.get('/fines/statistics'),
};

export default fineApi;
