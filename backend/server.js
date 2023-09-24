import mongoose from "mongoose";
import cors from "cors";
import express from "express";
import path from "path";
import dotenv from "dotenv";
import seedRouter from "./routes/seedRoutes.js";
import productRouter from "./routes/productRoutes.js";
import userRouter from "./routes/userRoutes.js";
import orderRouter from "./routes/orderRoutes.js";
import morgan from "morgan";
import uploadRouter from "./routes/uploadRoutes.js";
import sendEmailRouter from "./routes/emailMsgRoutes.js";
import stripeRouter from "./routes/stripeRoutes.js";
import settingsRoutes from "./routes/settingRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import brandRoutes from "./routes/brandRoutes.js";
import sizeRoutes from "./routes/sizeRoutes.js";
import wishRouter from "./routes/wishRoutes.js";
import priceRoutes from "./routes/priceRoutes.js";
import bannerRoutes from "./routes/bannerRoutes.js";
import colorRoutes from "./routes/colorRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import passport from "passport";
import showRoutes from "./routes/showroomRoutes.js";
import wrapperRouter from "./routes/wrapperRoutes.js";
import updateRouter from "./routes/updateRoutes.js";

dotenv.config();

mongoose.set("strictQuery", false);
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("connected to db");
  })
  .catch((err) => {
    console.log(err.message);
  });

const app = express();

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

app.use(passport.initialize());

app.use(
  cors({
    origin: "*",
    methods: "GET,HEAD,OPTIONS,POST,PUT,PATCH,DELETE",
    credentials: true,
  })
);

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET,HEAD,OPTIONS,POST,PUT,PATCH,DELETE"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin,X-Requested-With,Content-Type,Accept,Authorization"
  );
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/message", sendEmailRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/seed", seedRouter);
app.use("/api/products", productRouter);
app.use("/api/users", userRouter);
app.use("/api/wishes", wishRouter);
app.use("/api/orders", orderRouter);
app.use("/api/category", categoryRoutes);
app.use("/api/brand", brandRoutes);
app.use("/api/size", sizeRoutes);
app.use("/api/color", colorRoutes);
app.use("/api/price", priceRoutes);
app.use("/api/banner", bannerRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/checkout", stripeRouter);
app.use("/api/apply", applicationRoutes);
app.use("/api/showroom", showRoutes);
app.use("/api/wrappers", wrapperRouter);
app.use("/api/updates", updateRouter);

const _dirname = path.resolve();
app.use(express.static(path.join(_dirname, "/frontend/build")));
app.get("*", (req, res) =>
  res.sendFile(path.join(_dirname, "/frontend/build/index.html"))
);

app.use((err, req, res, next) => {
  res.status(500).send({ message: err.message });
});

const port = process.env.PORT || 5000;

const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

server.timeout = 600000; // Set the timeout to 10 minutes (600,000 milliseconds)
