const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const sendResponse = require('../utils/sendResponse');

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, rollNumber, phone } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return sendResponse(res, 409, false, 'Email already registered');
    }

    const user = await User.create({ name, email, password, rollNumber, phone });
    const token = generateToken(user._id);

    return sendResponse(res, 201, true, 'Registration successful', {
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendResponse(res, 400, false, 'Email and password are required');
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !user.isActive) {
      return sendResponse(res, 401, false, 'Invalid credentials');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return sendResponse(res, 401, false, 'Invalid credentials');
    }

    const token = generateToken(user._id);

    return sendResponse(res, 200, true, 'Login successful', {
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        canteen: user.canteen,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('canteen', 'name location');
    return sendResponse(res, 200, true, 'Profile fetched', user);
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone },
      { new: true, runValidators: true }
    );
    return sendResponse(res, 200, true, 'Profile updated', user);
  } catch (error) {
    next(error);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return sendResponse(res, 401, false, 'Current password is incorrect');

    user.password = newPassword;
    await user.save();

    return sendResponse(res, 200, true, 'Password changed successfully');
  } catch (error) {
    next(error);
  }
};
