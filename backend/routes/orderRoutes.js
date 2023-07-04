import express from "express";
import expressAsyncHandler from "express-async-handler";
import Order from "../models/orderModels.js";
import User from "../models/userModels.js";
import { isAuth, isAdmin, isSellerOrAdmin } from "../utils.js";
import Sib from "sib-api-v3-sdk";
import Product from "../models/productModels.js";
import Settings from "../models/settings.js";
import stripePackage from "stripe";
import Razorpay from "razorpay";
import axios from "axios";
import fetch from "node-fetch";

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
orderRouter.post(
  "/",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const newOrder = new Order({
      seller: req.body.orderItems[0].seller,
      orderItems: req.body.orderItems.map((x) => ({ ...x, product: x._id })),
      shippingAddress: req.body.shippingAddress,
      //paymentMethod: req.body.paymentMethod,
      itemsPrice: req.body.itemsPrice,
      shippingPrice: req.body.shippingPrice,
      taxPrice: req.body.taxPrice,
      grandTotal: req.body.grandTotal,
      user: req.user._id,
      product: req.body.orderItems.product,
    });
    const order = await newOrder.save();
    res.status(201).send({ message: "New Order Created", order });
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

//ORDER SUMMARY
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

    //GET MONTLY ORDERS
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

    //GET MONTHLY USERS STATS
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

orderRouter.get(
  "/order_summary",
  // isAuth,
  // isSellerOrAdmin,
  expressAsyncHandler(async (req, res) => {
    const productId = req?.query.id;
    const date = new Date();
    const lastMonth = new Date(date.setMonth(date.getMonth() - 1));
    const previousMonth = new Date(
      new Date().setMonth(lastMonth.getMonth() - 1)
    );
    console.log(productId);

    // GET MONTHLY ORDERS
    const orders = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: previousMonth, $lt: lastMonth },
        },
      },
      {
        $group: {
          _id: null,
          numOrders: { $sum: 1 },
        },
      },
    ]);

    // GET MONTHLY USERS STATS
    const users = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: previousMonth, $lt: lastMonth },
        },
      },
      {
        $group: {
          _id: null,
          numUsers: { $sum: 1 },
        },
      },
    ]);

    // GET MONTHLY INCOME
    const income = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: previousMonth, $lt: lastMonth },
        },
      },
      {
        $group: {
          _id: null,
          orders: { $sum: 1 },
          numOrders: { $sum: 1 },
          sales: { $sum: "$grandTotal" },
        },
      },
    ]);

    // GET DAILY ORDERS
    const dailyOrders = await Order.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          orders: { $sum: 1 },
          numOrders: { $sum: 1 },
          sales: { $sum: "$grandTotal" },
        },
      },
      {
        $match: {
          _id: {
            $gte: previousMonth.toISOString(),
            $lt: lastMonth.toISOString(),
          },
        },
      },
      { $sort: { _id: -1 } },
      { $limit: 10 },
    ]);

    // GET SALE PERFORMANCE
    const salePerformance = await Order.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          sales: { $sum: "$grandTotal" },
        },
      },
      {
        $match: {
          _id: {
            $gte: previousMonth.toISOString(),
            $lt: lastMonth.toISOString(),
          },
        },
      },
      { $sort: { _id: -1 } },
      { $limit: 2 },
    ]);

    res.send({ users, orders, income, dailyOrders, salePerformance });
  })
);

//FETCH ALL INDIV. ORDER
const USER_PAGE_SIZE = 25;
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
    const countOrders = await Order.countDocuments({ user: req.user.id });
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
    const order = await Order.findById(req.params.id);
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

//========
//STRIPE
//========
const stripe = stripePackage(process.env.STRIPE_SECRET_KEY);
orderRouter.post(
  "/payment",
  // isAuth,
  expressAsyncHandler(async (req, res) => {
    try {
      const { amount, currency, token, orderId } = req.body;
      // Create a charge using Stripe
      const charge = await stripe.charges.create({
        amount: amount,
        currency: currency,
        source: token.id,
        description: "Stripe Payment Example",
      });
      // Update the order status to 'paid'
      const order = await Order.findById(orderId);
      if (order) {
        order.isPaid = true;
        order.paidAt = Date.now();
        order.paymentResult = {
          id: charge.id,
          status: charge.status,
          update_time: charge.created,
          email_address: charge.billing_details.email,
        };
        await order.save();
      }

      // Return the charge object and updated order as the response
      res.status(200).json({ charge, order });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ error: "An error occurred while processing the payment" });
    }
  })
);

//=============
//RAZORPAY
//============
orderRouter.post(
  "/:id/razorpay",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_SECRET,
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
// const fetchExchangeRate = async (baseCurrency, targetCurrency) => {
//   try {
//     const response = await fetch(
//       `https://api.exchangerate-api.com/v4/latest/${baseCurrency}`
//     );
//     const data = await response.json();
//     const exchangeRates = data.rates;
//     const baseRate = exchangeRates[baseCurrency];
//     const targetRate = exchangeRates[targetCurrency];
//     if (!baseRate || !targetRate) {
//       throw new Error("Invalid currency");
//     }
//     const exchangeRate = targetRate / baseRate;
//     return exchangeRate;
//   } catch (error) {
//     console.log(error);
//     throw new Error("Failed to fetch exchange rates");
//   }
// };

// const convertCurrency = async (value, fromCurrency, toCurrency) => {
//   const exchangeRate = await fetchExchangeRate(fromCurrency, toCurrency);
//   if (exchangeRate) {
//     const convertedValue = value * exchangeRate;
//     return convertedValue;
//   } else {
//     throw new Error("Failed to convert currency");
//   }
// };

async function convertCurrency(amount, toCurrency) {
  const apiKey = process.env.EXCHANGE_RATE_API_KEY;
  const apiUrl = `https://v6.exchangerate-api.com/v6/${apiKey}/pair/USD/${toCurrency}/${amount}`;

  try {
    const response = await axios.get(apiUrl);
    const convertedAmount = response.data.conversion_result;
    return convertedAmount;
  } catch (error) {
    console.log(error);
    throw new Error("Failed to convert currency");
  }
}

orderRouter.post(
  "/:id/razorpay/success",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const orderId = req.params.id;
    const paymentResponse = req.body;

    const order = await Order.findById(orderId).populate("user", "email name");

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
      let convertedPrice = order.price;

      if (order.currencySign !== "USD") {
        try {
          const currencySignMapping = {
            NGN: "₦",
            EUR: "€",
            GBP: "£",
            INR: "₹",
          };

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
          convertedCurrencySign = currencySignMapping[order.currencySign];
        } catch (error) {
          console.log(error);
          throw new Error("Failed to convert currency");
        }
      }

      const convertPrice = async (price, toCurrency) => {
        try {
          const convertedPrice = await convertCurrency(
            price,
            order.currencySign,
            toCurrency
          );
          const currencySignMapping = {
            NGN: "₦",
            EUR: "€",
            GBP: "£",
            INR: "₹",
          };
          const formattedPrice = new Intl.NumberFormat("en", {
            style: "currency",
            currency: toCurrency,
          }).format(convertedPrice);
          return `${formattedPrice}`;
        } catch (error) {
          console.log(error);
          throw new Error("Failed to convert price");
        }
      };
      const payOrderEmailTemplate = `<!DOCTYPE html><html><body><h1>Thanks for shopping with us</h1>
        <p>
        Hi ${order.user.lastName} ${order.user.firstName},</p>
        <p>We have finished processing your order.</p>
        <h2>[Order ${order._id}] (${order.createdAt
        .toString()
        .substring(0, 10)})</h2>
        
            <table>
        <thead>
        <tr>
        <td><strong>Product</strong></td>
        <td><strong>Keygen</strong></td>
        <td><strong>Size</strong></td>
        <td><strong>Color</strong></td>
        <td><strong>Quantity</strong></td>
        <td><strong align="right">Price</strong></td>
        </thead>
        <tbody>
     ${await Promise.all(
       order.orderItems.map(async (item) => {
         let convertedPrice = "";
         if (order.currencySign === "INR") {
           convertedPrice = await convertPrice(item.price.toFixed(2), "INR");
         } else if (order.currencySign === "NGN") {
           convertedPrice = await convertPrice(item.price.toFixed(2), "NGN");
         } else if (order.currencySign === "EUR") {
           convertedPrice = await convertPrice(item.price.toFixed(2), "EUR");
         } else if (order.currencySign === "GBP") {
           convertedPrice = await convertPrice(item.price.toFixed(2), "GBP");
         }
         return `
      <tr>
        <td>${item.name}</td>
        <td align="left">${item.keygen}</td>
        <td align="left">${item.size === "" ? "" : item.size}</td>
        <td align="center"><img src=${
          item.color ? item.color : ""
        } alt=""/></td>
        <td align="center">${item.quantity}</td>
        <td align="right">${convertedCurrencySign}${convertedPrice}</td>
      </tr>
    `;
       })
     )}
        </tbody>
        <tfoot>
        <tr>
        <td colspan="2">Items Price:</td>
        <td align="right"> ${convertedCurrencySign}${convertedItemsPrice}</td>
        </tr>
        <tr>
        <td colspan="2">Tax Price:</td>
        <td align="right"> ${convertedCurrencySign}${convertedTaxPrice}</td>
        </tr>
        <tr>
        <td colspan="2">Shipping Price:</td>
        <td align="right">  ${convertedCurrencySign}${convertedShippingPrice}</td>
        </tr>
        <tr>
        <td colspan="2"><strong>Total Price:</strong></td>
        <td align="right"><strong> ${convertedCurrencySign}${convertedGrandTotal}</strong></td>
        </tr>
        <tr>
        <td colspan="2">Payment Method:</td>
        <td align="right">${order.paymentMethod}</td>
        </tr>
        </table>
        <h2>Shipping address</h2>
        <p>
        ${order.shippingAddress.firstName},<br/>
        ${order.shippingAddress.lastName},<br/>
        ${order.shippingAddress.address},<br/>
        ${order.shippingAddress.city},<br/>
        ${order.shippingAddress.zipCode}<br/>
        ${order.shippingAddress.cState}<br/>
        ${order.shippingAddress.country},<br/>
        ${order.shippingAddress.shipping},<br/>
        </p>
        <hr/>
        <p>
        Thanks for shopping with us.
        </p>
        </body></html>`;
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
          subject: `New Order ${order._id}`,
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
    const order = await Order.findById(req.params.id).populate(
      "user",
      "email name"
    );
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

      const updatedOrder = await order.save();

      const payOrderEmailTemplate = `<!DOCTYPE html><html><body><h1>Thanks for shopping with us</h1>
        <p>
        Hi ${order.user.name},</p>
        <p>We have finished processing your order.</p>
        <h2>[Order ${order._id}] (${order.createdAt
        .toString()
        .substring(0, 10)})</h2>
        
            <table>
        <thead>
        <tr>
        <td><strong>Product</strong></td>
        <td><strong>Keygen</strong></td>
        <td><strong>Size</strong></td>
        <td><strong>Color</strong></td>
        <td><strong>Quantity</strong></td>
        <td><strong align="right">Price</strong></td>
        </thead>
        <tbody>
        ${order.orderItems
          .map(
            (item) => `
          <tr>
          <td>${item.name}</td>
          <td align="left">${item.keygen}</td>
          <td align="left">${item.size === "" ? "" : item.size}</td>
          <td align="center"><img src=${item.color} alt=""/></td>
          <td align="center">${item.quantity}</td>
          <td align="right"> ${order.currencySign}${item.price.toFixed(2)}</td>
          </tr>
        `
          )
          .join("\n")}
        </tbody>
        <tfoot>
        <tr>
        <td colspan="2">Items Price:</td>
        <td align="right"> ${order.currencySign}${order.itemsPrice.toFixed(
        2
      )}</td>
        </tr>
        <tr>
        <td colspan="2">Tax Price:</td>
        <td align="right"> ${order.currencySign}${order.taxPrice.toFixed(
        2
      )}</td>
        </tr>
        <tr>
        <td colspan="2">Shipping Price:</td>
        <td align="right"> ${order.currencySign}${order.shippingPrice.toFixed(
        2
      )}</td>
        </tr>
        <tr>
        <td colspan="2"><strong>Total Price:</strong></td>
        <td align="right"><strong> ${
          order.currencySign
        }${order.grandTotal.toFixed(2)}</strong></td>
        </tr>
        <tr>
        <td colspan="2">Payment Method:</td>
        <td align="right">${order.paymentMethod}</td>
        </tr>
        </table>
        <h2>Shipping address</h2>
        <p>
        ${order.shippingAddress.firstName},<br/>
        ${order.shippingAddress.lastName},<br/>
        ${order.shippingAddress.address},<br/>
        ${order.shippingAddress.city},<br/>
        ${order.shippingAddress.zipCode}<br/>
        ${order.shippingAddress.cState}<br/>
        ${order.shippingAddress.country},<br/>
        ${order.shippingAddress.shipping},<br/>
        </p>
        <hr/>
        <p>
        Thanks for shopping with us.
        </p>
        </body></html>`;
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
          subject: `New Order ${order._id}`,
          htmlContent: payOrderEmailTemplate,
          params: {
            role: "Frontend",
          },
        })
        .then(console.log)
        .catch(console.log);

      res.send({ message: "Order Paid", order: updatedOrder });
    } else {
      res.status(404).send({ message: "Order Not Found" });
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
export default orderRouter;
