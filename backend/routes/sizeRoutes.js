import express from "express";
import expressAsyncHandler from "express-async-handler";
import Size from "../models/size.js";

import { isAdmin, isAuth } from "../utils.js";

const sizeRoutes = express.Router();

//create
sizeRoutes.post(
  "/",
  isAuth,
   isAdmin,
  expressAsyncHandler(async (req, res) => {
    try {
      const size = await Size.create({
        size: req.body.size,
         user: req.user._id,
      });
      res.send(size);
    } catch (error) {
      res.send(error);
    }
  })
);

//Fetch all
sizeRoutes.get(
  "/",
  expressAsyncHandler(async (req, res) => {
    try {
      const sizes = await Size.find({}).populate("user").sort("-createdAt");
      res.send(sizes);
    } catch (error) {
      res.send(error);
    }
  })
);

//Fetch single
sizeRoutes.get(
  "/:id",
  isAuth,
   isAdmin,
  expressAsyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
      const size = await Size.findById(id);
      res.send(size);
    } catch (error) {
      res.send(error);
    }
  })
);

//Update
sizeRoutes.put(
  "/:id",
  isAuth,
   isAdmin,
  expressAsyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
      const size = await Size.findByIdAndUpdate(
        id,
        {
          ...req.body,
        },
        { new: true }
      );
      res.send(size);
    } catch (error) {
      res.send(error);
    }
  })
);

//Delete single
sizeRoutes.delete(
  "/:id",
  isAuth,
   isAdmin,
  expressAsyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
      const size = await Size.findByIdAndDelete(id);
      res.send(size);
    } catch (error) {
      res.send(error);
    }
  })
);

export default sizeRoutes;
