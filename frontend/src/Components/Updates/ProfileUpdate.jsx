import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import {
  User, MapPin, Globe, Calendar, Camera, Edit3, Save, X,
  MessageCircle, ThumbsUp, MoreHorizontal, Sparkles, Heart,
  MessageSquare, BarChart3, Users, Link2, Trash2, Image as ImageIcon,
  Video as VideoIcon, Share2, Bookmark
} from "lucide-react";
import AppContext from "../../Context/UseContext.jsx";
import Comment from "../Post/Service/Comment.jsx";

const ProfileUpdate = () => {
  const {
    user, setUser, posts, setPosts, fetchPosts,
    setCommentIdForFetching, setShowImage, BASE_URL,
  } = useContext(AppContext);

  const [expandedPostId, setExpandedPostId] = useState(null);
  const [openCommentBoxId, setOpenCommentBoxId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [editOn, setEditOn] = useState(false);
  const [editPostId, setEditPostId] = useState(null);
  const [editdata, seteditdata] = useState({ content: "", video: "", image: "" });

  const [formData, setFormData] = useState({
    fullname: "", bio: "", location: "", username: "",
    website: "", phone: "", dateOfBirth: "", interests: "",
    socialLinks: { twitter: "", instagram: "", linkedin: "", github: "" },
  });

  useEffect(() => {
    if (user) {
      setFormData({
        fullname: user.fullname || "",
        bio: user.bio || "",
        location: user.location || "",
        username: user.username || "",
        website: user.website || "",
        phone: user.phone || "",
        dateOfBirth: user.dateOfBirth
          ? new Date(user.dateOfBirth).toISOString().split("T")[0]
          : "",
        interests: user.interests ? user.interests.join(", ") : "",
        socialLinks: {
          twitter: user.socialLinks?.twitter || "",
          instagram: user.socialLinks?.instagram || "",
          linkedin: user.socialLinks?.linkedin || "",
          github: user.socialLinks?.github || "",
        },
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("socialLinks.")) {
      const key = name.split(".")[1];
      setFormData((p) => ({
        ...p,
        socialLinks: { ...p.socialLinks, [key]: value },
      }));
    } else {
      setFormData((p) => ({ ...p, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const submitData = {
        ...formData,
        interests: formData.interests
          .split(",")
          .map((i) => i.trim())
          .filter(Boolean),
      };
      const res = await fetch(`${BASE_URL}/api/auth/updateprofile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(submitData),
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        setIsEditing(false);
        toast.success("Profile updated");
      } else {
        toast.error(data.message || "Update failed");
      }
    } catch (error) {
      toast.error("Error updating profile");
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append(type === "profile" ? "profilePic" : "coverPic", file);
    try {
      const res = await fetch(`${BASE_URL}/api/auth/upload-${type}-pic`, {
        method: "POST",
        credentials: "include",
        body: fd,
      });
      const data = await res.json();
      if (res.ok) {
        setUser((prev) => ({
          ...prev,
          [type === "profile" ? "profilePic" : "coverPic"]:
            data[type === "profile" ? "profilePic" : "coverPic"],
        }));
        toast.success(`${type === "profile" ? "Profile" : "Cover"} updated`);
      } else {
        toast.error(data.message || "Upload failed");
      }
    } catch (error) {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (id, content, image, video) => {
    setOpenMenuId(null);
    setEditOn(true);
    setEditPostId(id);
    seteditdata({ content: content || "", image: image || "", video: video || "" });
  };

  const handleSaveEdit = async () => {
    if (!editPostId) return;
    try {
      const res = await fetch(`${BASE_URL}/api/posts/${editPostId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(editdata),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Post updated");
        setPosts(posts.map((p) => (p._id === editPostId ? { ...p, ...data.post } : p)));
        setEditOn(false);
        setEditPostId(null);
        fetchPosts();
      } else {
        toast.error(data.message || "Update failed");
      }
    } catch (err) {
      toast.error("Error updating post");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this post?")) return;
    try {
      const res = await fetch(`${BASE_URL}/api/posts/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        toast.success("Post deleted");
        setPosts(posts.filter((p) => p._id !== id));
      }
    } catch (err) {
      toast.error("Error deleting post");
    }
  };

  const handleLike = async (postId) => {
    try {
      const res = await fetch(`${BASE_URL}/api/posts/${postId}/likeandunlike`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setPosts(posts.map((p) =>
          p._id === postId ? { ...p, likes: data.updatedLikes } : p
        ));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#05070A] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#18202B] border-t-[#7C3AED] rounded-full animate-spin" />
      </div>
    );
  }

  const stats = [
    { label: "Posts", value: user.posts?.length || 0, color: "#22D3EE", icon: BarChart3 },
    { label: "Friends", value: user.friends?.length || 0, color: "#10B981", icon: Users },
    { label: "Followers", value: user.followers?.length || 0, color: "#EC4899", icon: Heart },
    { label: "Following", value: user.following?.length || 0, color: "#F59E0B", icon: User },
  ];

  const socials = [
    { key: "twitter", label: "Twitter", color: "#22D3EE" },
    { key: "instagram", label: "Instagram", color: "#EC4899" },
    { key: "linkedin", label: "LinkedIn", color: "#3B82F6" },
    { key: "github", label: "GitHub", color: "#8B5CF6" },
  ];

  return (
    <div className="min-h-screen bg-[#05070A] relative overflow-hidden">
      <div className="bg-app-fixed" />

      <div className="relative z-10 max-w-5xl mx-auto p-4 md:p-6">
        {/* Cover Photo */}
        <div className="relative h-56 md:h-72 rounded-2xl overflow-hidden bg-gradient-to-br from-[#7C3AED]/25 via-[#3B82F6]/15 to-[#22D3EE]/15 mb-6 border border-[#18202B] animate-fadeUp">
          {user.coverPic && (
            <img
              src={user.coverPic}
              alt="Cover"
              className="w-full h-full object-cover cursor-pointer"
              onClick={() => setShowImage(user.coverPic)}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#05070A]/70 via-transparent to-transparent" />

          <label
            className={`absolute top-4 right-4 w-10 h-10 rounded-xl bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center cursor-pointer hover:bg-black/70 transition-all ${
              uploading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <Camera className="w-4 h-4 text-white" />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handlePhotoUpload(e, "cover")}
              className="hidden"
              disabled={uploading}
            />
          </label>
        </div>

        {/* Profile Header */}
        <div className="flex flex-col md:flex-row md:items-end gap-5 -mt-16 md:-mt-20 mb-8 relative z-20 animate-fadeUp">
          <div className="relative">
            <div className="w-28 h-28 md:w-32 md:h-32 rounded-full p-[3px] bg-gradient-to-br from-[#7C3AED] to-[#3B82F6] shadow-2xl shadow-purple-500/20">
              <div className="w-full h-full rounded-full overflow-hidden bg-[#0A0E14]">
                {user.profilePic ? (
                  <img
                    src={user.profilePic}
                    alt="Profile"
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => setShowImage(user.profilePic)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-12 h-12 text-[#71717A]" />
                  </div>
                )}
              </div>
            </div>
            <label
              className={`absolute bottom-0 right-0 w-9 h-9 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#3B82F6] border-2 border-[#05070A] flex items-center justify-center cursor-pointer hover:scale-110 transition-transform shadow-lg ${
                uploading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <Camera className="w-3.5 h-3.5 text-white" />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handlePhotoUpload(e, "profile")}
                className="hidden"
                disabled={uploading}
              />
            </label>
            <span className="absolute bottom-2 right-10 w-5 h-5 bg-[#10B981] border-4 border-[#05070A] rounded-full" />
          </div>

          <div className="flex-1 card-static p-5">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="heading-lg text-white">
                    {user.fullname || user.username || "Anonymous"}
                  </h1>
                  {user.isVerified && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gradient-to-r from-[#7C3AED] to-[#3B82F6] text-white text-[10px] font-bold">
                      <Sparkles className="w-3 h-3" />
                      Verified
                    </span>
                  )}
                </div>
                <p className="text-sm text-[#8B5CF6] mb-3">@{user.username}</p>
                {user.bio && (
                  <p className="text-sm text-[#A1A1AA] leading-relaxed mb-4">
                    {user.bio}
                  </p>
                )}

                <div className="flex flex-wrap gap-2">
                  {user.location && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[#0F141C] border border-[#18202B]">
                      <MapPin className="w-3 h-3 text-[#EC4899]" />
                      <span className="text-xs text-[#A1A1AA]">{user.location}</span>
                    </div>
                  )}
                  {user.website && (
                    <a
                      href={user.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[#0F141C] border border-[#18202B] hover:border-[#293445] transition-colors"
                    >
                      <Globe className="w-3 h-3 text-[#8B5CF6]" />
                      <span className="text-xs text-[#A1A1AA]">Website</span>
                    </a>
                  )}
                  {user.dateOfBirth && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[#0F141C] border border-[#18202B]">
                      <Calendar className="w-3 h-3 text-[#F59E0B]" />
                      <span className="text-xs text-[#A1A1AA]">
                        {new Date(user.dateOfBirth).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={() => setIsEditing(!isEditing)}
                className="btn-primary flex-shrink-0"
              >
                <Edit3 className="w-4 h-4" />
                {isEditing ? "Cancel" : "Edit Profile"}
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8 animate-fadeUp delay-1">
          {stats.map((stat) => (
            <div key={stat.label} className="card-static p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
              </div>
              <div className="text-2xl font-bold text-white mb-0.5">{stat.value}</div>
              <div className="text-[11px] uppercase tracking-wider text-[#71717A]">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Edit Form */}
        {isEditing && (
          <div className="card-static p-6 md:p-8 mb-8 animate-scaleIn">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#3B82F6] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h2 className="heading-md text-white">Edit Profile</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Left Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-[#A1A1AA] mb-2 uppercase tracking-wide">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="fullname"
                      value={formData.fullname}
                      onChange={handleInputChange}
                      className="input"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#A1A1AA] mb-2 uppercase tracking-wide">
                      Username
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="input"
                      placeholder="Choose a username"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#A1A1AA] mb-2 uppercase tracking-wide">
                      Bio
                    </label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      rows={4}
                      maxLength={500}
                      className="input resize-none"
                      placeholder="Tell us about yourself..."
                    />
                    <p className="text-[10px] text-[#71717A] mt-1 text-right">
                      {formData.bio.length}/500
                    </p>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-[#A1A1AA] mb-2 uppercase tracking-wide">
                        Location
                      </label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        className="input"
                        placeholder="City"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#A1A1AA] mb-2 uppercase tracking-wide">
                        Phone
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="input"
                        placeholder="+1 555..."
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#A1A1AA] mb-2 uppercase tracking-wide">
                      Website
                    </label>
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      className="input"
                      placeholder="https://example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#A1A1AA] mb-2 uppercase tracking-wide">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      className="input"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#A1A1AA] mb-2 uppercase tracking-wide">
                      Interests (comma separated)
                    </label>
                    <input
                      type="text"
                      name="interests"
                      value={formData.interests}
                      onChange={handleInputChange}
                      className="input"
                      placeholder="Technology, Music, Travel"
                    />
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div className="pt-4 border-t border-[#111820]">
                <h3 className="heading-sm text-white mb-4">Social Links</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {socials.map((s) => (
                    <input
                      key={s.key}
                      type="url"
                      name={`socialLinks.${s.key}`}
                      value={formData.socialLinks[s.key]}
                      onChange={handleInputChange}
                      placeholder={`${s.label} URL`}
                      className="input"
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="btn-secondary"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Social Links Display */}
        {user.socialLinks && Object.values(user.socialLinks).some((l) => l) && (
          <div className="card-static p-5 mb-6 animate-fadeUp delay-2">
            <div className="flex items-center gap-2 mb-4">
              <Link2 className="w-4 h-4 text-[#8B5CF6]" />
              <h3 className="heading-sm text-white">Connect With Me</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {socials.map((s) => user.socialLinks[s.key] && (
                <a
                  key={s.key}
                  href={user.socialLinks[s.key]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#0F141C] border border-[#18202B] hover:border-[#293445] transition-all"
                >
                  <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                  <span className="text-xs text-[#A1A1AA] font-medium">{s.label}</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Interests */}
        {user.interests && user.interests.length > 0 && (
          <div className="card-static p-5 mb-6 animate-fadeUp delay-3">
            <div className="flex items-center gap-2 mb-4">
              <Heart className="w-4 h-4 text-[#EC4899]" />
              <h3 className="heading-sm text-white">Interests & Passions</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {user.interests.map((interest, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#A1A1AA] bg-[#0F141C] border border-[#18202B]"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Posts */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="heading-md text-white">My Posts</h3>
            <Link to="/create-post" className="btn-primary text-xs py-2 px-4">
              <Sparkles className="w-3.5 h-3.5" />
              New Post
            </Link>
          </div>

          {user.posts?.length > 0 ? (
            user.posts.map((post, i) => (
              <article
                key={post._id}
                className="card-static p-4 md:p-5 animate-fadeUp"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={user.profilePic || "/avatar.svg"}
                      alt=""
                      className="w-10 h-10 rounded-full object-cover cursor-pointer"
                      onClick={() => setShowImage(user.profilePic)}
                    />
                    <div>
                      <Link
                        to={`/profile/${post.user._id}`}
                        className="text-sm font-semibold text-white hover:text-[#8B5CF6] transition-colors"
                      >
                        @{user.username}
                      </Link>
                      <p className="text-[11px] text-[#71717A]">
                        {new Date(post.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="relative">
                    <button
                      className="btn-ghost p-1.5"
                      onClick={() => setOpenMenuId(openMenuId === post._id ? null : post._id)}
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                    {openMenuId === post._id && (
                      <div className="absolute right-0 top-9 w-40 bg-[#0F141C] border border-[#18202B] rounded-xl overflow-hidden z-20 shadow-2xl">
                        <button
                          onClick={() => handleEdit(post._id, post.content, post.image, post.video)}
                          className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-[#A1A1AA] hover:bg-white/[0.03] transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(post._id)}
                          className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-[#F43F5E] hover:bg-[#F43F5E]/5 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>
                        <button className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-[#A1A1AA] hover:bg-white/[0.03] transition-colors">
                          <Share2 className="w-3.5 h-3.5" />
                          Share
                        </button>
                        <button className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-[#A1A1AA] hover:bg-white/[0.03] transition-colors">
                          <Bookmark className="w-3.5 h-3.5" />
                          Save
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Edit Mode */}
                {editOn && editPostId === post._id ? (
                  <div className="space-y-3">
                    <textarea
                      value={editdata.content}
                      onChange={(e) => seteditdata({ ...editdata, content: e.target.value })}
                      rows={5}
                      className="input resize-none"
                      placeholder="What's on your mind?"
                    />
                    <div className="flex gap-2 pt-1">
                      <button onClick={handleSaveEdit} className="btn-primary text-xs py-2">
                        Save Changes
                      </button>
                      <button
                        onClick={() => { setEditOn(false); setEditPostId(null); }}
                        className="btn-secondary text-xs py-2"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Content */}
                    <p
                      className={`text-sm text-[#A1A1AA] leading-relaxed mb-3 ${
                        expandedPostId === post._id ? "" : "line-clamp-3"
                      }`}
                    >
                      {post.content}
                    </p>
                    {post.content?.length > 180 && (
                      <button
                        onClick={() => setExpandedPostId(expandedPostId === post._id ? null : post._id)}
                        className="text-xs text-[#8B5CF6] hover:text-[#A78BFA] font-medium mb-3"
                      >
                        {expandedPostId === post._id ? "Show less" : "Read more"}
                      </button>
                    )}

                    {/* Media */}
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

                    {/* Actions */}
                    <div className="flex items-center gap-1 pt-3 border-t border-[#111820]">
                      <button
                        onClick={() => handleLike(post._id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                          post.likes?.includes(user._id)
                            ? "text-[#3B82F6]"
                            : "text-[#A1A1AA] hover:text-white hover:bg-white/[0.03]"
                        }`}
                      >
                        <ThumbsUp className={`w-4 h-4 ${post.likes?.includes(user._id) ? "fill-current" : ""}`} />
                        <span className="font-medium">{post.likes?.length || 0}</span>
                      </button>
                      <button
                        onClick={() => {
                          setOpenCommentBoxId(openCommentBoxId === post._id ? null : post._id);
                          setCommentIdForFetching(post._id);
                        }}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[#A1A1AA] hover:text-white hover:bg-white/[0.03] transition-all"
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
                  </>
                )}
              </article>
            ))
          ) : (
            <div className="card-static p-12 text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-[#0F141C] border border-[#18202B] flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-[#71717A]" />
              </div>
              <h4 className="heading-sm text-white mb-1">No posts yet</h4>
              <p className="text-sm text-[#71717A] mb-5">
                Start sharing your thoughts
              </p>
              <Link to="/create-post" className="btn-primary">
                <Sparkles className="w-4 h-4" />
                Create Post
              </Link>
            </div>
          )}
        </div>
      </div>

      <ToastContainer position="top-right" theme="dark" />
    </div>
  );
};

export default ProfileUpdate;