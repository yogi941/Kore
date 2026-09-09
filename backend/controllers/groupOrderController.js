const GroupOrder = require('../models/GroupOrder');
const MenuItem = require('../models/MenuItem');
const Order = require('../models/Order');
const ParentOrder = require('../models/ParentOrder');
const Canteen = require('../models/Canteen');
const sendResponse = require('../utils/sendResponse');
const generateQRCode = require('../utils/generateQR');
const { getIO } = require('../config/socket');

// Generate 6-character unique uppercase code
const generateGroupCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

exports.createGroupOrder = async (req, res, next) => {
  try {
    const { canteenId, paymentType = 'group_leader' } = req.body;

    const canteen = await Canteen.findById(canteenId);
    if (!canteen) return sendResponse(res, 404, false, 'Canteen not found');

    let groupCode = generateGroupCode();
    let existing = await GroupOrder.findOne({ groupCode });
    while (existing) {
      groupCode = generateGroupCode();
      existing = await GroupOrder.findOne({ groupCode });
    }

    const groupOrder = await GroupOrder.create({
      groupCode,
      leader: req.user._id,
      canteen: canteenId,
      members: [{ user: req.user._id, name: req.user.name, email: req.user.email }],
      paymentType,
      items: [],
    });

    const qrData = JSON.stringify({ type: 'GROUP_JOIN', groupCode });
    const qrCodeImage = await generateQRCode(qrData);

    return sendResponse(res, 201, true, 'Group Order created', {
      groupOrder,
      qrCodeImage,
      shareUrl: `${process.env.CLIENT_URL || 'http://localhost:5173'}/group/${groupCode}`,
    });
  } catch (error) {
    next(error);
  }
};

exports.joinGroupOrder = async (req, res, next) => {
  try {
    const { groupCode } = req.body;
    const groupOrder = await GroupOrder.findOne({ groupCode: groupCode.toUpperCase() });

    if (!groupOrder) return sendResponse(res, 404, false, 'Group Order not found');
    if (groupOrder.status !== 'active') return sendResponse(res, 400, false, 'Group Order is locked or placed');

    const alreadyMember = groupOrder.members.some((m) => m.user.toString() === req.user._id.toString());
    if (!alreadyMember) {
      groupOrder.members.push({ user: req.user._id, name: req.user.name, email: req.user.email });
      await groupOrder.save();

      getIO().to(`group_${groupCode}`).emit('group_member_joined', {
        user: { id: req.user._id, name: req.user.name },
        membersCount: groupOrder.members.length,
      });
    }

    return sendResponse(res, 200, true, 'Joined Group Order successfully', groupOrder);
  } catch (error) {
    next(error);
  }
};

exports.getGroupOrder = async (req, res, next) => {
  try {
    const { groupCode } = req.params;
    const groupOrder = await GroupOrder.findOne({ groupCode: groupCode.toUpperCase() })
      .populate('leader', 'name email')
      .populate('canteen', 'name location')
      .populate('items.menuItem', 'name image price category');

    if (!groupOrder) return sendResponse(res, 404, false, 'Group Order not found');

    return sendResponse(res, 200, true, 'Group Order details fetched', groupOrder);
  } catch (error) {
    next(error);
  }
};

exports.addItemToGroup = async (req, res, next) => {
  try {
    const { groupCode } = req.params;
    const { menuItemId, quantity = 1 } = req.body;

    const groupOrder = await GroupOrder.findOne({ groupCode: groupCode.toUpperCase() });
    if (!groupOrder) return sendResponse(res, 404, false, 'Group Order not found');
    if (groupOrder.status !== 'active') return sendResponse(res, 400, false, 'Group Order is locked for modifications');

    const menuItem = await MenuItem.findById(menuItemId);
    if (!menuItem) return sendResponse(res, 404, false, 'Menu item not found');

    const existingIndex = groupOrder.items.findIndex(
      (i) => i.menuItem.toString() === menuItemId && i.addedBy.toString() === req.user._id.toString()
    );

    if (existingIndex > -1) {
      groupOrder.items[existingIndex].quantity += quantity;
    } else {
      groupOrder.items.push({
        menuItem: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity,
        canteen: menuItem.canteen,
        addedBy: req.user._id,
        addedByName: req.user.name,
      });
    }

    groupOrder.totalAmount = groupOrder.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    await groupOrder.save();

    getIO().to(`group_${groupCode}`).emit('group_cart_updated', groupOrder);

    return sendResponse(res, 200, true, 'Item added to Group Order', groupOrder);
  } catch (error) {
    next(error);
  }
};

exports.removeItemFromGroup = async (req, res, next) => {
  try {
    const { groupCode, itemId } = req.params;

    const groupOrder = await GroupOrder.findOne({ groupCode: groupCode.toUpperCase() });
    if (!groupOrder) return sendResponse(res, 404, false, 'Group Order not found');
    if (groupOrder.status !== 'active') return sendResponse(res, 400, false, 'Group Order is locked');

    groupOrder.items = groupOrder.items.filter((item) => item._id.toString() !== itemId);
    groupOrder.totalAmount = groupOrder.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    await groupOrder.save();

    getIO().to(`group_${groupCode}`).emit('group_cart_updated', groupOrder);

    return sendResponse(res, 200, true, 'Item removed from Group Order', groupOrder);
  } catch (error) {
    next(error);
  }
};

exports.finalizeGroupOrder = async (req, res, next) => {
  try {
    const { groupCode } = req.params;
    const { pickupSlot } = req.body;

    const groupOrder = await GroupOrder.findOne({ groupCode: groupCode.toUpperCase() });
    if (!groupOrder) return sendResponse(res, 404, false, 'Group Order not found');
    if (groupOrder.leader.toString() !== req.user._id.toString()) {
      return sendResponse(res, 403, false, 'Only the Group Leader can finalize the order');
    }

    if (groupOrder.items.length === 0) {
      return sendResponse(res, 400, false, 'Cannot finalize an empty Group Order');
    }

    groupOrder.status = 'locked';
    await groupOrder.save();

    // Group items by shop/canteen for multi-shop support
    const shopItemMap = {};
    groupOrder.items.forEach((item) => {
      const cId = item.canteen.toString();
      if (!shopItemMap[cId]) shopItemMap[cId] = [];
      shopItemMap[cId].push(item);
    });

    // Create Parent Order
    const parentOrder = await ParentOrder.create({
      student: req.user._id,
      totalAmount: groupOrder.totalAmount,
      isGroupOrder: true,
      groupOrderRef: groupOrder._id,
      pickupSlot,
      shopOrders: [],
    });

    const shopOrderIds = [];

    for (const [canteenId, items] of Object.entries(shopItemMap)) {
      const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
      const shopOrder = await Order.create({
        parentOrder: parentOrder._id,
        student: req.user._id,
        canteen: canteenId,
        items,
        totalAmount: subtotal,
        pickupSlot,
        statusHistory: [{ status: 'pending', changedBy: req.user._id }],
      });

      const qrData = { orderId: shopOrder._id, pickupToken: shopOrder.pickupToken };
      shopOrder.qrCode = await generateQRCode(qrData);
      await shopOrder.save();

      shopOrderIds.push(shopOrder._id);

      getIO().to(`canteen_${canteenId}`).emit('new_order', shopOrder);
    }

    parentOrder.shopOrders = shopOrderIds;
    await parentOrder.save();

    groupOrder.status = 'placed';
    groupOrder.parentOrder = parentOrder._id;
    await groupOrder.save();

    getIO().to(`group_${groupCode}`).emit('group_order_finalized', {
      parentOrderId: parentOrder._id,
      orderNumber: parentOrder.parentOrderNumber,
    });

    return sendResponse(res, 200, true, 'Group Order finalized and submitted to kitchen!', parentOrder);
  } catch (error) {
    next(error);
  }
};
