import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (error) => {
        console.error('API Error:', error);
        console.error('Error response:', error.response);
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/auth/login';
        }
        return Promise.reject(error.response?.data || error.message);
    }
);

export const authAPI = {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
    getCurrentUser: () => api.get('/auth/me'),
    updateProfile: (userData) => api.put('/auth/profile', userData),
    changePassword: (passwordData) => api.put('/auth/change-password', passwordData),
    logout: () => api.post('/auth/logout'),
};

export const memberAPI = {
    getAll: (params) => api.get('/members', { params }),
    getById: (id) => api.get(`/members/${id}`),
    create: (memberData) => api.post('/members', memberData),
    update: (id, memberData) => api.put(`/members/${id}`, memberData),
    delete: (id) => api.delete(`/members/${id}`),
    getStatistics: () => api.get('/members/statistics'),
};

export const savingsAPI = {
    getAll: (params) => api.get('/savings', { params }),
    getById: (id) => api.get(`/savings/${id}`),
    create: (savingsData) => api.post('/savings', savingsData),
    createMonthlyEntry: (monthlyData) => api.post('/savings/monthly', monthlyData),
    checkDuplicate: (data) => api.post('/savings/check-duplicate', data),
    getMemberMonthSavings: (memberId, month, year) => api.get(`/savings/member/${memberId}/month/${month}/year/${year}`),
    getAllMonthlySavings: () => api.get('/savings/monthly/all'),
    update: (id, savingsData) => api.put(`/savings/${id}`, savingsData),
    deposit: (id, data) => api.post(`/savings/${id}/deposit`, data),
    withdraw: (id, data) => api.post(`/savings/${id}/withdraw`, data),
    calculateInterest: (id) => api.post(`/savings/${id}/calculate-interest`),
    getStatistics: () => api.get('/savings/statistics'),
};

export const loanAPI = {
    getAll: (params) => api.get('/loans', { params }),
    getById: (id) => api.get(`/loans/${id}`),
    create: (loanData) => api.post('/loans', loanData),
    approve: (id) => api.put(`/loans/${id}/approve`),
    disburse: (id, data) => api.put(`/loans/${id}/disburse`, data),
    makeRepayment: (repaymentId, data) => api.post(`/loans/repayments/${repaymentId}`, data),
    getStatistics: () => api.get('/loans/statistics'),
};

export const repaymentAPI = {
    getAll: (params) => api.get('/repayments', { params }),
    getById: (id) => api.get(`/repayments/${id}`),
    makePayment: (id, data) => api.post(`/repayments/${id}/pay`, data),
    getOverdue: () => api.get('/repayments/overdue'),
    getStatistics: () => api.get('/repayments/statistics'),
    generateSchedule: (loanId) => api.get(`/repayments/schedule/${loanId}`),
    update: (id, data) => api.put(`/repayments/${id}`, data),
};

export const fineAPI = {
    getAll: (params) => api.get('/fines', { params }),
    getById: (id) => api.get(`/fines/${id}`),
    create: (fineData) => api.post('/fines', fineData),
    update: (id, fineData) => api.put(`/fines/${id}`, fineData),
    pay: (id, data) => api.post(`/fines/${id}/pay`, data),
    waive: (id, data) => api.post(`/fines/${id}/waive`, data),
    calculateLateFines: () => api.post('/fines/calculate-late-fines'),
    getStatistics: () => api.get('/fines/statistics'),
};

export const reportAPI = {
    getDashboard: () => api.get('/reports/dashboard'),
    getLoanPerformance: (params) => api.get('/reports/loan-performance', { params }),
    getMemberWise: (memberId) => api.get(`/reports/member-wise/${memberId}`),
    getFinancialSummary: (params) => api.get('/reports/financial-summary', { params }),
    export: (params) => api.get('/reports/export', { params }),
};

export default api;
