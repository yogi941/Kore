const User = require('../models/User');
const Order = require('../models/Order');
const Canteen = require('../models/Canteen');
const MenuItem = require('../models/MenuItem');
const sendResponse = require('../utils/sendResponse');

exports.getPlatformAnalytics = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const [
      totalStudents,
      totalOrders,
      todayOrders,
      completedOrders,
      cancelledOrders,
      totalRevenue,
      canteenStats,
    ] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      Order.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: today, $lte: todayEnd } }),
      Order.countDocuments({ status: 'completed' }),
      Order.countDocuments({ status: 'cancelled' }),
      Order.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      Order.aggregate([
        {
          $group: {
            _id: '$canteen',
            totalOrders: { $sum: 1 },
            revenue: {
              $sum: {
                $cond: [{ $eq: ['$status', 'completed'] }, '$totalAmount', 0],
              },
            },
          },
        },
        {
          $lookup: {
            from: 'canteens',
            localField: '_id',
            foreignField: '_id',
            as: 'canteenInfo',
          },
        },
        { $unwind: '$canteenInfo' },
        {
          $project: {
            canteenName: '$canteenInfo.name',
            totalOrders: 1,
            revenue: 1,
          },
        },
      ]),
    ]);

    return sendResponse(res, 200, true, 'Analytics fetched', {
      overview: {
        totalStudents,
        totalOrders,
        todayOrders,
        completedOrders,
        cancelledOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        completionRate: totalOrders
          ? ((completedOrders / totalOrders) * 100).toFixed(1)
          : 0,
      },
      canteenStats,
    });
  } catch (error) {
    next(error);
  }
};

exports.getDailyRevenue = async (req, res, next) => {
  try {
    const { days = 7, canteenId } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(days));

    const matchStage = {
      status: 'completed',
      createdAt: { $gte: daysAgo },
    };
    if (canteenId) matchStage.canteen = require('mongoose').Types.ObjectId(canteenId);

    const revenue = await Order.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return sendResponse(res, 200, true, 'Daily revenue fetched', revenue);
  } catch (error) {
    next(error);
  }
};

exports.getAllUsers = async (req, res, next) => {
  try {
    const { role, page = 1, limit = 20, search } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [users, total] = await Promise.all([
      User.find(filter)
        .populate('canteen', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(filter),
    ]);

    return sendResponse(res, 200, true, 'Users fetched', {
      users,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    next(error);
  }
};

exports.createCanteenAdmin = async (req, res, next) => {
  try {
    const { name, email, password, canteenId } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return sendResponse(res, 409, false, 'Email already registered');

    const canteen = await Canteen.findById(canteenId);
    if (!canteen) return sendResponse(res, 404, false, 'Canteen not found');

    const admin = await User.create({
      name,
      email,
      password,
      role: 'canteen_admin',
      canteen: canteenId,
    });

    await Canteen.findByIdAndUpdate(canteenId, { admin: admin._id });

    return sendResponse(res, 201, true, 'Canteen admin created', {
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      canteen: canteenId,
    });
  } catch (error) {
    next(error);
  }
};

exports.toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return sendResponse(res, 404, false, 'User not found');
    if (user.role === 'super_admin') {
      return sendResponse(res, 403, false, 'Cannot modify super admin status');
    }
    user.isActive = !user.isActive;
    await user.save();
    return sendResponse(res, 200, true, `User ${user.isActive ? 'activated' : 'deactivated'}`, {
      _id: user._id,
      isActive: user.isActive,
    });
  } catch (error) {
    next(error);
  }
};

exports.getDemandForecast = async (req, res, next) => {
  try {
    const { canteenId } = req.params;
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const forecast = await Order.aggregate([
      {
        $match: {
          canteen: require('mongoose').Types.ObjectId(canteenId),
          status: { $in: ['completed', 'ready'] },
          createdAt: { $gte: sevenDaysAgo },
        },
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.menuItem',
          totalQuantity: { $sum: '$items.quantity' },
          itemName: { $first: '$items.name' },
          avgPerDay: { $avg: '$items.quantity' },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 10 },
    ]);

    return sendResponse(res, 200, true, 'Demand forecast fetched', forecast);
  } catch (error) {
    next(error);
  }
};
