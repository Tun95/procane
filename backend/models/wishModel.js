import mongoose from "mongoose";

const wishSchema = new mongoose.Schema(
  {
    name: { type: String },
    slug: { type: String },
    image: { type: String },
    rating: { type: Number },
    price: { type: Number },
    discount: { type: Number },
    flashdeal: { type: Boolean, default: false },
    checked: { type: Boolean, default: false },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User id is required"],
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Wish = mongoose.model("Wish", wishSchema);
export default Wish;
