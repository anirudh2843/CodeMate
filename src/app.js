const express = require("express");
const connectDB = require("./config/database");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config();

app.use(
  cors({
    origin: "https://code-mate-web.vercel.app",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
const userRouter = require("./routes/user");

const PORT = process.env.PORT;

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);

connectDB()
  .then(() => {
    console.log("connection successfull");
    app.listen(PORT, () => {
      console.log(`server is successfully listenning  on ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("connection failed");
  });

module.exports = app;
