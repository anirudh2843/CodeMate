const socket = require("socket.io");
const crypto = require("crypto"); // FIXED typo: "croypto" -> "crypto"
const { Chat } = require("../models/chat");

// Generate a consistent room ID for a pair of users
const getSecretRoomId = (userId, targetUserId) => {
  return crypto
    .createHash("sha256")
    .update([userId, targetUserId].sort().join("_"))
    .digest("hex");
};

const initializeSocket = (server) => {
  const io = socket(server, {
    cors: {
      origin: "http://localhost:5173", // Update this to your frontend domain in prod
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    // Join a secret room based on the user pair
    socket.on("joinChat", ({ firstName, userId, targetUserId }) => {
      const roomId = getSecretRoomId(userId, targetUserId);
      console.log(`${firstName} joined room: ${roomId}`);
      socket.join(roomId);
    });

    // Handle incoming message
    socket.on(
      "sendMessage",
      async ({ firstName, lastName, userId, targetUserId, text }) => {
        const roomId = getSecretRoomId(userId, targetUserId);
        console.log(`${firstName} ${lastName} sent: ${text}`);

        try {
          // Check if a chat already exists
          let chat = await Chat.findOne({
            participants: { $all: [userId, targetUserId] },
          });

          // If not, create one
          if (!chat) {
            chat = new Chat({
              participants: [userId, targetUserId],
              messages: [],
            });
          }

          // Append the message
          chat.messages.push({
            senderId: userId,
            text,
            timestamp: new Date(),
          });

          // Save updated chat
          await chat.save();

          // Emit message to both users in room
          io.to(roomId).emit("messageReceived", { firstName, lastName, text });
        } catch (err) {
          console.error("Error saving message:", err);
        }
      }
    );

    socket.on("disconnect", () => {});
  });
};

module.exports = initializeSocket;
