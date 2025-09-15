import Chat from "../models/chat.model.js";
import Message from "../models/message.model.js";
import Listing from "../models/listing.model.js";

// Create or get existing chat for a listing
export const createOrGetChat = async (req, res) => {
  try {
    const { listingId } = req.body;
    const buyerId = req.user.id;

    // Check if listing exists
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    const sellerId = listing.seller;

    // Don't allow seller to chat with themselves
    if (sellerId.toString() === buyerId) {
      return res.status(400).json({ message: "Cannot chat with yourself" });
    }

    // Find existing chat or create new one
    let chat = await Chat.findOne({
      listing: listingId,
      seller: sellerId,
      buyer: buyerId,
    }).populate(
      "seller buyer listing",
      "name email product_category brand model"
    );

    if (!chat) {
      chat = new Chat({
        listing: listingId,
        seller: sellerId,
        buyer: buyerId,
      });
      await chat.save();
      await chat.populate(
        "seller buyer listing",
        "name email product_category brand model"
      );
    }

    res.status(200).json({
      message: "Chat created successfully",
      chat,
    });
  } catch (error) {
    console.error("Create chat error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get user's chats
export const getUserChats = async (req, res) => {
  try {
    const userId = req.user.id;

    const chats = await Chat.find({
      $or: [{ seller: userId }, { buyer: userId }],
      status: "active",
    })
      .populate(
        "seller buyer listing lastMessage",
        "name email product_category brand model content createdAt"
      )
      .sort({ lastActivity: -1 });

    res.status(200).json({
      message: "Chats retrieved successfully",
      chats,
    });
  } catch (error) {
    console.error("Get chats error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get chat messages
export const getChatMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;

    // Verify user is part of this chat
    const chat = await Chat.findOne({
      _id: chatId,
      $or: [{ seller: userId }, { buyer: userId }],
    });

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    const messages = await Message.find({ chat: chatId })
      .populate("sender", "name email")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Mark messages as read
    await Message.updateMany(
      {
        chat: chatId,
        sender: { $ne: userId },
        "readBy.user": { $ne: userId },
      },
      {
        $push: {
          readBy: {
            user: userId,
            readAt: new Date(),
          },
        },
      }
    );

    res.status(200).json({
      message: "Messages retrieved successfully",
      messages: messages.reverse(),
      pagination: {
        page,
        limit,
        hasMore: messages.length === limit,
      },
    });
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
