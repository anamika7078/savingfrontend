import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://savings-2-ckrp.onrender.com/api';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

// Request interceptor - token removed
apiClient.interceptors.request.use(
    (config) => {
        // Token authentication removed
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('user');
            window.location.href = '/auth/login';
        }

        const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
        return Promise.reject(errorMessage);
    }
);

export default apiClient;
