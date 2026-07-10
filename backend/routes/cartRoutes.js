const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');
const { validateCart } = require('../controllers/cartController');

router.use(protect);
router.post('/validate', authorize('student'), validateCart);

module.exports = router;
