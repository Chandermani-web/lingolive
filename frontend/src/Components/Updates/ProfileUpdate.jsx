import { useContext, useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import {
  User, MapPin, Globe, Calendar, Camera, Edit3, Save, X,
  MessageCircle, ThumbsUp, MoreHorizontal, Sparkles, Heart,
  MessageSquare, BarChart3, Users, Link2, Trash2, Share2,
  Bookmark, Image as ImageIcon, Video as VideoIcon, AtSign,
  Briefcase, CheckCircle2, AlertCircle, TrendingUp
} from "lucide-react";
import AppContext from "../../Context/UseContext.jsx";
import Comment from "../Post/Service/Comment.jsx";

// ──────────────────────────────────────────────────────────
// Field component
// ──────────────────────────────────────────────────────────
const Field = ({ label, icon: Icon, children, hint }) => (
  <div>
    <label className="flex items-center gap-1.5 text-xs font-medium text-[#A1A1AA] mb-2 uppercase tracking-wider">
      {Icon && <Icon className="w-3.5 h-3.5 text-[#71717A]" />}
      {label}
    </label>
    {children}
    {hint && <p className="text-[10px] text-[#71717A] mt-1.5">{hint}</p>}
  </div>
);

// ──────────────────────────────────────────────────────────
// Stat Card
// ──────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon: Icon, color }) => (
  <div className="card-static p-4 group hover:border-[#293445] transition-colors">
    <div className="flex items-center justify-between mb-3">
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center"
        style={{ background: `${color}15`, border: `1px solid ${color}30` }}
      >
        <Icon className="w-4 h-4" style={{ color }} />
      </div>
      <TrendingUp className="w-3.5 h-3.5 text-[#293445] opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
    <div className="text-2xl font-bold text-white leading-none mb-1">
      {value.toLocaleString?.() ?? value}
    </div>
    <div className="text-[11px] uppercase tracking-wider text-[#71717A]">
      {label}
    </div>
  </div>
);

// ──────────────────────────────────────────────────────────
// Main Component
// ──────────────────────────────────────────────────────────
const ProfileUpdate = () => {
  const {
    user, setUser, posts, setPosts, fetchPosts,
    setCommentIdForFetching, setShowImage, BASE_URL,
  } = useContext(AppContext);

  const [activeTab, setActiveTab] = useState("posts");
  const [expandedPostId, setExpandedPostId] = useState(null);
  const [openCommentBoxId, setOpenCommentBoxId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [editOn, setEditOn] = useState(false);
  const [editPostId, setEditPostId] = useState(null);
  const [editdata, seteditdata] = useState({ content: "", video: "", image: "" });
  const [formErrors, setFormErrors] = useState({});

  const profileInputRef = useRef(null);
  const coverInputRef = useRef(null);

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

  // Close menus on outside click
  useEffect(() => {
    const handler = () => setOpenMenuId(null);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

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
    if (formErrors[name]) {
      setFormErrors((p) => ({ ...p, [name]: "" }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.fullname.trim()) errors.fullname = "Name is required";
    if (!formData.username.trim()) errors.username = "Username is required";
    if (formData.username.length < 3) errors.username = "Username too short";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fix the errors");
      return;
    }
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
        toast.success("Profile updated successfully");
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
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image too large (max 5MB)");
      return;
    }
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
    if (!window.confirm("Delete this post permanently?")) return;
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
    { label: "Posts", value: user.posts?.length || 0, icon: BarChart3, color: "#22D3EE" },
    { label: "Friends", value: user.friends?.length || 0, icon: Users, color: "#10B981" },
    { label: "Followers", value: user.followers?.length || 0, icon: Heart, color: "#EC4899" },
    { label: "Following", value: user.following?.length || 0, icon: User, color: "#F59E0B" },
  ];

  const socials = [
    { key: "twitter", label: "Twitter", color: "#22D3EE" },
    { key: "instagram", label: "Instagram", color: "#EC4899" },
    { key: "linkedin", label: "LinkedIn", color: "#3B82F6" },
    { key: "github", label: "GitHub", color: "#8B5CF6" },
  ];

  const tabs = [
    { id: "posts", label: "Posts", count: user.posts?.length || 0 },
    { id: "about", label: "About", count: null },
    { id: "activity", label: "Activity", count: null },
  ];

  const completionScore = (() => {
    let s = 20;
    if (user.profilePic) s += 15;
    if (user.coverPic) s += 10;
    if (user.bio) s += 15;
    if (user.location) s += 10;
    if (user.website) s += 10;
    if (user.interests?.length) s += 10;
    if (user.socialLinks && Object.values(user.socialLinks).some((l) => l)) s += 10;
    return Math.min(s, 100);
  })();

  return (
    <div className="min-h-screen bg-[#05070A] relative overflow-hidden">
      <div className="bg-app-fixed" />

      <div className="relative z-10 max-w-5xl mx-auto p-4 md:p-6">
        {/* ───── COVER PHOTO ───── */}
        <div className="relative h-52 md:h-72 rounded-2xl overflow-hidden bg-gradient-to-br from-[#7C3AED]/25 via-[#3B82F6]/15 to-[#22D3EE]/15 border border-[#18202B] animate-fadeUp group">
          {user.coverPic && (
            <img
              src={user.coverPic}
              alt="Cover"
              className="w-full h-full object-cover cursor-pointer"
              onClick={() => setShowImage(user.coverPic)}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#05070A]/70 via-transparent to-transparent" />

          <button
            onClick={() => coverInputRef.current?.click()}
            disabled={uploading}
            className="absolute top-4 right-4 flex items-center gap-2 px-3.5 py-2 rounded-lg bg-black/50 hover:bg-black/70 backdrop-blur-md border border-white/10 text-white text-xs font-medium transition-all disabled:opacity-50 z-10"
          >
            {uploading ? (
              <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <Camera className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">Edit Cover</span>
          </button>
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => handlePhotoUpload(e, "cover")}
            className="hidden"
            disabled={uploading}
          />
        </div>

        {/* ───── PROFILE HEADER ───── */}
        <div className="flex flex-col md:flex-row md:items-end gap-5 -mt-16 md:-mt-20 mb-8 relative z-20 animate-fadeUp">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
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

            <button
              onClick={() => profileInputRef.current?.click()}
              disabled={uploading}
              className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#3B82F6] border-2 border-[#05070A] flex items-center justify-center cursor-pointer hover:scale-110 transition-transform shadow-lg disabled:opacity-50 z-10"
            >
              {uploading ? (
                <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <Camera className="w-3.5 h-3.5 text-white" />
              )}
            </button>
            <input
              ref={profileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handlePhotoUpload(e, "profile")}
              className="hidden"
              disabled={uploading}
            />

            <span className="absolute bottom-2 right-11 w-5 h-5 bg-[#10B981] border-4 border-[#05070A] rounded-full" />
          </div>

          {/* Info Card */}
          <div className="flex-1 card-static p-5 md:p-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1.5">
                  <h1 className="heading-lg text-white truncate">
                    {user.fullname || user.username}
                  </h1>
                  {user.isVerified && (
                    <CheckCircle2 className="w-5 h-5 text-[#3B82F6] flex-shrink-0" />
                  )}
                </div>

                <div className="flex items-center gap-3 text-sm mb-3">
                  <span className="text-[#8B5CF6]">@{user.username}</span>
                  {user.location && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-[#293445]" />
                      <span className="text-[#A1A1AA] flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {user.location}
                      </span>
                    </>
                  )}
                </div>

                {user.bio && (
                  <p className="text-sm text-[#A1A1AA] leading-relaxed max-w-2xl line-clamp-2">
                    {user.bio}
                  </p>
                )}
              </div>

              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className={isEditing ? "btn-secondary" : "btn-primary"}
                >
                  {isEditing ? (
                    <>
                      <X className="w-4 h-4" />
                      Cancel
                    </>
                  ) : (
                    <>
                      <Edit3 className="w-4 h-4" />
                      Edit Profile
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ───── PROFILE COMPLETION ───── */}
        {!isEditing && completionScore < 100 && (
          <div className="card-static p-4 mb-6 animate-fadeUp delay-1">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-[#F59E0B]/10 border border-[#F59E0B]/30 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-[#F59E0B]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-sm font-semibold text-white">
                    Profile completion
                  </p>
                  <span className="text-sm font-bold text-[#F59E0B]">
                    {completionScore}%
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-[#18202B] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#7C3AED] to-[#3B82F6] transition-all duration-500"
                    style={{ width: `${completionScore}%` }}
                  />
                </div>
              </div>
              <button
                onClick={() => setIsEditing(true)}
                className="text-xs text-[#8B5CF6] hover:text-[#A78BFA] font-medium flex-shrink-0"
              >
                Complete now
              </button>
            </div>
          </div>
        )}

        {/* ───── STATS ───── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 animate-fadeUp delay-2">
          {stats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>

        {/* ───── EDIT FORM ───── */}
        {isEditing && (
          <div className="card-static p-6 md:p-8 mb-8 animate-scaleIn">
            <div className="flex items-center gap-3 mb-7 pb-5 border-b border-[#111820]">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#3B82F6] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="heading-md text-white">Edit Profile</h2>
                <p className="text-xs text-[#71717A] mt-0.5">
                  Keep your profile up to date
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Section: Basic Info */}
              <div>
                <h3 className="text-xs font-semibold text-[#71717A] uppercase tracking-widest mb-4">
                  Basic Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Full Name" icon={User}>
                    <input
                      type="text"
                      name="fullname"
                      value={formData.fullname}
                      onChange={handleInputChange}
                      className="input-icon"
                      placeholder="Enter your full name"
                      style={{ paddingLeft: '16px' }}
                    />
                    {formErrors.fullname && (
                      <p className="text-[10px] text-[#F43F5E] mt-1">
                        {formErrors.fullname}
                      </p>
                    )}
                  </Field>

                  <Field label="Username" icon={AtSign}>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="input"
                      placeholder="Choose a username"
                    />
                    {formErrors.username && (
                      <p className="text-[10px] text-[#F43F5E] mt-1">
                        {formErrors.username}
                      </p>
                    )}
                  </Field>
                </div>

                <div className="mt-4">
                  <Field
                    label="Bio"
                    icon={MessageSquare}
                    hint={`${formData.bio.length}/500 characters`}
                  >
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      rows={4}
                      maxLength={500}
                      className="input resize-none"
                      placeholder="Tell people about yourself..."
                    />
                  </Field>
                </div>
              </div>

              {/* Section: Contact */}
              <div className="pt-6 border-t border-[#111820]">
                <h3 className="text-xs font-semibold text-[#71717A] uppercase tracking-widest mb-4">
                  Contact Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Location" icon={MapPin}>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="input"
                      placeholder="City, Country"
                    />
                  </Field>

                  <Field label="Phone" icon={Globe}>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="input"
                      placeholder="+1 555 000 0000"
                    />
                  </Field>

                  <Field label="Website" icon={Globe}>
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      className="input"
                      placeholder="https://yourwebsite.com"
                    />
                  </Field>

                  <Field label="Date of Birth" icon={Calendar}>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      className="input"
                    />
                  </Field>
                </div>
              </div>

              {/* Section: Interests */}
              <div className="pt-6 border-t border-[#111820]">
                <h3 className="text-xs font-semibold text-[#71717A] uppercase tracking-widest mb-4">
                  Interests
                </h3>

                <Field
                  label="Your Interests"
                  icon={Heart}
                  hint="Separate with commas"
                >
                  <input
                    type="text"
                    name="interests"
                    value={formData.interests}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="Technology, Music, Travel, Photography"
                  />
                </Field>
              </div>

              {/* Section: Social Links */}
              <div className="pt-6 border-t border-[#111820]">
                <h3 className="text-xs font-semibold text-[#71717A] uppercase tracking-widest mb-4">
                  Social Links
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {socials.map((s) => (
                    <Field key={s.key} label={s.label} icon={Link2}>
                      <input
                        type="url"
                        name={`socialLinks.${s.key}`}
                        value={formData.socialLinks[s.key]}
                        onChange={handleInputChange}
                        className="input"
                        placeholder={`https://${s.key}.com/username`}
                      />
                    </Field>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3 pt-4 border-t border-[#111820]">
                <button type="submit" disabled={loading} className="btn-primary">
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

        {/* ───── TABS ───── */}
        {!isEditing && (
          <>
            <div className="flex items-center gap-1 mb-5 border-b border-[#111820] animate-fadeUp">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? "text-white"
                      : "text-[#71717A] hover:text-[#A1A1AA]"
                  }`}
                >
                  {tab.label}
                  {tab.count !== null && (
                    <span className="ml-1.5 text-xs text-[#71717A]">
                      {tab.count}
                    </span>
                  )}
                  {activeTab === tab.id && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#7C3AED] to-[#3B82F6] rounded-t-full" />
                  )}
                </button>
              ))}
            </div>

            {/* ───── TAB: ABOUT ───── */}
            {activeTab === "about" && (
              <div className="space-y-5 animate-fadeUp">
                {/* Contact Info Grid */}
                <div className="card-static p-6">
                  <h3 className="heading-sm text-white mb-5">
                    Contact Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { icon: AtSign, label: "Username", value: `@${user.username}` },
                      { icon: MapPin, label: "Location", value: user.location },
                      { icon: Globe, label: "Website", value: user.website, link: true },
                      { icon: Calendar, label: "Born", value: user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : null },
                    ]
                      .filter((i) => i.value)
                      .map((item) => (
                        <div key={item.label} className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-lg bg-[#0F141C] border border-[#18202B] flex items-center justify-center flex-shrink-0">
                            <item.icon className="w-4 h-4 text-[#8B5CF6]" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px] uppercase tracking-wider text-[#71717A] mb-0.5">
                              {item.label}
                            </p>
                            {item.link ? (
                              <a
                                href={item.value}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-[#A1A1AA] hover:text-[#8B5CF6] truncate block"
                              >
                                {item.value}
                              </a>
                            ) : (
                              <p className="text-sm text-[#A1A1AA] truncate">
                                {item.value}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Interests */}
                {user.interests?.length > 0 && (
                  <div className="card-static p-6">
                    <h3 className="heading-sm text-white mb-4">Interests</h3>
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

                {/* Socials */}
                {user.socialLinks && Object.values(user.socialLinks).some((l) => l) && (
                  <div className="card-static p-6">
                    <h3 className="heading-sm text-white mb-4">
                      Social Profiles
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {socials.map((s) =>
                        user.socialLinks[s.key] && (
                          <a
                            key={s.key}
                            href={user.socialLinks[s.key]}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 rounded-xl bg-[#0F141C] border border-[#18202B] hover:border-[#293445] transition-all"
                          >
                            <div
                              className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                              style={{ background: `${s.color}15` }}
                            >
                              <Link2
                                className="w-4 h-4"
                                style={{ color: s.color }}
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-white">
                                {s.label}
                              </p>
                              <p className="text-[10px] text-[#71717A] truncate">
                                {user.socialLinks[s.key]}
                              </p>
                            </div>
                          </a>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ───── TAB: POSTS ───── */}
            {activeTab === "posts" && (
              <div className="space-y-4">
                {user.posts?.length > 0 ? (
                  user.posts.map((post, i) => (
                    <article
                      key={post._id}
                      className="card-static p-5 animate-fadeUp"
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
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(openMenuId === post._id ? null : post._id);
                            }}
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                          {openMenuId === post._id && (
                            <div
                              className="absolute right-0 top-9 w-40 bg-[#0F141C] border border-[#18202B] rounded-xl overflow-hidden z-20 shadow-2xl"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                onClick={() => handleEdit(post._id, post.content, post.image, post.video)}
                                className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-[#A1A1AA] hover:bg-white/[0.03]"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(post._id)}
                                className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-[#F43F5E] hover:bg-[#F43F5E]/5"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Delete
                              </button>
                              <button className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-[#A1A1AA] hover:bg-white/[0.03]">
                                <Share2 className="w-3.5 h-3.5" />
                                Share
                              </button>
                              <button className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-[#A1A1AA] hover:bg-white/[0.03]">
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
                          <div className="flex gap-2">
                            <button onClick={handleSaveEdit} className="btn-primary text-xs py-2">
                              Save
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
                      Share your first thought with the community
                    </p>
                    <Link to="/create-post" className="btn-primary">
                      <Sparkles className="w-4 h-4" />
                      Create Post
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* ───── TAB: ACTIVITY ───── */}
            {activeTab === "activity" && (
              <div className="card-static p-8 text-center animate-fadeUp">
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-[#0F141C] border border-[#18202B] flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-[#22D3EE]" />
                </div>
                <h4 className="heading-sm text-white mb-1">Activity Feed</h4>
                <p className="text-sm text-[#71717A]">
                  Your likes, comments, and shares will appear here
                </p>
              </div>
            )}
          </>
        )}
      </div>

      <ToastContainer position="top-right" theme="dark" />
    </div>
  );
};

export default ProfileUpdate;