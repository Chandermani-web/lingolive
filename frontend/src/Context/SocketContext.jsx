// src/Context/SocketContext.jsx
import { createContext, useContext, useEffect, useState } from "react"
import { io } from "socket.io-client";
import AppContext from "./UseContext"; // import your main context

// Utility function to get Socket URL
const getSocketUrl = () => "https://lingolive.onrender.com";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user, posts, setPosts, requests, setRequests } = useContext(AppContext);
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    if (!user?._id) return;

    const socketUrl = getSocketUrl();
    console.log("🔌 Connecting to socket:", socketUrl);

    const newSocket = io(socketUrl, {
      query: { userId: user._id },
      withCredentials: true,
      transports: ["websocket", "polling"], // fallback for reliability
      timeout: 10000,
      forceNew: true,
    });

    setSocket(newSocket);

    newSocket.emit("addUser", user._id);
    newSocket.emit("joinRoom", user._id);

    // Post events
    newSocket.on("newPost", (newPost) => {
      console.log("🆕 New post received via socket:", newPost);
      setPosts((prev) => [newPost, ...prev]);
    });

    newSocket.on("updatePost", (updatedPost) => {
      console.log("📝 Post updated via socket:", updatedPost);
      setPosts((prev) =>
        prev.map((p) => (p._id === updatedPost._id ? updatedPost : p))
      );
    });

    newSocket.on("deletePost", ({ postId }) => {
      console.log("🗑️ Post deleted via socket:", postId);
      setPosts((prev) => prev.filter((p) => p._id !== postId));
    });

    // Friend request events
    newSocket.on("friendRequest", ({ newRequest }) => {
      console.log("🆕 New friend request received:", newRequest);
      setRequests((prev) => [newRequest, ...prev]);
    });

    // Notification events
    newSocket.on("newNotification", (notification) => {
      console.log("🔔 New notification received:", notification);
      setNotifications((prev) => [notification, ...prev]);
    });

    // Online users events
    newSocket.on("onlineUsers", (onlineUsersList) => {
      console.log("👥 Online Users List Updated:", onlineUsersList);
      setOnlineUsers(onlineUsersList);
    });

    return () => {
      console.log("🔌 Cleaning up socket connection");
      newSocket.disconnect();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id]); // Only reconnect when user changes

  // Real-time message handling
  useEffect(() => {
    if (!socket) return;

    socket.on("newMessage", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on("deleteMessage", (messageId) => {
      setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
    });

    return () => {
      socket.off("newMessage");
      socket.off("deleteMessage");
    };
  }, [socket]);

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
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
