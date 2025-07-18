const express = require("express");
const userAuth = require("../middleWares/auth");
const { path } = require("../app");
const chatRouter = express.Router();
const { Chat } = require("../models/chat");

chatRouter.get("/chat/:targetUserId", userAuth, async (req, res) => {
  const { targetUserId } = req.params;

  const userId = req.user._id;

  try {
    let chat = await Chat.findOne({
      participants: { $all: [userId, targetUserId] },
    }).populate({ path: "messages.senderId", select: "firstName lastName" });
    if (!chat) {
      chat = new Chat({
        participants: [userId, targetUserId],
        messages: [],
      });
      chat.messages.push({
        senderId,
        text,
      });
      await chat.save();
    }
    res.json(chat);
  } catch (e) {
    console.log(e);
  }
});

module.exports = chatRouter;
