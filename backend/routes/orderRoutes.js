const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');
const {
  placeOrder,
  getStudentOrders,
  getOrderById,
  cancelOrder,
  getCanteenOrders,
  updateOrderStatus,
  createRazorpayOrder,
  verifyPayment,
  verifyPickupToken,
  claimOrder,
} = require('../controllers/orderController');

router.use(protect);

router.post('/', authorize('student'), placeOrder);
router.get('/my-orders', authorize('student'), getStudentOrders);
router.post('/:id/pay', authorize('student'), createRazorpayOrder);
router.post('/:id/verify', authorize('student'), verifyPayment);
router.get('/:id', getOrderById);
router.patch('/:id/cancel', authorize('student'), cancelOrder);

router.get('/canteen/all', authorize('canteen_admin', 'super_admin'), getCanteenOrders);
router.get('/canteen/:canteenId', authorize('super_admin'), getCanteenOrders);
router.patch('/:id/status', authorize('canteen_admin', 'super_admin'), updateOrderStatus);
router.post('/canteen/verify-token', authorize('canteen_admin'), verifyPickupToken);
router.post('/:id/claim', authorize('canteen_admin'), claimOrder);

module.exports = router;
