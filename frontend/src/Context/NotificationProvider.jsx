import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PopupNotification from "../Components/Notifications/PopupNotification.jsx";
import { useSocket } from "./SocketContext";

const NotificationPopupManager = () => {
  const { notifications: socketNotifications, activeConversationId, setActiveConversationId } = useSocket();
  const location = useLocation();
  const navigate = useNavigate();
  const [queue, setQueue] = useState([]);
  const [current, setCurrent] = useState(null);
  const [shownIds, setShownIds] = useState(new Set());

  const isMessagingRoute = location.pathname === "/message" || location.pathname === "/messages";

  useEffect(() => {
    const newNotifications = socketNotifications.filter((n) => {
      if (!n || !n._id || !["like", "comment", "message", "friend_request", "post"].includes(n.type)) {
        return false;
      }

      if (n.type === "message") {
        const senderId = n.fromUser?._id || n.conversationId;
        const isSameConversation = isMessagingRoute && String(activeConversationId) === String(senderId);
        return !isSameConversation && !shownIds.has(n._id);
      }

      return !shownIds.has(n._id);
    });

    if (newNotifications.length > 0) {
      setQueue((prev) => [...prev, ...newNotifications]);
      setShownIds((prev) => new Set([...prev, ...newNotifications.map((n) => n._id)]));
    }
  }, [activeConversationId, isMessagingRoute, shownIds, socketNotifications]);

  useEffect(() => {
    if (!current && queue.length > 0) {
      setCurrent(queue[0]);
      setQueue((prev) => prev.slice(1));
    }
  }, [queue, current]);

  useEffect(() => {
    if (current) {
      const timer = setTimeout(() => setCurrent(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [current]);

  const handleNavigate = (notification) => {
    if (notification?.type === "message" && notification.conversationId) {
      setActiveConversationId(notification.conversationId);
      navigate("/messages", { state: { conversationId: notification.conversationId } });
      return;
    }

    if (notification?.type === "friend_request") {
      navigate("/connections");
      return;
    }

    if (notification?.type === "post" || notification?.type === "like" || notification?.type === "comment") {
      navigate("/");
    }
  };

  if (!current) return null;

  return (
    <PopupNotification
      data={current}
      onClose={() => setCurrent(null)}
      onNavigate={() => {
        handleNavigate(current);
        setCurrent(null);
      }}
    />
  );
};

export default NotificationPopupManager;
