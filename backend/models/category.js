import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
    },
    categoryImg: {
      type: String,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      // required: true,
    },
  },
  { timestamps: true }
);

//Virtual method to populate created post
categorySchema.virtual("order", {
  ref: "Order",
  foreignField: "category",
  localField: "_id",
});

const Category = mongoose.model("Category", categorySchema);
export default Category;
