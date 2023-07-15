import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String },
    image: { type: String },
    comment: { type: String, required: true },
    rating: { type: Number, required: true },
  },
  {
    timestamps: true,
  }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    slug: { type: String, required: true },
    keygen: { type: String },
    category: [{ type: String }], // Updated to array type
    size: [{ type: String }], // Updated to array type
    color: [{ type: String }], // Updated to array type
    price: { type: Number },
    countInStock: { type: Number, default: 0 },
    numSales: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    brand: [{ type: String }], // Updated to array type
    image: { type: String },
    flashdeal: { type: Boolean, default: false },
    images: [String],
    desc: { type: String },
    weight: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    reviews: [reviewSchema],
    numWish: { type: Number, default: 0 },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    // orders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true }, // Enable virtuals to be included in toJSON output
    toObject: { virtuals: true }, // Enable virtuals to be included in toObject output
  }
);

//Virtual method to populate created order
productSchema.virtual("order", {
  ref: "Order",
  foreignField: "orderItems.product",
  localField: "_id",
});

const Product = mongoose.model("Product", productSchema);
export default Product;
