// client/src/services/api.js
import axios from 'axios';

const rawBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:6050/api';
const API_BASE_URL = rawBase.replace(/\/+$/, '');

axios.defaults.timeout = 10000;

// 3. 🛡️ Bulletproof Request Interceptor
axios.interceptors.request.use((config) => {
    let url = config.url || '';

    // 1. Agar request 'http://localhost:6050/resume' hai (bina /api ke)
    if (url.includes('localhost:6050') && !url.includes('localhost:6050/api')) {
        url = url.replace('http://localhost:6050', `${API_BASE_URL}`);
    }
    // 2. Agar standard localhost:6050/api hai
    else if (url.includes('localhost:6050/api')) {
        url = url.replace('http://localhost:6050/api', API_BASE_URL);
    }
    // 3. Agar relative path hai (/resume/user-dashboard)
    else if (url.startsWith('/') && !url.startsWith('/api')) {
        url = `${API_BASE_URL}${url}`;
    }
    else if (url.startsWith('/api')) {
        url = `${API_BASE_URL}${url.replace('/api', '')}`;
    }

    config.url = url;

    // Token Injector
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
}, (error) => {
    return Promise.reject(new Error("Request preparation failed"));
});

// 4. Global Response Interceptor
axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (!navigator.onLine || error.code === 'ERR_NETWORK') {
            return Promise.reject({
                success: false,
                isNetworkError: true,
                message: "Unable to reach CVPilot servers. Please check your internet connection."
            });
        }

        if (error.response) {
            const status = error.response.status;
            const sanitizedMessage = status >= 500
                ? "A secure server error occurred. Please try again later."
                : (error.response.data?.message || "Operation failed.");

            return Promise.reject({
                success: false,
                status,
                message: sanitizedMessage
            });
        }

        return Promise.reject({
            success: false,
            message: "Request timed out. Please try again."
        });
    }
);

export default axios;