import express from "express";
import expressAsyncHandler from "express-async-handler";
import Color from "../models/color.js";

import { isAdmin, isAuth } from "../utils.js";

const colorRoutes = express.Router();

// Centralized error handler middleware
const errorHandler = (res, error) => {
  console.error(error); // Log the error for debugging purposes
  res.status(500).json({ message: "An error occurred" });
};

//======
//create
//======
colorRoutes.post(
  "/",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    try {
      const color = await Color.create({
        ...req.body,
        user: req.user._id,
      });
      res.send(color);
    } catch (error) {
      errorHandler(res, error);
    }
  })
);

//=========
//Fetch all
//=========
colorRoutes.get(
  "/",
  expressAsyncHandler(async (req, res) => {
    try {
      const colors = await Color.find({}).populate("user").sort("-createdAt");
      res.send(colors);
    } catch (error) {
      errorHandler(res, error);
    }
  })
);

//Fetch single
colorRoutes.get(
  "/:id",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
      const color = await Color.findById(id);
      res.send(color);
    } catch (error) {
      errorHandler(res, error);
    }
  })
);

//Update
colorRoutes.put(
  "/:id",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
      const color = await Color.findByIdAndUpdate(
        id,
        {
          ...req.body,
        },
        { new: true }
      );
      res.send(color);
    } catch (error) {
      errorHandler(res, error);
    }
  })
);

//Delete single
colorRoutes.delete(
  "/:id",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
      const color = await Color.findByIdAndDelete(id);
      res.send(color);
    } catch (error) {
      errorHandler(res, error);
    }
  })
);

export default colorRoutes;
