import express from "express";
import expressAsyncHandler from "express-async-handler";
import Settings from "../models/settings.js";
import { isAuth } from "../utils.js";

const settingsRoutes = express.Router();

// Centralized error handler middleware
const errorHandler = (res, error) => {
  console.error(error); // Log the error for debugging purposes
  res.status(500).json({ message: "An error occurred" });
};

//=======
// Create
//=======
settingsRoutes.post(
  "/",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    try {
      const settings = await Settings.create({
        ...req.body,
        user: req.user._id,
      });
      res.status(201).json(settings); // 201 Created status
    } catch (error) {
      errorHandler(res, error);
    }
  })
);

//==========
// Fetch all
//==========
settingsRoutes.get(
  "/",
  expressAsyncHandler(async (req, res) => {
    try {
      const settings = await Settings.find({})
        .populate("user")
        .sort("-createdAt");
      res.json(settings);
    } catch (error) {
      errorHandler(res, error);
    }
  })
);

//=============
// Fetch single
//=============
settingsRoutes.get(
  "/:id",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
      const setting = await Settings.findById(id);
      if (!setting) {
        res.status(404).json({ message: "Setting not found" });
        return;
      }
      res.json(setting);
    } catch (error) {
      errorHandler(res, error);
    }
  })
);

//========
// Update
//=======
settingsRoutes.put(
  "/:id",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
      const setting = await Settings.findByIdAndUpdate(
        id,
        {
          ...req.body,
        },
        { new: true }
      );
      if (!setting) {
        res.status(404).json({ message: "Setting not found" });
        return;
      }
      res.json(setting);
    } catch (error) {
      errorHandler(res, error);
    }
  })
);

export default settingsRoutes;
