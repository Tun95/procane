import express from "express";
import expressAsyncHandler from "express-async-handler";
import Order from "../models/orderModels.js";
import User from "../models/userModels.js";
import { isAuth, isAdmin, isSellerOrAdmin } from "../utils.js";
import Sib from "sib-api-v3-sdk";
import Product from "../models/productModels.js";
import Settings from "../models/settings.js";
import Stripe from "stripe";
import Razorpay from "razorpay";
import axios from "axios";
import fetch from "node-fetch";
import crypto from "crypto";
import shippo from "shippo";
import mongoose from "mongoose";

const orderRouter = express.Router();

const ADMIN_PAGE_SIZE = 25;
orderRouter.get(
  "/",
  isAuth,
  isSellerOrAdmin,
  expressAsyncHandler(async (req, res) => {
    const { query } = req;
    const page = query.page || 1;
    const seller = req.query.seller || "";
    const pageSize = query.pageSize || ADMIN_PAGE_SIZE;
    // const sellerFilter = seller ? { seller } : {};
    const sellerFilter = seller && seller !== "all" ? { seller } : {};
    const orders = await Order.find({ ...sellerFilter })
      .populate("user seller")
      .sort("-updatedAt")
      .skip(pageSize * (page - 1))
      .limit(pageSize);

    const countOrders = await Order.countDocuments({});

    res.send({
      orders,
      countOrders,
      page,
      pages: Math.ceil(countOrders / pageSize),
    });
  })
);

//==================
//ORDERS BY CATEGORY
//==================
orderRouter.get(
  "/orders-category",
  // isAuth,
  // isSellerOrAdmin,
  expressAsyncHandler(async (req, res) => {
    try {
      const orders = await Order.find();
      const categoryCounts = await Order.aggregate([
        {
          $unwind: "$orderItems",
        },
        {
          $group: {
            _id: "$orderItems.category",
            count: { $sum: 1 },
          },
        },
      ]);

      const categoryCountsMap = {};
      categoryCounts.forEach((categoryCount) => {
        categoryCountsMap[categoryCount._id] = categoryCount.count;
      });

      res.status(200).json({
        orders,
        categoryCounts: categoryCountsMap,
      });
    } catch (error) {
      res.status(500).json({ message: "Error retrieving orders" });
    }
  })
);

//===========
//PLACE ORDER
//===========
function generateRandomString(length) {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const randomBytes = crypto.randomBytes(length);
  const result = Array.from(randomBytes)
    .map((byte) => characters[byte % characters.length])
    .join("");

  return result;
}
// orderRouter.post(
//   "/",
//   isAuth,
//   expressAsyncHandler(async (req, res) => {
//     const trackingId = "R" + generateRandomString(16);
//     const newOrder = new Order({
//       seller: req.body.orderItems[0].seller,
//       orderItems: req.body.orderItems.map((x) => ({ ...x, product: x._id })),
//       shippingAddress: req.body.shippingAddress,
//       //paymentMethod: req.body.paymentMethod,
//       itemsPrice: req.body.itemsPrice,
//       shippingPrice: req.body.shippingPrice,
//       taxPrice: req.body.taxPrice,
//       grandTotal: req.body.grandTotal,
//       trackingId: trackingId,
//       user: req.user._id,
//       product: req.body.orderItems.product,
//     });
//     const order = await newOrder.save();
//     res.status(201).send({ message: "New Order Created", order });
//   })
// );
orderRouter.post(
  "/",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const trackingId = "R" + generateRandomString(16);
    const {
      orderItems,
      shippingAddress,
      itemsPrice,
      shippingPrice,
      taxPrice,
      grandTotal,
      affiliatorCommissionMap, // Include the affiliatorCommissionMap in the request body
    } = req.body;

    // Create the order with the received order items
    const newOrder = new Order({
      seller: orderItems[0].seller,
      orderItems: orderItems.map((x) => ({ ...x, product: x._id })),
      shippingAddress,
      itemsPrice,
      shippingPrice,
      taxPrice,
      grandTotal,
      trackingId,
      user: req.user._id,
      affiliatorCommissionMap, // Include the affiliatorCommissionMap in the order
    });

    const order = await newOrder.save();
    res.status(201).send({ message: "New Order Created", order });
  })
);

//==========================
// FETCH ORDER BY TRACKINGID
//==========================
orderRouter.get(
  "/track",
  // isAuth,
  expressAsyncHandler(async (req, res) => {
    const { trackingId } = req.query; // Access trackingId from query parameters

    try {
      // Find the order by trackingId in the database
      const order = await Order.findOne({ trackingId });

      if (order) {
        // If order is found, send it in the response
        res.json({ order });
      } else {
        // If order is not found, send an error message
        res.status(404).json({ message: "Order not found" });
      }
    } catch (error) {
      // If an error occurs, send an error response
      console.log(error);
      res.status(500).json({ message: "Server error" });
    }
  })
);

//ADMIN ORDER LIST
const PAGE_SIZE = 15;
orderRouter.get(
  "/admin",
  isAuth,
  isSellerOrAdmin,
  expressAsyncHandler(async (req, res) => {
    const { query } = req;
    const page = query.page || 1;
    const seller = query.seller || "";
    const order = query.order || "";
    const pageSize = query.pageSize || PAGE_SIZE;

    const sellerFilter = seller ? { seller } : {};
    //const sellerFilter = seller && seller !== "all" ? { seller } : {};

    const sortOrder = order === "featured" ? { createdAt: -1 } : { _id: -1 };

    const orders = await Order.find({
      ...sellerFilter,
    })
      .populate("user", "name")
      .sort(sortOrder)
      .skip(pageSize * (page - 1))
      .limit(pageSize);

    const countOrders = await Order.countDocuments({
      ...sellerFilter,
    });

    res.send({
      orders,
      countOrders,
      page,
      pages: Math.ceil(countOrders / pageSize),
    });
  })
);

//====================
//SELLER ORDER SUMMARY
//====================
function calculatePercentageChange(previousValue, currentValue) {
  return ((currentValue - previousValue) / previousValue) * 100;
}
orderRouter.get(
  "/seller-summary",
  isAuth,
  isSellerOrAdmin,
  expressAsyncHandler(async (req, res) => {
    const sellerId = req.user._id; // Assuming the seller's ID is available in the request user object

    try {
      const last10DaysEarnings = await Order.aggregate([
        // Match orders for the specific seller that are paid (isPaid: true)
        {
          $match: { seller: mongoose.Types.ObjectId(sellerId), isPaid: true },
        },
        // Group orders by date
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            orders: { $sum: 1 }, // Count the number of orders per day
            totalEarningsPerDay: { $sum: "$grandTotal" }, // Sum up total earnings per day
          },
        },
        // Sort by date in descending order to get the last day's sales
        { $sort: { _id: -1 } },
        // Limit to only 10 documents to get the last 10 days' sales
        {
          $limit: 10,
        },
        // Project to show only the desired fields in the result
        {
          $project: {
            _id: 0,
            date: "$_id",
            totalEarningsPerDay: 1,
          },
        },
      ]);

      const earningsPerDay = await Order.aggregate([
        // Match orders for the specific seller that are paid (isPaid: true)
        {
          $match: { seller: mongoose.Types.ObjectId(sellerId), isPaid: true },
        },
        // Group orders by date and limit to only one document to get earnings for each day
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            totalEarningsPerDay: { $sum: "$grandTotal" }, // Sum up total earnings per day
          },
        },
        // Sort by date in descending order to get the last day's sales
        { $sort: { _id: -1 } },
        // Limit to only one document to get earnings for each day
        {
          $limit: 1,
        },
        // Project to show only the desired fields in the result
        {
          $project: {
            _id: 0,
            date: "$_id",
            totalEarningsPerDay: 1,
          },
        },
      ]);

      const earningsByMonth = await Order.aggregate([
        // Match orders for the specific seller that are paid (isPaid: true)
        {
          $match: { seller: mongoose.Types.ObjectId(sellerId), isPaid: true },
        },
        // Group orders by year and month to calculate total earnings per month
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
            totalEarningsPerMonth: { $sum: "$grandTotal" },
          },
        },
        // Sort by year and month to get the data in chronological order
        { $sort: { _id: 1 } },
      ]);
      // const totalOrders = await Order.aggregate([
      //   // Match orders for the specific seller that are paid (isPaid: true)
      //   {
      //     $match: { seller: mongoose.Types.ObjectId(sellerId), isPaid: true },
      //   },
      //   // Group orders to get the total number of orders
      //   {
      //     $group: {
      //       _id: null,
      //       totalOrders: { $sum: 1 }, // Sum up total number of orders
      //     },
      //   },
      //   // Project to show only the desired fields in the result
      //   {
      //     $project: {
      //       _id: 0,
      //       totalOrders: 1,
      //     },
      //   },
      // ]);
      const totalOrders = await Order.aggregate([
        // Match orders for the specific seller
        {
          $match: { seller: mongoose.Types.ObjectId(sellerId) },
        },
        // Group orders to get the total number of orders
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 }, // Sum up total number of orders
          },
        },
        // Project to show only the desired fields in the result
        {
          $project: {
            _id: 0,
            totalOrders: 1,
          },
        },
      ]);

      const grandTotalEarnings = await Order.aggregate([
        // Match orders for the specific seller that are paid (isPaid: true)
        {
          $match: { seller: mongoose.Types.ObjectId(sellerId), isPaid: true },
        },
        // Group orders to get the grand total earnings of all time
        {
          $group: {
            _id: null,
            grandTotalEarnings: { $sum: "$grandTotal" }, // Sum up grand total earnings
          },
        },
        // Project to show only the desired fields in the result
        {
          $project: {
            _id: 0,
            grandTotalEarnings: 1,
          },
        },
      ]);

      // Merge all the results into the final seller summary object
      // Calculate the percentage change for each pair of consecutive months
      const monthlyPercentageChanges = [];
      for (let i = 1; i < earningsByMonth.length; i++) {
        const previousEarnings = earningsByMonth[i - 1].totalEarningsPerMonth;
        const currentEarnings = earningsByMonth[i].totalEarningsPerMonth;
        const percentageChange = calculatePercentageChange(
          previousEarnings,
          currentEarnings
        );
        monthlyPercentageChanges.push({
          month: earningsByMonth[i]._id,
          percentageChange,
        });
      }

      // Calculate and update the grandTotalEarnings for the seller
      const seller = await User.findById(sellerId);
      if (seller) {
        const grandTotalEarnings = await seller.calculateGrandTotalEarnings();
        seller.grandTotalEarnings = grandTotalEarnings; // Update the user's grandTotalEarnings field
        await seller.save(); // Save the updated user document
      }

      // Merge all the results into the final seller summary object
      const sellerSummary = {
        last10DaysEarnings,
        earningsPerDay,
        totalOrders: totalOrders.length > 0 ? totalOrders[0].totalOrders : 0,
        grandTotalEarnings:
          grandTotalEarnings.length > 0
            ? grandTotalEarnings[0].grandTotalEarnings
            : 0,
        monthlyPercentageChanges,
      };

      if (
        sellerSummary.last10DaysEarnings.length > 0 ||
        sellerSummary.earningsPerDay.length > 0
      ) {
        res.status(200).json(sellerSummary);
      } else {
        // No data found for the seller
        res.status(404).json({ message: "Seller data not found" });
      }
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ message: "An error occurred while fetching seller summary" });
    }
  })
);

//================================
//SINGLE SELLER EARNINGS PER MONTH
//================================
// orderRouter.get(
//   "/seller-summary/:id",
//   isAuth,
//   isSellerOrAdmin,
//   expressAsyncHandler(async (req, res) => {
//     const sellerId = req.params?.id;

//     try {
//       const sellerSummary = await Order.aggregate([
//         // Match orders for the specific seller
//         {
//           $match: { seller: mongoose.Types.ObjectId(sellerId) },
//         },
//         // Group orders by month
//         {
//           $group: {
//             _id: {
//               year: { $year: "$createdAt" },
//               month: { $month: "$createdAt" },
//             },
//             totalEarningsPerMonth: { $sum: "$grandTotal" }, // Sum up total earnings per month
//           },
//         },
//         // Sort by date in descending order to get the latest month's earnings first
//         {
//           $sort: { "_id.year": -1, "_id.month": -1 },
//         },
//         // Limit to only one document to get the latest month's earnings
//         {
//           $limit: 1,
//         },
//         // Project to show only the desired fields in the result
//         {
//           $project: {
//             _id: 0,
//             totalEarnings: "$totalEarningsPerMonth", // Rename the field to totalEarnings
//           },
//         },
//       ]);

//       if (sellerSummary.length > 0) {
//         res.status(200).json(sellerSummary[0]);
//       } else {
//         // No data found for the seller
//         res.status(404).json({ message: "Seller data not found" });
//       }
//     } catch (err) {
//       res
//         .status(500)
//         .json({ message: "An error occurred while fetching seller summary" });
//     }
//   })
// );
orderRouter.get(
  "/seller-summary/:id",
  isAuth,
  isSellerOrAdmin,
  expressAsyncHandler(async (req, res) => {
    const sellerId = req.params?.id;

    try {
      const sellerSummary = await Order.aggregate([
        // Match orders for the specific seller that are paid (isPaid: true)
        {
          $match: { seller: mongoose.Types.ObjectId(sellerId), isPaid: true },
        },
        // Group orders by month
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            totalEarningsPerMonth: { $sum: "$grandTotal" }, // Sum up total earnings per month
          },
        },
        // Sort by date in descending order to get the latest month's earnings first
        {
          $sort: { "_id.year": -1, "_id.month": -1 },
        },
        // Limit to only one document to get the latest month's earnings
        {
          $limit: 1,
        },
        // Project to show only the desired fields in the result
        {
          $project: {
            _id: 0,
            totalEarnings: "$totalEarningsPerMonth", // Rename the field to totalEarnings
          },
        },
      ]);

      if (sellerSummary.length > 0) {
        res.status(200).json(sellerSummary[0]);
      } else {
        // No data found for the seller
        res.status(404).json({ message: "Seller data not found" });
      }
    } catch (err) {
      res
        .status(500)
        .json({ message: "An error occurred while fetching seller summary" });
    }
  })
);

//===================
//ADMIN ORDER SUMMARY
//===================
// orderRouter.get(
//   "/order_summary",
//   // isAuth,
//   // isSellerOrAdmin,
//   expressAsyncHandler(async (req, res) => {
//     const productId = req?.query.id;
//     const date = new Date();
//     const lastMonth = new Date(date.setMonth(date.getMonth() - 1));
//     const previousMonth = new Date(
//       new Date().setMonth(lastMonth.getMonth() - 1)
//     );
//     console.log(productId);

//     // GET MONTHLY ORDERS
//     const orders = await Order.aggregate([
//       {
//         $match: {
//           createdAt: { $gte: previousMonth, $lt: lastMonth },
//         },
//       },
//       {
//         $group: {
//           _id: null,
//           numOrders: { $sum: 1 },
//         },
//       },
//     ]);

//     // GET MONTHLY USERS STATS
//     const users = await User.aggregate([
//       {
//         $match: {
//           createdAt: { $gte: previousMonth, $lt: lastMonth },
//         },
//       },
//       {
//         $group: {
//           _id: null,
//           numUsers: { $sum: 1 },
//         },
//       },
//     ]);

//     // GET MONTHLY INCOME
//     const income = await Order.aggregate([
//       {
//         $match: {
//           createdAt: { $gte: previousMonth, $lt: lastMonth },
//         },
//       },
//       {
//         $group: {
//           _id: null,
//           orders: { $sum: 1 },
//           numOrders: { $sum: 1 },
//           sales: { $sum: "$grandTotal" },
//         },
//       },
//     ]);

//     // GET DAILY ORDERS
//     const dailyOrders = await Order.aggregate([
//       {
//         $group: {
//           _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
//           orders: { $sum: 1 },
//           numOrders: { $sum: 1 },
//           sales: { $sum: "$grandTotal" },
//         },
//       },
//       {
//         $match: {
//           _id: {
//             $gte: previousMonth.toISOString(),
//             $lt: lastMonth.toISOString(),
//           },
//         },
//       },
//       { $sort: { _id: -1 } },
//       { $limit: 10 },
//     ]);

//     // GET SALE PERFORMANCE
//     const salePerformance = await Order.aggregate([
//       {
//         $group: {
//           _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
//           sales: { $sum: "$grandTotal" },
//         },
//       },
//       {
//         $match: {
//           _id: {
//             $gte: previousMonth.toISOString(),
//             $lt: lastMonth.toISOString(),
//           },
//         },
//       },
//       { $sort: { _id: -1 } },
//       { $limit: 2 },
//     ]);

//     res.send({ users, orders, income, dailyOrders, salePerformance });
//   })
// );
orderRouter.get(
  "/summary",
  // isAuth,
  // isSellerOrAdmin,
  expressAsyncHandler(async (req, res) => {
    const productId = req?.query.id;
    const date = new Date();
    const lastMonth = new Date(date.setMonth(date.getMonth() - 1));
    const previousMonth = new Date(
      new Date().setMonth(lastMonth.getMonth() - 1)
    );

    //GET TOTAL NUMBER ORDERS
    const orders = await Order.aggregate([
      {
        $group: {
          _id: 1,
          numOrders: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
      { $limit: 2 },
    ]);

    //GET TOTAL USERS STATS
    const users = await User.aggregate([
      {
        $group: {
          _id: 1,
          numUsers: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
      { $limit: 2 },
    ]);

    //GET DAILY INCOME
    const dailyOrders = await Order.aggregate([
      // Match orders that are paid (isPaid: true)
      {
        $match: { isPaid: true },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          orders: { $sum: 1 },
          numOrders: { $sum: 1 },
          sales: { $sum: "$grandTotal" },
        },
      },

      { $sort: { _id: -1 } },
      { $limit: 10 },
    ]);

    //GET DAILY INCOME
    const income = await Order.aggregate([
      // Match orders that are paid (isPaid: true)
      {
        $match: { isPaid: true },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          orders: { $sum: 1 },
          numOrders: { $sum: 1 },
          sales: { $sum: "$grandTotal" },
        },
      },

      { $sort: { _id: -1 } },
      { $limit: 2 },
    ]);

    //SALE PERFORMANCE
    const salePerformance = await Order.aggregate([
      // Match orders that are paid (isPaid: true)
      {
        $match: { isPaid: true },
      },
      {
        $group: {
          _id: 1,
          sales: { $sum: "$grandTotal" },
        },
      },

      { $sort: { _id: -1 } },
      // { $limit: 2 },
    ]);

    res.send({ users, orders, income, dailyOrders, salePerformance });
  })
);

//======================
//FETCH ALL INDIV. ORDER
const USER_PAGE_SIZE = 15;
orderRouter.get(
  "/mine",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const { query } = req;
    const page = query.page || 1;
    const pageSize = query.pageSize || USER_PAGE_SIZE;
    const orders = await Order.find({ user: req.user._id })
      .sort("-createdAt")
      .skip(pageSize * (page - 1))
      .limit(pageSize);
    const countOrders = await Order.countDocuments({ user: req.user._id });
    res.send({
      orders,
      countOrders,
      page,
      pages: Math.ceil(countOrders / pageSize),
    });
  })
);

//============================
//ADMIN FETCH ALL INDIV. ORDER
//============================
const USER_ORDER_PAGE_SIZE = 10;
orderRouter.get(
  "/mine/:id",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const { query, params } = req;
    const userId = params.id;
    const page = query.page || 1;
    const pageSize = query.pageSize || USER_ORDER_PAGE_SIZE;

    const orders = await Order.find({ user: userId })
      .sort("-createdAt")
      .skip(pageSize * (page - 1))
      .limit(pageSize);

    const countOrders = await Order.countDocuments({ user: userId });

    res.send({
      orders,
      countOrders,
      page,
      pages: Math.ceil(countOrders / pageSize),
    });
  })
);

//FETCH ORDER DETAILS
orderRouter.get(
  "/:id",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id).populate("user");
    if (order) {
      res.send(order);
    } else {
      res.send(404).send({ message: "Order Not Found" });
    }
  })
);

//DELIVER ORDER
orderRouter.put(
  "/:id/deliver",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (order) {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
      await order.save();
      res.send({ message: "Order Delivered" });
    } else {
      res.status(404).send({ message: "Order No Found" });
    }
  })
);

//=========================
//SELLER WITHDRAWAL REQUEST
//=========================
orderRouter.post(
  "/withdraw",
  isAuth,
  isSellerOrAdmin,
  expressAsyncHandler(async (req, res) => {
    const sellerId = req.user._id;
    const { amount } = req.body;

    try {
      // Fetch the seller's document from the database
      const seller = await User.findById(sellerId);

      // Check if the seller has sufficient balance for the withdrawal
      if (seller.grandTotalEarnings < amount) {
        return res
          .status(400)
          .json({ message: "Insufficient balance for withdrawal" });
      }

      // Create a new withdrawal record
      const withdrawal = {
        amount,
        status: "pending", // Set the status to pending initially
        requestedAt: new Date(),
      };

      // Add the new withdrawal record to the seller's document
      seller.withdrawals.push(withdrawal);

      // Deduct the withdrawal amount from the seller's grandTotalEarnings
      seller.grandTotalEarnings -= amount;

      // Save the updated seller document
      await seller.save();

      res
        .status(201)
        .json({ message: "Withdrawal request submitted successfully" });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: "An error occurred while processing the request" });
    }
  })
);

//======================================
//ADMIN APPROVAL/DECLINE OF A WITHDRAWAL
//======================================
orderRouter.post(
  "/withdraw",
  isAuth,
  isSellerOrAdmin,
  expressAsyncHandler(async (req, res) => {
    const sellerId = req.user._id;
    const { amount } = req.body;

    try {
      // Fetch the seller's document from the database
      const seller = await User.findById(sellerId);

      // Check if the seller has sufficient balance for the withdrawal
      if (seller.grandTotalEarnings < amount) {
        return res
          .status(400)
          .json({ message: "Insufficient balance for withdrawal" });
      }

      // Create a new withdrawal record
      const withdrawal = {
        amount,
        status: "pending", // Set the status to pending initially
        requestedAt: new Date(),
      };

      // Add the new withdrawal record to the seller's document
      seller.withdrawals.push(withdrawal);

      // Deduct the withdrawal amount from the seller's grandTotalEarnings
      seller.grandTotalEarnings -= amount;

      // Save the updated seller document
      await seller.save();

      res
        .status(201)
        .json({ message: "Withdrawal request submitted successfully" });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: "An error occurred while processing the request" });
    }
  })
);

//=============
// EXHANGE RATE
//=============
async function convertCurrency(amount, toCurrencies) {
  // Get the base currency from the database
  try {
    const settings = await Settings.findOne({});
    const { currency: baseCurrency } = settings || {};

    if (!baseCurrency) {
      throw new Error("Base currency not found in database.");
    }
    const apiUrl = `https://api.exchangerate-api.com/v4/latest/${baseCurrency}`;

    const response = await axios.get(apiUrl);
    const exchangeRates = response.data.rates;
    const convertedAmount = amount * exchangeRates[toCurrencies];

    return convertedAmount;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to convert currency");
  }
}

//========
//STRIPE
//========
orderRouter.post(
  "/:id/stripe",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const settings = await Settings.find({});
    const { currency: currencyStripe } =
      (settings &&
        settings
          .map((s) => ({
            currency: s.currency,
          }))
          .find(() => true)) ||
      {};
    const { stripeApiKey } = (await Settings.findOne({})) ?? {};
    const stripe = Stripe(stripeApiKey);
    console.log(stripeApiKey);
    try {
      const { amount, currency, tokenId, description } = req.body;
      const charge = await stripe.charges.create({
        source: tokenId,
        amount,
        currency,
        description,
      });

      const order = await Order.findById(req.params.id).populate("user");

      if (charge) {
        // Update the necessary fields in the order object and save it
        order.isPaid = true;
        order.paidAt = Date.now();
        order.paymentResult = {
          id: charge.id,
          status: charge.status,
          update_time: charge.created,
          email_address: charge.billing_details?.email,
        };

        order.paymentMethod = req.body.paymentMethod;
        order.currencySign = req.body.currencySign;

        for (const index in order.orderItems) {
          const item = order.orderItems[index];
          const product = await Product.findById(item.product);
          if (!product) {
            res
              .status(404)
              .send({ message: `Product Not Found: ${item.product}` });
            return;
          }
          if (item.quantity > product.countInStock) {
            res.status(400).send({
              message: `Insufficient stock for product: ${product.name}`,
            });
            return;
          }
          product.countInStock -= item.quantity;
          product.numSales += item.quantity;
          await product.save();
        }

        // Convert the currency if needed
        let convertedCurrencySign = order.currencySign;
        let convertedItemsPrice = order.itemsPrice;
        let convertedTaxPrice = order.taxPrice;
        let convertedShippingPrice = order.shippingPrice;
        let convertedGrandTotal = order.grandTotal;

        if (order.currencySign !== currencyStripe) {
          try {
            convertedItemsPrice = await convertCurrency(
              order.itemsPrice,
              order.currencySign
            );
            convertedTaxPrice = await convertCurrency(
              order.taxPrice,
              order.currencySign
            );
            convertedShippingPrice = await convertCurrency(
              order.shippingPrice,
              order.currencySign
            );
            convertedGrandTotal = await convertCurrency(
              order.grandTotal,
              order.currencySign
            );
            convertedCurrencySign = order.currencySign;
            const formatter = new Intl.NumberFormat("en-GB", {
              style: "currency",
              currency: convertedCurrencySign,
              currencyDisplay: "symbol", // Display the currency symbol instead of the currency code
            });
            // Format converted values
            convertedItemsPrice = formatter.format(convertedItemsPrice);
            convertedTaxPrice = formatter.format(convertedTaxPrice);
            convertedShippingPrice = formatter.format(convertedShippingPrice);
            convertedGrandTotal = formatter.format(convertedGrandTotal);
          } catch (error) {
            console.log(error);
            throw new Error("Failed to convert currency");
          }
        }

        const convertPrice = async (price, fromCurrency) => {
          try {
            if (fromCurrency) {
              const convertedPrice = await convertCurrency(price, fromCurrency);
              const formatter = new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: fromCurrency,
              });
              return formatter.format(convertedPrice);
            } else {
              // If the currency sign is not available, return the original price without conversion
              const formatter = new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD", // Replace "USD" with the default currency code if needed
              });
              return formatter.format(price);
            }
          } catch (error) {
            console.log(error);
            throw new Error("Failed to convert price");
          }
        };

        const payOrderEmailTemplate = `<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      color: #333;
    }
    h1 {
      color: #007BFF;
    }
    p {
      margin-bottom: 16px;
    }
    table {
      border-collapse: collapse;
      width: 100%;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 8px;
    }
    th {
      background-color: #f2f2f2;
    }
    td img {
      max-width: 50px;
      max-height: 50px;
    }
    .total {
      font-weight: bold;
    }
    .thanks {
      margin-top: 20px;
      font-size: 16px;
    }
    .footer {
      margin-top: 20px;
      font-size: 12px;
      color: #888;
    }
   
  </style>
</head>
<body>
  <h1>Thanks for shopping with us</h1>
  <p>Hello ${order.user.lastName} ${order.user.firstName},</p>
  <p>We have finished processing your order.</p>
  <h2>Order Tracking ID: ${order.trackingId} (${order.createdAt
          .toString()
          .substring(0, 10)})</h2>
  <table>
    <thead>
      <tr>
        <th>Product</th>
        <th>Keygen</th>
        <th>Size</th>
        <th>Color</th>
        <th>Quantity</th>
        <th align="right">Price</th>
      </tr>
    </thead>
    <tbody>
       ${await Promise.all(
         order.orderItems.map(async (item) => {
           // Use the convertPrice function to get the converted price
           const convertedPrice = await convertPrice(
             item.discount > 0
               ? item.price - (item.price * item.discount) / 100
               : item.price.toFixed(2),
             order.currencySign
           );
           return `
          <tr>
            <td>${item.name}</td>
            <td align="left">${item.keygen}</td>
            <td align="left">${item.size === "" ? "" : item.size}</td>
            <td align="center">${
              item.color !== "" ? `<img src=${item.color} alt=""/>` : ""
            }</td>
            <td align="center">${item.quantity}</td>
            <td align="right">${convertedPrice}</td>
          </tr>
        `;
         })
       )}
    </tbody>
    <tfoot>
    <tr class="total">
      <td colspan="2">Items Price:</td>
      <td align="right">${convertedItemsPrice}</td>
    </tr>
    <tr class="total">
      <td colspan="2">Tax Price:</td>
      <td align="right">${convertedTaxPrice}</td>
    </tr>
    <tr class="total">
      <td colspan="2">Shipping Price:</td>
      <td align="right">${convertedShippingPrice}</td>
    </tr>
    <tr class="total">
      <td colspan="2"><strong>Total Price:</strong></td>
      <td align="right"><strong>${convertedGrandTotal}</strong></td>
    </tr>
    <tr>
      <td colspan="2">Payment Method:</td>
      <td align="right">${order.paymentMethod}</td>
    </tr>
  </tfoot>
  </table>
  <h2>Shipping address</h2>
  <p>
  <table>
    <tr>
      <th>Field</th>
      <th>Value</th>
    </tr>
    <tr>
      <td><strong>First Name:</strong></td>
      <td>${order.shippingAddress.firstName}</td>
    </tr>
    <tr>
      <td><strong>Last Name:</strong></td>
      <td>${order.shippingAddress.lastName}</td>
    </tr>
    <tr>
      <td><strong>Address:</strong></td>
      <td>${order.shippingAddress.address}</td>
    </tr>
    <tr>
      <td><strong>Phone:</strong></td>
      <td>${order.shippingAddress.phone}</td>
    </tr>
    <tr>
      <td><strong>City:</strong></td>
      <td>${order.shippingAddress.city}</td>
    </tr>
    <tr>
      <td><strong>Zip Code:</strong></td>
      <td>${order.shippingAddress.zipCode}</td>
    </tr>
    <tr>
      <td><strong>State:</strong></td>
      <td>${order.shippingAddress.cState}</td>
    </tr>
    <tr>
      <td><strong>Country:</strong></td>
      <td>${order.shippingAddress.country}</td>
    </tr>
    <tr>
      <td><strong>Shipping:</strong></td>
      <td>${order.shippingAddress.shipping}</td>
    </tr>
  </table>
</p>
  <hr/>
  <p class="thanks">Thanks for shopping with us.</p>
  <!-- This anchor tag will be displayed as a plain link without any additional styles -->
  <p class="footer">Developed by <a href="https://my-portfolio-nine-nu-28.vercel.app/">Olatunji Akande</a></p>
</body>
</html>
`;
        const client = Sib.ApiClient.instance;
        const apiKey = client.authentications["api-key"];
        apiKey.apiKey = process.env.SEND_IN_BLUE_API_KEY;

        const tranEmailApi = new Sib.TransactionalEmailsApi();
        const sender = {
          name: process.env.SHOP_NAME,
          email: process.env.EMAIL_ADDRESS,
        };
        const receivers = [
          {
            name: `${order.user.firstName} ${order.user.lastName}`,
            email: `${order.user.email}`,
          },
        ];
        tranEmailApi
          .sendTransacEmail({
            sender,
            to: receivers,
            subject: `New Order ${order.trackingId}`,
            htmlContent: payOrderEmailTemplate,
            params: {
              role: "Frontend",
            },
          })
          .then(console.log)
          .catch(console.log);

        const updatedOrder = await order.save();

        res.json(updatedOrder);
      } else {
        res.status(404).send({ message: "Order Not Found" });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Something went wrong" });
    }
  })
);

//=========
//RAZORPAY
//=========
orderRouter.post(
  "/:id/razorpay",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const settings = await Settings.find({});
    const { razorkeyid, razorsecret } =
      (settings &&
        settings
          .map((s) => ({
            razorkeyid: s.razorkeyid,
            razorsecret: s.razorsecret,
          }))
          .find(() => true)) ||
      {};

    const razorpay = new Razorpay({
      key_id: razorkeyid,
      key_secret: razorsecret,
    });
    try {
      const { amount, currency } = req.body;
      const options = {
        amount: amount,
        currency: currency,
        receipt: "order_receipt",
        payment_capture: 1,
      };

      const razorpayOrder = await razorpay.orders.create(options);

      const order = await Order.findById(req.params.id).populate(
        "user",
        "email name"
      );

      if (!order) {
        res.status(404).send({ message: "Order Not Found" });
        return;
      }

      if (order.isPaid) {
        res.status(400).send({ message: "Order is already paid" });
        return;
      }
      order.paymentResult = {
        id: razorpayOrder.id,
        status: "created",
      };
      order.paymentMethod = req.body.paymentMethod;
      order.currencySign = req.body.currencySign;

      const updatedOrder = await order.save();

      res.json(updatedOrder);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Something went wrong" });
    }
  })
);

//====================
//RAZORPAY SUCCESS PAY
//====================
orderRouter.post(
  "/:id/razorpay/success",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const orderId = req.params.id;
    const paymentResponse = req.body;
    const settings = await Settings.find({});
    const { currency } =
      (settings &&
        settings
          .map((s) => ({
            currency: s.currency,
          }))
          .find(() => true)) ||
      {};
    const order = await Order.findById(orderId).populate("user");

    if (!order) {
      res.status(404).send({ message: "Order Not Found" });
      return;
    }

    if (order.isPaid) {
      res.status(400).send({ message: "Order is already paid" });
      return;
    }

    if (paymentResponse.razorpay_payment_id) {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentResult = {
        id: paymentResponse.razorpay_payment_id,
        status: paymentResponse.status,
      };

      for (const index in order.orderItems) {
        const item = order.orderItems[index];
        const product = await Product.findById(item.product);

        // Check if the item quantity is greater than the available countInStock
        if (item.quantity > product.countInStock) {
          throw new Error(`Insufficient stock for product: ${product.name}`);
        }

        // Decrease the countInStock and increase the numSales
        product.countInStock -= item.quantity;
        product.numSales += item.quantity;
        await product.save();
      }
      // Convert the currency if needed
      let convertedCurrencySign = order.currencySign;
      let convertedItemsPrice = order.itemsPrice;
      let convertedTaxPrice = order.taxPrice;
      let convertedShippingPrice = order.shippingPrice;
      let convertedGrandTotal = order.grandTotal;

      if (order.currencySign !== currency) {
        try {
          convertedItemsPrice = await convertCurrency(
            order.itemsPrice,
            order.currencySign
          );
          convertedTaxPrice = await convertCurrency(
            order.taxPrice,
            order.currencySign
          );
          convertedShippingPrice = await convertCurrency(
            order.shippingPrice,
            order.currencySign
          );
          convertedGrandTotal = await convertCurrency(
            order.grandTotal,
            order.currencySign
          );
          convertedCurrencySign = order.currencySign;
          const formatter = new Intl.NumberFormat("en-GB", {
            style: "currency",
            currency: convertedCurrencySign,
            currencyDisplay: "symbol", // Display the currency symbol instead of the currency code
          });
          // Format converted values
          convertedItemsPrice = formatter.format(convertedItemsPrice);
          convertedTaxPrice = formatter.format(convertedTaxPrice);
          convertedShippingPrice = formatter.format(convertedShippingPrice);
          convertedGrandTotal = formatter.format(convertedGrandTotal);
        } catch (error) {
          console.log(error);
          throw new Error("Failed to convert currency");
        }
      }

      const convertPrice = async (price, fromCurrency) => {
        try {
          if (fromCurrency) {
            const convertedPrice = await convertCurrency(price, fromCurrency);
            const formatter = new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: fromCurrency,
            });
            return formatter.format(convertedPrice);
          } else {
            // If the currency sign is not available, return the original price without conversion
            const formatter = new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD", // Replace "USD" with the default currency code if needed
            });
            return formatter.format(price);
          }
        } catch (error) {
          console.log(error);
          throw new Error("Failed to convert price");
        }
      };

      const payOrderEmailTemplate = `<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      color: #333;
    }
    h1 {
      color: #007BFF;
    }
    p {
      margin-bottom: 16px;
    }
    table {
      border-collapse: collapse;
      width: 100%;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 8px;
    }
    th {
      background-color: #f2f2f2;
    }
    td img {
      max-width: 50px;
      max-height: 50px;
    }
    .total {
      font-weight: bold;
    }
    .thanks {
      margin-top: 20px;
      font-size: 16px;
    }
    .footer {
      margin-top: 20px;
      font-size: 12px;
      color: #888;
    }
   
  </style>
</head>
<body>
  <h1>Thanks for shopping with us</h1>
  <p>Hello ${order.user.lastName} ${order.user.firstName},</p>
  <p>We have finished processing your order.</p>
  <h2>Order Tracking ID: ${order.trackingId} (${order.createdAt
        .toString()
        .substring(0, 10)})</h2>
  <table>
    <thead>
      <tr>
        <th>Product</th>
        <th>Keygen</th>
        <th>Size</th>
        <th>Color</th>
        <th>Quantity</th>
        <th align="right">Price</th>
      </tr>
    </thead>
    <tbody>
       ${await Promise.all(
         order.orderItems.map(async (item) => {
           // Use the convertPrice function to get the converted price
           const convertedPrice = await convertPrice(
             item.discount > 0
               ? item.price - (item.price * item.discount) / 100
               : item.price.toFixed(2),
             order.currencySign
           );
           return `
          <tr>
            <td>${item.name}</td>
            <td align="left">${item.keygen}</td>
            <td align="left">${item.size === "" ? "" : item.size}</td>
            <td align="center">${
              item.color !== "" ? `<img src=${item.color} alt=""/>` : ""
            }</td>
            <td align="center">${item.quantity}</td>
            <td align="right">${convertedPrice}</td>
          </tr>
        `;
         })
       )}
    </tbody>
    <tfoot>
    <tr class="total">
      <td colspan="2">Items Price:</td>
      <td align="right">${convertedItemsPrice}</td>
    </tr>
    <tr class="total">
      <td colspan="2">Tax Price:</td>
      <td align="right">${convertedTaxPrice}</td>
    </tr>
    <tr class="total">
      <td colspan="2">Shipping Price:</td>
      <td align="right">${convertedShippingPrice}</td>
    </tr>
    <tr class="total">
      <td colspan="2"><strong>Total Price:</strong></td>
      <td align="right"><strong>${convertedGrandTotal}</strong></td>
    </tr>
    <tr>
      <td colspan="2">Payment Method:</td>
      <td align="right">${order.paymentMethod}</td>
    </tr>
  </tfoot>
  </table>
  <h2>Shipping address</h2>
  <p>
  <table>
    <tr>
      <th>Field</th>
      <th>Value</th>
    </tr>
    <tr>
      <td><strong>First Name:</strong></td>
      <td>${order.shippingAddress.firstName}</td>
    </tr>
    <tr>
      <td><strong>Last Name:</strong></td>
      <td>${order.shippingAddress.lastName}</td>
    </tr>
    <tr>
      <td><strong>Address:</strong></td>
      <td>${order.shippingAddress.address}</td>
    </tr>
    <tr>
      <td><strong>Phone:</strong></td>
      <td>${order.shippingAddress.phone}</td>
    </tr>
    <tr>
      <td><strong>City:</strong></td>
      <td>${order.shippingAddress.city}</td>
    </tr>
    <tr>
      <td><strong>Zip Code:</strong></td>
      <td>${order.shippingAddress.zipCode}</td>
    </tr>
    <tr>
      <td><strong>State:</strong></td>
      <td>${order.shippingAddress.cState}</td>
    </tr>
    <tr>
      <td><strong>Country:</strong></td>
      <td>${order.shippingAddress.country}</td>
    </tr>
    <tr>
      <td><strong>Shipping:</strong></td>
      <td>${order.shippingAddress.shipping}</td>
    </tr>
  </table>
</p>
  <hr/>
  <p class="thanks">Thanks for shopping with us.</p>
  <!-- This anchor tag will be displayed as a plain link without any additional styles -->
  <p class="footer">Developed by <a href="https://my-portfolio-nine-nu-28.vercel.app/">Olatunji Akande</a></p>
</body>
</html>
`;
      const client = Sib.ApiClient.instance;
      const apiKey = client.authentications["api-key"];
      apiKey.apiKey = process.env.SEND_IN_BLUE_API_KEY;

      const tranEmailApi = new Sib.TransactionalEmailsApi();
      const sender = {
        name: process.env.SHOP_NAME,
        email: process.env.EMAIL_ADDRESS,
      };
      const receivers = [
        {
          name: `${order.user.firstName} ${order.user.lastName}`,
          email: `${order.user.email}`,
        },
      ];
      tranEmailApi
        .sendTransacEmail({
          sender,
          to: receivers,
          subject: `New Order ${order.trackingId}`,
          htmlContent: payOrderEmailTemplate,
          params: {
            role: "Frontend",
          },
        })
        .then(console.log)
        .catch(console.log);

      await order.save();
      res.json({ success: true, message: "Payment successful" });
    } else {
      res.json({ success: false, message: "Payment canceled or failed" });
    }
  })
);

//=========
// PAYTM
//=========
const generateChecksum = (params, key) => {
  const data = Object.values(params).join("|");
  const checksum = crypto.createHmac("sha256", key).update(data).digest("hex");
  return checksum;
};
orderRouter.post(
  "/:id/paytm",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const settings = await Settings.find({});
    const { paytmid, paytmkey } =
      (settings &&
        settings
          .map((s) => ({
            paytmid: s.paytmid,
            paytmkey: s.paytmkey,
          }))
          .find(() => true)) ||
      {};
    try {
      const orderId = req.params.id;
      const { amount, currency } = req.body;

      // Create the PayTm order parameters
      const params = {
        MID: paytmid, // PayTm Merchant ID
        ORDER_ID: orderId, // Unique order ID for PayTm
        CUST_ID: req.user._id, // Customer ID
        INDUSTRY_TYPE_ID: "Retail", // Industry type
        CHANNEL_ID: "WEB", // Channel ID (WEB for website)
        TXN_AMOUNT: amount, // Payment amount
        CURRENCY: currency, // Currency code
        CALLBACK_URL: `${process.env.BACKEND_BASE_URL}/api/orders/${orderId}/paytm/success`, // Callback URL for payment success
      };

      // Generate the PayTm checksum
      const checksum = generateChecksum(params, paytmkey);

      // Construct the final PayTm payment URL
      const paytmPaymentUrl = `https://securegw.paytm.in/order/process?orderid=${orderId}`;

      // Return the PayTm payment URL and checksum
      res.json({
        paytmPaymentUrl,
        checksum,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Something went wrong" });
    }
  })
);

//=================
//PAYTM SUCCESS PAY
//=================
orderRouter.post(
  "/:id/paytm/success",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const orderId = req.params.id;
    const paymentResponse = req.body;
    const settings = await Settings.find({});
    const { currency } =
      (settings &&
        settings
          .map((s) => ({
            currency: s.currency,
          }))
          .find(() => true)) ||
      {};
    const order = await Order.findById(orderId).populate("user");

    if (!order) {
      res.status(404).send({ message: "Order Not Found" });
      return;
    }

    if (order.isPaid) {
      res.status(400).send({ message: "Order is already paid" });
      return;
    }

    // Verify the PayTm checksum
    const isValidChecksum = validateChecksum(
      paymentResponse,
      process.env.PAYTM_MERCHANT_KEY
    );

    if (!isValidChecksum) {
      res.status(400).send({ message: "Invalid PayTm checksum" });
      return;
    }

    if (paymentResponse.STATUS === "TXN_SUCCESS") {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentResult = {
        id: paymentResponse.TXNID,
        status: paymentResponse.STATUS,
      };

      // Perform any additional logic or updates to the order as needed
      for (const index in order.orderItems) {
        const item = order.orderItems[index];
        const product = await Product.findById(item.product);

        // Check if the item quantity is greater than the available countInStock
        if (item.quantity > product.countInStock) {
          throw new Error(`Insufficient stock for product: ${product.name}`);
        }

        // Decrease the countInStock and increase the numSales
        product.countInStock -= item.quantity;
        product.numSales += item.quantity;
        await product.save();
      }
      // Convert the currency if needed
      let convertedCurrencySign = order.currencySign;
      let convertedItemsPrice = order.itemsPrice;
      let convertedTaxPrice = order.taxPrice;
      let convertedShippingPrice = order.shippingPrice;
      let convertedGrandTotal = order.grandTotal;

      if (order.currencySign !== currency) {
        try {
          convertedItemsPrice = await convertCurrency(
            order.itemsPrice,
            order.currencySign
          );
          convertedTaxPrice = await convertCurrency(
            order.taxPrice,
            order.currencySign
          );
          convertedShippingPrice = await convertCurrency(
            order.shippingPrice,
            order.currencySign
          );
          convertedGrandTotal = await convertCurrency(
            order.grandTotal,
            order.currencySign
          );
          convertedCurrencySign = order.currencySign;
          const formatter = new Intl.NumberFormat("en-GB", {
            style: "currency",
            currency: convertedCurrencySign,
            currencyDisplay: "symbol", // Display the currency symbol instead of the currency code
          });
          // Format converted values
          convertedItemsPrice = formatter.format(convertedItemsPrice);
          convertedTaxPrice = formatter.format(convertedTaxPrice);
          convertedShippingPrice = formatter.format(convertedShippingPrice);
          convertedGrandTotal = formatter.format(convertedGrandTotal);
        } catch (error) {
          console.log(error);
          throw new Error("Failed to convert currency");
        }
      }

      const convertPrice = async (price, fromCurrency) => {
        try {
          if (fromCurrency) {
            const convertedPrice = await convertCurrency(price, fromCurrency);
            const formatter = new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: fromCurrency,
            });
            return formatter.format(convertedPrice);
          } else {
            // If the currency sign is not available, return the original price without conversion
            const formatter = new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD", // Replace "USD" with the default currency code if needed
            });
            return formatter.format(price);
          }
        } catch (error) {
          console.log(error);
          throw new Error("Failed to convert price");
        }
      };

      const payOrderEmailTemplate = `<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      color: #333;
    }
    h1 {
      color: #007BFF;
    }
    p {
      margin-bottom: 16px;
    }
    table {
      border-collapse: collapse;
      width: 100%;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 8px;
    }
    th {
      background-color: #f2f2f2;
    }
    td img {
      max-width: 50px;
      max-height: 50px;
    }
    .total {
      font-weight: bold;
    }
    .thanks {
      margin-top: 20px;
      font-size: 16px;
    }
    .footer {
      margin-top: 20px;
      font-size: 12px;
      color: #888;
    }
   
  </style>
</head>
<body>
  <h1>Thanks for shopping with us</h1>
  <p>Hello ${order.user.lastName} ${order.user.firstName},</p>
  <p>We have finished processing your order.</p>
  <h2>Order Tracking ID: ${order.trackingId} (${order.createdAt
        .toString()
        .substring(0, 10)})</h2>
  <table>
    <thead>
      <tr>
        <th>Product</th>
        <th>Keygen</th>
        <th>Size</th>
        <th>Color</th>
        <th>Quantity</th>
        <th align="right">Price</th>
      </tr>
    </thead>
    <tbody>
       ${await Promise.all(
         order.orderItems.map(async (item) => {
           // Use the convertPrice function to get the converted price
           const convertedPrice = await convertPrice(
             item.discount > 0
               ? item.price - (item.price * item.discount) / 100
               : item.price.toFixed(2),
             order.currencySign
           );
           return `
          <tr>
            <td>${item.name}</td>
            <td align="left">${item.keygen}</td>
            <td align="left">${item.size === "" ? "" : item.size}</td>
            <td align="center">${
              item.color !== "" ? `<img src=${item.color} alt=""/>` : ""
            }</td>
            <td align="center">${item.quantity}</td>
            <td align="right">${convertedPrice}</td>
          </tr>
        `;
         })
       )}
    </tbody>
    <tfoot>
    <tr class="total">
      <td colspan="2">Items Price:</td>
      <td align="right">${convertedItemsPrice}</td>
    </tr>
    <tr class="total">
      <td colspan="2">Tax Price:</td>
      <td align="right">${convertedTaxPrice}</td>
    </tr>
    <tr class="total">
      <td colspan="2">Shipping Price:</td>
      <td align="right">${convertedShippingPrice}</td>
    </tr>
    <tr class="total">
      <td colspan="2"><strong>Total Price:</strong></td>
      <td align="right"><strong>${convertedGrandTotal}</strong></td>
    </tr>
    <tr>
      <td colspan="2">Payment Method:</td>
      <td align="right">${order.paymentMethod}</td>
    </tr>
  </tfoot>
  </table>
  <h2>Shipping address</h2>
  <p>
  <table>
    <tr>
      <th>Field</th>
      <th>Value</th>
    </tr>
    <tr>
      <td><strong>First Name:</strong></td>
      <td>${order.shippingAddress.firstName}</td>
    </tr>
    <tr>
      <td><strong>Last Name:</strong></td>
      <td>${order.shippingAddress.lastName}</td>
    </tr>
    <tr>
      <td><strong>Address:</strong></td>
      <td>${order.shippingAddress.address}</td>
    </tr>
    <tr>
      <td><strong>Phone:</strong></td>
      <td>${order.shippingAddress.phone}</td>
    </tr>
    <tr>
      <td><strong>City:</strong></td>
      <td>${order.shippingAddress.city}</td>
    </tr>
    <tr>
      <td><strong>Zip Code:</strong></td>
      <td>${order.shippingAddress.zipCode}</td>
    </tr>
    <tr>
      <td><strong>State:</strong></td>
      <td>${order.shippingAddress.cState}</td>
    </tr>
    <tr>
      <td><strong>Country:</strong></td>
      <td>${order.shippingAddress.country}</td>
    </tr>
    <tr>
      <td><strong>Shipping:</strong></td>
      <td>${order.shippingAddress.shipping}</td>
    </tr>
  </table>
</p>
  <hr/>
  <p class="thanks">Thanks for shopping with us.</p>
  <!-- This anchor tag will be displayed as a plain link without any additional styles -->
  <p class="footer">Developed by <a href="https://my-portfolio-nine-nu-28.vercel.app/">Olatunji Akande</a></p>
</body>
</html>
`;
      const client = Sib.ApiClient.instance;
      const apiKey = client.authentications["api-key"];
      apiKey.apiKey = process.env.SEND_IN_BLUE_API_KEY;

      const tranEmailApi = new Sib.TransactionalEmailsApi();
      const sender = {
        name: process.env.SHOP_NAME,
        email: process.env.EMAIL_ADDRESS,
      };
      const receivers = [
        {
          name: `${order.user.firstName} ${order.user.lastName}`,
          email: `${order.user.email}`,
        },
      ];
      tranEmailApi
        .sendTransacEmail({
          sender,
          to: receivers,
          subject: `New Order ${order.trackingId}`,
          htmlContent: payOrderEmailTemplate,
          params: {
            role: "Frontend",
          },
        })
        .then(console.log)
        .catch(console.log);

      await order.save();
      res.json({ success: true, message: "Payment successful" });
    } else {
      res.json({ success: false, message: "Payment canceled or failed" });
    }
  })
);

//=====================
//OTHER PAYMENT METHODS
//=====================
orderRouter.put(
  "/:id/pay",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const settings = await Settings.find({});

    const order = await Order.findById(req.params.id).populate("user");
    if (order) {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentResult = {
        id: req.body.id,
        status: req.body.status,
        update_time: req.body.update_time,
        email_address: req.body.email_address,
      };
      order.paymentMethod = req.body.paymentMethod;
      order.currencySign = req.body.currencySign;

      for (const index in order.orderItems) {
        const item = order.orderItems[index];
        const product = await Product.findById(item.product);

        // Check if the item quantity is greater than the available countInStock
        if (item.quantity > product.countInStock) {
          throw new Error(`Insufficient stock for product: ${product.name}`);
        }

        // Decrease the countInStock and increase the numSales
        product.countInStock -= item.quantity;
        product.numSales += item.quantity;
        await product.save();
      }

      // try {
      //   // Use orderItems to retrieve the correct affiliateCode and product price
      //   const affiliateCode = order.orderItems[0].affiliateCode;
      //   const productPrice = order.orderItems[0].price;
      //   const affiliateCommissionMap = order.affiliatorCommissionMap;

      //   // Add these logs to inspect the content of the affiliateCommissionMap
      //   console.log("Affiliate Code:", affiliateCode);
      //   console.log("Affiliate Commission Map:", affiliateCommissionMap);
      //   console.log(
      //     "Is affiliateCode present in affiliateCommissionMap:",
      //     affiliateCommissionMap.has(affiliateCode)
      //   );

      //   const affiliateCommission = affiliateCommissionMap.get(affiliateCode);

      //   console.log("Affiliate Commission:", affiliateCommission);
      //   console.log(
      //     "Type of Affiliate Commission:",
      //     typeof affiliateCommission
      //   );

      //   // Add this log to verify if the value is actually undefined
      //   console.log(
      //     "Is affiliateCommission undefined?",
      //     affiliateCommission === undefined
      //   );

      //   // Check if the affiliateCommission is defined and not undefined
      //   if (affiliateCommission !== undefined) {
      //     // Convert the affiliateCommission to a number using parseFloat
      //     const parsedAffiliateCommission = parseFloat(affiliateCommission);

      //     // Check if the conversion is successful and not NaN
      //     if (!isNaN(parsedAffiliateCommission)) {
      //       // Retrieve the affiliate user based on the affiliateCode
      //       const affiliateUser = await User.findOne({ affiliateCode });

      //       console.log("Affiliate User:", affiliateUser);

      //       if (affiliateUser) {
      //         // Calculate the affiliate commission based on the commission rate and the product price
      //         const affiliateCommission =
      //           await affiliateUser.calculateAffiliateCommission(
      //             productPrice,
      //             order._id, // Use the order ID as the identifier
      //             affiliateCode
      //           );

      //         console.log("Affiliate Commission:", affiliateCommission);

      //         // ... (rest of the code remains the same) ...

      //         console.log("Before saving affiliateUser:", affiliateUser);
      //         // Save the updated user document
      //         await affiliateUser.save();
      //         console.log("After saving affiliateUser:", affiliateUser);
      //       }
      //     } else {
      //       console.log(
      //         "Invalid affiliateCommission value:",
      //         affiliateCommission
      //       );
      //       // Handle the case when the conversion fails or the value is NaN
      //       throw new Error("Invalid affiliate commission value");
      //     }
      //   } else {
      //     console.log(
      //       "No affiliate commission found for affiliateCode:",
      //       affiliateCode
      //     );
      //     // Handle the case when the affiliate commission is not defined
      //     throw new Error("No affiliate commission found");
      //   }
      // } catch (error) {
      //   console.log(error);
      //   // Handle any potential errors that might occur during the update process
      //   throw new Error("Failed to update affiliate earnings");
      // }

      // Convert the currency if neededy
      let convertedItemsPrice = order.itemsPrice;
      let convertedTaxPrice = order.taxPrice;
      let convertedShippingPrice = order.shippingPrice;
      let convertedGrandTotal = order.grandTotal;

      if (order.currencySign) {
        try {
          convertedItemsPrice = await convertCurrency(
            order.itemsPrice,
            order.currencySign
          );
          convertedTaxPrice = await convertCurrency(
            order.taxPrice,
            order.currencySign
          );
          convertedShippingPrice = await convertCurrency(
            order.shippingPrice,
            order.currencySign
          );
          convertedGrandTotal = await convertCurrency(
            order.grandTotal,
            order.currencySign
          );
          const formatter = new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: order.currencySign,
            currencyDisplay: "symbol", // Display the currency symbol instead of the currency code
          });
          // Format converted values
          convertedItemsPrice = formatter.format(convertedItemsPrice);
          convertedTaxPrice = formatter.format(convertedTaxPrice);
          convertedShippingPrice = formatter.format(convertedShippingPrice);
          convertedGrandTotal = formatter.format(convertedGrandTotal);
        } catch (error) {
          console.log(error);
          throw new Error("Failed to convert currency");
        }
      }

      const convertPrice = async (price, fromCurrency) => {
        try {
          if (fromCurrency) {
            const convertedPrice = await convertCurrency(price, fromCurrency);
            const formatter = new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: fromCurrency,
            });
            return formatter.format(convertedPrice);
          } else {
            // If the currency sign is not available, return the original price without conversion
            const formatter = new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD", // Replace "USD" with the default currency code if needed
            });
            return formatter.format(price);
          }
        } catch (error) {
          console.log(error);
          throw new Error("Failed to convert price");
        }
      };

      const payOrderEmailTemplate = `<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      color: #333;
    }
    h1 {
      color: #007BFF;
    }
    p {
      margin-bottom: 16px;
    }
    table {
      border-collapse: collapse;
      width: 100%;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 8px;
    }
    th {
      background-color: #f2f2f2;
    }
    td img {
      max-width: 50px;
      max-height: 50px;
    }
    .total {
      font-weight: bold;
    }
    .thanks {
      margin-top: 20px;
      font-size: 16px;
    }
    .footer {
      margin-top: 20px;
      font-size: 12px;
      color: #888;
    }
   
  </style>
</head>
<body>
  <h1>Thanks for shopping with us</h1>
  <p>Hello ${order.user.lastName} ${order.user.firstName},</p>
  <p>We have finished processing your order.</p>
  <h2>Order Tracking ID: ${order.trackingId} (${order.createdAt
        .toString()
        .substring(0, 10)})</h2>
  <table>
    <thead>
      <tr>
        <th>Product</th>
        <th>Keygen</th>
        <th>Size</th>
        <th>Color</th>
        <th>Quantity</th>
        <th align="right">Price</th>
      </tr>
    </thead>
    <tbody>
       ${await Promise.all(
         order.orderItems.map(async (item) => {
           // Use the convertPrice function to get the converted price
           const convertedPrice = await convertPrice(
             item.discount > 0
               ? item.price - (item.price * item.discount) / 100
               : item.price.toFixed(2),
             order.currencySign
           );
           return `
          <tr>
            <td>${item.name}</td>
            <td align="left">${item.keygen}</td>
            <td align="left">${item.size === "" ? "" : item.size}</td>
            <td align="center">${
              item.color !== "" ? `<img src=${item.color} alt=""/>` : ""
            }</td>
            <td align="center">${item.quantity}</td>
            <td align="right">${convertedPrice}</td>
          </tr>
        `;
         })
       )}
    </tbody>
    <tfoot>
    <tr class="total">
      <td colspan="2">Items Price:</td>
      <td align="right">${convertedItemsPrice}</td>
    </tr>
    <tr class="total">
      <td colspan="2">Tax Price:</td>
      <td align="right">${convertedTaxPrice}</td>
    </tr>
    <tr class="total">
      <td colspan="2">Shipping Price:</td>
      <td align="right">${convertedShippingPrice}</td>
    </tr>
    <tr class="total">
      <td colspan="2"><strong>Total Price:</strong></td>
      <td align="right"><strong>${convertedGrandTotal}</strong></td>
    </tr>
    <tr>
      <td colspan="2">Payment Method:</td>
      <td align="right">${order.paymentMethod}</td>
    </tr>
  </tfoot>
  </table>
  <h2>Shipping address</h2>
  <p>
  <table>
    <tr>
      <th>Field</th>
      <th>Value</th>
    </tr>
    <tr>
      <td><strong>First Name:</strong></td>
      <td>${order.shippingAddress.firstName}</td>
    </tr>
    <tr>
      <td><strong>Last Name:</strong></td>
      <td>${order.shippingAddress.lastName}</td>
    </tr>
    <tr>
      <td><strong>Address:</strong></td>
      <td>${order.shippingAddress.address}</td>
    </tr>
    <tr>
      <td><strong>Phone:</strong></td>
      <td>${order.shippingAddress.phone}</td>
    </tr>
    <tr>
      <td><strong>City:</strong></td>
      <td>${order.shippingAddress.city}</td>
    </tr>
    <tr>
      <td><strong>Zip Code:</strong></td>
      <td>${order.shippingAddress.zipCode}</td>
    </tr>
    <tr>
      <td><strong>State:</strong></td>
      <td>${order.shippingAddress.cState}</td>
    </tr>
    <tr>
      <td><strong>Country:</strong></td>
      <td>${order.shippingAddress.country}</td>
    </tr>
    <tr>
      <td><strong>Shipping:</strong></td>
      <td>${order.shippingAddress.shipping}</td>
    </tr>
  </table>
</p>
  <hr/>
  <p class="thanks">Thanks for shopping with us.</p>
  <!-- This anchor tag will be displayed as a plain link without any additional styles -->
  <p class="footer">Developed by <a href="https://my-portfolio-nine-nu-28.vercel.app/">Olatunji Akande</a></p>
</body>
</html>
`;
      const client = Sib.ApiClient.instance;
      const apiKey = client.authentications["api-key"];
      apiKey.apiKey = process.env.SEND_IN_BLUE_API_KEY;

      const tranEmailApi = new Sib.TransactionalEmailsApi();
      const sender = {
        name: process.env.SHOP_NAME,
        email: process.env.EMAIL_ADDRESS,
      };
      const receivers = [
        {
          name: `${order.user.firstName} ${order.user.lastName}`,
          email: `${order.user.email}`,
        },
      ];
      tranEmailApi
        .sendTransacEmail({
          sender,
          to: receivers,
          subject: `New Order ${order.trackingId}`,
          htmlContent: payOrderEmailTemplate,
          params: {
            role: "Frontend",
          },
        })
        .then(console.log)
        .catch(console.log);

      await order.save();

      res.json({ success: true, message: "Payment successful" });
    } else {
      res.json({ success: false, message: "Payment canceled or failed" });
    }
  })
);

//DELETING ORDERS
orderRouter.delete(
  "/:id",
  isAuth,
  isSellerOrAdmin,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (order) {
      await order.remove();
      res.send({ message: "Order Deleted Successfully" });
    } else {
      res.status(404).send({ message: "Order Not Found" });
    }
  })
);

//================
// CREATE SHIPMENT
//================
const shippoClient = shippo(process.env.SHIPPO_TOKEN);
orderRouter.post("/shipments", async (req, res) => {
  try {
    const { address_from, address_to, parcels } = req.body;

    const shipment = await shippoClient.shipment.create({
      address_from,
      address_to,
      parcels,
    });

    res
      .status(200)
      .json({ message: "Shipment created successfully", shipment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create shipment" });
  }
});

//================
// TRACK SHIPMENT
//================
orderRouter.get("/shipments/:shipmentId", async (req, res) => {
  try {
    const { shipmentId } = req.params;

    const shipment = await shippoClient.shipment.retrieve(shipmentId);

    if (shipment) {
      res.status(200).send({
        message: "Shipment retrieved successfully",
        shipment,
      });
    } else {
      res.status(404).send({
        message: "Shipment not found",
        error: "Item not found",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: "Invalid Tracking ID or Failed to retrieve shipment",
    });
  }
});

//=====
// DHL
//=====
// DHL API configuration
const apiKey = "Or6EfpGnVxOqLb1Abl8HaOmwGLPmTPBT";
const apiSecret = "CL21O1YAUjvd3QWy";

// Booking API
orderRouter.post("/dhl/booking", async (req, res) => {
  try {
    const { addressFrom, addressTo, parcels } = req.body;

    // Perform booking request to DHL API
    const response = await axios.post(
      "https://api-eu.dhl.com/booking/shipments",
      {
        addressFrom,
        addressTo,
        parcels,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "DHL-API-Key": apiKey,
          "DHL-API-Secret": apiSecret,
        },
      }
    );

    // Return booking result
    res.status(200).json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to book shipment" });
  }
});

// Tracking API
orderRouter.get("/dhl/tracking/:trackingNumber", async (req, res) => {
  try {
    const { trackingNumber } = req.params;

    // Perform tracking request to DHL API
    const response = await axios.get(
      `https://api.dhl.com/v2/tracking/shipments?trackingNumber=${trackingNumber}`,
      {
        headers: {
          "Content-Type": "application/json",
          "DHL-API-Key": apiKey,
          "DHL-API-Secret": apiSecret,
        },
      }
    );

    // Return tracking result
    res.status(200).json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to track shipment" });
  }
});

orderRouter.get("/dhl/:trackingNumber", async (req, res) => {
  const { trackingNumber } = req.params;

  const response = await fetch(
    `https://api-test.dhl.com/track/shipments?trackingNumber=${trackingNumber}`,
    {
      method: "GET",
      headers: {
        Authorization: `Basic ${Buffer.from(`${apiKey}:${apiSecret}`).toString(
          "base64"
        )}`,
      },
    }
  );

  if (response.ok) {
    const data = await response.json();
    res.send(data);
  } else {
    res.sendStatus(response.status);
  }
});

//==============
//SHIPPING PRICE
//==============
orderRouter.get("/shippingPrice", async (req, res) => {
  // Get the country code from the request
  const countryCode = req.query.countryCode;

  // Make an API call to fetch the shipping price for the country
  const response = await axios.get(
    `https://api.shipping.com/v1/shippingPrice?countryCode=${countryCode}`
  );

  // Check if the response was successful
  if (response.status === 200) {
    // The shipping price is in the response body
    const shippingPrice = response.data.shippingPrice;

    // Return the shipping price
    res.json({ shippingPrice });
  } else {
    // The request failed
    res.status(response.status).json({ error: response.statusText });
  }
});

export default orderRouter;
