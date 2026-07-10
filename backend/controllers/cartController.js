const MenuItem = require('../models/MenuItem');
const sendResponse = require('../utils/sendResponse');

exports.validateCart = async (req, res, next) => {
  try {
    const { items } = req.body;

    if (!items || items.length === 0) {
      return sendResponse(res, 400, false, 'Cart is empty');
    }

    const validatedItems = [];
    let totalAmount = 0;
    const warnings = [];

    for (const cartItem of items) {
      const menuItem = await MenuItem.findById(cartItem.menuItem).populate('canteen', 'name isOpen');

      if (!menuItem) {
        warnings.push(`Item not found and was removed from cart`);
        continue;
      }

      if (!menuItem.isAvailable) {
        warnings.push(`"${menuItem.name}" is no longer available and was removed`);
        continue;
      }

      if (!menuItem.canteen.isOpen) {
        return sendResponse(res, 400, false, `Canteen "${menuItem.canteen.name}" is currently closed`);
      }

      validatedItems.push({
        menuItem: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: cartItem.quantity,
        image: menuItem.image,
        subtotal: menuItem.price * cartItem.quantity,
      });

      totalAmount += menuItem.price * cartItem.quantity;
    }

    return sendResponse(res, 200, true, 'Cart validated', {
      items: validatedItems,
      totalAmount,
      warnings,
    });
  } catch (error) {
    next(error);
  }
};
