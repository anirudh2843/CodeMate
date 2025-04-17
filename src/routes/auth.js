const express = require("express");
const User = require("../models/user");
const { validateSignUpData } = require("../utils/validation");
const authRouter = express.Router();
const bcrypt = require("bcrypt");

authRouter.post("/signup", async (req, res) => {
  try {
    // validate the data
    validateSignUpData(req);

    // encrypt the password
    const { firstName, lastName, emailId, password } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);

    const user = new User({
      firstName,
      lastName,
      emailId,
      password: passwordHash,
    });
    const savedUser = await user.save();
    const token = await savedUser.getJWT();

    // add token to cookie and send response to user
    res.cookie("token", token, { expires: new Date(Date.now() + 8 * 3600000) });
    res.json({ message: "user added successsfully", data: savedUser });
  } catch (err) {
    res.status(400).send("Error  :" + err.message);
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;

    const user = await User.findOne({ emailId: emailId });
    if (!user) {
      return res.status(400).send("Invalid Credentials!!!");
    }

    const isPasswordValid = await user.validatePassword(password);
    if (isPasswordValid) {
      // create token
      const token = await user.getJWT();

      // add token to cookie and send response to user
      res.cookie("token", token, {
        expires: new Date(Date.now() + 8 * 3600000),
      });
      res.send(user);
    } else {
      throw new Error("Invalid Credentials");
    }
  } catch (err) {
    res.status(500).send({ message: "Login Failed", error: err.message });
  }
});


authRouter.post("/logout", async (req, res) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
  });
  res.send("Logout Successfull!!!");
});

module.exports = authRouter;
