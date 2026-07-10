const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
      maxlength: [150, 'Name cannot exceed 150 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['breakfast', 'lunch', 'snacks', 'beverages', 'dinner'],
    },
    canteen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Canteen',
      required: true,
    },
    image: {
      type: String,
      default: null,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    isVeg: {
      type: Boolean,
      default: true,
    },
    preparationTime: {
      type: Number,
      default: 10,
    },
    tags: [{ type: String, trim: true }],
    totalOrdered: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

menuItemSchema.index({ canteen: 1, isAvailable: 1 });
menuItemSchema.index({ canteen: 1, category: 1 });
menuItemSchema.index({ name: 'text', tags: 'text' });

module.exports = mongoose.model('MenuItem', menuItemSchema);
