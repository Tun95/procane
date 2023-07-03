import express from "express";
import data from "../data.js";
import Product from "../models/productModels.js";
import Settings from "../models/settings.js";
import User from "../models/userModels.js";

const seedRouter = express.Router();

seedRouter.get("/", async (req, res) => {
  await Product.deleteMany({});
  const createProducts = await Product.insertMany(data.products);

  // await User.deleteMany({});
  // const createUsers = await User.insertMany(data.users);

  await Settings.deleteMany({});
  const createSettings = await Settings.insertMany(data.settings);

  res.send({ createProducts, createSettings });
});

export default seedRouter;
