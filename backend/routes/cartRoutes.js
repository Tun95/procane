import expressAsyncHandler from "express-async-handler";
import express from "express";
import Cart from "../models/cartModel.js";

const cartRoutes = express.Router();

cartRoutes.post(
  "/",
  expressAsyncHandler(async (req, res) => {
    try {
      const carts = await Cart.create({
        ...req.body,
        user: req.user.id,
      });
    } catch (error) {
      res.send({ message: "Failed to add to cart" });
    }
  })
);

export default cartRoutes;
