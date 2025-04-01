const express = require("express");
const connectDB = require("./config/database");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config();
const authRouter = express.Router();


app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);

connectDB()
  .then(() => {
    console.log("✅ Database connected successfully");

    app.use(
      cors({
        origin: "https://code-mate-web.vercel.app",
        credentials: true,
      })
    );

    app.use(express.json());
    app.use(cookieParser());

    // Routes
    const authRouter = require("./routes/auth");
    app.use("/auth", authRouter);

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("❌ Database connection failed:", err.message);
  });

module.exports = app;
