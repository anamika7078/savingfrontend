import { authAPI } from './api';

export const isAuthenticated = () => {
    if (typeof window === 'undefined') return false;
    const user = localStorage.getItem('user');
    return !!user;
};

export const getCurrentUser = () => {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
};

export const getAuthToken = () => {
    // Token removed - return null
    return null;
};

export const setAuthData = (token, user) => {
    if (typeof window === 'undefined') return;
    // Token removed - only store user
    localStorage.setItem('user', JSON.stringify(user));
};

export const clearAuthData = () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('user');
};

export const login = async (credentials) => {
    try {
        console.log('🔐 Login attempt with credentials:', { username: credentials.username });
        const response = await authAPI.login(credentials);
        console.log('🔐 Login API response:', response);
        
        // Handle different response structures - token removed
        let user;
        if (response.success && response.data) {
            user = response.data.user;
        } else if (response.user) {
            user = response.user;
        } else if (response.data && response.data.user) {
            user = response.data.user;
        }
        
        if (user) {
            console.log('✅ User received, storing in localStorage');
            setAuthData(null, user);
            console.log('✅ User stored successfully');
            return { user };
        } else {
            console.error('❌ No user in response:', response);
            throw new Error('No user received from server');
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
            setAuthData(null, response.data.user);
            return { user: response.data.user };
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
