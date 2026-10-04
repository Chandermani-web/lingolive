// src/Context/SocketContext.jsx
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import AppContext from "./UseContext";

const getSocketUrl = () => "https://lingolive.onrender.com";

const SocketContext = createContext();

const getMessagePreview = (message) => {
  if (!message) return "Start a conversation";

  if (message.text && message.text.trim()) {
    return message.text.trim();
  }

  if (message.image) return "📷 Photo";
  if (message.video) return "🎥 Video";
  if (message.audio) return "🎵 Audio";
  if (message.file) return "📎 File";

  return "Start a conversation";
};

export const SocketProvider = ({ children }) => {
  const { user, posts, setPosts, requests, setRequests } = useContext(AppContext);
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);

  const resetConversationUnread = useCallback((friendId) => {
    setConversations((prev) =>
      prev.map((conversation) =>
        String(conversation._id) === String(friendId)
          ? { ...conversation, unreadCount: 0 }
          : conversation
      )
    );
  }, []);

  const upsertConversation = useCallback(
    (message, options = {}) => {
      if (!user?._id || !message) return;

      const senderId = typeof message.sender === "object" ? message.sender._id : message.sender;
      const receiverId = typeof message.receiver === "object" ? message.receiver._id : message.receiver;
      const otherUserId = String(senderId) === String(user._id) ? String(receiverId) : String(senderId);
      const partner = String(senderId) === String(user._id)
        ? (typeof message.receiver === "object" ? message.receiver : null)
        : (typeof message.sender === "object" ? message.sender : null);

      setConversations((prev) => {
        const existing = prev.find((conversation) => String(conversation._id) === otherUserId);
        const isCurrentConversation = String(otherUserId) === String(activeConversationId);
        const nextUnreadCount =
          options.isOwnMessage || isCurrentConversation
            ? 0
            : (existing?.unreadCount || 0) + (options.incrementUnread ? 1 : 0);

        const nextConversation = {
          ...(existing || {}),
          _id: otherUserId,
          username: partner?.username || existing?.username || "",
          profilePic: partner?.profilePic || existing?.profilePic || "",
          latestMessage: message,
          latestMessageAt: message.createdAt || new Date().toISOString(),
          unreadCount: nextUnreadCount,
        };

        return [nextConversation, ...prev.filter((conversation) => String(conversation._id) !== otherUserId)]
          .sort((a, b) => new Date(b.latestMessageAt || 0) - new Date(a.latestMessageAt || 0));
      });
    },
    [activeConversationId, user?._id]
  );

  useEffect(() => {
    if (!user?._id) return;

    const socketUrl = getSocketUrl();
    console.log("🔌 Connecting to socket:", socketUrl);

    const newSocket = io(socketUrl, {
      query: { userId: user._id },
      withCredentials: true,
      transports: ["websocket", "polling"],
      timeout: 10000,
      forceNew: true,
    });

    setSocket(newSocket);

    newSocket.emit("addUser", user._id);
    newSocket.emit("joinRoom", user._id);

    newSocket.on("newPost", (newPost) => {
      setPosts((prev) => {
        if (prev.some((post) => String(post._id) === String(newPost._id))) {
          return prev;
        }
        return [newPost, ...prev];
      });
    });

    newSocket.on("updatePost", (updatedPost) => {
      setPosts((prev) =>
        prev.map((p) => (p._id === updatedPost._id ? updatedPost : p))
      );
    });

    newSocket.on("deletePost", ({ postId }) => {
      setPosts((prev) => prev.filter((p) => p._id !== postId));
    });

    newSocket.on("friendRequest", ({ newRequest }) => {
      setRequests((prev) => [newRequest, ...prev]);
    });

    newSocket.on("newNotification", (notification) => {
      setNotifications((prev) => [notification, ...prev]);
    });

    newSocket.on("onlineUsers", (onlineUsersList) => {
      setOnlineUsers(onlineUsersList);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [user?._id, setPosts, setRequests]);

  useEffect(() => {
    if (!socket) return;

    socket.on("newMessage", (message) => {
      setMessages((prev) => {
        if (prev.some((msg) => String(msg._id) === String(message._id))) {
          return prev;
        }
        return [...prev, message];
      });

      const senderId = typeof message.sender === "object" ? message.sender._id : message.sender;
      const receiverId = typeof message.receiver === "object" ? message.receiver._id : message.receiver;
      const isIncoming = String(senderId) !== String(user?._id);
      const otherUserId = isIncoming ? String(senderId) : String(receiverId);
      const isCurrentConversation = String(otherUserId) === String(activeConversationId);

      if (isIncoming && !isCurrentConversation) {
        const notification = {
          _id: `message-${message._id}`,
          type: "message",
          message: getMessagePreview(message),
          fromUser: typeof message.sender === "object" ? message.sender : null,
          conversationId: otherUserId,
          createdAt: message.createdAt,
        };

        setNotifications((prev) => [
          notification,
          ...prev.filter((item) => item._id !== notification._id),
        ]);
      }

      upsertConversation(message, {
        incrementUnread: isIncoming && !isCurrentConversation,
        isOwnMessage: !isIncoming,
      });
    });

    socket.on("deleteMessage", (messageId) => {
      setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
    });

    return () => {
      socket.off("newMessage");
      socket.off("deleteMessage");
    };
  }, [activeConversationId, socket, upsertConversation, user?._id]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        notifications,
        posts,
        requests,
        setNotifications,
        messages,
        onlineUsers,
        setMessages,
        conversations,
        setConversations,
        activeConversationId,
        setActiveConversationId,
        resetConversationUnread,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
