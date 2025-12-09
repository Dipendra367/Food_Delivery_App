import axios from 'axios';

const api = axios.create({
    // Use localhost for local development, or your computer's IP address for mobile testing
    baseURL: 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to attach the token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Order API
export const orderAPI = {
    create: (orderData) => api.post('/orders', orderData),
    getAll: () => api.get('/orders'),
    getById: (id) => api.get(`/orders/${id}`)
};

export default api;
