import mongoose from "mongoose";

const priceSchema = new mongoose.Schema(
  {
    price: {
      type: String,
      required: true,
    },
    priceSpan: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const Price = mongoose.model("Price", priceSchema);
export default Price;
