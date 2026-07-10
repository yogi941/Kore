import axiosInstance from './axiosInstance';

export const getNotifications = () => axiosInstance.get('/notifications');
export const markNotificationAsRead = (id) => axiosInstance.patch(`/notifications/${id}/read`);
export const markAllNotificationsAsRead = () => axiosInstance.patch('/notifications/read-all');
