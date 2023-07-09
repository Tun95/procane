import express from "express";
import expressAsyncHandler from "express-async-handler";
import Apply from "../models/application.js";
import { isAdmin, isAuth } from "../utils.js";

const applicationRoutes = express.Router();

//======
//APPLY
//======
// applicationRoutes.post(
//   "/",
//   isAuth,
//   expressAsyncHandler(async (req, res) => {
//     try {
//       const application = await Apply.create({
//         ...req.body,
//         user: req.user._id,
//       });
//       res.send(application);
//     } catch (error) {
//       res.send(error);
//     }
//   })
// );
applicationRoutes.post(
  "/",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const existingApplication = await Apply.findOne({ user: req.user._id });
    if (existingApplication && existingApplication.status) {
      return res
        .status(400)
        .send({ message: "You have already submitted an application." });
    }
    try {
      const application = await Apply.create({
        ...req.body,
        user: req.user._id,
      });
      res.send(application);
    } catch (error) {
      res.status(500).send({ message: "Internal Server Error" });
    }
  })
);

//=========
//FETCH ALL
//=========
applicationRoutes.get(
  "/",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    try {
      const applications = await Apply.find({})
        .sort("-createdAt")
        .populate("user");
      res.send(applications);
    } catch (error) {
      res.status(500).send({ message: "Fail to fetch all applications" });
    }
  })
);

export default applicationRoutes;
