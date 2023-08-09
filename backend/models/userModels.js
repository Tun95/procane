import mongoose from "mongoose";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import Order from "./orderModels.js";

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

    //Affiliate
    isAffiliate: { type: Boolean, default: false }, // Indicates if the user is an affiliate
    affiliateCode: { type: String, unique: true }, // Unique code for the affiliate user
    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Stores the ID of the user who referred this user (optional)

    affiliateCommissionRate: { type: Number, default: 0.1 }, // Example: Commission rate for the affiliate
    totalEarnings: [
      {
        value: { type: Number, default: 0 },
        date: { type: Date, default: Date.now },
      },
    ], //  otherAffiliateData: { type: ... }, // Example: Any other data specific to the affiliate

    grandTotalEarnings: { type: Number, default: 0 },
    availableBalance: { type: Number, default: 0 },
    minimumWithdrawalAmount: { type: Number, default: 0 },
    withdrawnAmount: { type: Number, default: 0 },
    refundAmount: { type: Number, default: 0 },
    // Withdrawal requests made by the seller
    withdrawalRequests: [
      {
        amount: { type: Number, required: true },
        status: {
          type: String,
          enum: ["pending", "approved", "declined"],
          default: "pending",
        },
        requestDate: { type: Date, default: Date.now },
        approvalDate: { type: Date },
      },
    ],
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

// Generate and save an affiliate code for the user
userSchema.methods.generateAffiliateCode = async function () {
  // Generate a unique affiliate code using a combination of user's ID and a random string
  const randomString = crypto.randomBytes(5).toString("hex"); // Generate a 10-character random string
  const affiliateCode = `${this._id}${randomString}`; // Combine user's ID with the random string

  this.affiliateCode = affiliateCode;
  this.isAffiliate = true;

  // Save the user document
  await this.save();

  return affiliateCode;
};

// Optionally, you can add methods to track and calculate affiliate commissions and earnings

// Optionally, you can add methods to track and calculate affiliate commissions and earnings
userSchema.methods.calculateAffiliateCommission = async function (amount) {
  // Calculate the commission based on the affiliate's commission rate and the given amount
  const commission = this.affiliateCommissionRate * amount;

  // Push the new commission object with the current date to the totalEarnings array
  this.totalEarnings.push({ value: commission, date: new Date() });

  // Save the updated user document
  await this.save();

  return commission;
};

// Method to process withdrawal requests
userSchema.methods.processWithdrawal = async function (amount) {
  // Validate if the withdrawal amount is greater than the minimum withdrawal amount
  if (amount < this.minimumWithdrawalAmount) {
    throw new Error("Withdrawal amount is less than the minimum allowed.");
  }

  // Validate if the withdrawal amount is not greater than the available balance
  if (amount > this.availableBalance) {
    throw new Error("Insufficient available balance for withdrawal.");
  }

  // Deduct the withdrawal amount from the available balance and update withdrawnAmount
  this.availableBalance -= amount;
  this.withdrawnAmount += amount;

  // Add the withdrawal request to the withdrawalRequests array
  this.withdrawalRequests.push({
    amount,
    status: "pending",
    requestDate: new Date(),
  });

  // Save the updated user document
  await this.save();
};

// Method to calculate the grandTotalEarnings for a seller
userSchema.methods.calculateGrandTotalEarnings = async function () {
  try {
    // Calculate the grandTotalEarnings by aggregating the grandTotal from orders
    const orders = await Order.find({ seller: this._id, isPaid: true });
    const grandTotalEarnings = orders.reduce(
      (total, order) => total + order.grandTotal,
      0
    );

    // Update the grandTotalEarnings field in the user document
    this.grandTotalEarnings = grandTotalEarnings;

    // Save the updated user document
    await this.save();

    return grandTotalEarnings;
  } catch (error) {
    throw new Error("Failed to calculate grandTotalEarnings for the seller.");
  }
};

// Method to handle admin approval or decline of withdrawal requests
userSchema.methods.adminApproveOrDeclineWithdrawal = async function (
  requestId,
  status
) {
  const withdrawalRequest = this.withdrawalRequests.id(requestId);
  if (!withdrawalRequest) {
    throw new Error("Withdrawal request not found.");
  }

  if (withdrawalRequest.status === "pending") {
    if (status === "approved") {
      // Update the status and approval date
      withdrawalRequest.status = "approved";
      withdrawalRequest.approvalDate = new Date();

      // Withdrawal approved, no further action needed
    } else if (status === "declined") {
      // Update the status and refund the amount to the available balance and grandTotalEarnings
      withdrawalRequest.status = "declined";
      this.availableBalance += withdrawalRequest.amount;
      this.refundAmount += withdrawalRequest.amount;
    } else {
      throw new Error(
        "Invalid status. Status should be 'approved' or 'declined'."
      );
    }

    // Save the updated user document
    await this.save();
  } else {
    throw new Error(
      "Withdrawal request status cannot be modified once processed."
    );
  }
};

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
