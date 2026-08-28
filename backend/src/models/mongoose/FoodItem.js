import mongoose from 'mongoose';

export const foodItemSchema = new mongoose.Schema(
  {
    donationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Donation',
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Food item name is required'],
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      default: 1,
      min: 0.1,
    },
    unit: {
      type: String,
      default: 'KG',
      trim: true,
    },
    category: {
      type: String,
      enum: ['COOKED_MEALS', 'BAKERY', 'PRODUCE', 'PACKAGED', 'DAIRY', 'BEVERAGES', 'RAW_PRODUCE', 'PACKAGED_GOODS'],
      default: 'COOKED_MEALS',
    },
    expiryDate: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const FoodItem =
  mongoose.models.FoodItem || mongoose.model('FoodItem', foodItemSchema);
export default FoodItem;
