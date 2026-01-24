import apiClient from './apiClient';

export const authApi = {
    login: (credentials) => apiClient.post('/auth/login', credentials),
    register: (userData) => apiClient.post('/auth/register', userData),
    getCurrentUser: () => apiClient.get('/auth/me'),
    updateProfile: (userData) => apiClient.put('/auth/profile', userData),
    changePassword: (passwordData) => apiClient.put('/auth/change-password', passwordData),
    logout: () => apiClient.post('/auth/logout'),
};

export default authApi;
