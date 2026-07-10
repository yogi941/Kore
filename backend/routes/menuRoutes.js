const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');
const {
  getMenuByCanteen,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  toggleAvailability,
  deleteMenuItem,
  getPopularItems,
} = require('../controllers/menuController');

router.get('/canteen/:canteenId', getMenuByCanteen);
router.get('/canteen/:canteenId/popular', getPopularItems);
router.get('/:id', getMenuItemById);

router.use(protect);
router.post('/', authorize('canteen_admin', 'super_admin'), createMenuItem);
router.put('/:id', authorize('canteen_admin', 'super_admin'), updateMenuItem);
router.patch('/:id/toggle', authorize('canteen_admin', 'super_admin'), toggleAvailability);
router.delete('/:id', authorize('canteen_admin', 'super_admin'), deleteMenuItem);

module.exports = router;
