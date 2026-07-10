const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');
const {
  getAllCanteens,
  getCanteenById,
  createCanteen,
  updateCanteen,
  toggleCanteenStatus,
  deleteCanteen,
} = require('../controllers/canteenController');

router.get('/', getAllCanteens);
router.get('/:id', getCanteenById);

router.use(protect);
router.post('/', authorize('super_admin'), createCanteen);
router.put('/:id', authorize('super_admin', 'canteen_admin'), updateCanteen);
router.patch('/:id/toggle', authorize('super_admin', 'canteen_admin'), toggleCanteenStatus);
router.delete('/:id', authorize('super_admin'), deleteCanteen);

module.exports = router;
