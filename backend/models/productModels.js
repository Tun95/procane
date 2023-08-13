import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema({
  checked: { type: Boolean, default: false },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});
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
    slug: { type: String, required: true, unique: true },
    keygen: { type: String },
    category: [{ type: String }], // Updated to array type
    size: [{ type: String }], // Updated to array type
    color: [{ type: String }], // Updated to array type
    price: { type: Number },
    countInStock: { type: Number, default: 0 },
    numSales: { type: Number, default: 0 },
    sold: [
      {
        value: { type: Number, default: 0 },
        date: { type: Date, default: Date.now },
      },
    ],
    discount: { type: Number, default: 0 },
    brand: [{ type: String }], // Updated to array type
    image: { type: String },
    flashdeal: { type: Boolean, default: false },
    images: [String],
    desc: { type: String },
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    reviews: [reviewSchema],
    weight: { type: Number, default: 0 },
    wish: [wishlistSchema],
    numWish: { type: Number, default: 0 },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // Fields for affiliate functionality
    affiliateEnabled: { type: Boolean, default: false }, // Indicates if the product supports affiliate program
    affiliateCommissionRate: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true }, // Enable virtuals to be included in toJSON output
    toObject: { virtuals: true }, // Enable virtuals to be included in toObject output
  }
);

// Create the slug before saving the product
productSchema.pre("save", function (next) {
  if (this.isNew || this.isModified("name")) {
    // Replace spaces with hyphens in the name and convert to lowercase
    this.slug = this.name.replace(/\s+/g, "-").toLowerCase();
  }
  next();
});

// // Middleware to update the 'sold' array based on 'numSales'
// productSchema.pre("save", function (next) {
//   if (this.isModified("numSales")) {
//     const today = new Date().toISOString().slice(0, 10);

//     // Find the sold entry for today
//     const todaySold = this.sold.find(
//       (entry) => entry.date.toISOString().slice(0, 10) === today
//     );

//     if (todaySold) {
//       todaySold.value = this.numSales;
//     } else {
//       this.sold.push({ value: this.numSales, date: new Date(today) });
//     }
//   }
//   next();
// });
// Middleware to update the 'sold' array based on 'numSales'
productSchema.pre("save", function (next) {
  if (this.isModified("numSales")) {
    const currentDate = new Date();
    const today = currentDate.toISOString().slice(0, 10);
    const twoDaysAgo = new Date(currentDate.getTime() - 2 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);

    // Filter the sold entries to include only those from the last two days
    const lastTwoDaysSold = this.sold.filter(
      (entry) =>
        entry.date.toISOString().slice(0, 10) === today ||
        entry.date.toISOString().slice(0, 10) === twoDaysAgo
    );

    if (lastTwoDaysSold.length > 0) {
      // Update the values of existing entries for the last two days
      lastTwoDaysSold.forEach((entry) => {
        entry.value = this.numSales;
      });
    } else {
      // If no entries for the last two days, create new entries
      this.sold.push({ value: this.numSales, date: new Date(today) });
      this.sold.push({ value: this.numSales, date: new Date(twoDaysAgo) });
    }
  }
  next();
});

//Virtual method to populate created order
productSchema.virtual("order", {
  ref: "Order",
  foreignField: "orderItems.product",
  localField: "_id",
});

const Product = mongoose.model("Product", productSchema);
export default Product;
