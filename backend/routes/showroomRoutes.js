import express from "express";
import expressAsyncHandler from "express-async-handler";

import { isAdmin, isAuth } from "../utils.js";
import ShowRoom from "../models/showroom.js";

const showRoutes = express.Router();

//========
// CREATE
//========
showRoutes.post(
  "/",
  expressAsyncHandler(async (req, res) => {
    try {
      const { smallImage, largeImage, titleOne, titleTwo, normalText } =
        req.body;

      const showRoom = new ShowRoom({
        smallImage,
        largeImage,
        titleOne,
        titleTwo,
        normalText,
      });

      const createdShowRoom = await showRoom.save();

      res.status(201).json(createdShowRoom); // Return the created ShowRoom as the response
    } catch (err) {
      res.status(500).json({ error: "Failed to create ShowRoom" });
    }
  })
);

//===========
// FETCH ALL
//===========
showRoutes.get(
  "/",
  expressAsyncHandler(async (req, res) => {
    try {
      const showRooms = await ShowRoom.find({}); // Find all ShowRooms in the database

      res.status(200).json(showRooms); // Return the list of ShowRooms as the response
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch ShowRooms" });
    }
  })
);

//=========
// Update
//=========
showRoutes.put(
  "/:id",
  expressAsyncHandler(async (req, res) => {
    try {
      const { smallImage, largeImage, titleOne, titleTwo, normalText } =
        req.body;
      const { id } = req.params;

      // Find the ShowRoom with the provided ID
      const showRoom = await ShowRoom.findById(id);

      if (!showRoom) {
        return res.status(404).json({ error: "ShowRoom not found" });
      }

      // Update the ShowRoom data with the new values
      showRoom.smallImage = smallImage;
      showRoom.largeImage = largeImage;
      showRoom.titleOne = titleOne;
      showRoom.titleTwo = titleTwo;
      showRoom.normalText = normalText;

      // Save the updated ShowRoom in the database
      const updatedShowRoom = await showRoom.save();

      res.status(200).json(updatedShowRoom); // Return the updated ShowRoom as the response
    } catch (err) {
      res.status(500).json({ error: "Failed to update ShowRoom" });
    }
  })
);

export default showRoutes;
