import express from "express";
import expressAsyncHandler from "express-async-handler";
import Banner from "../models/banner.js";

import { isAdmin, isAuth } from "../utils.js";

const bannerRoutes = express.Router();

//======
//create
//======
bannerRoutes.post(
  "/",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    try {
      const banner = await Banner.create({
        ...req.body,
        user: req.user._id,
      });
      res.send(banner);
    } catch (error) {
      res.send(error);
    }
  })
);

//Fetch all
bannerRoutes.get(
  "/",
  expressAsyncHandler(async (req, res) => {
    try {
      const banners = await Banner.find({}).populate("user").sort("-createdAt");
      res.send(banners);
    } catch (error) {
      res.send(error);
    }
  })
);

//Fetch single
bannerRoutes.get(
  "/:id",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
      const banner = await Banner.findById(id);
      res.send(banner);
    } catch (error) {
      res.send(error);
    }
  })
);

//Update
bannerRoutes.put(
  "/:id",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
      const banner = await Banner.findByIdAndUpdate(
        id,
        {
          ...req.body,
        },
        { new: true }
      );
      res.send(banner);
    } catch (error) {
      res.send(error);
    }
  })
);

//Delete single
bannerRoutes.delete(
  "/:id",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
      const banner = await Banner.findByIdAndDelete(id);
      res.send(banner);
    } catch (error) {
      res.send(error);
    }
  })
);

export default bannerRoutes;
