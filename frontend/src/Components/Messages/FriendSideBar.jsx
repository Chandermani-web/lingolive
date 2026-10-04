import { useContext, useEffect, useMemo, useState } from "react";
import { Search, MessageCircle } from "lucide-react";
import { useSocket } from "../../Context/SocketContext";
import AppContext from "../../Context/UseContext";
import { getConversationPreview, formatConversationTime } from "../../utils/messagePreview";

const FriendsSidebar = ({ onSelectFriend, selectedUser }) => {
  const { onlineUsers, conversations, setConversations } = useSocket();
  const { BASE_URL } = useContext(AppContext);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/messages/conversations`, {
          credentials: "include",
        });
        const data = await res.json();
        setConversations(data.conversations || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchConversations();
  }, [BASE_URL, setConversations]);

  const filtered = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) return conversations;

    return conversations.filter(
      (conversation) =>
        conversation.username?.toLowerCase().includes(normalizedSearch) ||
        conversation.email?.toLowerCase().includes(normalizedSearch)
    );
  }, [conversations, search]);

  return (
    <div className="w-80 h-full bg-[#06080C] border-r border-[#18202B] flex flex-col">
      <div className="p-5 border-b border-[#18202B]">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#3B82F6] flex items-center justify-center">
            <MessageCircle className="w-4 h-4 text-white" />
          </div>
          <h2 className="heading-md text-white">Messages</h2>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717A] pointer-events-none z-10" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-search py-2.5 text-sm"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
        {filtered.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-[#0F141C] border border-[#18202B] flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-muted" />
            </div>
            <p className="text-sm text-muted">
              {search ? "No matches" : "No conversations yet"}
            </p>
          </div>
        ) : (
          <ul className="space-y-0.5">
            {filtered.map((friend) => {
              const online = onlineUsers.includes(friend._id);
              const active = selectedUser?._id === friend._id;
              const preview = getConversationPreview(friend.latestMessage);
              const timeLabel = formatConversationTime(friend.latestMessageAt);

              return (
                <li
                  key={friend._id}
                  onClick={() => onSelectFriend(friend)}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                    active
                      ? "bg-[#15152A] border border-[#8B5CF6]/25"
                      : "border border-transparent hover:bg-white/[0.03]"
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <img
                      src={friend.profilePic || "/avatar.svg"}
                      alt=""
                      className="w-11 h-11 rounded-full object-cover"
                    />
                    <span
                      className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 ${
                        active ? "border-[#15152A]" : "border-[#06080C]"
                      }`}
                      style={{ background: online ? "#10B981" : "#52525B" }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-semibold text-white truncate">
                        @{friend.username}
                      </h3>
                      {timeLabel && (
                        <span className="text-[10px] text-muted shrink-0">{timeLabel}</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-1">
                      <p className={`text-xs truncate ${online ? "text-[#10B981]" : "text-muted"}`}>
                        {preview}
                      </p>
                      {Number(friend.unreadCount || 0) > 0 && (
                        <span className="flex-shrink-0 min-w-[1.2rem] h-5 px-1.5 rounded-full bg-[#8B5CF6] text-[10px] font-bold text-white flex items-center justify-center">
                          {friend.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default FriendsSidebar;