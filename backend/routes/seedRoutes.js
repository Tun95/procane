import express from "express";
import data from "../data.js";
import Product from "../models/productModels.js";
import Settings from "../models/settings.js";
import User from "../models/userModels.js";
// import Order from "../models/orderModels.js";
import Category from "../models/category.js";
import Banner from "../models/banner.js";
import Wrapper from "../models/wrapper.js";
import ShowRoom from "../models/showroom.js";

const seedRouter = express.Router();

seedRouter.get("/", async (req, res) => {
  await Product.deleteMany({});
  const createProducts = await Product.insertMany(data.products);

  await User.deleteMany({});
  const createUsers = await User.insertMany(data.users);

  await Settings.deleteMany({});
  const createSettings = await Settings.insertMany(data.settings);

  await Category.deleteMany({});
  const createCategory = await Category.insertMany(data.categories);

  await Banner.deleteMany({});
  const createBanner = await Banner.insertMany(data.banners);

  await Wrapper.deleteMany({});
  const createWrapper = await Wrapper.insertMany(data.wrappers);

  await ShowRoom.deleteMany({});
  const createShowRoom = await ShowRoom.insertMany(data.showrooms);
  // await Order.deleteMany({});

  res.send({
    createProducts,
    createUsers,
    createSettings,
    createCategory,
    createBanner,
    createWrapper,
    createShowRoom,
  });
});

export default seedRouter;
