import axiosInstance from './axiosInstance';

export const getPlatformAnalytics = () => axiosInstance.get('/admin/analytics');
export const getDailyRevenue = (params) => axiosInstance.get('/admin/revenue', { params });
export const getAllUsers = (params) => axiosInstance.get('/admin/users', { params });
export const createCanteenAdmin = (data) => axiosInstance.post('/admin/users/canteen-admin', data);
export const toggleUserStatus = (id) => axiosInstance.patch(`/admin/users/${id}/toggle`);
export const getDemandForecast = (canteenId) =>
  axiosInstance.get(`/admin/forecast/${canteenId}`);
