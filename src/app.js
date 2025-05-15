const express = require("express");
const connectDB = require("./config/database");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const http = require("http");
const initializeSocket = require("./utils/socket");
require("dotenv").config();

app.use(
  cors({
    origin: "https://codemate-web.onrender.com",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

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
initializeSocket(server);

connectDB()
  .then(() => {
    console.log("connection successfull");
    server.listen(PORT, () => {
      console.log(`server is successfully listenning  on ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("connection failed");
  });

module.exports = app;
