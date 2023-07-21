import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    orderItems: [
      {
        slug: { type: String, required: true },
        name: { type: String, required: true },
        keygen: { type: String },
        size: { type: Array },
        category: { type: Array },
        color: { type: Array },
        quantity: { type: Number },
        image: { type: String },
        price: { type: Number },
        discount: { type: Number },
        sellerName: { type: String },
        seller: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
      },
    ],
    trackingId: { type: String, unique: true, index: true },
    shippingAddress: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      address: { type: String, required: true },
      phone: { type: String, required: true },
      city: { type: String, required: true },
      cState: { type: String, required: true },
      zipCode: { type: String, required: true },
      country: { type: String, required: true },
      shipping: { type: String, required: true },
    },
    currencySign: { type: String },
    paymentMethod: { type: String },
    paymentResult: {
      id: String,
      status: String,
      update_time: String,
      email_address: String,
    },
    itemsPrice: { type: Number, required: true },
    shippingPrice: { type: Number, required: true },
    taxPrice: { type: Number, required: true },
    grandTotal: { type: Number, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date },
    isDelivered: { type: Boolean, default: false },
    deliveredAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
