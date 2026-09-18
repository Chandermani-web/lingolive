import { useContext } from "react";
import { Link } from "react-router-dom";
import { Edit3, BarChart3 } from "lucide-react";
import AppContext from "../../Context/UseContext";

const LeftSideBar = () => {
  const { user, setShowImage } = useContext(AppContext);

  const stats = [
    { label: "Posts", value: user?.posts?.length || 0 },
    { label: "Friends", value: user?.friends?.length || 0 },
    { label: "Followers", value: user?.followers?.length || 0 },
    { label: "Following", value: user?.following?.length || 0 },
  ];

  return (
    <div className="space-y-4 sticky top-20 animate-slideInLeft">
      {/* Profile Card */}
      <div className="card-static p-5">
        <div className="flex items-start gap-3 mb-4">
          <div className="relative">
            <img
              src={user?.profilePic || "/avatar.svg"}
              alt="Profile"
              className="w-14 h-14 rounded-full object-cover border-2 border-[#18202B] cursor-pointer hover:border-[#7C3AED] transition-colors"
              onClick={() => setShowImage(user?.profilePic || "/avatar.svg")}
            />
            <span className="status-dot-online" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="heading-sm text-white truncate">
              {user?.fullname || user?.username || "User"}
            </h2>
            <p className="text-xs text-[#8B5CF6] truncate">@{user?.username}</p>
          </div>
        </div>

        {user?.bio && (
          <p className="text-xs text-secondary mb-4 line-clamp-3 leading-relaxed">
            {user.bio}
          </p>
        )}

        <Link
          to="/profile"
          className="btn-secondary w-full text-xs py-2.5"
        >
          <Edit3 className="w-3.5 h-3.5" />
          Edit Profile
        </Link>
      </div>

      {/* Stats */}
      <div className="card-static p-5">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-4 h-4 text-[#8B5CF6]" />
          <h3 className="text-xs font-semibold text-secondary uppercase tracking-wider">
            Your Activity
          </h3>
        </div>
        <div className="space-y-1">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-white/[0.02] transition-colors"
            >
              <span className="text-sm text-secondary">{stat.label}</span>
              <span className="text-sm font-semibold text-white">{stat.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LeftSideBar;