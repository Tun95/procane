import mongoose from "mongoose";
import { Server } from "socket.io";
import { createServer } from "http";
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

//VERCEL ERROR
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//VERCEL ERROR
app.get("/", (req, res) => {
  const data = {
    title: "My Website",
    name: "John", // Replace 'John' with the actual name you want to display
  };
  res.render("index", data);
});

const paypalClientId = process.env.PAYPAL_CLIENT_ID || "sb";
app.get("/", (req, res) => {
  res.render("index", { paypalClientId });
});
app.get("/api/keys/paypal", (req, res) => {
  res.send(process.env.PAYPAL_CLIENT_ID || "sb");
});

app.get("/get-stripe-key", (req, res) => {
  res.send({ key: process.env.STRIPE_PUBLISHABLE_KEY });
});

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

const _dirname = path.resolve();
app.use(express.static(path.join(_dirname, "/frontend/build")));
app.get("*", (req, res) =>
  res.sendFile(path.join(_dirname, "/frontend/build/index.html"))
);

app.use((err, req, res, next) => {
  res.status(500).send({ message: err.message });
});

const server = createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
// const httpServer = http.Server(app);
// const io = SocketIO(httpServer);
const users = [];

io.on("connection", (socket) => {
  socket.on("disconnect", () => {
    const user = users.find((x) => x.socketId === socket.id);
    if (user) {
      user.online = false;
      console.log("Offline", user.name);
      const admin = users.find((x) => x.isAdmin && x.online);
      if (admin) {
        io.to(admin.socketId).emit("updateUser", user);
      }
    }
  });
  socket.on("onLogin", (user) => {
    const updatedUser = {
      ...user,
      online: true,
      socketId: socket.id,
      messages: [],
    };
    const existUser = users.find((x) => x._id === updatedUser._id);
    if (existUser) {
      existUser.socketId = socket.id;
      existUser.online = true;
    } else {
      users.push(updatedUser);
    }
    console.log("Online", user.name);
    const admin = users.find((x) => x.isAdmin && x.online);
    if (admin) {
      io.to(admin.socketId).emit("updateUser", updatedUser);
    }
    if (updatedUser.isAdmin) {
      io.to(updatedUser.socketId).emit("listUsers", users);
    }
  });
  socket.on("onUserSelected", (user) => {
    const admin = users.find((x) => x.isAdmin && x.online);
    if (admin) {
      const existUser = users.find((x) => x._id === user._id);
      io.to(admin.socketId).emit("selectUser", existUser);
    }
  });
  socket.on("onMessage", (message) => {
    if (message.isAdmin) {
      const user = users.find((x) => x._id === message._id && x.online);
      if (user) {
        io.to(user.socketId).emit("message", message);
        user.messages.push(message);
      }
    } else {
      const admin = users.find((x) => x.isAdmin && x.online);
      if (admin) {
        io.to(admin.socketId).emit("message", message);
        const user = users.find((x) => x._id === message._id && x.online);
        user.messages.push(message);
      } else {
        io.to(socket.id).emit("message", {
          name: "Admin",
          body: "Sorry, I am not online right now",
        });
      }
    }
  });
});

const port = process.env.PORT || 5000;
server.listen(port, () => {
  console.log(`serve at http://localhost:${port}`);
});

// app.listen(port, () => {
//   console.log(`serve at http://localhost:${port}`);
// });
