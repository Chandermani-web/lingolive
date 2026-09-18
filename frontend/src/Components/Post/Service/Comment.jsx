import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Send, MoreVertical, Trash2 } from "lucide-react";
import AppContext from "../../../Context/UseContext";

const Comment = ({ id }) => {
  const navigate = useNavigate();
  const [comment, setComment] = useState("");
  const [menuOpen, setMenuOpen] = useState(null);
  const [loading, setLoading] = useState(false);
  const { comments, setComments, user, BASE_URL } = useContext(AppContext);

  const handleComment = async () => {
    if (!comment.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/posts/${id}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ text: comment }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to add comment");

      if (data.comment) setComments((prev) => [...prev, data.comment]);
      else if (data.updatedComments) setComments(data.updatedComments);

      setComment("");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (commentId) => {
    try {
      const res = await fetch(`${BASE_URL}/api/posts/${id}/comment/${commentId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete comment");
      setComments((prev) => prev.filter((c) => c._id !== commentId));
      setMenuOpen(null);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-3">
      {/* Input */}
      <div className="flex items-start gap-2">
        <img
          src={user?.profilePic || "/avatar.svg"}
          alt=""
          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
        />
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Write a comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleComment()}
            className="input py-2.5 pr-11 text-sm"
          />
          <button
            onClick={handleComment}
            disabled={loading || !comment.trim()}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#3B82F6] text-white disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar">
        {comments?.length > 0 ? (
          comments.map((cmt) => (
            <div
              key={cmt._id}
              className="flex items-start gap-2.5 p-2.5 rounded-lg bg-[#0F141C] border border-[#111820] group hover:border-[#18202B] transition-colors"
            >
              <img
                src={cmt?.user?.profilePic || "/avatar.svg"}
                alt=""
                className="w-7 h-7 rounded-full object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <button
                    onClick={() => navigate(`/profile/${cmt.user?._id}`)}
                    className="text-xs font-semibold text-[#8B5CF6] hover:text-[#A78BFA] transition-colors"
                  >
                    @{cmt.user?.username}
                  </button>
                  <span className="text-[10px] text-muted">
                    {new Date(cmt.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-secondary break-words">{cmt.text}</p>
              </div>

              {cmt.user?._id === user?._id && (
                <div className="relative">
                  <button
                    onClick={() => setMenuOpen(menuOpen === cmt._id ? null : cmt._id)}
                    className="p-1 text-muted hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreVertical className="w-3.5 h-3.5" />
                  </button>
                  {menuOpen === cmt._id && (
                    <div className="absolute right-0 top-6 w-24 bg-[#0F141C] border border-[#18202B] rounded-lg overflow-hidden z-10 shadow-xl">
                      <button
                        onClick={() => handleDelete(cmt._id)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#F43F5E] hover:bg-[#F43F5E]/5 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="text-xs text-muted text-center py-4">
            No comments yet. Start the conversation.
          </p>
        )}
      </div>
    </div>
  );
};

export default Comment;