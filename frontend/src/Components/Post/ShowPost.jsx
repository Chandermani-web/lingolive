import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ThumbsUp, MessageCircle, MoreHorizontal } from "lucide-react";
import AppContext from "../../Context/UseContext";
import Comment from "./Service/Comment";
import { useSocket } from "../../Context/SocketContext";

const ShowPost = () => {
  const [openCommentBoxId, setOpenCommentBoxId] = useState(null);
  const [expandedPostId, setExpandedPostId] = useState(null);
  const {
    posts, user, setPosts, setComments,
    setCommentIdForFetching, setShowImage, BASE_URL,
  } = useContext(AppContext);
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;
    socket.on("newPost", (post) => setPosts((prev) => [post, ...prev]));
    socket.on("updateLikes", ({ postId, likes }) => {
      setPosts((prev) => prev.map((p) => (p._id === postId ? { ...p, likes } : p)));
    });
    socket.on("newComment", ({ postId, comment }) => {
      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId
            ? { ...p, comments: [...(p.comments || []), comment] }
            : p
        )
      );
      setComments((prev) => [...prev, comment]);
    });
    socket.on("deleteComment", ({ postId, commentId, updatedComments }) => {
      setPosts((prev) =>
        prev.map((p) => (p._id === postId ? { ...p, comments: updatedComments } : p))
      );
      setComments((prev) => prev.filter((c) => c._id !== commentId));
    });
    return () => {
      socket.off("newPost");
      socket.off("updateLikes");
      socket.off("newComment");
      socket.off("deleteComment");
    };
  }, [socket, setPosts]);

  const handleLike = async (postId) => {
    try {
      const response = await fetch(
        `${BASE_URL}/api/posts/${encodeURIComponent(postId)}/likeandunlike`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to like post");
      if (data.success) {
        setPosts(
          posts.map((post) =>
            post._id === postId ? { ...post, likes: data.updatedLikes } : post
          )
        );
      }
    } catch (err) {
      console.error("Error liking post:", err);
    }
  };

  if (!posts) {
    return (
      <div className="text-center py-8 text-muted text-sm">
        Please log in to view posts.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post, i) => (
        <article
          key={post._id}
          className="card-static p-5 animate-fadeUp"
          style={{ animationDelay: `${i * 0.05}s` }}
        >
          {/* Header */}
          <header className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={post.profilePic || post.user?.profilePic || "/avatar.svg"}
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover cursor-pointer"
                  onClick={() => setShowImage(post.profilePic || post.user?.profilePic)}
                />
                <span
                  className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#0A0E14]"
                  style={{ background: "#10B981" }}
                />
              </div>
              <div>
                <Link
                  to={`/profile/${post.user?._id}`}
                  className="text-sm font-semibold text-white hover:text-[#8B5CF6] transition-colors"
                >
                  @{post.user?.username}
                </Link>
                <p className="text-[11px] text-muted">
                  {new Date(post.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
            <button className="btn-ghost p-1.5">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </header>

          {/* Content */}
          <div className="mb-3">
            <p
              className={`text-sm text-secondary leading-relaxed ${
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
                className="text-xs text-[#8B5CF6] hover:text-[#A78BFA] mt-1.5 font-medium transition-colors"
              >
                {expandedPostId === post._id ? "Show less" : "Read more"}
              </button>
            )}
          </div>

          {/* Media */}
          {post.image && (
            <img
              src={post.image}
              alt="Post"
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
                post.likes?.includes(user?._id)
                  ? "text-[#3B82F6]"
                  : "text-secondary hover:text-white hover:bg-white/[0.03]"
              }`}
            >
              <ThumbsUp
                className={`w-4 h-4 ${
                  post.likes?.includes(user?._id) ? "fill-current" : ""
                }`}
              />
              <span className="font-medium">{post.likes?.length || 0}</span>
            </button>

            <button
              onClick={() => {
                setOpenCommentBoxId(openCommentBoxId === post._id ? null : post._id);
                setCommentIdForFetching(post._id);
              }}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-secondary hover:text-white hover:bg-white/[0.03] transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="font-medium">{post.comments?.length || 0}</span>
            </button>
          </div>

          {/* Comments */}
          {openCommentBoxId === post._id && (
            <div className="mt-3 pt-3 border-t border-[#111820] animate-fadeUp">
              <Comment id={post._id} />
            </div>
          )}
        </article>
      ))}
    </div>
  );
};

export default ShowPost;