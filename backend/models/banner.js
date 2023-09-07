import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: "Your Banner Title",
    },
    background: {
      type: String,
      default: "banner image",
    },
    category: {
      type: String,
    },
    descriptions: {
      type: String,
      default: "Banner descriptions",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
     
    },
  },
  {
    timestamps: true,
  }
);

const Banner = mongoose.model("Banner", bannerSchema);
export default Banner;
