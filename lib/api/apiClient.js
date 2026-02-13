import axios from 'axios';

/**
 * Normalise API base URL so that:
 * - If the env var already includes `/api`, we keep it
 * - If it doesn't, we append `/api`
 * - We remove trailing slashes to avoid `//api`
 *
 * This keeps this client consistently pointing at the `/api` namespace
 * regardless of how `NEXT_PUBLIC_API_URL` is configured.
 */
const normaliseApiBaseUrl = (rawUrl) => {
    const fallback = 'https://savings-2-ckrp.onrender.com/api';
    let url = (rawUrl || fallback).trim();

    // Remove trailing slashes
    url = url.replace(/\/+$/, '');

    // Ensure it ends with `/api`
    if (!url.toLowerCase().endsWith('/api')) {
        url = `${url}/api`;
    }

    return url;
};

const API_BASE_URL = normaliseApiBaseUrl(process.env.NEXT_PUBLIC_API_URL);

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
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

// Response interceptor for error handling
apiClient.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/auth/login';
        }

        const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
        return Promise.reject(errorMessage);
    }
);

export default apiClient;
