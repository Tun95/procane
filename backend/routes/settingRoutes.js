import express from "express";
import expressAsyncHandler from "express-async-handler";
import Settings from "../models/settings.js";
import { isAuth } from "../utils.js";

const settingsRoutes = express.Router();

//create
settingsRoutes.post(
  "/",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    try {
      const settings = await Settings.create({
        ...req.body,
        user: req.user._id,
      });
      res.send(settings);
    } catch (error) {
      res.send(error);
    }
  })
);

//Fetch all
settingsRoutes.get(
  "/",
  expressAsyncHandler(async (req, res) => {
    try {
      const settings = await Settings.find({})
        .populate("user")
        .sort("-createdAt");
      res.send(settings);
    } catch (error) {
      res.send(error);
    }
  })
);

//Fetch single
settingsRoutes.get(
  "/:id",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
      const setting = await Settings.findById(id);
      res.send(setting);
    } catch (error) {
      res.send(error);
    }
  })
);

//Update
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
      res.send(setting);
    } catch (error) {
      res.send(error);
    }
  })
);

export default settingsRoutes;
