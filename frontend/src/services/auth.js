import api from './api';

const AuthService = {
    login: async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    },

    register: async (userData) => {
        const response = await api.post('/auth/signup', userData);
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('cart');
    },

    forgotPassword: async (email) => {
        const response = await api.post('/auth/forgot-password', { email });
        return response.data;
    },

    resetPassword: async (token, password) => {
        const response = await api.post(`/auth/reset-password/${token}`, { password });
        return response.data;
    },

    verifyPhoneOTP: async (phoneNumber, otp) => {
        const response = await api.post('/auth/verify-phone-otp', { phoneNumber, otp });
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    },

    sendPhoneOTP: async (phoneNumber) => {
        const response = await api.post('/auth/send-phone-otp', { phoneNumber });
        return response.data;
    },

    getCurrentUser: () => {
        return JSON.parse(localStorage.getItem('user'));
    }
};

export default AuthService;
