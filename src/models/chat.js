const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
    },
    path: String,
    filename: String,
  },
  { timestamps: true }
);

const chatSchema = new mongoose.Schema({
  participants: [
    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  ],
  senderId: {},
  receiverId: {},
  messages: [messageSchema],
  lastEmailSent: { type: Date },
});
const Chat = mongoose.model("Chat", chatSchema);

module.exports = { Chat };
