import axiosInstance from './axiosInstance';

export const fetchMenuByCanteen = (canteenId, params) =>
  axiosInstance.get(`/menu/canteen/${canteenId}`, { params });
export const fetchPopularItems = (canteenId) =>
  axiosInstance.get(`/menu/canteen/${canteenId}/popular`);
export const fetchMenuItemById = (id) => axiosInstance.get(`/menu/${id}`);
export const createMenuItem = (data) => axiosInstance.post('/menu', data);
export const updateMenuItem = (id, data) => axiosInstance.put(`/menu/${id}`, data);
export const toggleItemAvailability = (id) => axiosInstance.patch(`/menu/${id}/toggle`);
export const deleteMenuItem = (id) => axiosInstance.delete(`/menu/${id}`);
