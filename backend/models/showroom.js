import mongoose from "mongoose";

const showRoomSchema = new mongoose.Schema(
  {
    smallImage: {
      type: String,
    },
    largeImage: {
      type: String,
    },
    titleOne: {
      type: String,
    },
    titleTwo: {
      type: String,
    },
    normalText: [
      {
        type: String,
      },
    ],
  },
  {
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
    timestamps: true,
  }
);

const ShowRoom = mongoose.model("ShowRoom", showRoomSchema);

export default ShowRoom;
