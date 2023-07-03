import express from "express";
import expressAsyncHandler from "express-async-handler";
import Brand from "../models/brand.js";

import { isAdmin, isAuth } from "../utils.js";

const brandRoutes = express.Router();

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
      res.send(error);
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
      res.send(error);
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
      res.send(error);
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
      res.send(error);
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
      res.send(error);
    }
  })
);

export default brandRoutes;
