import axiosInstance from './axiosInstance';

export const fetchCanteens = () => axiosInstance.get('/canteens');
export const fetchCanteenById = (id) => axiosInstance.get(`/canteens/${id}`);
export const createCanteen = (data) => axiosInstance.post('/canteens', data);
export const updateCanteen = (id, data) => axiosInstance.put(`/canteens/${id}`, data);
export const toggleCanteen = (id) => axiosInstance.patch(`/canteens/${id}/toggle`);
export const deleteCanteen = (id) => axiosInstance.delete(`/canteens/${id}`);
