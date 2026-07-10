import axiosInstance from './axiosInstance';

export const placeOrder = (data) => axiosInstance.post('/orders', data);
export const getStudentOrders = (params) => axiosInstance.get('/orders/my-orders', { params });
export const getOrderById = (id) => axiosInstance.get(`/orders/${id}`);
export const cancelOrder = (id) => axiosInstance.patch(`/orders/${id}/cancel`);
export const getCanteenOrders = (params) => axiosInstance.get('/orders/canteen/all', { params });
export const updateOrderStatus = (id, status) =>
  axiosInstance.patch(`/orders/${id}/status`, { status });
export const validateCart = (items) => axiosInstance.post('/cart/validate', { items });
export const createPayment = (id) => axiosInstance.post(`/orders/${id}/pay`);
export const verifyPayment = (id, data) => axiosInstance.post(`/orders/${id}/verify`, data);
export const verifyPickupToken = (pickupToken) => axiosInstance.post('/orders/canteen/verify-token', { pickupToken });
export const claimOrder = (id) => axiosInstance.post(`/orders/${id}/claim`);
