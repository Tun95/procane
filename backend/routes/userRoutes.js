import express from "express";
import bcrypt from "bcryptjs";
import expressAsyncHandler from "express-async-handler";
import User from "../models/userModels.js";
import { generateToken, isAdmin, isAuth, isSellerOrAdmin } from "../utils.js";
import nodemailer from "nodemailer";
import crypto from "crypto";
import mongoose from "mongoose";
import Order from "../models/orderModels.js";
import moment from "moment";
import Settings from "../models/settings.js";

// import passport from "./passport.js";

const userRouter = express.Router();
// userRouter.use(passport.initialize());

//============
//USER SIGN IN
//============
userRouter.post(
  "/signin",
  expressAsyncHandler(async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(401).send({ message: "Invalid email or password" });
    }
    if (user.isBlocked === true) {
      return res.status(403).send({
        message: "😲 It appears this account has been blocked by Admin",
      });
    }
    if (bcrypt.compareSync(req.body.password, user.password)) {
      res.send({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        image: user.image,
        email: user.email,
        isAdmin: user.isAdmin,
        isSeller: user.isSeller,
        isAffiliate: user.isAffiliate,
        isBlocked: user.isBlocked,
        isAccountVerified: user.isAccountVerified,
        token: generateToken(user),
      });
      return;
    }
    res.status(401).send({ message: "Invalid email or password" });
  })
);

//===========
//USER SIGNUP
//===========
userRouter.post(
  "/signup",
  expressAsyncHandler(async (req, res) => {
    const userExists = await User.findOne({ email: req.body?.email });
    if (userExists) {
      throw new Error("User already exist");
    }
    const newUser = new User({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password),
    });
    const user = await newUser.save();
    res.send({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      image: user.image,
      email: user.email,
      isAdmin: user.isAdmin,
      isSeller: user.isSeller,
      isAffiliate: user.isAffiliate,
      isBlocked: user.isBlocked,
      isAccountVerified: user.isAccountVerified,
      token: generateToken(user),
    });
  })
);

//============
//GOOGLE LOGIN
//============
// userRouter.get(
//   "/auth/google",
//   passport.authenticate("google", { scope: ["profile", "email"] })
// );
// userRouter.get(
//   "/auth/google/callback",
//   passport.authenticate("google", { failureRedirect: "/login" }),
//   (req, res) => {
//     // Generate the JWT token using the user object obtained from the authentication process
//     const token = generateToken(req.user);

//     // Redirect or send the token to the client (you may choose a different approach based on your application's design)
//     res.redirect(`/dashboard?token=${token}`);
//   }
// );

// userRouter.get("/auth/facebook", passport.authenticate("facebook"));

// userRouter.get(
//   "/auth/facebook/callback",
//   passport.authenticate("facebook", { failureRedirect: "/login" }),
//   (req, res) => {
//     // Redirect or handle successful authentication
//     res.redirect("/"); // Example: Redirect to the homepage
//   }
// );

//TOP SELLERS
userRouter.get(
  "/top-sellers",
  expressAsyncHandler(async (req, res) => {
    const topSellers = await User.find({ isSeller: true })
      .sort({
        "seller.rating": -1,
      })
      .limit(3);
    res.send(topSellers);
  })
);

//=============
//VENDORS FETCH
//=============
userRouter.get(
  "/sellers",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    try {
      const vendors = await User.find({ isSeller: true }).sort("-createdAt");
      res.send(vendors);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve sellers" });
    }
  })
);

//=======================
// AFFILIATE CODE
//=======================
userRouter.post("/generate-affiliate-code/:id", async (req, res) => {
  try {
    // Find the user by userId
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    // Generate a unique affiliate code using a combination of user's ID and a random string
    const randomString = crypto.randomBytes(5).toString("hex"); // Generate a 10-character random string
    const affiliateCode = `${user._id}${randomString}`; // Combine user's ID with the random string

    // Save the affiliate code and isAffiliate status to the user document
    user.affiliateCode = affiliateCode;
    user.isAffiliate = true;
    await user.save();

    res.status(200).send({ affiliateCode });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal server error" });
  }
});

//=========================
//SELLER WITHDRAWAL REQUEST
//=========================
function generateTransactionId() {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const length = 10;
  let transactionId = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    transactionId += characters.charAt(randomIndex);
  }
  return transactionId;
}
userRouter.post(
  "/withdraw",
  isAuth,
  isSellerOrAdmin,
  expressAsyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { amount, email, gateway } = req.body;

    const settings = await Settings.findOne({});
    const minimumWithdrawalAmount = settings?.minimumWithdrawalAmount || 0;

    try {
      // Find the seller user by userId
      const seller = await User.findById(userId);

      if (!seller) {
        return res.status(404).json({ message: "Seller not found" });
      }

      if (!seller.isSeller) {
        return res.status(400).json({ message: "User is not a seller" });
      }

      if (amount <= 0 || amount > seller.grandTotalEarnings) {
        return res.status(400).json({ message: "Invalid withdrawal amount" });
      }

      if (amount < minimumWithdrawalAmount) {
        return res
          .status(400)
          .json({ message: "Withdrawal amount is below the minimum" });
      }

      // Generate a transaction ID for the withdrawal request
      const transactionId = generateTransactionId();

      // Deduct the withdrawal amount from the grandTotalEarnings
      seller.grandTotalEarnings -= amount;

      // Fetch the totalWithdrawn directly from the seller instance
      const totalWithdrawn = seller.withdrawalRequests.reduce(
        (total, request) =>
          request.status === "approved" ? total + request.amount : total,
        0
      );

      // Calculate and update the availableBalance for the seller
      const grandTotalEarningsValue = seller.grandTotalEarnings;
      const availableBalance = grandTotalEarningsValue - totalWithdrawn;
      seller.availableBalance = availableBalance;

      // Add the withdrawal request to the seller's withdrawalRequests
      seller.withdrawalRequests.push({
        amount,
        gateway,
        email,
        transactionId, // Add the generated transactionId
        status: "pending",
        requestDate: new Date(),
      });

      await seller.save();

      res
        .status(200)
        .json({ message: "Withdrawal request submitted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  })
);

//==============================
// Fetch all withdrawal requests
//==============================
userRouter.get(
  "/withdrawal-requests",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    try {
      // Find all users with withdrawal requests
      const usersWithWithdrawalRequests = await User.find({
        "withdrawalRequests.0": { $exists: true },
      });

      if (usersWithWithdrawalRequests.length === 0) {
        // No withdrawal requests found
        res.status(200).json({ message: "No withdrawal requests found" });
        return;
      }

      // Extract withdrawal requests from users
      const withdrawalRequests = usersWithWithdrawalRequests.map((user) => {
        return {
          userId: user._id,
          username: `${user.firstName} ${user.lastName}`,
          sellerName: user.isSeller ? user.seller.name : null,
          requests: user.withdrawalRequests,
        };
      });

      withdrawalRequests.forEach((user) => {
        user.requests.sort((a, b) => b.requestDate - a.requestDate);
      });

      res.status(200).json(withdrawalRequests);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  })
);

//=====================================
// DELETE A SPECIFIC WITHDRAWAL REQUEST
//=====================================
userRouter.delete(
  "/withdrawal-requests/:id",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const { id } = req.params;

    try {
      // Find the user with the withdrawal request
      const userWithWithdrawal = await User.findOne({
        "withdrawalRequests._id": id,
      });

      if (!userWithWithdrawal) {
        return res
          .status(404)
          .json({ message: "Withdrawal request not found" });
      }

      // Find and remove the withdrawal request
      const withdrawalRequest = userWithWithdrawal.withdrawalRequests.id(id);

      if (!withdrawalRequest) {
        return res
          .status(404)
          .json({ message: "Withdrawal request not found" });
      }

      withdrawalRequest.remove();
      await userWithWithdrawal.save();

      res
        .status(200)
        .json({ message: "Withdrawal request deleted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  })
);

//======================================
//ADMIN APPROVAL/DECLINE A WITHDRAWAL
//======================================
// Function to send withdrawal approval/decline email
async function sendWithdrawalEmail(
  toEmail,
  withdrawalAmount,
  gateway,
  transactionId,
  status
) {
  const transporter = nodemailer.createTransport({
    service: process.env.MAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_ADDRESS,
      pass: process.env.GMAIL_PASS,
    },
  });

  let subject = "";
  let message = "";

  if (status === "approved") {
    subject = "Withdrawal Request Approved";
    message = `
    <html>
      <head>
       <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f5f5f5;
            padding: 20px;
          }
          .container {
            background-color: white;
            padding: 20px;
            border-radius: 5px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          h2 {
            color: #333;
          }
          p {
            color: #666;
            margin: 10px 0;
          }
          .footer {
            margin-top: 20px;
            text-align: center;
          }
          .social-icons {
            margin-top: 10px;
          }
          .social-icon {
            margin: 0 5px;
            font-size: 24px;
            color: #333;
          }
          .icons{
            width:25px;
            height: 25px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Withdrawal Request Approved</h2>
          <p>Your withdrawal request for $${withdrawalAmount} via ${gateway} has been approved.</p>
          <p>Transaction ID: ${transactionId}</p>
        </div>
        <div class="footer">
          <p>For more information, visit our website:</p>
          <p><strong>${process.env.SHOP_NAME}</strong></p>
          <div class="social-icons">
            <a href="#" class="social-icon">
              <img class="icons" src="https://res.cloudinary.com/dstj5eqcd/image/upload/v1693399098/facebook_e2bdv6.png" alt="Facebook">
            </a>
            <a href="#" class="social-icon">
              <img class="icons" src="https://res.cloudinary.com/dstj5eqcd/image/upload/v1693399098/twitter_djgizx.png" alt="Twitter">
            </a>
            <a href="#" class="social-icon">
              <img class="icons" src="https://res.cloudinary.com/dstj5eqcd/image/upload/v1693399099/whatsapp_m0dmdp.png" alt="WhatsApp">
            </a>
          </div>
        </div>
      </body>
    </html>
  `;
  } else if (status === "declined") {
    subject = "Withdrawal Request Declined";
    message = `
    <html>
      <head>
       <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f5f5f5;
            padding: 20px;
          }
          .container {
            background-color: white;
            padding: 20px;
            border-radius: 5px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          h2 {
            color: #333;
          }
          p {
            color: #666;
            margin: 10px 0;
          }
          .footer {
            margin-top: 20px;
            text-align: center;
          }
          .social-icons {
            margin-top: 10px;
          }
          .social-icon {
            margin: 0 5px;
            font-size: 24px;
            color: #333;
          }
          .icons{
            width:25px;
            height: 25px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Withdrawal Request Declined</h2>
          <p>Your withdrawal request for $${withdrawalAmount} via ${gateway} has been declined.</p>
        </div>
        <div class="footer">
          <p>For more information, visit our website:</p>
          <p><strong>${process.env.SHOP_NAME}</strong></p>
          <div class="social-icons">
            <a href="#" class="social-icon">
              <img class="icons" src="https://res.cloudinary.com/dstj5eqcd/image/upload/v1693399098/facebook_e2bdv6.png" alt="Facebook">
            </a>
            <a href="#" class="social-icon">
              <img class="icons" src="https://res.cloudinary.com/dstj5eqcd/image/upload/v1693399098/twitter_djgizx.png" alt="Twitter">
            </a>
            <a href="#" class="social-icon">
              <img class="icons" src="https://res.cloudinary.com/dstj5eqcd/image/upload/v1693399099/whatsapp_m0dmdp.png" alt="WhatsApp">
            </a>
          </div>
        </div>
      </body>
    </html>
  `;
  }

  const mailOptions = {
    from: `${process.env.SHOP_NAME} ${process.env.EMAIL_ADDRESS}`,
    to: toEmail,
    subject: subject,
    html: message,
  };

  await transporter.sendMail(mailOptions);
}
userRouter.patch(
  "/withdraw/:id",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const { id } = req.params;
    const { action } = req.body;

    try {
      // Find the seller user by userId
      const seller = await User.findOne({ "withdrawalRequests._id": id });

      if (!seller) {
        return res.status(404).json({ message: "Seller not found" });
      }

      const withdrawalRequest = seller.withdrawalRequests.id(id);
      const withdrawalAmount = withdrawalRequest.amount;
      const gateway = withdrawalRequest.gateway;
      const email = withdrawalRequest.email;
      const transactionId = withdrawalRequest.transactionId; // Retrieve the transactionId from the withdrawal request

      if (action === "approve") {
        // Find the withdrawal request and update its status to approved
        withdrawalRequest.status = "approved";
        withdrawalRequest.approvalDate = new Date();

        // Update the withdrawnAmount by adding the approved withdrawal amount
        seller.withdrawnAmount += withdrawalAmount;

        // Send email notification to the seller about withdrawal approval
        sendWithdrawalEmail(
          email,
          withdrawalAmount,
          gateway,
          transactionId,
          "approved"
        );

        // Save the updated user document
        await seller.save();

        res.status(200).json({ message: "Withdrawal request approved" });
      } else if (action === "decline") {
        // Find the withdrawal request and update its status to declined
        withdrawalRequest.status = "declined";

        // Return the declined amount back to grandTotalEarnings
        seller.grandTotalEarnings += withdrawalAmount;

        // Send email notification to the seller about withdrawal decline
        sendWithdrawalEmail(
          email,
          withdrawalAmount,
          gateway,
          transactionId,
          "declined"
        );

        // Save the updated user document
        await seller.save();

        res.status(200).json({ message: "Withdrawal request declined" });
      } else {
        res.status(400).json({ message: "Invalid action" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  })
);

//=======================
// AFFILIATE COMMISSION
//=======================
userRouter.post("/calculate-affiliate-commission/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    const { amount } = req.body;

    // Calculate the commission based on the user's commission rate and the given amount
    const commission = user.affiliateCommissionRate * amount;

    // Update the user's total earnings with the commission
    user.totalEarnings += commission;
    await user.save();

    res.status(200).send({ commission });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal server error" });
  }
});

//==========================
// ADMIN USER INFO FETCHING
//==========================
userRouter.get(
  "/:id",
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).populate(
      "products wish order apply"
    );

    if (user) {
      const startDate = moment().startOf("day").subtract(9, "days").toDate();
      const endDate = moment().endOf("day").toDate();

      const dailyOrders = await Order.aggregate([
        {
          $match: {
            createdAt: {
              $gte: startDate,
              $lte: endDate,
            },
            user: user._id,
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
            orders: { $sum: 1 },
            numOrders: { $sum: 1 },
            sales: { $sum: "$grandTotal" },
          },
        },
        {
          $sort: { _id: -1 },
        },
        {
          $limit: 10,
        },
      ]);

      res.send({ user, dailyOrders });
    } else {
      res.status(404).send({ message: "User Not Found" });
    }
  })
);

//====================
// USER INFO FETCHING
//====================
userRouter.get(
  "/info/:id",
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).populate(
      "products wish apply"
    );

    if (user) {
      res.send(user);
    } else {
      res.status(404).send({ message: "User Not Found" });
    }
  })
);

//==============
//SELLER PRODUCT
//==============
userRouter.get(
  "/seller/:id",
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).populate({
      path: "products",
      options: { sort: { createdAt: -1 } },
    });

    let numReviewsSum = 0;
    let ratingSum = 0;
    let numSales = 0;

    if (user) {
      for (const product of user.products) {
        numReviewsSum += product.numReviews;
        ratingSum += product.rating;
        numSales += product.numSales;
      }

      // Calculate the total number of sales for the seller's products
      const totalNumSales = [{ _id: null, numSales: numSales }];
      const numReviews = [{ _id: null, numReviews: numReviewsSum }];
      const rating = [
        {
          _id: null,
          rating: ratingSum / user.products.length,
          maxRating: 5,
        },
      ];

      res.send({ user, numReviews, rating, totalNumSales });
    } else {
      res.status(404).send({ message: "User Not Found" });
    }
  })
);

//=============
//USER SPENDING
//=============
userRouter.get(
  "/spent/:id",
  expressAsyncHandler(async (req, res) => {
    const userId = req.params.id;
    try {
      const fiveDaysAgo = new Date();
      fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 1);

      const result = await Order.aggregate([
        {
          $match: {
            createdAt: { $lte: fiveDaysAgo },
            "user._id": userId, // Replace with the user's _id
          },
        },
        {
          $group: {
            _id: {
              // year: { $year: "$createdAt" },
              // month: { $month: "$createdAt" },
              day: { $dayOfMonth: "$createdAt" },
            },
            grandTotal: { $sum: "$grandTotal" },
          },
        },
        {
          $sort: {
            // "_id.year": -1,
            // "_id.month": -1,
            "_id.day": -1,
          },
        },
      ]).limit(5);

      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "An error occurred" });
    }
  })
);

//USER PROFILE UPDATE
userRouter.put(
  "/profile",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (user) {
      user.name = req.body.name;
      user.email = req.body.email;
      user.image = req.body.image || user.image;
      user.phone = req.body.phone;
      user.address = req.body.address;
      user.country = req.body.country;
      if (user.isSeller) {
        user.seller.name = req.body.sellerName || user.seller.name;
        user.seller.logo = req.body.sellerLogo || user.seller.logo;
        user.seller.description =
          req.body.sellerDescription || user.seller.description;
      }
      if (req.body.password) {
        user.password = bcrypt.hashSync(req.body.password, 8);
      }
      const updatedUser = await user.save();
      res.send({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        image: updatedUser.image,
        phone: updatedUser.phone,
        address: updatedUser.address,
        country: updatedUser.country,
        isAdmin: updatedUser.isAdmin,
        isSeller: updatedUser.isSeller,
        isBlocked: updatedUser.isBlocked,
        isAccountVerified: updatedUser.isAccountVerified,
        token: generateToken(updatedUser),
      });
    }
  })
);

//ADMIN USER LIST FETCHING
userRouter.get(
  "/",
  isAuth,
  // isAdmin,
  expressAsyncHandler(async (req, res) => {
    const users = await User.find({}).sort("-createdAt").populate("apply");
    res.send(users);
  })
);

//ADMIN USER DELETE
userRouter.delete(
  "/:id",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).send({ message: "User Not Found" });
    }
    if (user) {
      if (user.isAdmin) {
        return res.status(400).send({ message: "Cannot Delete Admin User" });
      }
      await user.remove();
      res.send({ message: "User Deleted Successfuly" });
    } else {
      res.status(404).send({ message: "User Not Found" });
    }
  })
);

//ADMIN BLOCK USER
userRouter.put(
  "/block/:id",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const { id } = req.params;
    const user = await User.findById(req.params.id);
    if (user.isAdmin) {
      res.status(400).send({ message: "Cannot Block Admin User" });
    } else {
      try {
        const user = await User.findByIdAndUpdate(
          id,
          {
            isBlocked: true,
          },
          {
            new: true,
            runValidators: true,
          }
        );
        res.send(user);
      } catch {
        res.send({ message: "Fail to block user" });
      }
    }
  })
);

//==================
//ADMIN UNBLOCK USER
//=================
userRouter.put(
  "/unblock/:id",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const id = req.params.id;
    try {
      const user = await User.findByIdAndUpdate(
        id,
        {
          isBlocked: false,
        },
        {
          new: true,
          runValidators: true,
        }
      );
      res.send(user);
    } catch {
      res.send({ message: "Fail to unblock user" });
    }
  })
);

//=================
//ADMIN USER UPDATE
//=================
userRouter.put(
  "/:id",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (user) {
      user.name = req.body.name;
      user.email = req.body.email;
      user.phone = req.body.phone;
      user.address = req.body.address;
      user.country = req.body.country;
      user.image = req.body.image || user.image;
      user.isAdmin = Boolean(req.body.isAdmin);
      user.isSeller = Boolean(req.body.isSeller);
      user.isAffiliate = Boolean(req.body.isAffiliate);
      user.isBlocked = Boolean(req.body.isBlocked);
      const updatedUser = await user.save();
      res.send({
        message: "User Updated Successfully",
        user: updatedUser,
      });
    } else {
      res.status(404).send({ message: "User Not Found" });
    }
  })
);

//===============
//Generate Email Verification Token
//===============
userRouter.post(
  "/verification-token",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const loginUserId = req?.user?._id;
    const user = await User.findById(loginUserId);
    try {
      const verificationToken = await user?.createAccountVerificationToken();
      await user.save();
      console.log(verificationToken);

      // Generate the verification link
      const verificationLink = `${process.env.SUB_DOMAIN}/verify-success/${user.id}/${verificationToken}`;

      // HTML message
      const emailMessage = `
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
            }
            h1 {
              color: #007BFF;
            }
            p {
              margin-bottom: 16px;
            }
            a {
              display: inline-block;
              padding: 10px 20px;
              background-color: #007BFF;
              color: #FFFFFF !important;
              text-decoration: none;
              border-radius: 4px;
            }
            
          </style>
        </head>
        <body>
          <h1>Email Verification</h1>
          <p>Hello ${user.firstName},</p>
          <p>You have received this email because you have been requested to verify your account.</p>
          <p>Please click the button below to verify your account:</p>
          <a href="${verificationLink}">Verify Account</a>
          <p>If you did not request this verification, you can safely ignore this email.</p>
          <p>This verification link is valid for the next 10 minutes.</p>
          <p>Thank you,</p>
          <p>${process.env.SHOP_NAME} Team</p>
          <hr/>
        </body>
        </html>
      `;

      // Create a nodemailer transport
      const smtpTransport = nodemailer.createTransport({
        service: process.env.MAIL_SERVICE,
        auth: {
          user: process.env.EMAIL_ADDRESS,
          pass: process.env.GMAIL_PASS,
        },
      });

      // Setup email data
      const mailOptions = {
        from: `${process.env.SHOP_NAME} ${process.env.EMAIL_ADDRESS}`,
        to: `${user.email}`,
        subject: "Verify your email address",
        html: emailMessage,
      };

      // Send the email
      smtpTransport.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
          res.status(500).json({ message: "Failed to send email" });
        } else {
          console.log("Email sent: " + info.response);
          res
            .status(200)
            .json({ message: "Verification email sent successfully" });
        }
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  })
);

//===============
//Account Verification
//===============
userRouter.put(
  "/verify-account/:id/",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const { token } = req?.body;
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    //find user by token
    const userFound = await User.findOne({
      accountVerificationToken: hashedToken,
      accountVerificationTokenExpires: { $gt: new Date() },
    });
    if (!userFound) {
      throw new Error("Invalid token or Token expired, try again");
    }
    userFound.isAccountVerified = true;
    userFound.accountVerificationToken = undefined;
    userFound.accountVerificationTokenExpires = undefined;
    await userFound.save();
    res.send(userFound);
  })
);

//===============
//Password Reset Token
//===============
userRouter.post(
  "/password-token",
  expressAsyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) throw new Error("User not Found");
    try {
      const token = await user.createPasswordResetToken();
      await user.save();

      // HTML message
      const resetURL = `<p>Hello ${user.firstName},</p>
        <p>We received a request to reset your password for your account at ${
          process.env.SHOP_NAME
        }. If you did not request this, please ignore this email.</p>
        <p>To reset your password, click the button below:</p>
        <a href=${`${process.env.SUB_DOMAIN}/${user.id}/new-password/${token}`} style="display: inline-block; margin: 10px 0; padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 4px;">Reset Password</a>
        <p style="color: #777; font-size: 14px;">Please note that this link will expire in 10 minutes for security reasons.</p>
        <p>If the button above doesn't work, you can also copy and paste the following URL into your web browser:</p>
        <p>${`${process.env.SUB_DOMAIN}/${user.id}/new-password/${token}`}</p>
        <p>If you have any questions or need further assistance, please contact our support team at ${
          process.env.EMAIL_ADDRESS
        }.</p>
        <p>Best regards,<br/>${process.env.SHOP_NAME} Team</p>     
        `;

      const smtpTransport = nodemailer.createTransport({
        service: process.env.MAIL_SERVICE,
        auth: {
          user: process.env.EMAIL_ADDRESS,
          pass: process.env.GMAIL_PASS,
        },
      });

      const mailOptions = {
        from: `${process.env.SHOP_NAME} ${process.env.EMAIL_ADDRESS}`,
        to: email,
        subject: "Reset Password",
        html: resetURL,
      };
      // Send the email
      smtpTransport.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
          res.status(500).json({ message: "Failed to send email" });
        } else {
          console.log("Email sent: " + info.response);
          res.status(200).json({
            message: `A verification email has been successfully sent to ${user?.email}. Reset now within 10 minutes.`,
          });
        }
      });
    } catch (error) {
      res.send(error);
    }
  })
);

//===============
//Password Reset
//===============
userRouter.put(
  "/:id/reset-password",
  // isAuth,
  expressAsyncHandler(async (req, res) => {
    const password = bcrypt.hashSync(req.body.password);
    const { token } = req?.body;
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    //find user by token
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetTokenExpires: { $gt: new Date() },
    });
    console.log(hashedToken);
    if (!user) throw new Error("Invalid token or token expired, try again");

    //update user password
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;
    await user.save();

    res.send(user);
    console.log(user);
  })
);

export default userRouter;
