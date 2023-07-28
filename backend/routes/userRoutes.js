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

// import passport from "./passport.js";

const userRouter = express.Router();
// userRouter.use(passport.initialize());

//===========
//USER SIGNIN
//===========
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
    const user = await User.findById(req.params.id).populate("products");
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

//ADMIN USER UPDATE
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
          <small>Developed by <a href=${`https://my-portfolio-nine-nu-28.vercel.app/`}>Olatunji Akande</a><small/>
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
        <p>We received a request to reset your password for your account at [Your Website Name]. If you did not request this, please ignore this email.</p>
        <p>To reset your password, click the button below:</p>
        <a href=${`${process.env.SUB_DOMAIN}/${user.id}/new-password/${token}`} style="display: inline-block; margin: 10px 0; padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 4px;">Reset Password</a>
        <p style="color: #777; font-size: 14px;">Please note that this link will expire in 10 minutes for security reasons.</p>
        <p>If the button above doesn't work, you can also copy and paste the following URL into your web browser:</p>
        <p>${`${process.env.SUB_DOMAIN}/${user.id}/new-password/${token}`}</p>
        <p>If you have any questions or need further assistance, please contact our support team at ${
          process.env.EMAIL_ADDRESS
        }.</p>
        <p>Best regards,<br/>${process.env.SHOP_NAME} Team</p>
        <hr/>
        <small>Developed by <a href=${`https://my-portfolio-nine-nu-28.vercel.app/`}>Olatunji Akande</a><small/>
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

      smtpTransport.sendMail(mailOptions);
      res.send({
        msg: `A verification email has been successfully sent to ${user?.email}. Reset now within 10 minutes.`,
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
