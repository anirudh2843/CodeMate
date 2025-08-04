const socket = require("socket.io");
const crypto = require("crypto");
const onlineUsers = new Set();
const { Chat } = require("../models/chat");
const User = require("../models/user"); // ✅ FIX

// Generate consistent room ID
const getSecretRoomId = (userId, targetUserId) => {
  return crypto
    .createHash("sha256")
    .update([userId, targetUserId].sort().join("_"))
    .digest("hex");
};

const initializeSocket = (server) => {
  const io = socket(server, {
    cors: {
      origin: [
        "http://localhost:5173", // Local dev
        "https://codemate-web.onrender.com", // Production
      ],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("✅ New client connected:", socket.id);

    // Join chat room
    socket.on("joinChat", ({ firstName, userId, targetUserId }) => {
      const roomId = getSecretRoomId(userId, targetUserId);
      socket.userId = userId;
      socket.roomId = roomId;

      socket.join(roomId);
      onlineUsers.add(userId);

      console.log(`👤 ${firstName} (${userId}) joined room: ${roomId}`);
      io.emit("onlineUsers", Array.from(onlineUsers));
    });

    // Typing indicator
    socket.on("typing", ({ userId, targetUserId, isTyping }) => {
      const roomId = getSecretRoomId(userId, targetUserId);
      socket.to(roomId).emit("userTyping", { userId, isTyping });
    });

    // ✅ Disconnect handler (FIXED)
    socket.on("disconnect", async () => {
      console.log(`❌ User ${socket.userId} disconnected`);
      if (socket.userId) {
        onlineUsers.delete(socket.userId);
        io.emit("onlineUsers", Array.from(onlineUsers));
        try {
          await User.findByIdAndUpdate(socket.userId, { lastActive: new Date() });
        } catch (err) {
          console.error("Error updating lastActive:", err.message);
        }
      }
    });
  });

  return io;
};

module.exports = { initializeSocket, onlineUsers, getSecretRoomId };
