// client/src/services/adminService.js
const API_BASE_URL = 'http://localhost:6050/api/admin';

// Helper for Authorization Header
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

// 1. Fetch Admin Dashboard Statistics
export const fetchAdminStats = async () => {
    const res = await fetch(`${API_BASE_URL}/stats`, {
        headers: getAuthHeaders()
    });
    return res.json();
};

// 2. Fetch All Registered Users
export const fetchAllUsers = async () => {
    const res = await fetch(`${API_BASE_URL}/users`, {
        headers: getAuthHeaders()
    });
    return res.json();
};

// 3. Toggle User Block / Unblock
export const toggleBlockUserApi = async (userId) => {
    const res = await fetch(`${API_BASE_URL}/toggle-block/${userId}`, {
        method: 'PATCH',
        headers: getAuthHeaders()
    });
    return res.json();
};

// Toggle User Admin Role API
export const toggleAdminRoleApi = async (userId) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE_URL}/toggle-role/${userId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });
    return res.json();
};