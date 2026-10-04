import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, X, MapPin, Target } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import AppContext from "../../../Context/UseContext";

const ReceiveRequestConnection = () => {
  const { requests, setRequests, fetchFriendRequests, loading, BASE_URL } = useContext(AppContext);
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(null);

  useEffect(() => {
    fetchFriendRequests();
  }, []);

  if (loading || requests.length === 0) return null;

  const handleAccept = async (requestId) => {
    setProcessing(requestId);
    try {
      const res = await fetch(`${BASE_URL}/api/friends/accept-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ requestId }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Request accepted");
        setRequests((prev) => prev.filter((r) => r._id !== requestId));
      } else {
        toast.error(data.message || "Failed");
      }
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (requestId) => {
    setProcessing(requestId);
    try {
      const res = await fetch(`${BASE_URL}/api/friends/reject-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ requestId }),
      });
      if (res.ok) {
        toast.info("Request declined");
        setRequests((prev) => prev.filter((r) => r._id !== requestId));
      }
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {requests.map((req, i) => (
        <div
          key={req._id}
          className="card p-4 animate-fadeUp"
          style={{ animationDelay: `${i * 0.05}s` }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="relative flex-shrink-0">
              <img
                src={req.sender.profilePic || "/avatar.svg"}
                alt=""
                className="w-12 h-12 rounded-full object-cover border-2 border-[#10B981]/30 cursor-pointer"
                onClick={() => navigate(`/profile/${req.sender._id}`)}
              />
              <span className="status-dot-online border-[#0A0E14]" />
            </div>
            <div className="flex-1 min-w-0">
              <h3
                className="text-sm font-semibold text-white truncate cursor-pointer hover:text-[#10B981] transition-colors"
                onClick={() => navigate(`/profile/${req.sender._id}`)}
              >
                {req.sender.fullname}
              </h3>
              <p className="text-xs text-muted truncate">@{req.sender.username}</p>
            </div>
          </div>

          {req.sender.bio && (
            <p className="text-xs text-secondary line-clamp-2 mb-3">
              {req.sender.bio}
            </p>
          )}

          {req.sender.location && (
            <div className="flex items-center gap-1.5 text-[10px] text-muted mb-3">
              <MapPin className="w-3 h-3" />
              <span className="truncate">{req.sender.location}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleAccept(req._id)}
              disabled={processing === req._id}
              className="btn-primary text-xs py-2.5"
              style={{ background: "linear-gradient(135deg, #22C55E, #10B981)" }}
            >
              {processing === req._id ? (
                <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Accept
                </>
              )}
            </button>
            <button
              onClick={() => handleReject(req._id)}
              disabled={processing === req._id}
              className="btn-ghost text-xs py-2.5 border border-[#F43F5E]/20 text-[#F43F5E] hover:bg-[#F43F5E]/5"
            >
              <X className="w-3.5 h-3.5" />
              Decline
            </button>
          </div>
        </div>
      ))}
      <ToastContainer position="top-right" theme="dark" />
    </div>
  );
};

export default ReceiveRequestConnection;