import axiosInstance from './axiosInstance';

export const registerUser = (data) => axiosInstance.post('/auth/register', data);
export const loginUser = (data) => axiosInstance.post('/auth/login', data);
export const getMe = () => axiosInstance.get('/auth/me');
export const updateProfile = (data) => axiosInstance.put('/auth/profile', data);
export const changePassword = (data) => axiosInstance.put('/auth/change-password', data);
