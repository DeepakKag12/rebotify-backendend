import jwt from "jsonwebtoken";
import Chat from "../models/chat.model.js";
import Message from "../models/message.model.js";

// Socket authentication middleware
export const authenticateSocket = (socket, next) => {
  const token = socket.handshake.auth.token;

  if (!token) {
    return next(new Error("Authentication error"));
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return next(new Error("Authentication error"));
    socket.userId = user.id;
    next();
  });
};

// Main socket handlers
export const handleConnection = (io) => {
  return async (socket) => {
    console.log(`User ${socket.userId} connected`);

    // Join user to their personal room for notifications
    socket.join(`user_${socket.userId}`);

    // Handle joining a chat room
    socket.on("join_chat", async (chatId) => {
      try {
        // Verify user is part of this chat
        const chat = await Chat.findOne({
          _id: chatId,
          $or: [{ seller: socket.userId }, { buyer: socket.userId }],
        });

        if (chat) {
          socket.join(`chat_${chatId}`);
          socket.emit("joined_chat", { chatId, success: true });
        } else {
          socket.emit("error", { message: "Chat not found" });
        }
      } catch (error) {
        socket.emit("error", { message: "Failed to join chat" });
      }
    });

    // Handle sending messages
    socket.on("send_message", async (data) => {
      try {
        const { chatId, content } = data;

        // Verify user is part of this chat
        const chat = await Chat.findOne({
          _id: chatId,
          $or: [{ seller: socket.userId }, { buyer: socket.userId }],
        });

        if (!chat) {
          socket.emit("error", { message: "Chat not found" });
          return;
        }

        // Create new message
        const message = new Message({
          chat: chatId,
          sender: socket.userId,
          content: content.trim(),
          readBy: [{ user: socket.userId }],
        });

        await message.save();
        await message.populate("sender", "name email");

        // Update chat's last activity and message
        chat.lastMessage = message._id;
        chat.lastActivity = new Date();
        await chat.save();

        // Send message to all users in the chat room
        io.to(`chat_${chatId}`).emit("new_message", {
          _id: message._id,
          chat: chatId,
          sender: message.sender,
          content: message.content,
          createdAt: message.createdAt,
          readBy: message.readBy,
        });
      } catch (error) {
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // Handle typing indicators
    socket.on("typing", (data) => {
      const { chatId, isTyping } = data;
      socket.to(`chat_${chatId}`).emit("user_typing", {
        userId: socket.userId,
        isTyping,
      });
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      console.log(`User ${socket.userId} disconnected`);
    });
  };
};
