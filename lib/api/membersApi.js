import apiClient from './apiClient';

export const membersApi = {
    getAll: (params) => apiClient.get('/members', { params }),
    getById: (id) => apiClient.get(`/members/${id}`),
    create: (memberData) => apiClient.post('/members', memberData),
    update: (id, memberData) => apiClient.put(`/members/${id}`, memberData),
    delete: (id) => apiClient.delete(`/members/${id}`),
    getStatistics: () => apiClient.get('/members/statistics'),
};

export default membersApi;
