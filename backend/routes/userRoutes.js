import express from "express";
import bcrypt from "bcryptjs";
import expressAsyncHandler from "express-async-handler";
import User from "../models/userModels.js";
import { generateToken, isAdmin, isAuth } from "../utils.js";
import nodemailer from "nodemailer";
import crypto from "crypto";
import mongoose from "mongoose";
import Order from "../models/orderModels.js";
import moment from "moment";

const userRouter = express.Router();

// userRouter.get(
//   "/:userId/orders/summary",
//   // isAuth middleware to ensure user is authenticated
//   // isSellerOrAdmin middleware to check if the user is a seller or admin
//   expressAsyncHandler(async (req, res) => {
//     const { userId } = req.params;

//     const dailyOrders = await User.aggregate([
//       // Match the user based on the provided userId
//       { $match: { _id: mongoose.Types.ObjectId(userId) } },
//       // Unwind the order array to flatten it
//       { $unwind: "$order" },
//       // Group by the order's createdAt date and calculate the total grandTotal for each day
//       {
//         $group: {
//           _id: {
//             $dateToString: { format: "%Y-%m-%d", date: "$order.createdAt" },
//           },
//           totalGrandTotal: { $sum: "$order.grandTotal" },
//         },
//       },
//       // Sort the results by date in descending order
//       { $sort: { _id: -1 } },
//       // Limit the results to the last 10 days
//       { $limit: 10 },
//     ]);

//     res.send({ dailyOrders });
//   })
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

// ADMIN USER INFO FETCHING
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

// USER INFO FETCHING
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
    const user = await User.findById(req.params.id).populate("products");
    let numReviewsSum = 0;
    let ratingSum = 0;

    if (user) {
      for (const product of user.products) {
        numReviewsSum += product.numReviews;
        ratingSum += product.rating;
      }
      const numReviews = [{ _id: null, numReviews: numReviewsSum }];
      const rating = [
        {
          _id: null,
          rating: ratingSum / user.products.length,
          maxRating: 5,
        },
      ];

      res.send({ user, numReviews, rating });
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
//TEST
userRouter.get(
  "/num_reviews/:id",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const userId = req.params.id;
    const result = await User.aggregate([
      { $match: { _id: mongoose.Types.ObjectId(userId) } },
      { $unwind: "$products" },
      {
        $group: {
          _id: null,
          totalNumReviews: { $sum: "$products.numReviews" },
        },
      },
    ]);

    if (result.length > 0) {
      const totalNumReviews = result[0].totalNumReviews;
      res.status(200).json({ totalNumReviews });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  })
);

//USER SIGNIN
userRouter.post(
  "/signin",
  expressAsyncHandler(async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    // if (user.isBlocked === true) {
    //   throw new Error("😲It appears this account have been blocked by Admin");
    // }
    if (user) {
      if (bcrypt.compareSync(req.body.password, user.password)) {
        res.send({
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          image: user.image,
          email: user.email,
          isAdmin: user.isAdmin,
          isSeller: user.isSeller,
          isBlocked: user.isBlocked,
          isAccountVerified: user.isAccountVerified,
          token: generateToken(user),
        });

        return;
      }
    }
    res.status(401).send({ message: "Invalid email or password" });
  })
);

//USER SIGNUP
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
      isBlocked: user.isBlocked,
      isAccountVerified: user.isAccountVerified,
      token: generateToken(user),
    });
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
    if (user) {
      if (user.email === process.env.EMAIL_ADDRESS) {
        res.status(400).send({ message: "Can Not Delete Admin User" });
        return;
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
  // isAuth,
  // isAdmin,
  expressAsyncHandler(async (req, res) => {
    const { id } = req.params;
    const user = await User.findById(req.params.id);
    if (user.email === process.env.EMAIL_ADDRESS) {
      throw new Error("Can Not Block This Admin User");
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

//ADMIN UNBLOCK USER
userRouter.put(
  "/unblock/:id",
  // isAuth,
  // isAdmin,
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

//ADMIN USER UPDATE
userRouter.put(
  "/:id",
  isAuth,
  // isAdmin,
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

      //HTML message
      const subdomain = process.env.SUB_DOMAIN;
      const resetURL = `<p>if you were requested to verify your
      account,<br/> verify now within the next 10mins,<br/>
      otherwise ignore this message</p>
      <a href=${`${process.env.SUB_DOMAIN}/verify-success/${user.id}/${verificationToken}`}>Click here to verify</a>`;
      const smtpTransport = nodemailer.createTransport({
        service: process.env.MAIL_SERVICE,
        auth: {
          user: process.env.EMAIL_ADDRESS,
          pass: process.env.GMAIL_PASS,
        },
      });
      const mailOptions = {
        from: `${process.env.SHOP_NAME} ${process.env.EMAIL_ADDRESS}`,
        to: `${user.email}`,
        subject: "Verify your email address",
        html: resetURL,
      };
      smtpTransport.sendMail(mailOptions);
      res.send(resetURL);
    } catch (error) {
      res.send(error);
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

      //HTML message
      const subdomain = process.env.SUB_DOMAIN;
      const resetURL = `<p>if you were requested to reset your 
		password,<br/> resest now within the next 10mins,<br/>
		otherwise ignore this message </p>
		<a href=${`${process.env.SUB_DOMAIN}/${user.id}/new-password/${token}`}>Click here to reset</a>`;
      const smtpTransport = nodemailer.createTransport({
        service: process.env.MAIL_SERVICE,
        auth: {
          user: process.env.EMAIL_ADDRESS,
          pass: process.env.GMAIL_PASS,
        },
      });
      //kakszzxtewcdustm
      const mailOptions = {
        from: `${process.env.SHOP_NAME} ${process.env.EMAIL_ADDRESS}`,
        to: email,
        subject: "Reset Password",
        html: resetURL,
      };
      smtpTransport.sendMail(mailOptions);
      res.send({
        msg: `A verification email has been successfully sent to ${user?.email}.
			 Reset now within 10mins, ${resetURL} `,
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
