import mongoose from "mongoose";

const wrapperSchema = new mongoose.Schema(
  {
    wrappers: [
      {
        icon: {
          type: String,
        },
        header: {
          type: String,
        },
        description: {
          type: String,
        },
      },
    ],
  },
  { timestamps: true }
);

const Wrapper = mongoose.model("Wrapper", wrapperSchema);
export default Wrapper;
