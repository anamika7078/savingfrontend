import axios from 'axios';

// Ensure base URL doesn't have /api suffix since we add it in endpoints
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL 
    ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api$/, '') 
    : 'https://savings-2-ckrp.onrender.com';

console.log('API Base URL:', API_BASE_URL);
console.log('Environment NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        // CRITICAL: Always ensure token is added, even if it wasn't in config
        if (typeof window !== 'undefined') {
            try {
                const token = localStorage.getItem('token');
                if (token) {
                    // Force set the Authorization header
                    config.headers = config.headers || {};
                    config.headers.Authorization = `Bearer ${token}`;
                    console.log('✅ Token found and added to request header');
                    console.log('Token preview:', token.substring(0, 20) + '...');
                    console.log('Request URL:', config.url);
                } else {
                    console.error('❌ No token found in localStorage for request:', config.url);
                    console.error('localStorage contents:', {
                        token: localStorage.getItem('token') ? 'Present' : 'Missing',
                        user: localStorage.getItem('user') ? 'Present' : 'Missing',
                        allKeys: Object.keys(localStorage)
                    });
                    // Don't proceed without token for protected routes
                    if (config.url && !config.url.includes('/auth/login') && !config.url.includes('/auth/register')) {
                        console.error('❌ BLOCKING REQUEST: No token for protected route');
                    }
                }
            } catch (error) {
                console.error('❌ Error accessing localStorage:', error);
            }
        } else {
            console.warn('⚠️ Server-side request, no localStorage available');
        }
        
        // Ensure headers object exists
        config.headers = config.headers || {};
        
        // Log full URL for debugging
        const fullUrl = config.baseURL + config.url;
        console.log('📡 API Request:', config.method?.toUpperCase(), fullUrl);
        console.log('📋 Request headers:', { 
            Authorization: config.headers.Authorization ? 'Bearer ***' : '❌ Not set',
            'Content-Type': config.headers['Content-Type'],
            'Origin': typeof window !== 'undefined' ? window.location.origin : 'Server-side'
        });
        console.log('⚙️ Request config:', { 
            baseURL: config.baseURL, 
            url: config.url, 
            params: config.params,
            hasHeaders: !!config.headers,
            headerKeys: config.headers ? Object.keys(config.headers) : []
        });
        
        // Final verification - check if Authorization header is set
        if (!config.headers.Authorization && typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            if (token) {
                console.warn('⚠️ Authorization header was not set, forcing it now');
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        
        return config;
    },
    (error) => {
        console.error('❌ Request interceptor error:', error);
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        // Log response for debugging
        if (response.config?.url?.includes('savings')) {
            console.log('Savings API Response:', {
                url: response.config.url,
                status: response.status,
                data: response.data
            });
        }
        return response.data;
    },
    (error) => {
        console.error('❌ API Error:', error);
        console.error('Error response:', error.response);
        console.error('Error status:', error.response?.status);
        console.error('Error message:', error.response?.data?.message || error.message);
        console.error('Error config:', {
            url: error.config?.url,
            method: error.config?.method,
            baseURL: error.config?.baseURL,
            headers: {
                Authorization: error.config?.headers?.Authorization ? 'Present' : 'Missing'
            }
        });
        
        if (error.response?.status === 401) {
            console.error('🔒 401 Unauthorized - Clearing token and redirecting to login');
            if (typeof window !== 'undefined') {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/auth/login';
            }
        }
        
        // Return error object with more details
        const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
        const errorData = error.response?.data || { message: errorMessage };
        return Promise.reject(errorData);
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
    getAll: (params) => api.get('/api/members', { params }),
    getById: (id) => api.get(`/api/members/${id}`),
    create: (memberData) => api.post('/api/members', memberData),
    update: (id, memberData) => api.put(`/api/members/${id}`, memberData),
    delete: (id) => api.delete(`/api/members/${id}`),
    getStatistics: () => api.get('/api/members/statistics'),
};

export const savingsAPI = {
    getAll: (params) => api.get('/api/savings', { params }),
    getById: (id) => api.get(`/api/savings/${id}`),
    create: (savingsData) => api.post('/api/savings', savingsData),
    getAllMonthlySavings: (params) => api.get('/api/savings/monthly/all', { params }),
    update: (id, savingsData) => api.put(`/api/savings/${id}`, savingsData),
    deposit: (id, data) => api.post(`/api/savings/${id}/deposit`, data),
    withdraw: (id, data) => api.post(`/api/savings/${id}/withdraw`, data),
    calculateInterest: (id) => api.post(`/api/savings/${id}/calculate-interest`),
    getStatistics: () => api.get('/api/savings/statistics'),
};

export const loanAPI = {
    getAll: (params) => api.get('/api/loans', { params }),
    getById: (id) => api.get(`/api/loans/${id}`),
    create: (loanData) => api.post('/api/loans', loanData),
    approve: (id) => api.put(`/api/loans/${id}/approve`),
    disburse: (id, data) => api.put(`/api/loans/${id}/disburse`, data),
    makeRepayment: (repaymentId, data) => api.post(`/api/loans/repayments/${repaymentId}`, data),
    getStatistics: () => api.get('/api/loans/statistics'),
};

export const repaymentAPI = {
    getAll: (params) => api.get('/api/repayments', { params }),
    getById: (id) => api.get(`/api/repayments/${id}`),
    makePayment: (id, data) => api.post(`/api/repayments/${id}/pay`, data),
    getOverdue: () => api.get('/api/repayments/overdue'),
    getStatistics: () => api.get('/api/repayments/statistics'),
    generateSchedule: (loanId) => api.get(`/api/repayments/schedule/${loanId}`),
    update: (id, data) => api.put(`/api/repayments/${id}`, data),
};

export const fineAPI = {
    getAll: (params) => api.get('/api/fines', { params }),
    getById: (id) => api.get(`/api/fines/${id}`),
    create: (fineData) => api.post('/api/fines', fineData),
    update: (id, fineData) => api.put(`/api/fines/${id}`, fineData),
    pay: (id, data) => api.post(`/api/fines/${id}/pay`, data),
    waive: (id, data) => api.post(`/api/fines/${id}/waive`, data),
    calculateLateFines: () => api.post('/api/fines/calculate-late-fines'),
    getStatistics: () => api.get('/api/fines/statistics'),
};

export const reportAPI = {
    getDashboard: () => api.get('/api/reports/dashboard'),
    getLoanPerformance: (params) => api.get('/api/reports/loan-performance', { params }),
    getMemberWise: (memberId) => api.get(`/api/reports/member-wise/${memberId}`),
    getFinancialSummary: (params) => api.get('/api/reports/financial-summary', { params }),
    export: (params) => api.get('/api/reports/export', { params }),
};

export default api;
