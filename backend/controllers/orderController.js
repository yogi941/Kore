const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const Canteen = require('../models/Canteen');
const Notification = require('../models/Notification');
const generateQRCode = require('../utils/generateQR');
const sendResponse = require('../utils/sendResponse');
const { getIO } = require('../config/socket');
const Razorpay = require('razorpay');
const crypto = require('crypto');

const createNotification = async (recipientId, type, title, message, orderId) => {
  try {
    const notification = await Notification.create({
      recipient: recipientId,
      type,
      title,
      message,
      order: orderId,
    });
    getIO().to(recipientId.toString()).emit('new_notification', notification);
  } catch (err) {
    console.error('Notification creation failed:', err.message);
  }
};

exports.placeOrder = async (req, res, next) => {
  try {
    const { canteenId, items, pickupSlot, specialInstructions } = req.body;

    // Time window validations (IST / UTC+5:30)
    if (pickupSlot) {
      const now = new Date();
      const istString = now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
      const istTime = new Date(istString);
      const hours = istTime.getHours();
      const minutes = istTime.getMinutes();
      const currentTimeInMinutes = (hours * 60) + minutes;

      const slotLabel = pickupSlot.label.toLowerCase();
      if (slotLabel.includes('morning') || slotLabel.includes('breakfast')) {
        if (currentTimeInMinutes < 510 || currentTimeInMinutes > 615) {
          return sendResponse(res, 400, false, 'Pre-ordering for Morning Break is only allowed from 8:30 AM to 10:15 AM');
        }
      }
      if (slotLabel.includes('lunch')) {
        if (currentTimeInMinutes < 660 || currentTimeInMinutes > 735) {
          return sendResponse(res, 400, false, 'Pre-ordering for Lunch Break is only allowed from 11:00 AM to 12:15 PM');
        }
      }
    }

    if (!items || items.length === 0) {
      return sendResponse(res, 400, false, 'Order must have at least one item');
    }

    const canteen = await Canteen.findById(canteenId);
    if (!canteen || !canteen.isOpen) {
      return sendResponse(res, 400, false, 'Canteen is not available');
    }

    let totalAmount = 0;
    const validatedItems = [];

    for (const orderItem of items) {
      const menuItem = await MenuItem.findOne({
        _id: orderItem.menuItem,
        canteen: canteenId,
        isAvailable: true,
      });

      if (!menuItem) {
        return sendResponse(res, 400, false, `Item "${orderItem.menuItem}" is not available`);
      }

      const subtotal = menuItem.price * orderItem.quantity;
      totalAmount += subtotal;

      validatedItems.push({
        menuItem: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: orderItem.quantity,
      });
    }

    const order = await Order.create({
      student: req.user._id,
      canteen: canteenId,
      items: validatedItems,
      totalAmount,
      pickupSlot,
      specialInstructions,
      statusHistory: [{ status: 'pending', changedBy: req.user._id }],
    });

    const qrData = {
      orderId: order._id,
      orderNumber: order.orderNumber,
      pickupToken: order.pickupToken,
      studentId: req.user._id,
    };
    order.qrCode = await generateQRCode(qrData);
    await order.save();

    await MenuItem.updateMany(
      { _id: { $in: validatedItems.map((i) => i.menuItem) } },
      { $inc: { totalOrdered: 1 } }
    );

    await Canteen.findByIdAndUpdate(canteenId, { $inc: { totalOrders: 1 } });

    const populatedOrder = await Order.findById(order._id)
      .populate('canteen', 'name location')
      .populate('items.menuItem', 'name image');

    getIO()
      .to(`canteen_${canteenId}`)
      .emit('new_order', populatedOrder);

    await createNotification(
      req.user._id,
      'order_placed',
      'Order Placed',
      `Your order #${order.orderNumber} has been placed successfully.`,
      order._id
    );

    if (canteen.admin) {
      await createNotification(
        canteen.admin,
        'order_placed',
        'New Order Received',
        `New order #${order.orderNumber} received.`,
        order._id
      );
    }

    return sendResponse(res, 201, true, 'Order placed successfully', populatedOrder);
  } catch (error) {
    next(error);
  }
};

exports.getStudentOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const filter = { student: req.user._id };
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('canteen', 'name location image')
        .populate('items.menuItem', 'name image')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Order.countDocuments(filter),
    ]);

    return sendResponse(res, 200, true, 'Orders fetched', {
      orders,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('canteen', 'name location')
      .populate('student', 'name email rollNumber')
      .populate('items.menuItem', 'name image price');

    if (!order) return sendResponse(res, 404, false, 'Order not found');

    const isStudent = order.student._id.toString() === req.user._id.toString();
    const isCanteenAdmin =
      req.user.role === 'canteen_admin' &&
      order.canteen._id.toString() === req.user.canteen?.toString();
    const isSuperAdmin = req.user.role === 'super_admin';

    if (!isStudent && !isCanteenAdmin && !isSuperAdmin) {
      return sendResponse(res, 403, false, 'Not authorized to view this order');
    }

    return sendResponse(res, 200, true, 'Order fetched', order);
  } catch (error) {
    next(error);
  }
};

exports.cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return sendResponse(res, 404, false, 'Order not found');

    if (order.student.toString() !== req.user._id.toString()) {
      return sendResponse(res, 403, false, 'Not authorized');
    }

    if (!['pending', 'accepted'].includes(order.status)) {
      return sendResponse(res, 400, false, 'Order cannot be cancelled at this stage');
    }

    order.status = 'cancelled';
    order.cancelledAt = new Date();
    order.statusHistory.push({ status: 'cancelled', changedBy: req.user._id });
    await order.save();

    getIO()
      .to(`canteen_${order.canteen}`)
      .emit('order_cancelled', { orderId: order._id, orderNumber: order.orderNumber });

    await createNotification(
      req.user._id,
      'order_cancelled',
      'Order Cancelled',
      `Your order #${order.orderNumber} has been cancelled.`,
      order._id
    );

    return sendResponse(res, 200, true, 'Order cancelled', order);
  } catch (error) {
    next(error);
  }
};

exports.getCanteenOrders = async (req, res, next) => {
  try {
    const canteenId =
      req.user.role === 'canteen_admin' ? req.user.canteen : req.params.canteenId;

    const { status, page = 1, limit = 20, date } = req.query;
    const filter = { canteen: canteenId };
    if (status) filter.status = status;

    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      filter.createdAt = { $gte: start, $lte: end };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('student', 'name email rollNumber phone')
        .populate('items.menuItem', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Order.countDocuments(filter),
    ]);

    return sendResponse(res, 200, true, 'Canteen orders fetched', {
      orders,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['accepted', 'preparing', 'ready', 'completed', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return sendResponse(res, 400, false, 'Invalid status value');
    }

    const order = await Order.findById(req.params.id);
    if (!order) return sendResponse(res, 404, false, 'Order not found');

    const isCanteenAdmin =
      req.user.role === 'canteen_admin' &&
      order.canteen.toString() === req.user.canteen?.toString();

    if (!isCanteenAdmin && req.user.role !== 'super_admin') {
      return sendResponse(res, 403, false, 'Not authorized');
    }

    const statusFlow = {
      pending: ['accepted', 'cancelled'],
      accepted: ['preparing', 'cancelled'],
      preparing: ['ready'],
      ready: ['completed'],
      completed: [],
      cancelled: [],
    };

    if (!statusFlow[order.status].includes(status)) {
      return sendResponse(
        res,
        400,
        false,
        `Cannot transition from '${order.status}' to '${status}'`
      );
    }

    order.status = status;
    order.statusHistory.push({ status, changedBy: req.user._id });
    if (status === 'completed') order.completedAt = new Date();
    if (status === 'cancelled') order.cancelledAt = new Date();

    await order.save();

    const notifMap = {
      accepted: { type: 'order_accepted', title: 'Order Accepted', message: `Your order #${order.orderNumber} has been accepted and will be prepared soon.` },
      preparing: { type: 'order_preparing', title: 'Order Being Prepared', message: `Your order #${order.orderNumber} is now being prepared.` },
      ready: { type: 'order_ready', title: 'Order Ready for Pickup', message: `Your order #${order.orderNumber} is ready! Please collect it at the canteen.` },
      completed: { type: 'order_placed', title: 'Order Completed', message: `Your order #${order.orderNumber} has been marked as completed.` },
      cancelled: { type: 'order_cancelled', title: 'Order Cancelled', message: `Your order #${order.orderNumber} has been cancelled by the canteen.` },
    };

    const notif = notifMap[status];
    if (notif) {
      await createNotification(order.student, notif.type, notif.title, notif.message, order._id);
    }

    getIO()
      .to(order.student.toString())
      .emit('order_status_update', { orderId: order._id, status, orderNumber: order.orderNumber });

    getIO()
      .to(`canteen_${order.canteen}`)
      .emit('order_status_update', { orderId: order._id, status });

    return sendResponse(res, 200, true, `Order status updated to '${status}'`, order);
  } catch (error) {
    next(error);
  }
};

exports.createRazorpayOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return sendResponse(res, 404, false, 'Order not found');

    if (!process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID.includes('placeholder')) {
      return sendResponse(res, 200, true, 'Mock Razorpay order created', {
        keyId: 'rzp_test_placeholder',
        amount: Math.round(order.totalAmount * 100),
        currency: 'INR',
        rzpOrderId: 'order_mock_' + order.orderNumber,
        orderNumber: order.orderNumber,
        isMock: true,
      });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: Math.round(order.totalAmount * 100),
      currency: 'INR',
      receipt: order.orderNumber,
    };

    const rzpOrder = await razorpay.orders.create(options);
    return sendResponse(res, 200, true, 'Razorpay order created', {
      keyId: process.env.RAZORPAY_KEY_ID,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      rzpOrderId: rzpOrder.id,
      orderNumber: order.orderNumber,
    });
  } catch (error) {
    next(error);
  }
};

exports.verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return sendResponse(res, 404, false, 'Order not found');

    if (razorpay_order_id && razorpay_order_id.startsWith('order_mock_')) {
      order.paymentStatus = 'paid';
      order.status = 'accepted';
      order.statusHistory.push({ status: 'accepted', changedBy: req.user._id });
      await order.save();

      const populatedOrder = await Order.findById(order._id)
        .populate('canteen', 'name location admin')
        .populate('items.menuItem', 'name image');

      getIO().to(`canteen_${order.canteen}`).emit('new_order', populatedOrder);

      await createNotification(
        order.student,
        'order_accepted',
        'Order Accepted',
        `Your order #${order.orderNumber} has been accepted and is being prepared.`,
        order._id
      );

      if (populatedOrder.canteen?.admin) {
        await createNotification(
          populatedOrder.canteen.admin,
          'order_placed',
          'New Order Received (Paid)',
          `New order #${order.orderNumber} received.`,
          order._id
        );
      }

      return sendResponse(res, 200, true, 'Mock payment verified successfully', order);
    }

    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    hmac.update(razorpay_order_id + '|' + razorpay_payment_id);
    const generatedSignature = hmac.digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return sendResponse(res, 400, false, 'Payment verification failed');
    }

    order.paymentStatus = 'paid';
    order.status = 'accepted';
    order.statusHistory.push({ status: 'accepted', changedBy: req.user._id });
    await order.save();

    const populatedOrder = await Order.findById(order._id)
      .populate('canteen', 'name location admin')
      .populate('items.menuItem', 'name image');

    getIO().to(`canteen_${order.canteen}`).emit('new_order', populatedOrder);

    await createNotification(
      order.student,
      'order_accepted',
      'Order Accepted',
      `Your order #${order.orderNumber} has been accepted and is being prepared.`,
      order._id
    );

    if (populatedOrder.canteen?.admin) {
      await createNotification(
        populatedOrder.canteen.admin,
        'order_placed',
        'New Order Received (Paid)',
        `New order #${order.orderNumber} received.`,
        order._id
      );
    }

    return sendResponse(res, 200, true, 'Payment verified and order accepted', order);
  } catch (error) {
    next(error);
  }
};

exports.verifyPickupToken = async (req, res, next) => {
  try {
    const { pickupToken } = req.body;
    if (!pickupToken) return sendResponse(res, 400, false, 'Pickup token is required');

    const query = { pickupToken };
    if (req.user.role === 'canteen_admin') {
      const canteen = await Canteen.findOne({ admin: req.user._id });
      if (!canteen) return sendResponse(res, 403, false, 'No canteen associated with this admin');
      query.canteen = canteen._id;
    }

    const order = await Order.findOne(query)
      .populate('student', 'name email phone')
      .populate('items.menuItem', 'name image');

    if (!order) return sendResponse(res, 404, false, 'Order not found with this token');

    return sendResponse(res, 200, true, 'Order verified successfully', order);
  } catch (error) {
    next(error);
  }
};

exports.claimOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return sendResponse(res, 404, false, 'Order not found');

    if (req.user.role === 'canteen_admin') {
      const canteen = await Canteen.findOne({ admin: req.user._id });
      if (!canteen || canteen._id.toString() !== order.canteen.toString()) {
        return sendResponse(res, 403, false, 'Unauthorized to claim this order');
      }
    }

    order.status = 'completed';
    order.statusHistory.push({ status: 'completed', changedBy: req.user._id });
    await order.save();

    getIO().to(order.student.toString()).emit('order_status_update', {
      orderId: order._id,
      status: 'completed',
      orderNumber: order.orderNumber,
    });

    await createNotification(
      order.student,
      'order_placed',
      'Order Picked Up',
      `Your order #${order.orderNumber} has been successfully picked up. Thank you!`,
      order._id
    );

    return sendResponse(res, 200, true, 'Order marked as completed', order);
  } catch (error) {
    next(error);
  }
};
