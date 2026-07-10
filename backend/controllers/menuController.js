const MenuItem = require('../models/MenuItem');
const sendResponse = require('../utils/sendResponse');

exports.getMenuByCanteen = async (req, res, next) => {
  try {
    const { canteenId } = req.params;
    const { category, search, isVeg, isAvailable } = req.query;

    const filter = { canteen: canteenId };
    if (category) filter.category = category;
    if (isVeg !== undefined) filter.isVeg = isVeg === 'true';
    if (isAvailable !== undefined) filter.isAvailable = isAvailable === 'true';

    if (search) {
      filter.$text = { $search: search };
    }

    const items = await MenuItem.find(filter).sort({ category: 1, name: 1 });
    return sendResponse(res, 200, true, 'Menu fetched', items);
  } catch (error) {
    next(error);
  }
};

exports.getMenuItemById = async (req, res, next) => {
  try {
    const item = await MenuItem.findById(req.params.id).populate('canteen', 'name');
    if (!item) return sendResponse(res, 404, false, 'Menu item not found');
    return sendResponse(res, 200, true, 'Menu item fetched', item);
  } catch (error) {
    next(error);
  }
};

exports.createMenuItem = async (req, res, next) => {
  try {
    const canteenId =
      req.user.role === 'canteen_admin' ? req.user.canteen : req.body.canteen;

    if (!canteenId) return sendResponse(res, 400, false, 'Canteen ID is required');

    const item = await MenuItem.create({ ...req.body, canteen: canteenId });
    return sendResponse(res, 201, true, 'Menu item created', item);
  } catch (error) {
    next(error);
  }
};

exports.updateMenuItem = async (req, res, next) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) return sendResponse(res, 404, false, 'Menu item not found');

    if (
      req.user.role === 'canteen_admin' &&
      item.canteen.toString() !== req.user.canteen.toString()
    ) {
      return sendResponse(res, 403, false, 'Not authorized to update this item');
    }

    const updated = await MenuItem.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    return sendResponse(res, 200, true, 'Menu item updated', updated);
  } catch (error) {
    next(error);
  }
};

exports.toggleAvailability = async (req, res, next) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) return sendResponse(res, 404, false, 'Menu item not found');

    if (
      req.user.role === 'canteen_admin' &&
      item.canteen.toString() !== req.user.canteen.toString()
    ) {
      return sendResponse(res, 403, false, 'Not authorized');
    }

    item.isAvailable = !item.isAvailable;
    await item.save();
    return sendResponse(res, 200, true, `Item is now ${item.isAvailable ? 'available' : 'unavailable'}`, item);
  } catch (error) {
    next(error);
  }
};

exports.deleteMenuItem = async (req, res, next) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) return sendResponse(res, 404, false, 'Menu item not found');

    if (
      req.user.role === 'canteen_admin' &&
      item.canteen.toString() !== req.user.canteen.toString()
    ) {
      return sendResponse(res, 403, false, 'Not authorized to delete this item');
    }

    await item.deleteOne();
    return sendResponse(res, 200, true, 'Menu item deleted');
  } catch (error) {
    next(error);
  }
};

exports.getPopularItems = async (req, res, next) => {
  try {
    const { canteenId } = req.params;
    const items = await MenuItem.find({ canteen: canteenId, isAvailable: true })
      .sort({ totalOrdered: -1 })
      .limit(6);
    return sendResponse(res, 200, true, 'Popular items fetched', items);
  } catch (error) {
    next(error);
  }
};
