import mongoose from "mongoose";
import crypto from "crypto";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    address: { type: String },
    country: { type: String },
    image: { type: String },
    isBlocked: { type: Boolean, default: false },
    application: { type: Boolean, default: false },
    password: { type: String, required: true },
    passwordChangeAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    isAdmin: { type: Boolean, default: false, required: true },
    isSeller: { type: Boolean, default: false, required: true },
    seller: {
      name: String,
      logo: String,
      description: String,
      rating: { type: Number },
      numReviews: { type: Number },
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    },
    isAccountVerified: { type: Boolean, default: false },
    accountVerificationToken: { type: String },
    accountVerificationTokenExpires: { type: Date },
  },
  {
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
    timestamps: true,
  }
);

//Virtual method to populate created product
userSchema.virtual("products", {
  ref: "Product",
  foreignField: "seller",
  localField: "_id",
});

//Virtual method to populate created wish
userSchema.virtual("wish", {
  ref: "Wish",
  foreignField: "user",
  localField: "_id",
});

//Virtual method to populate created order
userSchema.virtual("order", {
  ref: "Order",
  foreignField: "user",
  localField: "_id",
});

//Virtual method to populate created applications
userSchema.virtual("apply", {
  ref: "Apply",
  foreignField: "user",
  localField: "_id",
});

//Verify Account
userSchema.methods.createAccountVerificationToken = async function () {
  const verificationToken = crypto.randomBytes(32).toString("hex");
  this.accountVerificationToken = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex");

  this.accountVerificationTokenExpires = Date.now() + 30 * 60 * 1000; //10 mins
  return verificationToken;
};

//Password Reset
userSchema.methods.createPasswordResetToken = async function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetExpires = Date.now() + 30 * 60 * 1000; //10mins
  return resetToken;
};

//Match Password
userSchema.methods.isPasswordMatch = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
