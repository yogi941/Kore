const mongoose = require('mongoose');

const canteenSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Canteen name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    image: {
      type: String,
      default: null,
    },
    isOpen: {
      type: Boolean,
      default: true,
    },
    operatingHours: {
      breakfast: { open: String, close: String },
      lunch: { open: String, close: String },
      evening: { open: String, close: String },
    },
    pickupSlots: [
      {
        label: String,
        time: String,
        maxOrders: { type: Number, default: 50 },
      },
    ],
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalOrders: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

canteenSchema.index({ name: 1 });
canteenSchema.index({ isOpen: 1 });

module.exports = mongoose.model('Canteen', canteenSchema);
