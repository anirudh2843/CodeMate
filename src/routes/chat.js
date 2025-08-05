const express = require("express");
const userAuth = require("../middleWares/auth");
const chatRouter = express.Router();
const { Chat } = require("../models/chat");
const User = require("../models/user");
const sendEmail = require("../utils/sendEmail");
const { onlineUsers, getSecretRoomId } = require("../utils/socket");

const multer = require("multer");
const storage = multer.memoryStorage(); // ✅ Store in memory
const upload = multer({ storage });

chatRouter.get("/:chatId/image/:messageId", async (req, res) => {
  try {
    const { chatId, messageId } = req.params;
    const chat = await Chat.findById(chatId);
    const message = chat?.messages.id(messageId);

    if (!message || !message.image?.data) {
      return res.status(404).send("Image not found");
    }

    res.set("Content-Type", message.image.contentType);
    res.send(message.image.data);
  } catch (err) {
    res.status(500).send("Server error");
  }
});

chatRouter.get("/user/:id", userAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      "firstName lastName emailId"
    );
    if (!user) {
      console.warn(`⚠️ User ${req.params.id} not found.`);
      return res.status(200).json({
        _id: req.params.id,
        firstName: "Unknown",
        lastName: "",
        emailId: "",
        isOnline: false,
      });
    }

    const isOnline = onlineUsers.has(req.params.id); // Check online status
    res.json({ ...user.toObject(), isOnline });
  } catch (err) {
    console.error("❌ Error fetching user:", err);
    res.status(500).json({ message: "Error fetching user details" });
  }
});

chatRouter.post(
  "/chat/:targetUserId",
  userAuth,
  upload.single("image"),
  async (req, res) => {
    try {
      console.log("Incoming message:", req.body);
      console.log("Uploaded file:", req.file);
      const { targetUserId } = req.params;
      const senderId = req.user._id;
      const { text } = req.body;

      if (!text && !req.file) {
        return res.status(400).json({ message: "Text or image is required" });
      }

      // Ensure chat exists
      const sortedParticipants = [senderId.toString(), targetUserId].sort();
      let chat = await Chat.findOne({ participants: sortedParticipants });

      if (!chat) {
        chat = new Chat({
          participants: sortedParticipants,
          messages: [],
        });
      }

      // Save new message
      const message = {
        senderId,
        text: text || "",
      };
      if (req.file) {
        console.log("File received:", req.file);
        message.image = {
          data: req.file.buffer,
          contentType: req.file.mimetype,
        };
      }

      chat.messages.push(message);

      // Check recipient online and email if offline
      const now = Date.now();
      const ONE_HOUR = 60 * 60 * 1000;
      const isUserOffline = !onlineUsers.has(targetUserId);

      if (isUserOffline) {
        console.log("📧 User is offline:", targetUserId);

        const recipient = await User.findById(targetUserId);
        const sender = await User.findById(senderId);

        const alreadySent =
          chat.lastEmailSent && now - chat.lastEmailSent.getTime() < ONE_HOUR; // ✅ Moved here

        console.log("Recipient Email:", recipient?.emailId);
        console.log("Sender Name:", `${sender.firstName} ${sender.lastName}`);
        console.log("Last Email Sent:", chat.lastEmailSent);

        if (!alreadySent && recipient?.emailId) {
          await sendEmail(recipient.emailId, "New Message on CodeMate", {
            senderName: `${sender.firstName} ${sender.lastName}`,
            message: text || "Image",
          });
          chat.lastEmailSent = new Date();
        }
      }

      await chat.save();

      // Populate sender details for socket payload
      const updatedChat = await Chat.findById(chat._id).populate({
        path: "messages.senderId",
        select: "firstName lastName",
      });

      const lastMessage = updatedChat.messages.at(-1);
      const payload = {
        _id: lastMessage._id, // ✅ Message ID
        chatId: chat._id,
        firstName: lastMessage.senderId.firstName,
        lastName: lastMessage.senderId.lastName,
        text: lastMessage.text,
        createdAt: lastMessage.createdAt,
        senderId: lastMessage.senderId._id.toString(),
        image: !!lastMessage.image?.data,
      };

      // ✅ Emit via room (real-time to both participants)
      const io = req.app.get("io");
      if (io) {
        const roomId = getSecretRoomId(senderId.toString(), targetUserId);
        io.to(roomId).emit("messageReceived", payload);
      }

      return res.status(200).json(updatedChat);
    } catch (err) {
      console.error("❌ Error sending message:", err);
      if (!res.headersSent) {
        return res.status(500).json({ message: "Error sending message" });
      }
    }
  }
);

// ✅ Fetch chat messages
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
    console.error(e);
    res.status(500).json({ message: "Error fetching chat" });
  }
});

module.exports = chatRouter;
