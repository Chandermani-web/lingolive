// src/components/Notification/PopupNotification.jsx
import { useEffect } from "react";
import { ThumbsUp, UserPlus, MessageCircle, Bell } from "lucide-react";

const PopupNotification = ({ data, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => onClose(), 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-6 right-6 bg-[var(--color-highlight)]/10 backdrop-blur-md border border-[var(--color-secondary)]/30 p-4 rounded-2xl shadow-lg shadow-blue-900/20 w-80 animate-slideIn z-[9999]">
      <div className="flex items-start gap-3">
        <img
          src={data.fromUser?.profilePic || "/avatar.svg"}
          className="h-10 w-10 rounded-full border-2 border-[var(--color-highlight)]/30 object-cover shadow-md"
          alt="user"
        />

        <div className="flex-1 space-y-1">
          <h3 className="text-[var(--color-highlight)] font-medium">
            @{data.fromUser?.username || "Unknown"}
          </h3>
          <p className="text-[var(--color-muted)] text-sm">
            {data.message || "You have a new notification"}
          </p>

          {/* Like Notification */}
          {data.type === "like" && (
            <div className="mt-2 flex items-center gap-2 bg-[var(--color-secondary)]/5 border border-[var(--color-highlight)]/20 rounded-xl p-2">
              <ThumbsUp className="w-5 h-5 text-[var(--color-highlight)] absolute top-0 right-0" />
              <p className="text-[var(--color-muted)] text-xs">
                {data.message || "Liked your post"}
              </p>
              
              {data.post?.image && (
                <img
                  src={data.post.image}
                  className="h-12 w-12 object-cover rounded-lg border border-[var(--color-secondary)]/30"
                  alt="Post"
                />
              )}
              {data.post?.video && (
                  <video
                    src={data.post.video}
                    className="h-12 w-12 object-cover rounded-lg border border-[var(--color-secondary)]/30"
                    alt="Post"
                  />
                )}
            </div>
          )}

          {/* Friend Request */}
          {data.type === "friend_request" && (
            <div className="mt-2 flex items-center gap-2 bg-green-500/5 border border-[var(--color-accent)]/20 rounded-xl p-2">
              <UserPlus className="w-5 h-5 text-[var(--color-accent)]" />
              <p className="text-[var(--color-muted)] text-xs">
                {data.message || "Sent you a friend request"}
              </p>
            </div>
          )}

          {/* Message */}
          {data.type === "message" && (
            <div className="mt-2 flex items-center gap-2 bg-purple-500/5 border border-purple-500/20 rounded-xl p-2">
              <MessageCircle className="w-5 h-5 text-[var(--color-highlight)]" />
              <p className="text-[var(--color-muted)] text-xs">
                {data.message || "New message received"}
              </p>
            </div>
          )}

          {/* Comment Notification */}
          {data.type === "comment" && (
            <div className="flex flex-col">
              {data.post?.image && (
                <div className="mt-3 flex items-center gap-3 bg-[var(--color-secondary)]/5 border border-[var(--color-highlight)]/20 rounded-xl p-2.5">
                  <img
                    src={data.post.image}
                    className="h-12 w-12 object-cover rounded-lg border border-[var(--color-secondary)]/30"
                    alt="Post"
                    />
                    <p>{data.post.content || "New comment received"}</p>
                </div>
              )}

              <div className="mt-3 flex items-center gap-2 bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-2.5">
                <MessageCircle className="w-5 h-5 text-[var(--color-highlight)]" />
                <p className="text-[var(--color-muted)] text-xs">
                  {data.post?.comments?.[data.post?.comments?.length - 1]
                    ?.text || "New comment received"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PopupNotification;
