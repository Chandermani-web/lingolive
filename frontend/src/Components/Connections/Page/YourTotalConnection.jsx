import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle, UserMinus, Users, Search } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import AppContext from "../../../Context/UseContext";

const YourTotalConnection = () => {
  const { friendList, fetchFriendlist, loading, BASE_URL } = useContext(AppContext);
  const [removingId, setRemovingId] = useState(null);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchFriendlist();
  }, []);

  const handleRemove = async (friendId) => {
    if (!window.confirm("Remove this connection?")) return;
    setRemovingId(friendId);
    try {
      const response = await fetch(`${BASE_URL}/api/friends/remove-friend`, {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ friendId }),
      });
      if (!response.ok) throw new Error();
      toast.success("Connection removed");
      fetchFriendlist();
    } catch (err) {
      toast.error("Failed to remove");
    } finally {
      setRemovingId(null);
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center">
        <div className="w-8 h-8 mx-auto border-2 border-[#18202B] border-t-[#8B5CF6] rounded-full animate-spin" />
      </div>
    );
  }

  const filtered = friendList?.filter(
    (f) =>
      f.username?.toLowerCase().includes(search.toLowerCase()) ||
      f.fullname?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  if (friendList?.length === 0) {
    return (
      <div className="card-static p-12 text-center">
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-[#0F141C] border border-[#18202B] flex items-center justify-center">
          <Users className="w-6 h-6 text-[#8B5CF6]" />
        </div>
        <h3 className="heading-sm text-white mb-1">No connections yet</h3>
        <p className="text-sm text-muted">
          Start connecting with people to build your network
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717A] pointer-events-none z-10" />
        <input
          type="text"
          placeholder="Search your connections..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-search"
        />
      </div>

      {/* List */}
      <div className="space-y-2">
        {filtered.map((friend, i) => (
          <div
            key={friend._id}
            className="card p-4 animate-fadeUp"
            style={{ animationDelay: `${i * 0.03}s` }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div
                className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                onClick={() => navigate(`/profile/${friend._id}`)}
              >
                <div className="relative flex-shrink-0">
                  <img
                    src={friend.profilePic || "/avatar.svg"}
                    alt=""
                    className="w-12 h-12 rounded-full object-cover border-2 border-[#18202B]"
                  />
                  <span className="status-dot-online border-[#0A0E14]" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-white truncate hover:text-[#8B5CF6] transition-colors">
                    {friend.fullname}
                  </h3>
                  <p className="text-xs text-[#8B5CF6] truncate">
                    @{friend.username}
                  </p>
                  {friend.location && (
                    <p className="text-[10px] text-muted truncate mt-0.5">
                      📍 {friend.location}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => navigate("/message")}
                  className="btn-secondary text-xs py-2 px-4"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  Message
                </button>
                <button
                  onClick={() => handleRemove(friend._id)}
                  disabled={removingId === friend._id}
                  className="btn-ghost text-[#F43F5E] text-xs py-2 px-3 border border-[#F43F5E]/20 hover:bg-[#F43F5E]/5"
                >
                  {removingId === friend._id ? (
                    <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : (
                    <UserMinus className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <ToastContainer position="top-right" theme="dark" />
    </div>
  );
};

export default YourTotalConnection;