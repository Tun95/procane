import express from "express";
import expressAsyncHandler from "express-async-handler";
import Apply from "../models/application.js";
import { isAdmin, isAuth } from "../utils.js";

const applicationRoutes = express.Router();

//======
//APPLY
//======
applicationRoutes.post(
  "/",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const existingApplication = await Apply.findOne({ user: req.user._id });
    if (existingApplication && existingApplication.user.id) {
      return res.status(400).send({
        message: "You have already submitted an application.",
      });
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

applicationRoutes.get(
  "/:id",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const {id} = req.params
  })
);

//==========
// DELCINED
//==========
applicationRoutes.put(
  "/:id",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
      const application = await Apply.findById(id);
      if (!application) {
        res.status(404).json({ message: "Application not found" });
        return;
      }
      application.status = false;
      const updatedApplication = await application.save();

      res.json(updatedApplication);
    } catch (error) {
      res.status(500).json({ message: "Error updating application" });
    }
  })
);

//==========
// ACCEPT
//==========
applicationRoutes.put(
  "/:id/approve",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
      const application = await Apply.findById(id);
      if (!application) {
        res.status(404).json({ message: "Application not found" });
        return;
      }
      application.status = true;
      const updatedApplication = await application.save();

      res.json(updatedApplication);
    } catch (error) {
      res.status(500).json({ message: "Error updating application" });
    }
  })
);

export default applicationRoutes;
