const mongoose = require('mongoose');

const parentOrderSchema = new mongoose.Schema(
  {
    parentOrderNumber: {
      type: String,
      unique: true,
      default: () => `KCT-GRP-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    shopOrders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded'],
      default: 'pending',
    },
    overallStatus: {
      type: String,
      enum: ['pending', 'in_progress', 'ready_for_pickup', 'completed', 'cancelled'],
      default: 'pending',
    },
    isGroupOrder: {
      type: Boolean,
      default: false,
    },
    groupOrderRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'GroupOrder',
      default: null,
    },
    pickupSlot: {
      label: String,
      time: String,
    },
    specialInstructions: { type: String, trim: true },
  },
  { timestamps: true }
);

parentOrderSchema.index({ student: 1, createdAt: -1 });
parentOrderSchema.index({ parentOrderNumber: 1 });

module.exports = mongoose.model('ParentOrder', parentOrderSchema);
