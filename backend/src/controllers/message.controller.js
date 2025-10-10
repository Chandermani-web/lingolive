import Message from "../models/Message.model.js";
import { io } from "../index.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const sendMessage = asyncHandler(async (req, res) => {
  const senderId = req.user._id;
  const { receiverId, text } = req.body;
  const files = req.files || {};

  // Validate: at least one field must exist
  if (
    (!text || !text.trim()) &&
    !files.image &&
    !files.video &&
    !files.audio &&
    !files.file
  ) {
    return res.status(400).json({ message: "Message cannot be empty" });
  }

  // Build message object
  const messageData = {
    sender: senderId,
    receiver: receiverId,
  };

  if (text && text.trim()) messageData.text = text.trim();

  if (files.image) messageData.image = files.image[0].path;
  if (files.video) messageData.video = files.video[0].path;
  if (files.audio) messageData.audio = files.audio[0].path;
  if (files.file) messageData.file = files.file[0].path;

  // Save message
  const message = await Message.create(messageData);

  // Populate sender info before sending
  const populatedMessage = await message.populate("sender", "username profilePic");

  // Emit to both sender and receiver sockets
  io.to(receiverId.toString()).emit("newMessage", populatedMessage);
  io.to(senderId.toString()).emit("newMessage", populatedMessage);

  res.status(201).json({ message: "Message sent", data: populatedMessage });
});

export const deleteMessage = asyncHandler(async (req, res) => {
    const { messageId } = req.params;
    const currentUserId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) {
        return res.status(404).json({ message: "Message not found" });
    }

    if (message.sender.toString() !== currentUserId.toString()) {
        return res.status(403).json({ message: "You can only delete your own messages" });
    }

    io.to(message.receiver.toString()).emit("deleteMessage", messageId);
    io.to(currentUserId.toString()).emit("deleteMessage", messageId);

    await message.remove();
    res.status(200).json({ message: "Message deleted" });
});

export const getMessages = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    const messages = await Message.find({
        $or: [
            { sender: currentUserId, receiver: userId },
            { sender: userId, receiver: currentUserId },
        ],
    })
        .populate('sender', 'username profilePic')
        .populate('receiver', 'username profilePic')
        .sort({ createdAt: 1 });

    res.status(200).json(messages);
});
