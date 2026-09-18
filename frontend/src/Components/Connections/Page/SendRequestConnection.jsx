import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, UserPlus, Users } from "lucide-react";
import AppContext from "../../../Context/UseContext";

const SendRequestConnection = () => {
  const { user, loading } = useContext(AppContext);
  const navigate = useNavigate();

  const friendIds = user?.friends?.map((f) => f._id) || [];
  const sendRequests = user?.following?.filter((u) => !friendIds.includes(u._id)) || [];

  if (loading) {
    return (
      <div className="py-12 text-center">
        <div className="w-8 h-8 mx-auto border-2 border-[#18202B] border-t-[#8B5CF6] rounded-full animate-spin" />
      </div>
    );
  }

  if (sendRequests.length === 0) {
    return (
      <div className="card-static p-12 text-center">
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-[#0F141C] border border-[#18202B] flex items-center justify-center">
          <UserPlus className="w-6 h-6 text-[#10B981]" />
        </div>
        <h3 className="heading-sm text-white mb-1">No pending follows</h3>
        <p className="text-sm text-muted">
          You haven't followed anyone new yet
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {sendRequests.map((u, i) => (
        <div
          key={u._id}
          className="card overflow-hidden group animate-fadeUp"
          style={{ animationDelay: `${i * 0.04}s` }}
        >
          <div className="relative h-20 overflow-hidden bg-gradient-to-br from-[#8B5CF6]/20 to-[#EC4899]/20">
            {u.coverPic && (
              <img
                src={u.coverPic}
                alt=""
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0E14] to-transparent" />
            <div className="absolute top-2 right-2">
              <span className="px-2 py-1 rounded-md bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 text-[10px] font-bold text-[#8B5CF6]">
                FOLLOWING
              </span>
            </div>
          </div>

          <div className="p-4 -mt-8 relative">
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

            {u.location && (
              <div className="flex items-center gap-1.5 text-[10px] text-muted mb-3">
                <MapPin className="w-3 h-3" />
                <span className="truncate">{u.location}</span>
              </div>
            )}

            <button className="w-full py-2.5 rounded-lg bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 text-[#8B5CF6] text-xs font-semibold flex items-center justify-center gap-1.5 cursor-default">
              <i className="ri-user-follow-line text-sm"></i>
              Following
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SendRequestConnection;