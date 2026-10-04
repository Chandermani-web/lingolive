// src/components/Notification/PopupNotification.jsx
import { useEffect } from "react";
import { ThumbsUp, UserPlus, MessageCircle, Bell, X } from "lucide-react";

const PopupNotification = ({ data, onClose, onNavigate }) => {
  useEffect(() => {
    const timer = setTimeout(() => onClose(), 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const handleClick = () => {
    if (onNavigate) onNavigate();
  };

  return (
    <div
      className="fixed bottom-4 right-3 sm:bottom-6 sm:right-6 bg-[#0F141C]/95 backdrop-blur-md border border-[#18202B] p-4 rounded-2xl shadow-lg shadow-[#7C3AED]/10 w-[min(22rem,calc(100vw-1.25rem))] max-w-[calc(100vw-1.25rem)] animate-slideIn z-[9999] cursor-pointer overflow-hidden"
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        <img
          src={data.fromUser?.profilePic || "/avatar.svg"}
          className="h-10 w-10 rounded-full border-2 border-[#8B5CF6]/30 object-cover shadow-md"
          alt="user"
        />

        <div className="flex-1 space-y-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-[#A78BFA] font-medium truncate">
              @{data.fromUser?.username || "Unknown"}
            </h3>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onClose();
              }}
              className="p-1 rounded-full hover:bg-white/5 text-gray-400"
              aria-label="Close notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-gray-300 text-sm break-words">
            {data.message || "You have a new notification"}
          </p>

          {data.type === "like" && (
            <div className="mt-2 flex items-center gap-2 bg-blue-500/5 border border-blue-500/20 rounded-xl p-2">
              <ThumbsUp className="w-5 h-5 text-blue-400" />
              <p className="text-gray-400 text-xs">{data.message || "Liked your post"}</p>
              {data.post?.image && (
                <img
                  src={data.post.image}
                  className="h-12 w-12 object-cover rounded-lg border border-white/10"
                  alt="Post"
                />
              )}
              {data.post?.video && (
                <video
                  src={data.post.video}
                  className="h-12 w-12 object-cover rounded-lg border border-white/10"
                  alt="Post"
                />
              )}
            </div>
          )}

          {data.type === "friend_request" && (
            <div className="mt-2 flex items-center gap-2 bg-green-500/5 border border-green-500/20 rounded-xl p-2">
              <UserPlus className="w-5 h-5 text-green-400" />
              <p className="text-gray-400 text-xs">{data.message || "Sent you a friend request"}</p>
            </div>
          )}

          {data.type === "message" && (
            <div className="mt-2 flex items-center gap-2 bg-purple-500/5 border border-purple-500/20 rounded-xl p-2">
              <MessageCircle className="w-5 h-5 text-purple-400" />
              <p className="text-gray-400 text-xs">{data.message || "New message received"}</p>
            </div>
          )}

          {data.type === "comment" && (
            <div className="flex flex-col">
              {data.post?.image && (
                <div className="mt-3 flex items-center gap-3 bg-blue-500/5 border border-blue-500/20 rounded-xl p-2.5">
                  <img
                    src={data.post.image}
                    className="h-12 w-12 object-cover rounded-lg border border-white/10"
                    alt="Post"
                  />
                  <p className="text-gray-300 text-xs">{data.post.content || "New comment received"}</p>
                </div>
              )}

              <div className="mt-3 flex items-center gap-2 bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-2.5">
                <Bell className="w-5 h-5 text-yellow-400" />
                <p className="text-gray-400 text-xs">
                  {data.post?.comments?.[data.post?.comments?.length - 1]?.text || "New comment received"}
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
