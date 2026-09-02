// client/src/services/adminService.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:6050/api/admin';

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

export const fetchUsersWithResumes = async () => {
    const token = localStorage.getItem('token');
    const res = await axios.get(`${API_BASE_URL}/users-with-resumes`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
};

// 3. Toggle User Block / Unblock
export const toggleBlockUserApi = async (userId) => {
    const res = await fetch(`${API_BASE_URL}/toggle-block/${userId}`, {
        method: 'PATCH',
        headers: getAuthHeaders()
    });
    return res.json();
};

// 4. Toggle User Admin Role API
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

// 🚀 5. Report Unknown / Suspicious Route Hit (Called by 404 NotFound page)
export const reportSuspiciousRouteApi = async (payload) => {
    try {
        const res = await axios.post(`${API_BASE_URL}/report-suspicious-route`, payload);
        return res.data;
    } catch (e) {
        return { success: false };
    }
};