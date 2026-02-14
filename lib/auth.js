import { authAPI } from './api';

export const isAuthenticated = () => {
    if (typeof window === 'undefined') return false;
    const token = localStorage.getItem('token');
    return !!token;
};

export const getCurrentUser = () => {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
};

export const getAuthToken = () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
};

export const setAuthData = (token, user) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
};

export const clearAuthData = () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};

export const login = async (credentials) => {
    try {
        console.log('🔐 Login attempt with credentials:', { username: credentials.username });
        const response = await authAPI.login(credentials);
        console.log('🔐 Login API response:', response);
        
        // Handle different response structures
        let token, user;
        if (response.success && response.data) {
            token = response.data.token;
            user = response.data.user;
        } else if (response.token) {
            // Direct token in response
            token = response.token;
            user = response.user;
        } else if (response.data && response.data.token) {
            // Nested data structure
            token = response.data.token;
            user = response.data.user;
        }
        
        if (token) {
            console.log('✅ Token received, storing in localStorage');
            console.log('Token preview:', token.substring(0, 20) + '...');
            setAuthData(token, user);
            console.log('✅ Token stored successfully');
            console.log('Verifying storage:', {
                token: localStorage.getItem('token') ? 'Present' : 'Missing',
                user: localStorage.getItem('user') ? 'Present' : 'Missing'
            });
            return { token, user };
        } else {
            console.error('❌ No token in response:', response);
            throw new Error('No token received from server');
        }
    } catch (error) {
        console.error('❌ Login error:', error);
        throw error;
    }
};

export const register = async (userData) => {
    try {
        console.log('Registration data being sent:', userData);
        const response = await authAPI.register(userData);
        console.log('Registration response:', response);
        if (response.success) {
            setAuthData(response.data.token, response.data.user);
            return response.data;
        }
        throw new Error(response.message);
    } catch (error) {
        console.error('Registration error:', error);
        throw error;
    }
};

export const logout = async () => {
    try {
        await authAPI.logout();
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        clearAuthData();
        window.location.href = '/auth/login';
    }
};

export const updateProfile = async (userData) => {
    try {
        const response = await authAPI.updateProfile(userData);
        if (response.success) {
            const updatedUser = response.data;
            localStorage.setItem('user', JSON.stringify(updatedUser));
            return updatedUser;
        }
        throw new Error(response.message);
    } catch (error) {
        throw error;
    }
};

export const changePassword = async (passwordData) => {
    try {
        const response = await authAPI.changePassword(passwordData);
        if (response.success) {
            return response.message;
        }
        throw new Error(response.message);
    } catch (error) {
        throw error;
    }
};
