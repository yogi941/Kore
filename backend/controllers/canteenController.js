const Canteen = require('../models/Canteen');
const Order = require('../models/Order');
const { predictPrepAndWaitTime } = require('../services/mlService');
const sendResponse = require('../utils/sendResponse');

exports.getAllCanteens = async (req, res, next) => {
  try {
    const canteens = await Canteen.find()
      .populate('admin', 'name email')
      .sort({ name: 1 })
      .lean();

    // Attach real-time queue status & ML prediction to each canteen
    const enrichedCanteens = await Promise.all(
      canteens.map(async (canteen) => {
        const activeOrdersCount = await Order.countDocuments({
          canteen: canteen._id,
          status: { $in: ['accepted', 'preparing', 'pending'] },
        });

        const mlPrediction = predictPrepAndWaitTime({
          items: [{ category: 'lunch', quantity: 2 }],
          queueLength: activeOrdersCount,
          kitchenWorkload: activeOrdersCount * 2,
        });

        return {
          ...canteen,
          activeOrdersCount,
          estimatedWaitMinutes: mlPrediction.predictedWaitTime,
          waitRange: mlPrediction.formattedRange,
          queueStatus: mlPrediction.queueStatus,
          queueColor: mlPrediction.queueColor,
        };
      })
    );

    return sendResponse(res, 200, true, 'Canteens fetched', enrichedCanteens);
  } catch (error) {
    next(error);
  }
};

exports.getCanteenById = async (req, res, next) => {
  try {
    const canteen = await Canteen.findById(req.params.id).populate('admin', 'name email');
    if (!canteen) return sendResponse(res, 404, false, 'Canteen not found');
    return sendResponse(res, 200, true, 'Canteen fetched', canteen);
  } catch (error) {
    next(error);
  }
};

exports.createCanteen = async (req, res, next) => {
  try {
    const canteen = await Canteen.create(req.body);
    return sendResponse(res, 201, true, 'Canteen created', canteen);
  } catch (error) {
    next(error);
  }
};

exports.updateCanteen = async (req, res, next) => {
  try {
    const canteen = await Canteen.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!canteen) return sendResponse(res, 404, false, 'Canteen not found');
    return sendResponse(res, 200, true, 'Canteen updated', canteen);
  } catch (error) {
    next(error);
  }
};

exports.toggleCanteenStatus = async (req, res, next) => {
  try {
    const canteen = await Canteen.findById(req.params.id);
    if (!canteen) return sendResponse(res, 404, false, 'Canteen not found');
    canteen.isOpen = !canteen.isOpen;
    await canteen.save();
    return sendResponse(res, 200, true, `Canteen is now ${canteen.isOpen ? 'open' : 'closed'}`, canteen);
  } catch (error) {
    next(error);
  }
};

exports.deleteCanteen = async (req, res, next) => {
  try {
    const canteen = await Canteen.findByIdAndDelete(req.params.id);
    if (!canteen) return sendResponse(res, 404, false, 'Canteen not found');
    return sendResponse(res, 200, true, 'Canteen deleted');
  } catch (error) {
    next(error);
  }
};
