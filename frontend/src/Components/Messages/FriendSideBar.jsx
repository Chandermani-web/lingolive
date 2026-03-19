import { useEffect, useState } from "react";
import { UserCircle, MessageSquare, Search } from "lucide-react";
import { useSocket } from "../../Context/SocketContext";

const FriendsSidebar = ({ onSelectFriend, selectedUser }) => {
  const { onlineUsers } = useSocket();
  const [friends, setFriends] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const res = await fetch(
          "https://lingolive.onrender.com/api/friends/getfriends",
          {
            credentials: "include",
          }
        );
        const data = await res.json();
        console.log("Fetched friends for message sidebar:", data);
        setFriends(data.friends || []);
      } catch (err) {
        console.error("Error fetching friends:", err);
      }
    };
    fetchFriends();
  }, []);

  const filteredFriends = friends.filter(friend =>
    friend.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    friend.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-80 bg-[var(--color-primary)]/50 backdrop-blur-xl h-full overflow-y-auto border-r border-[var(--color-secondary)]/50">
      {/* Header */}
      <div className="sticky top-0 z-10 p-6 border-b border-[var(--color-secondary)]/50 bg-[var(--color-primary)]/50 backdrop-blur-xl">
        
        <div className="flex items-center gap-1 mb-4">
            <MessageSquare className="w-6 h-6 text-[var(--color-text)]" />
          <h2 className="text-2xl font-bold bg-gradient-to-r from-[var(--color-text)] to-[var(--color-muted)] bg-clip-text text-transparent">
            Messages
          </h2>
        </div>
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[var(--color-muted)] w-5 h-5" />
          <input
            type="text"
            placeholder="Search friends..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-2 bg-[var(--color-secondary)]/50 border border-[var(--color-secondary)]/50 rounded-xl text-[var(--color-text)] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-highlight)]/50 focus:border-transparent transition-all duration-300"
          />
        </div>
      </div>

      {/* Friends List */}
      <div className="p-1">
        {filteredFriends.length === 0 ? (
          <div className="text-center py-12">
            <UserCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-[var(--color-muted)] text-lg mb-2">
              {searchTerm ? "No friends found" : "No friends yet"}
            </p>
            <p className="text-[var(--color-muted)] text-sm">
              {searchTerm ? "Try a different search term" : "Start connecting with people"}
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {filteredFriends.map((friend) => (
              <li
                key={friend._id}
                onClick={() => onSelectFriend(friend)}
                className={`flex items-center gap-4 p-2 cursor-pointer rounded-2xl transition-all duration-300 ${
                  selectedUser?._id === friend._id 
                    ? "bg-gradient-to-r from-[var(--color-secondary)]/20 to-[var(--color-highlight)]/20 border border-[var(--color-highlight)]/30 shadow-lg" 
                    : "hover:bg-[var(--color-secondary)]/75 border border-transparent hover:border-gray-100"
                }`}
              >
                <div className="relative flex-shrink-0">
                  {friend.profilePic ? (
                    <div className="w-14 h-14 rounded-full bg-gradient-to-r from-[var(--color-secondary)] to-[var(--color-highlight)] p-0.5">
                      <img
                        src={friend.profilePic}
                        alt="profile"
                        className="w-full h-full rounded-full object-cover bg-[var(--color-secondary)]"
                      />
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-gradient-to-r from-gray-600 to-gray-700 flex items-center justify-center border-2 border-[var(--color-text)]">
                      <UserCircle className="w-8 h-8 text-[var(--color-muted)]" />
                    </div>
                  )}
                  {onlineUsers.includes(friend._id) && (
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-[var(--color-secondary)] rounded-full"></span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-[var(--color-text)] font-semibold text-lg truncate">
                    @{friend.username}
                  </h3>
                  <p className="text-[var(--color-muted)] text-xs truncate">
                    {onlineUsers.includes(friend._id) ? "Online" : "Offline"}
                  </p>
                </div>
                {onlineUsers.includes(friend._id) && (
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default FriendsSidebar;