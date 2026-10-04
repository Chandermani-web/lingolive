import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus, MapPin, Users, Compass } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import AppContext from "../../../Context/UseContext";

const ShowAllUser = () => {
  const {
    user, allUser, fetchAllUser, requests, BASE_URL,
    userPage, hasMoreUsers, loadingUsers, usersError,
  } = useContext(AppContext);
  const [displayUsers, setDisplayUsers] = useState([]);
  const [processingId, setProcessingId] = useState(null);
  const loadMoreRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (allUser && user) {
      const relationIds = (items = []) =>
        items.map((item) => String(item?._id || item));
      const followingIds = new Set(relationIds(user.following));
      const followerIds = new Set(relationIds(user.followers));
      const requestSenderIds = new Set(
        requests?.map((request) => String(request.sender?._id || request.sender))
      );

      const filtered = allUser.filter(
        (u) =>
          String(u._id) !== String(user._id) &&
          !followingIds.has(String(u._id)) &&
          !followerIds.has(String(u._id)) &&
          !requestSenderIds.has(String(u._id))
      );
      setDisplayUsers(filtered);
    }
  }, [allUser, user, requests]);

  useEffect(() => {
    const sentinel = loadMoreRef.current;
    if (!sentinel || !hasMoreUsers) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !loadingUsers) {
          fetchAllUser(userPage + 1, true);
        }
      },
      { rootMargin: "320px 0px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [fetchAllUser, hasMoreUsers, loadingUsers, userPage]);

  const handleSendRequest = async (userId) => {
    setProcessingId(userId);
    try {
      const response = await fetch(`${BASE_URL}/api/friends/send-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ receiverId: userId }),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success("Friend request sent");
        setDisplayUsers((prev) => prev.filter((u) => u._id !== userId));
      } else {
        toast.error(data.message || "Failed to send request");
      }
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setProcessingId(null);
    }
  };

  if (displayUsers.length === 0 && allUser.length === 0 && !loadingUsers) {
    return (
      <div className="card-static p-12 text-center">
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-[#0F141C] border border-[#18202B] flex items-center justify-center">
          <Users className="w-6 h-6 text-[#22D3EE]" />
        </div>
        <h3 className="heading-sm text-white mb-1">No suggestions right now</h3>
        <p className="text-sm text-muted">
          {usersError || "Check back later for new people to connect with"}
        </p>
        {usersError && (
          <button
            type="button"
            onClick={() => fetchAllUser(userPage + 1, true)}
            className="mt-4 text-xs text-[#A78BFA] hover:text-white transition-colors"
          >
            Try again
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {displayUsers.map((u, i) => (
        <div
          key={u._id}
          className="card h-full overflow-hidden group animate-fadeUp flex flex-col"
          style={{ animationDelay: `${i * 0.04}s` }}
        >
          {/* Cover */}
          <div className="relative h-20 overflow-hidden bg-gradient-to-br from-[#7C3AED]/20 to-[#3B82F6]/20">
            {u.coverPic && (
              <img
                src={u.coverPic}
                alt=""
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0E14] to-transparent" />
          </div>

          <div className="p-4 -mt-8 relative flex flex-1 flex-col min-h-[264px]">
            <div className="flex items-end gap-3 mb-3">
              <div className="relative">
                <img
                  src={u.profilePic || "/avatar.svg"}
                  alt={u.fullname}
                  className="w-14 h-14 rounded-full object-cover border-4 border-[#0A0E14] cursor-pointer"
                  onClick={() => navigate(`/profile/${u._id}`)}
                />
                <span className="status-dot-online border-[#0A0E14]" />
              </div>
            </div>

            <h3
              className="text-sm font-semibold text-white cursor-pointer hover:text-[#8B5CF6] transition-colors truncate"
              onClick={() => navigate(`/profile/${u._id}`)}
            >
              {u.fullname}
            </h3>
            <p
              className="text-xs text-[#8B5CF6] cursor-pointer hover:text-[#A78BFA] transition-colors mb-2 truncate"
              onClick={() => navigate(`/profile/${u._id}`)}
            >
              @{u.username}
            </p>

            <p className="text-xs text-muted line-clamp-2 mb-3 min-h-[2rem]">
              {u.bio || "No bio available"}
            </p>

            <div className="flex items-center gap-1.5 text-[10px] text-muted mb-3 min-h-[1rem]">
              {u.location ? (
                <>
                <MapPin className="w-3 h-3" />
                <span className="truncate">{u.location}</span>
                </>
              ) : null}
            </div>

            <button
              onClick={() => handleSendRequest(u._id)}
              disabled={processingId === u._id}
              className="btn-primary w-full text-xs py-2.5 mt-auto"
            >
              {processingId === u._id ? (
                <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-3.5 h-3.5" />
                  Add Friend
                </>
              )}
            </button>
          </div>
        </div>
      ))}
      <div ref={loadMoreRef} aria-hidden="true" className="h-1 col-span-full" />

      {loadingUsers && (
        <div className="col-span-full flex justify-center py-6">
          <div className="w-6 h-6 border-2 border-[#18202B] border-t-[#7C3AED] rounded-full animate-spin" />
        </div>
      )}

      {usersError && allUser.length > 0 && (
        <div className="col-span-full flex flex-col items-center gap-2 py-4 text-center">
          <p className="text-xs text-[#F43F5E]">Could not load more people.</p>
          <button
            type="button"
            onClick={() => fetchAllUser(userPage + 1, true)}
            className="text-xs text-[#A78BFA] hover:text-white transition-colors"
          >
            Try again
          </button>
        </div>
      )}

      {!hasMoreUsers && allUser.length > 0 && (
        <p className="col-span-full text-center text-xs text-muted py-4">
          You're all caught up
        </p>
      )}
      <ToastContainer position="top-right" theme="dark" />
    </div>
  );
};

export default ShowAllUser;