import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, ThumbsUp, UserPlus, MessageCircle, Heart } from "lucide-react";
import AppContext from "../../Context/UseContext";
import { useSocket } from "../../Context/SocketContext";

const ShowNotification = () => {
  const navigate = useNavigate();
  const { user, notifications, loading, fetchNotifications, setNotifications, BASE_URL } =
    useContext(AppContext);
  const { notifications: socketNotifications } = useSocket();

  useEffect(() => {
    if (user) fetchNotifications();
  }, [user]);

  useEffect(() => {
    if (socketNotifications?.length > 0) {
      setNotifications((prev) => [
        ...socketNotifications.filter((sn) => !prev.some((pn) => pn._id === sn._id)),
        ...prev,
      ]);
    }
  }, [socketNotifications]);

  const handleClick = async (n) => {
    try {
      await fetch(`${BASE_URL}/api/notifications/read`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: n._id }),
        credentials: "include",
      });
      if (n.type === "friend_request") navigate("/connections");
      else if (n.type === "post") navigate("/posts");
      else if (n.type === "message" && n.fromUser) navigate(`/message`);
    } catch (err) {
      console.error(err);
    }
  };

  if (!user || loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#18202B] border-t-[#7C3AED] rounded-full animate-spin" />
      </div>
    );
  }

  const unread = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="min-h-screen bg-app relative">
      <div className="bg-app-fixed" />

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 animate-fadeUp">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#3B82F6] flex items-center justify-center">
            <Bell className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="heading-lg text-white">Notifications</h1>
            <p className="text-xs text-muted">
              {unread > 0 ? `${unread} unread` : "You're all caught up"}
            </p>
          </div>
        </div>

        {/* Empty */}
        {notifications.length === 0 && (
          <div className="card-static p-12 text-center animate-fadeUp">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-[#0F141C] border border-[#18202B] flex items-center justify-center">
              <Bell className="w-6 h-6 text-[#8B5CF6]" />
            </div>
            <h3 className="heading-sm text-white mb-1">No notifications</h3>
            <p className="text-sm text-muted">
              When someone interacts with you, it will show up here
            </p>
          </div>
        )}

        {/* List */}
        <div className="space-y-2">
          {notifications.map((n, i) => (
            <button
              key={n._id || i}
              onClick={() => handleClick(n)}
              className={`w-full card p-4 text-left flex items-start gap-3 animate-fadeUp relative ${
                !n.isRead ? "border-l-2 border-l-[#7C3AED]" : ""
              }`}
              style={{ animationDelay: `${i * 0.03}s` }}
            >
              <div className="relative flex-shrink-0">
                <img
                  src={n.fromUser?.profilePic || "/avatar.svg"}
                  alt=""
                  className="w-11 h-11 rounded-full object-cover"
                />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center border-2 border-[#0A0E14]"
                  style={{
                    background:
                      n.type === "like" ? "#3B82F6" :
                      n.type === "friend_request" ? "#10B981" :
                      n.type === "message" ? "#8B5CF6" :
                      n.type === "comment" ? "#F59E0B" : "#71717A",
                  }}
                >
                  {n.type === "like" && <ThumbsUp className="w-3 h-3 text-white" />}
                  {n.type === "friend_request" && <UserPlus className="w-3 h-3 text-white" />}
                  {n.type === "message" && <MessageCircle className="w-3 h-3 text-white" />}
                  {n.type === "comment" && <Heart className="w-3 h-3 text-white" />}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-sm font-semibold text-white truncate">
                    @{n.fromUser?.username || "Unknown"}
                  </span>
                  <span className="text-[10px] text-muted flex-shrink-0">
                    {new Date(n.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="text-sm text-secondary">{n.message || "New notification"}</p>
              </div>

              {!n.isRead && (
                <span className="w-2 h-2 rounded-full bg-[#7C3AED] mt-1.5 flex-shrink-0" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShowNotification;