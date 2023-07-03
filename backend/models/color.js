import mongoose from "mongoose";

const colorSchema = new mongoose.Schema(
  {
    color: {
      type: String,
      required: true,
      default:
        "https://res.cloudinary.com/dstj5eqcd/image/upload/v1673947522/ryctyvbnjapn0zruozqa.png",
    },
    colorName: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const Color = mongoose.model("Color", colorSchema);
export default Color;
