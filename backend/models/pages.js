import mongoose from "mongoose";

const pageSchema = new mongoose.Schema(
  {
    homeImageOne: {
      type: String,
      default: "",
    },
    homeText: {
      type: String,
      default: "",
    },
    homeImageTwo: {
      type: String,
      default: "",
    },
    homeImage: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const Page = mongoose.model("Page", pageSchema);
export default Page;
