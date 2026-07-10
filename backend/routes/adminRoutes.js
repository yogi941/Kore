const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');
const {
  getPlatformAnalytics,
  getDailyRevenue,
  getAllUsers,
  createCanteenAdmin,
  toggleUserStatus,
  getDemandForecast,
} = require('../controllers/adminController');

router.use(protect);
router.use(authorize('super_admin'));

router.get('/analytics', getPlatformAnalytics);
router.get('/revenue', getDailyRevenue);
router.get('/users', getAllUsers);
router.post('/users/canteen-admin', createCanteenAdmin);
router.patch('/users/:id/toggle', toggleUserStatus);
router.get('/forecast/:canteenId', getDemandForecast);

module.exports = router;
