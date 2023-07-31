import express from "express";
import expressAsyncHandler from "express-async-handler";
import Wrapper from "../models/wrapper.js";

const wrapperRouter = express.Router();

//=====================
// Create a new wrapper
//=====================
wrapperRouter.post(
  "/",
  expressAsyncHandler(async (req, res) => {
    try {
      const { icon, header, description } = req.body;

      // Create a new wrapper instance
      const newWrapper = new Wrapper({
        wrappers: [
          {
            icon,
            header,
            description,
          },
        ],
      });

      // Save the new wrapper to the database
      const savedWrapper = await newWrapper.save();

      res.status(201).json(savedWrapper);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to create wrapper", error: error.message });
    }
  })
);

//=================
// Get all wrappers
//=================
wrapperRouter.get(
  "/",
  expressAsyncHandler(async (req, res) => {
    try {
      // Fetch all wrappers from the database
      const wrappers = await Wrapper.find();

      res.status(200).json(wrappers);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to fetch wrappers", error: error.message });
    }
  })
);

//========================
// Get a specific wrapper
//========================
wrapperRouter.get(
  "/:id",
  expressAsyncHandler(async (req, res) => {
    try {
      const wrapperId = req.params.id;

      // Find the wrapper by ID in the database
      const wrapper = await Wrapper.findById(wrapperId);

      if (!wrapper) {
        return res.status(404).json({ message: "Wrapper not found" });
      }

      res.status(200).json(wrapper);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to fetch wrapper", error: error.message });
    }
  })
);

//================================
// Update a specific wrapper by ID
//================================
wrapperRouter.put(
  "/:id",
  expressAsyncHandler(async (req, res) => {
    try {
      const { icon, header, description } = req.body;
      const wrapperId = req.params.id;

      // Find the wrapper by ID in the database
      const wrapper = await Wrapper.findById(wrapperId);

      if (!wrapper) {
        return res.status(404).json({ message: "Wrapper not found" });
      }

      // Update the wrapper fields
      wrapper.wrappers[0].icon = icon;
      wrapper.wrappers[0].header = header;
      wrapper.wrappers[0].description = description;

      // Save the updated wrapper to the database
      const updatedWrapper = await wrapper.save();

      res.status(200).json(updatedWrapper);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to update wrapper", error: error.message });
    }
  })
);

//================================
// Delete a specific wrapper by ID
//================================
wrapperRouter.delete(
  "/:id",
  expressAsyncHandler(async (req, res) => {
    try {
      const wrapperId = req.params.id;

      // Find the wrapper by ID in the database
      const wrapper = await Wrapper.findById(wrapperId);

      if (!wrapper) {
        return res.status(404).json({ message: "Wrapper not found" });
      }

      // Delete the wrapper from the database
      await wrapper.remove();

      res.status(200).json({ message: "Wrapper deleted successfully" });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to delete wrapper", error: error.message });
    }
  })
);

export default wrapperRouter;
