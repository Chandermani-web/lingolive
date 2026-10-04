import mongoose from 'mongoose';
import Message from '../models/Message.model.js';
import Friend from '../models/friend.model.js';
import User from '../models/auth.model.js';
import { io } from '../index.js';
import { asyncHandler } from '../utils/asyncHandler.js';

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
        return res.status(400).json({ message: 'Message cannot be empty' });
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
    const populatedMessage = await message.populate(
        'sender',
        'username profilePic'
    );

    // Emit to both sender and receiver sockets
    io.to(receiverId.toString()).emit('newMessage', populatedMessage);
    io.to(senderId.toString()).emit('newMessage', populatedMessage);

    res.status(201).json({ message: 'Message sent', data: populatedMessage });
});

export const deleteMessage = asyncHandler(async (req, res) => {
    const { messageId } = req.params;
    const currentUserId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) {
        return res.status(404).json({ message: 'Message not found' });
    }

    if (message.sender.toString() !== currentUserId.toString()) {
        return res
            .status(403)
            .json({ message: 'You can only delete your own messages' });
    }

    io.to(message.receiver.toString()).emit('deleteMessage', messageId);
    io.to(currentUserId.toString()).emit('deleteMessage', messageId);

    // ✅ FIX HERE
    await message.deleteOne();
    res.status(200).json({ message: 'Message deleted' });
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

export const getConversations = asyncHandler(async (req, res) => {
    const currentUserId = req.user._id;

    const acceptedFriendships = await Friend.find({
        status: 'accepted',
        $or: [{ sender: currentUserId }, { receiver: currentUserId }],
    }).lean();

    const friendIds = [...new Set(
        acceptedFriendships.map((friend) => {
            const otherUserId = friend.sender.toString() === currentUserId.toString()
                ? friend.receiver
                : friend.sender;
            return otherUserId.toString();
        })
    )];

    if (!friendIds.length) {
        return res.status(200).json({ conversations: [] });
    }

    const friendObjectIds = friendIds.map((id) => new mongoose.Types.ObjectId(id));

    const latestMessages = await Message.aggregate([
        {
            $match: {
                $or: [
                    { sender: currentUserId, receiver: { $in: friendObjectIds } },
                    { sender: { $in: friendObjectIds }, receiver: currentUserId },
                ],
            },
        },
        {
            $project: {
                otherUserId: {
                    $cond: [{ $eq: ['$sender', currentUserId] }, '$receiver', '$sender'],
                },
                _id: 1,
                sender: 1,
                receiver: 1,
                text: 1,
                image: 1,
                video: 1,
                audio: 1,
                file: 1,
                createdAt: 1,
            },
        },
        { $sort: { createdAt: -1 } },
        {
            $group: {
                _id: '$otherUserId',
                latestMessage: { $first: {
                    _id: '$_id',
                    sender: '$sender',
                    receiver: '$receiver',
                    text: '$text',
                    image: '$image',
                    video: '$video',
                    audio: '$audio',
                    file: '$file',
                    createdAt: '$createdAt',
                } },
                latestMessageAt: { $first: '$createdAt' },
            },
        },
    ]);

    const latestByUserId = new Map(
        latestMessages.map((item) => [item._id.toString(), item])
    );

    const users = await User.find({ _id: { $in: friendObjectIds } })
        .select('username profilePic email')
        .lean();

    const userById = new Map(users.map((user) => [user._id.toString(), user]));

    const conversations = friendIds
        .map((friendId) => {
            const user = userById.get(friendId);
            const latest = latestByUserId.get(friendId);

            return {
                _id: friendId,
                username: user?.username || '',
                profilePic: user?.profilePic || '',
                email: user?.email || '',
                latestMessage: latest ? latest.latestMessage : null,
                latestMessageAt: latest ? latest.latestMessageAt : null,
                unreadCount: 0,
            };
        })
        .sort((a, b) => {
            const timeA = a.latestMessageAt ? new Date(a.latestMessageAt).getTime() : 0;
            const timeB = b.latestMessageAt ? new Date(b.latestMessageAt).getTime() : 0;
            return timeB - timeA;
        });

    res.status(200).json({ conversations });
});
