import { useSocket } from "../../Context/SocketContext";
import { useContext, useEffect } from "react";
import AppContext from "../../Context/UseContext";

import { Loader, ThumbsUp, UserPlus, MessageCircle, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ShowNotification = () => {
  const navigate = useNavigate();
  const { user, notifications, loading, fetchNotifications, setNotifications } =
    useContext(AppContext);
  const { notifications: socketNotifications } = useSocket();

  useEffect(() => {
    if (user) fetchNotifications();
  }, [user]);

  // 👇 New useEffect to merge socket notifications
  useEffect(() => {
    if (socketNotifications?.length > 0) {
      setNotifications((prev) => [
        ...socketNotifications.filter(
          (sn) => !prev.some((pn) => pn._id === sn._id)
        ),
        ...prev,
      ]);
    }
  }, [socketNotifications]);

  const handleNotificationClick = async (n) => {
    try {
      const res = await fetch(
        "https://lingolive.onrender.com/api/notifications/read",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notificationId: n._id }),
          credentials: "include",
        }
      );
      if (res.ok) {
        if (n.type === "friend_request" && n.fromUser) {
          navigate(`/connections`);
        } else if (n.type === "post") {
          navigate(`/posts`);
        } else if (n.type === "message" && n.fromUser) {
          navigate(`/chat/${n.fromUser._id}`);
        }
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  if (!user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-primary)]">
        <div className="text-center space-y-4">
          <Loader className="w-10 h-10 text-[var(--color-accent)] animate-spin mx-auto" />
          <p className="text-[var(--color-muted)] font-light">Loading notifications...</p>
        </div>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-primary)]">
        <div className="text-center space-y-6">
          <div className="w-28 h-28 bg-gradient-to-tr from-[var(--color-secondary)]/30 to-[var(--color-highlight)]/20 border border-[var(--color-highlight)]/30 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-[var(--color-secondary)]/40">
            <Bell className="w-14 h-14 text-[var(--color-highlight)] opacity-70" />
          </div>
          <h2 className="text-3xl font-semibold bg-gradient-to-r from-[var(--color-highlight)] via-[var(--color-accent)] to-[var(--color-secondary)] bg-clip-text text-transparent">
            All Caught Up!
          </h2>
          <p className="text-[var(--color-muted)] max-w-sm mx-auto">
            You’re all set — no new notifications right now. We’ll notify you
            when something exciting happens!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-primary)] text-[var(--color-text)] px-4 py-10">
      <div className="max-w-3xl mx-auto relative">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 bg-[var(--color-highlight)]/5 backdrop-blur-md border border-[var(--color-secondary)]/30 px-6 py-3 rounded-2xl shadow-lg shadow-[var(--color-secondary)]/20">
            <Bell className="w-6 h-6 text-[var(--color-accent)] animate-bounce" />
            <h1 className="text-2xl font-semibold bg-gradient-to-r from-[var(--color-highlight)] via-[var(--color-accent)] to-[var(--color-secondary)] bg-clip-text text-transparent">
              Notifications
            </h1>
            <span className="bg-[var(--color-secondary)] text-[var(--color-text)] text-sm px-2 py-1 rounded-full">
              {notifications.filter((u) => u.isRead === false).length}
            </span>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-5">
          {notifications.map((n, index) => (
            <div
              key={n._id || index}
              onClick={() => handleNotificationClick(n)}
              className={`group flex items-start gap-4 p-5 rounded-2xl border border-[var(--color-secondary)]/30 bg-[var(--color-highlight)]/5 backdrop-blur-md transition-all duration-300 hover:bg-gradient-to-br hover:from-[var(--color-secondary)]/20 hover:to-[var(--color-highlight)]/20 hover:border-[var(--color-accent)]/40 hover:scale-[1.02] cursor-pointer relative`}
            >
              {!n.isRead && (
                <span className="absolute -left-1 -top-1 w-5 h-5 bg-[var(--color-accent)] rounded-full animate-pulse"></span>
              )}
              <img
                src={n.fromUser?.profilePic || "/avatar.svg"}
                className="h-12 w-12 rounded-full border-2 border-[var(--color-highlight)]/40 object-cover shadow-md"
                alt="user"
              />

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-[var(--color-highlight)] font-medium">
                    @{n.fromUser?.username || "Unknown User"}
                  </h3>
                  <span className="text-xs text-[var(--color-muted)]">
                    {new Date(n.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="text-[var(--color-muted)] text-sm leading-snug">
                  {n.message || "No message available"}
                </p>

                {/* Like Notification */}
                {n.type === "like" && (
                  <div className="mt-3 flex items-center gap-3 bg-[var(--color-secondary)]/20 border border-[var(--color-highlight)]/30 rounded-xl p-2.5 relative">
                    <ThumbsUp className="w-5 h-5 text-[var(--color-highlight)] absolute top-0 right-0" />
                    <div className="mt-3 flex items-center gap-3 bg-[var(--color-secondary)]/20 border border-[var(--color-highlight)]/30 rounded-xl p-2.5">
                      {n.post?.image && (
                        <img
                          src={n.post.image}
                          className="h-1/2 w-1/2 object-cover rounded-lg border border-[var(--color-secondary)]/30"
                          alt="Post"
                        />
                      )}
                      {n.post?.video && (
                        <video
                          src={n.post.video}
                          className="w-1/2 h-1/2 object-cover rounded-lg border border-[var(--color-secondary)]/30"
                          alt="Post"
                          controls
                        />
                      )}
                      <p className="text-[var(--color-muted)] text-xs line-clamp-2">
                        {n.post?.content || "Post liked"}
                      </p>
                    </div>
                  </div>
                )}

                {/* Post Notification */}
                {n.type === "post" && (
                  <div className="mt-3 flex items-center gap-3 bg-[var(--color-secondary)]/20 border border-[var(--color-highlight)]/30 rounded-xl p-2.5">
                    {n.post?.image && (
                      <img
                        src={n.post.image}
                        className="h-12 w-12 object-cover rounded-lg border border-[var(--color-secondary)]/30"
                        alt="Post"
                      />
                    )}
                    <p className="text-[var(--color-muted)] text-xs line-clamp-2">
                      {n.post?.content || "Post liked"}
                    </p>
                  </div>
                )}

                {/* Friend Request */}
                {n.type === "friend_request" && (
                  <div className="mt-3 flex items-center gap-2 bg-[var(--color-secondary)]/20 border border-[var(--color-accent)]/40 rounded-xl p-2.5">
                    <UserPlus className="w-5 h-5 text-[var(--color-accent)]" />
                    <p className="text-[var(--color-muted)] text-xs">
                      {n.message || "Sent you a friend request"}
                    </p>
                  </div>
                )}

                {/* Message */}
                {n.type === "message" && (
                  <div className="mt-3 flex items-center gap-2 bg-[var(--color-secondary)]/20 border border-[var(--color-highlight)]/30 rounded-xl p-2.5">
                    <MessageCircle className="w-5 h-5 text-[var(--color-highlight)]" />
                    <p className="text-[var(--color-muted)] text-xs">
                      {n.message || "New message received"}
                    </p>
                  </div>
                )}

                {/* Comment Notification */}
                {n.type === "comment" && (
                  <div className="flex flex-col">
                    <div className="mt-3 flex items-center gap-3 bg-[var(--color-secondary)]/20 border border-[var(--color-highlight)]/30 rounded-xl p-2.5">
                      <MessageCircle className="w-5 h-5 text-[var(--color-highlight)]" />
                      {n.post?.image && (
                        <img
                          src={n.post.image}
                          className="h-1/2 w-1/2 object-cover rounded-lg border border-[var(--color-secondary)]/30"
                          alt="Post"
                        />
                      )}
                      {n.post?.video && (
                        <video
                          src={n.post.video}
                          className="w-1/2 h-1/2 object-cover rounded-lg border border-[var(--color-secondary)]/30"
                          alt="Post"
                          controls
                        />
                      )}
                      <p className="text-[var(--color-muted)] text-xs line-clamp-2">
                        {n.post?.content || "Post liked"}
                      </p>
                    </div>

                    <div className="mt-3 flex items-center gap-2 bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30 rounded-xl p-2.5">
                      <MessageCircle className="w-5 h-5 text-[var(--color-accent)]" />
                      <p className="text-[var(--color-muted)] text-xs">
                        {Array.isArray(n.post?.comments) &&
                        n.post.comments.length > 0
                          ? n.post.comments[n.post.comments.length - 1]?.text
                          : "New comment received"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShowNotification;
