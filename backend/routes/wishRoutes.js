import express from "express";
import expressAsyncHandler from "express-async-handler";
import Wish from "../models/wishModel.js";
import { isAuth } from "../utils.js";

const wishRouter = express.Router();

//======
//CREATE
//======
wishRouter.post(
  "/post",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const {
      name,
      slug,
      image,
      price,
      rating,
      discount,
      checked,
      user,
      product,
    } = req.body;

    try {
      // Check if the product already exists in the user's wish list
      const existingWish = await Wish.findOne({
        user: req.user._id,
        product,
      });

      if (existingWish) {
        return res
          .status(400)
          .json({ message: "Product already exists in wish list" });
      }

      const newWish = new Wish({
        name,
        slug,
        image,
        rating,
        price,
        discount,
        checked,
        user: req.user._id,
        product,
      });

      const createdWish = await newWish.save();

      res.status(201).json(createdWish);
    } catch (error) {
      res.status(500).json({ message: "Failed to create a new wish" });
    }
  })
);

//=======================
//WISH CHECK BY PRODUCT ID
//======================= 
wishRouter.get(
  "/product/:id",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    try {
      const existingWish = await Wish.findOne({
        user: req.user._id,
        product: req.params.id,
      });

      if (existingWish) {
        res.json({ exists: true });
      } else {
        res.json({ exists: false });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to check wish list" });
    }
  })
);

//==========
//===========
wishRouter.delete(
  "/product/:id",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const wishId = req.params.id;

    try {
      const deletedWish = await Wish.findByIdAndDelete(wishId);

      if (deletedWish) {
        res.json({ message: "Wish deleted successfully" });
      } else {
        res.status(404).json({ message: "Wish not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete wish" });
    }
  })
);


//=======
//DELETE
//=======
wishRouter.delete("/post/:id", isAuth, async (req, res) => {
  try {
    const wish = await Wish.findById(req.params.id);
    if (!wish) {
      return res.status(404).json({ message: "Wish not found" });
    }
    await wish.remove();
    res.json({ message: "Wish removed" });
  } catch (error) {
    res.status(500).json({ message: "Failed to remove the wish" });
  }
});

//FETCH ALL
wishRouter.get(
  "/",
  // isAuth,
  expressAsyncHandler(async (req, res) => {
    try {
      const wishLists = await Wish.find({})
        .sort("-createdAt")
        .populate("user product");
      res.send(wishLists);
    } catch (error) {
      res.send(error);
    }
  })
);

//DELETE
wishRouter.delete(
  "/:id",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
      const wish = await Wish.findByIdAndDelete(id);
      res.send(wish);
    } catch (error) {
      res.send(error);
    }
  })
);

export default wishRouter;
