import mongoose from "mongoose";

const cartSchema = new mongoose.Schema(
  {
    name: { type: String },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    slug: { type: String },
    keygen: { type: String },
    gender: { type: String },
    category: { type: Array },
    size: { type: Array },
    color: { type: Array },
    price: { type: Number },
    countInStock: { type: Number },
    discount: { type: Number, default: 0 },
    brand: { type: Array },
    image: { type: String },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const Cart = mongoose.model("Cart", cartSchema);
export default Cart;
