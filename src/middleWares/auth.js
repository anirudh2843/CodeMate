const jwt = require("jsonwebtoken");
const User = require("../models/user");

const userAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).send({ message: "Unauthorized - No token" });
    }

    const token = authHeader.split(" ")[1]; // Remove 'Bearer ' prefix
    const decodedObj = await jwt.verify(token, "DEV@TINDER");
    const { _id } = decodedObj;

    const user = await User.findById(_id);
    if (!user) {
      return res.status(401).send({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).send({ message: "Invalid token: " + err.message });
  }
};

module.exports = userAuth;
