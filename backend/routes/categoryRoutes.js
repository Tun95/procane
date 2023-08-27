import express from "express";
import expressAsyncHandler from "express-async-handler";
import Category from "../models/category.js";
import { isAdmin, isAuth } from "../utils.js";

const categoryRoutes = express.Router();

// Centralized error handler middleware
const errorHandler = (res, error) => {
  console.error(error); // Log the error for debugging purposes
  res.status(500).json({ message: "An error occurred" });
};

//create
categoryRoutes.post(
  "/",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    try {
      const category = await Category.create({
        category: req.body.category,
        categoryImg: req.body.categoryImg,
        user: req.user._id,
      });
      res.send(category);
    } catch (error) {
      errorHandler(res, error);
    }
  })
);

//Fetch all
categoryRoutes.get(
  "/",
  expressAsyncHandler(async (req, res) => {
    try {
      const categories = await Category.find({})
        .populate("user")
        .sort("-createdAt");
      res.send(categories);
    } catch (error) {
      errorHandler(res, error);
    }
  })
);
//=============
//FETCH ALL ALPHA. CATEGORY
//=============
categoryRoutes.get(
  "/alphabetic",
  expressAsyncHandler(async (req, res) => {
    const mysort = { category: 1 };
    try {
      const categories = await Category.find({}).sort(mysort).populate("user");
      res.send(categories);
    } catch (error) {
      errorHandler(res, error);
    }
  })
);

//Fetch single
categoryRoutes.get(
  "/:id",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
      const category = await Category.findById(id);
      res.send(category);
    } catch (error) {
      errorHandler(res, error);
    }
  })
);

//Update
categoryRoutes.put(
  "/:id",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
      const category = await Category.findByIdAndUpdate(
        id,
        {
          ...req.body,
        },
        { new: true }
      );
      res.send(category);
    } catch (error) {
      errorHandler(res, error);
    }
  })
);

//Delete single
categoryRoutes.delete(
  "/:id",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
      const category = await Category.findByIdAndDelete(id);
      res.send(category);
    } catch (error) {
      errorHandler(res, error);
    }
  })
);

export default categoryRoutes;
