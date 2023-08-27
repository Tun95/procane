import express from "express";
import expressAsyncHandler from "express-async-handler";
import Price from "../models/price.js";

import { isAdmin, isAuth } from "../utils.js";

const priceRoutes = express.Router();

// Centralized error handler middleware
const errorHandler = (res, error) => {
  console.error(error); // Log the error for debugging purposes
  res.status(500).json({ message: "An error occurred" });
};

//create
priceRoutes.post(
  "/",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    try {
      const price = await Price.create({
        price: req.body.price,
        priceSpan: req.body.priceSpan,
        user: req.user._id,
      });
      res.send(price);
    } catch (error) {
      errorHandler(res, error);
    }
  })
);

//Fetch all
priceRoutes.get(
  "/",
  expressAsyncHandler(async (req, res) => {
    const mysort = { price: 1 };
    try {
      const prices = await Price.find({}).sort(mysort).populate("user");
      res.send(prices);
    } catch (error) {
      errorHandler(res, error);
    }
  })
);

//Fetch single
priceRoutes.get(
  "/:id",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
      const price = await Price.findById(id);
      res.send(price);
    } catch (error) {
      errorHandler(res, error);
    }
  })
);

//Update
priceRoutes.put(
  "/:id",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
      const price = await Price.findByIdAndUpdate(
        id,
        {
          ...req.body,
        },
        { new: true }
      );
      res.send(price);
    } catch (error) {
      errorHandler(res, error);
    }
  })
);

//Delete single
priceRoutes.delete(
  "/:id",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
      const price = await Price.findByIdAndDelete(id);
      res.send(price);
    } catch (error) {
      errorHandler(res, error);
    }
  })
);

export default priceRoutes;
