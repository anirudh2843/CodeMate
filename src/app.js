const express = require("express");
const connectDB = require("./config/database");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const http = require("http");
const { initializeSocket } = require("./utils/socket");
require("dotenv").config();
app.use(cookieParser());
const path = require("path");
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

const allowedOrigins = [
  "http://localhost:5173",
  "https://codemate-web.onrender.com",
  "https://code-mate-web.vercel.app",
  "https://codemate-2.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(express.json());

const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
const userRouter = require("./routes/user");
const chatRouter = require("./routes/chat");

const PORT = process.env.PORT;

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);
app.use("/", chatRouter);

const server = http.createServer(app);
const io = initializeSocket(server);
app.set("io", io);

connectDB()
  .then(() => {
    console.log("connection successfull");
    server.listen(PORT, () => {
      console.log(`server is successfully listenning  on ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("connection failed:", { err });
  });

module.exports = app;
