import express from "express";
import expressAsyncHandler from "express-async-handler";
import Brand from "../models/brand.js";

import { isAdmin, isAuth } from "../utils.js";

const brandRoutes = express.Router();

// Centralized error handler middleware
const errorHandler = (res, error) => {
  console.error(error); // Log the error for debugging purposes
  res.status(500).json({ message: "An error occurred" });
};

//create
brandRoutes.post(
  "/",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    try {
      const brand = await Brand.create({
        brand: req.body.brand,
        user: req.user._id,
      });
      res.send(brand);
    } catch (error) {
      errorHandler(res, error);
    }
  })
);

//Fetch all
brandRoutes.get(
  "/",
  expressAsyncHandler(async (req, res) => {
    const mysort = { brand: 1 };
    try {
      const brands = await Brand.find({}).sort(mysort).populate("user");
      res.send(brands);
    } catch (error) {
      errorHandler(res, error);
    }
  })
);

//Fetch single
brandRoutes.get(
  "/:id",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
      const brand = await Brand.findById(id);
      res.send(brand);
    } catch (error) {
      errorHandler(res, error);
    }
  })
);

//Update
brandRoutes.put(
  "/:id",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
      const brand = await Brand.findByIdAndUpdate(
        id,
        {
          ...req.body,
        },
        { new: true }
      );
      res.send(brand);
    } catch (error) {
      errorHandler(res, error);
    }
  })
);

//Delete single
brandRoutes.delete(
  "/:id",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
      const brand = await Brand.findByIdAndDelete(id);
      res.send(brand);
    } catch (error) {
      errorHandler(res, error);
    }
  })
);

export default brandRoutes;
