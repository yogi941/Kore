const Order = require('../models/Order');
const ParentOrder = require('../models/ParentOrder');
const Canteen = require('../models/Canteen');
const Notification = require('../models/Notification');
const sendResponse = require('../utils/sendResponse');
const { getIO } = require('../config/socket');

/**
 * Scan and verify QR Code for order pickup
 */
exports.verifyAndCollectQR = async (req, res, next) => {
  try {
    const { qrData, pickupToken } = req.body;
    let targetToken = pickupToken;

    if (qrData) {
      try {
        const parsed = typeof qrData === 'string' ? JSON.parse(qrData) : qrData;
        targetToken = parsed.pickupToken || parsed.token || targetToken;
      } catch (e) {
        targetToken = qrData; // Assume plain string token
      }
    }

    if (!targetToken) {
      return sendResponse(res, 400, false, 'Valid QR Code or Pickup Token is required');
    }

    // Find shop order matching token
    const order = await Order.findOne({ pickupToken: targetToken })
      .populate('student', 'name email phone rollNumber')
      .populate('canteen', 'name admin location')
      .populate('items.menuItem', 'name image price');

    if (!order) {
      return sendResponse(res, 404, false, 'Invalid or Unknown QR Code');
    }

    // Check staff canteen authorization
    if (req.user.role === 'canteen_admin' || req.user.role === 'shop_manager') {
      const userCanteenId = req.user.canteen?.toString();
      if (userCanteenId && order.canteen._id.toString() !== userCanteenId) {
        return sendResponse(
          res,
          403,
          false,
          `QR Verification Rejected: Order belongs to "${order.canteen.name}", not your assigned shop.`
        );
      }
    }

    // Duplicate pickup validation
    if (order.status === 'completed') {
      return sendResponse(
        res,
        400,
        false,
        `Duplicate Pickup Warning: Order #${order.orderNumber} was ALREADY COLLECTED at ${new Date(order.completedAt).toLocaleTimeString()}`
      );
    }

    if (order.status === 'cancelled') {
      return sendResponse(res, 400, false, `Pickup Error: Order #${order.orderNumber} was CANCELLED.`);
    }

    // Mark order as completed
    order.status = 'completed';
    order.completedAt = new Date();
    order.statusHistory.push({ status: 'completed', changedBy: req.user._id });
    await order.save();

    // Check parent order status if part of multi-shop order
    if (order.parentOrder) {
      const parent = await ParentOrder.findById(order.parentOrder).populate('shopOrders');
      if (parent) {
        const allCompleted = parent.shopOrders.every((so) => so.status === 'completed' || so._id.toString() === order._id.toString());
        if (allCompleted) {
          parent.overallStatus = 'completed';
          await parent.save();
        } else {
          parent.overallStatus = 'in_progress';
          await parent.save();
        }
      }
    }

    // Emit live socket status update
    getIO().to(order.student._id.toString()).emit('order_status_update', {
      orderId: order._id,
      status: 'completed',
      orderNumber: order.orderNumber,
      canteenName: order.canteen.name,
    });

    getIO().to(`canteen_${order.canteen._id}`).emit('order_status_update', {
      orderId: order._id,
      status: 'completed',
    });

    // Send pickup notification
    await Notification.create({
      recipient: order.student._id,
      type: 'order_placed',
      title: 'Order Picked Up',
      message: `Your order #${order.orderNumber} from ${order.canteen.name} has been verified and picked up! Enjoy your meal.`,
      order: order._id,
    });

    return sendResponse(res, 200, true, `QR Verified! Order #${order.orderNumber} collected successfully.`, {
      order,
      scannedAt: new Date(),
      verifiedBy: req.user.name,
    });
  } catch (error) {
    next(error);
  }
};
