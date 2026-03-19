import React, { useContext } from 'react'
import AppContext from '../../Context/UseContext';
import { Edit3, BarChart3 } from 'lucide-react';

const LeftSideBar = () => {
  const { user, setShowImage } = useContext(AppContext);

  return (
    <div className="space-y-3 sticky top-2">
      {/* User Profile Card */}
      <div className="bg-[var(--color-secondary)]/40 backdrop-blur-xl rounded-2xl p-6 border border-[var(--color-secondary)]/50 shadow-xl">
        <div className="text-center">
          <div className="relative inline-block mb-2">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-r from-[var(--color-secondary)] to-[var(--color-highlight)] p-1 shadow-2xl">
              <div className="w-full h-full rounded-2xl bg-[var(--color-secondary)] overflow-hidden">
                {user.profilePic ? (
                  <img
                    src={user.profilePic || "/defaultProfile.png"}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onClick={()=>setShowImage(user.profilePic)}
                  />
                ) : (
                  <img className='w-full h-full object-cover' src="/avatar.svg" alt="Default Avatar" />
                )}
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-400 border-4 border-[var(--color-secondary)] rounded-full"></div>
          </div>
          <h2 className="text-xl font-bold mb-1 bg-gradient-to-r from-[var(--color-text)] to-[var(--color-muted)] bg-clip-text text-transparent">
            {user.fullname || user.username || "Anonymous User"}
          </h2>
          <p className="text-[var(--color-muted)] text-sm mb-2">
            @{user.username || "username"}
          </p>
          {user.bio && (
            <p className="text-[var(--color-muted)] text-sm mb-2 leading-relaxed line-clamp-3">{user.bio}</p>
          )}
          <a
            href="/profile"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[var(--color-secondary)] to-[var(--color-highlight)] hover:from-[var(--color-secondary)] hover:to-[var(--color-accent)] px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <Edit3 className="w-4 h-4" />
            Edit Profile
          </a>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-[var(--color-secondary)]/40 backdrop-blur-xl rounded-2xl p-6 border border-[var(--color-secondary)]/50 shadow-xl">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-gradient-to-r from-[var(--color-secondary)] to-[var(--color-highlight)] rounded-xl flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-[var(--color-text)]" />
          </div>
          <h3 className="text-lg font-semibold bg-gradient-to-r from-[var(--color-text)] to-[var(--color-muted)] bg-clip-text text-transparent">
            Quick Stats
          </h3>
        </div>
        <div className="space-y-2">
          {[
            { label: "Posts", value: user.posts?.length || 0, color: "from-[var(--color-secondary)] to-[var(--color-accent)]" },
            { label: "Friends", value: user.friends?.length || 0, color: "from-[var(--color-accent)] to-emerald-500" },
            { label: "Followers", value: user.followers?.length || 0, color: "from-[var(--color-highlight)] to-pink-500" },
            { label: "Following", value: user.following?.length || 0, color: "from-[var(--color-secondary)] to-red-500" }
          ].map((stat, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-[var(--color-secondary)]/30 rounded-xl border border-[var(--color-secondary)]/30">
              <span className="text-[var(--color-muted)] font-medium">{stat.label}</span>
              <span className={`bg-gradient-to-r ${stat.color} text-[var(--color-text)] px-3 py-1 rounded-lg font-bold text-sm shadow-lg`}>
                {stat.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default LeftSideBar