const mongoose = require("mongoose");

const connectDB = async () => {
  await mongoose.connect(
    "mongodb+srv://firstTest:anirudh123@server.1e5lx.mongodb.net/devTinder"
  );
};

module.exports = connectDB;
