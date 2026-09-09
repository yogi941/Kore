const mongoose = require('mongoose');

const groupOrderItemSchema = new mongoose.Schema({
  menuItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem',
    required: true,
  },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, default: 1 },
  canteen: { type: mongoose.Schema.Types.ObjectId, ref: 'Canteen', required: true },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  addedByName: { type: String, required: true },
});

const groupOrderSchema = new mongoose.Schema(
  {
    groupCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    leader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    canteen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Canteen',
      required: true,
    },
    members: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        name: String,
        email: String,
        isPaid: { type: Boolean, default: false },
        joinedAt: { type: Date, default: Date.now },
      },
    ],
    items: [groupOrderItemSchema],
    paymentType: {
      type: String,
      enum: ['group_leader', 'split'],
      default: 'group_leader',
    },
    status: {
      type: String,
      enum: ['active', 'locked', 'placed', 'cancelled'],
      default: 'active',
    },
    parentOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ParentOrder',
      default: null,
    },
    totalAmount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

groupOrderSchema.index({ groupCode: 1 });
groupOrderSchema.index({ leader: 1 });

module.exports = mongoose.model('GroupOrder', groupOrderSchema);
