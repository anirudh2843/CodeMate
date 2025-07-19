const express = require("express");
const userAuth = require("../middleWares/auth");
const { path } = require("../app");
const chatRouter = express.Router();
const { Chat } = require("../models/chat");

chatRouter.post("/chat/:targetUserId", userAuth, async (req, res) => {
  const { targetUserId } = req.params;
  const { text } = req.body;
  const senderId = req.user._id;

  if (!text) {
    return res.status(400).json({ message: "Text is required" });
  }

  try {
    let chat = await Chat.findOne({
      participants: { $all: [senderId, targetUserId] },
    });

    if (!chat) {
      chat = new Chat({
        participants: [senderId, targetUserId],
        messages: [],
      });
    }

    // Push new message
    chat.messages.push({ senderId, text });
    await chat.save();

    const updatedChat = await Chat.findById(chat._id).populate({
      path: "messages.senderId",
      select: "firstName lastName",
    });

    // Get the last message for socket broadcasting
    const lastMessage = updatedChat.messages[updatedChat.messages.length - 1];

    // Broadcast to all connected clients via socket
    const io = req.app.get("io"); // Make sure you have access to io instance
    if (io) {
      io.emit("messageReceived", {
        firstName: lastMessage.senderId.firstName,
        lastName: lastMessage.senderId.lastName,
        text: lastMessage.text,
        createdAt: lastMessage.createdAt,
        senderId: lastMessage.senderId._id.toString(),
      });
    }

    res.status(200).json(updatedChat);
  } catch (err) {
    console.error("Error sending message:", err);
    res.status(500).json({ message: "Error sending message" });
  }
});

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
      await chat.save();
    }
    res.json(chat);
  } catch (e) {
    console.log(e);
  }
});

module.exports = chatRouter;
