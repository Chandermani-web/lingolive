import { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  User, MapPin, Globe, Calendar, Heart,
  MessageCircle, ThumbsUp, Link2, Sparkles
} from "lucide-react";
import AppContext from "../../../Context/UseContext.jsx";
import Comment from "../../Post/Service/Comment.jsx";
import "remixicon/fonts/remixicon.css";

const User_Profile = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState({});
  const [openCommentBoxId, setOpenCommentBoxId] = useState(null);
  const [expandedPostId, setExpandedPostId] = useState(null);
  const {
    posts, setCommentIdForFetching, setPosts,
    loading, setShowImage, BASE_URL,
  } = useContext(AppContext);

  useEffect(() => {
    const getUser = async () => {
      if (!id) return;
      try {
        const res = await fetch(`${BASE_URL}/api/friends/getfriend/${id}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        const data = await res.json();
        if (res.ok) setProfile(data.friend);
      } catch (err) {
        console.error(err);
      }
    };
    getUser();
  }, [id, BASE_URL]);

  const handleLike = async (postId) => {
    try {
      const response = await fetch(
        `${BASE_URL}/api/posts/${postId}/likeandunlike`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );
      const data = await response.json();
      if (data.success) {
        setPosts(
          posts.map((post) =>
            post._id === postId ? { ...post, likes: data.updatedLikes } : post
          )
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-app flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#18202B] border-t-[#7C3AED] rounded-full animate-spin" />
      </div>
    );
  }

  const userPosts = posts?.filter((p) => p.user._id === profile._id) || [];

  const stats = [
    { label: "Posts", value: profile.posts?.length || 0, color: "#22D3EE" },
    { label: "Friends", value: profile.friends?.length || 0, color: "#10B981" },
    { label: "Followers", value: profile.followers?.length || 0, color: "#EC4899" },
    { label: "Following", value: profile.following?.length || 0, color: "#F59E0B" },
  ];

  const socials = [
    { key: "twitter", icon: "ri-twitter-x-fill", label: "Twitter", color: "#22D3EE" },
    { key: "instagram", icon: "ri-instagram-fill", label: "Instagram", color: "#EC4899" },
    { key: "linkedin", icon: "ri-linkedin-fill", label: "LinkedIn", color: "#3B82F6" },
    { key: "github", icon: "ri-github-fill", label: "GitHub", color: "#8B5CF6" },
  ];

  return (
    <div className="min-h-screen bg-app relative">
      <div className="bg-app-fixed" />

      <div className="relative z-10 max-w-5xl mx-auto p-4 md:p-6">
        {/* Cover */}
        <div className="relative h-48 md:h-64 rounded-2xl overflow-hidden bg-gradient-to-br from-[#7C3AED]/30 via-[#3B82F6]/20 to-[#22D3EE]/20 mb-6 animate-fadeUp">
          {profile.coverPic && (
            <img
              src={profile.coverPic}
              alt=""
              className="w-full h-full object-cover cursor-pointer"
              onClick={() => setShowImage(profile.coverPic)}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#05070A] via-transparent to-transparent" />
        </div>

        {/* Profile Header */}
        <div className="flex flex-col md:flex-row md:items-end gap-5 -mt-20 md:-mt-24 mb-8 relative z-20 animate-fadeUp">
          <div className="relative">
            <div className="w-28 h-28 md:w-32 md:h-32 rounded-full p-[3px] bg-gradient-to-br from-[#7C3AED] to-[#3B82F6] shadow-2xl shadow-purple-500/20">
              <div className="w-full h-full rounded-full overflow-hidden bg-[#0A0E14]">
                {profile.profilePic ? (
                  <img
                    src={profile.profilePic}
                    alt=""
                    className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => setShowImage(profile.profilePic)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-12 h-12 text-muted" />
                  </div>
                )}
              </div>
            </div>
            <span className="absolute bottom-1 right-1 w-6 h-6 bg-[#10B981] border-4 border-[#05070A] rounded-full" />
          </div>

          <div className="flex-1 card-static p-5">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="heading-lg text-white">
                {profile.fullname || profile.username || "Anonymous"}
              </h1>
              {profile.isVerified && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gradient-to-r from-[#7C3AED] to-[#3B82F6] text-white text-[10px] font-bold">
                  <Sparkles className="w-3 h-3" />
                  Verified
                </span>
              )}
            </div>
            <p className="text-sm text-[#8B5CF6] mb-3">@{profile.username}</p>

            {profile.bio && (
              <p className="text-sm text-secondary leading-relaxed mb-4">
                {profile.bio}
              </p>
            )}

            <div className="flex flex-wrap gap-2">
              {profile.location && (
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[#0F141C] border border-[#18202B]">
                  <MapPin className="w-3 h-3 text-[#EC4899]" />
                  <span className="text-xs text-secondary">{profile.location}</span>
                </div>
              )}
              {profile.website && (
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[#0F141C] border border-[#18202B] hover:border-[#293445] transition-colors"
                >
                  <Globe className="w-3 h-3 text-[#8B5CF6]" />
                  <span className="text-xs text-secondary">Website</span>
                </a>
              )}
              {profile.dateOfBirth && (
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[#0F141C] border border-[#18202B]">
                  <Calendar className="w-3 h-3 text-[#F59E0B]" />
                  <span className="text-xs text-secondary">
                    {new Date(profile.dateOfBirth).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8 animate-fadeUp delay-1">
          {stats.map((stat) => (
            <div key={stat.label} className="card-static p-4 text-center">
              <div
                className="text-2xl font-bold mb-1"
                style={{ color: stat.color }}
              >
                {stat.value}
              </div>
              <div className="text-[11px] uppercase tracking-wider text-muted">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Social */}
        {profile.socialLinks && Object.values(profile.socialLinks).some((l) => l) && (
          <div className="card-static p-5 mb-6 animate-fadeUp delay-2">
            <div className="flex items-center gap-2 mb-4">
              <Link2 className="w-4 h-4 text-[#8B5CF6]" />
              <h3 className="heading-sm text-white">Connect</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {socials.map(
                (s) =>
                  profile.socialLinks[s.key] && (
                    <a
                      key={s.key}
                      href={profile.socialLinks[s.key]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#0F141C] border border-[#18202B] hover:border-[#293445] transition-all"
                    >
                      <i className={`${s.icon} text-base`} style={{ color: s.color }}></i>
                      <span className="text-xs text-secondary font-medium">
                        {s.label}
                      </span>
                    </a>
                  )
              )}
            </div>
          </div>
        )}

        {/* Interests */}
        {profile.interests && profile.interests.length > 0 && (
          <div className="card-static p-5 mb-6 animate-fadeUp delay-3">
            <div className="flex items-center gap-2 mb-4">
              <Heart className="w-4 h-4 text-[#EC4899]" />
              <h3 className="heading-sm text-white">Interests</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.interests.map((interest, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-secondary bg-[#0F141C] border border-[#18202B]"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Posts */}
        <div className="space-y-4">
          <h3 className="heading-md text-white mb-3">Recent Posts</h3>

          {userPosts.length > 0 ? (
            userPosts.map((post, i) => (
              <article
                key={post._id}
                className="card-static p-5 animate-fadeUp"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <header className="flex items-center gap-3 mb-4">
                  <img
                    src={post.user?.profilePic || "/avatar.svg"}
                    alt=""
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <Link
                      to={`/profile/${post.user._id}`}
                      className="text-sm font-semibold text-white hover:text-[#8B5CF6] transition-colors"
                    >
                      @{post.user.username}
                    </Link>
                    <p className="text-[11px] text-muted">
                      {new Date(post.createdAt).toLocaleString()}
                    </p>
                  </div>
                </header>

                <p
                  className={`text-sm text-secondary leading-relaxed mb-3 ${
                    expandedPostId === post._id ? "" : "line-clamp-3"
                  }`}
                >
                  {post.content}
                </p>
                {post.content?.length > 180 && (
                  <button
                    onClick={() =>
                      setExpandedPostId(expandedPostId === post._id ? null : post._id)
                    }
                    className="text-xs text-[#8B5CF6] hover:text-[#A78BFA] font-medium mb-3"
                  >
                    {expandedPostId === post._id ? "Show less" : "Read more"}
                  </button>
                )}

                {post.image && (
                  <img
                    src={post.image}
                    alt=""
                    className="rounded-lg w-full max-h-96 object-cover cursor-pointer border border-[#18202B] mb-3"
                    onClick={() => setShowImage(post.image)}
                  />
                )}
                {post.video && (
                  <video
                    src={post.video}
                    controls
                    className="rounded-lg w-full max-h-96 border border-[#18202B] mb-3"
                  />
                )}

                <div className="flex items-center gap-1 pt-3 border-t border-[#111820]">
                  <button
                    onClick={() => handleLike(post._id)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-secondary hover:text-white hover:bg-white/[0.03] transition-all"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    <span className="font-medium">{post.likes?.length || 0}</span>
                  </button>
                  <button
                    onClick={() => {
                      setOpenCommentBoxId(
                        openCommentBoxId === post._id ? null : post._id
                      );
                      setCommentIdForFetching(post._id);
                    }}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-secondary hover:text-white hover:bg-white/[0.03] transition-all"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span className="font-medium">{post.comments?.length || 0}</span>
                  </button>
                </div>

                {openCommentBoxId === post._id && (
                  <div className="mt-3 pt-3 border-t border-[#111820]">
                    <Comment id={post._id} />
                  </div>
                )}
              </article>
            ))
          ) : (
            <div className="card-static p-12 text-center">
              <MessageCircle className="w-10 h-10 text-muted mx-auto mb-3" />
              <p className="text-sm text-muted">No posts yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default User_Profile;