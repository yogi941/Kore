const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const { predictPrepAndWaitTime } = require('../services/mlService');
const { forecastDemand } = require('../services/demandForecastService');
const { getStudentRecommendations } = require('../services/recommendationService');
const MenuItem = require('../models/MenuItem');
const Order = require('../models/Order');
const sendResponse = require('../utils/sendResponse');

router.use(protect);

// 1. Predict Prep & Wait Time for Cart/Items
router.post('/predict-time', async (req, res, next) => {
  try {
    const { items, canteenId } = req.body;
    const activeOrdersCount = await Order.countDocuments({
      canteen: canteenId,
      status: { $in: ['accepted', 'preparing'] },
    });

    const prediction = predictPrepAndWaitTime({
      items,
      queueLength: activeOrdersCount,
      kitchenWorkload: activeOrdersCount * 2,
    });

    return sendResponse(res, 200, true, 'ML prediction generated', prediction);
  } catch (err) {
    next(err);
  }
});

// 2. Forecast Demand for Admin/Canteen
router.get('/demand-forecast', async (req, res, next) => {
  try {
    const { canteenId } = req.query;
    const filter = canteenId ? { canteen: canteenId } : {};

    const [historicalOrders, menuItems] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).limit(200),
      MenuItem.find({ ...filter, isAvailable: true }),
    ]);

    const forecast = forecastDemand(historicalOrders, menuItems);
    return sendResponse(res, 200, true, 'Demand forecast generated', forecast);
  } catch (err) {
    next(err);
  }
});

// 3. Personalized Recommendations for Student
router.get('/recommendations', async (req, res, next) => {
  try {
    const { canteenId } = req.query;
    const recommendations = await getStudentRecommendations(req.user._id, canteenId);
    return sendResponse(res, 200, true, 'Recommendations generated', recommendations);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
