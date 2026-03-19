import 'remixicon/fonts/remixicon.css';
import { useContext, useEffect } from "react";
import AppContext from '../../../Context/UseContext';
import { useNavigate } from 'react-router-dom';

const ReceiveRequestConnection = () => {
  const { requests, setRequests, fetchFriendRequests, loading } = useContext(AppContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFriendRequests();
  }, []);

  if (loading) return <div className="bg-gradient-to-br from-[var(--color-primary)] via-[var(--color-secondary)] to-[var(--color-primary)] min-h-screen text-[var(--color-text)]"> Loading...</div>;

  const handleAcceptRequest = async (requestId) => {
    try {
      const res = await fetch("https://lingolive.onrender.com/api/friends/accept-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ requestId }),
      });

      const data = await res.json();
      ("Friend request accepted:", data);

      // Remove from UI
      setRequests((prev) => prev.filter((r) => r._id !== requestId));
    } catch (err) {
      console.error("Error accepting friend request:", err);
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      const res = await fetch("https://lingolive.onrender.com/api/friends/reject-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ requestId }),
      });
      const data = await res.json();
      ("Friend request rejected:", data);

      // Remove from UI
      setRequests((prev) => prev.filter((r) => r._id !== requestId));
    }catch (err) {
      console.error("Error rejecting friend request:", err);
    }
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
      <h1 className="col-span-full text-2xl font-bold text-[var(--color-text)]">Received Connection Requests</h1>
      {requests.length > 0 ? (
        requests.map((req) => (
          <div
          className="bg-gradient-to-br from-[var(--color-secondary)] via-[var(--color-secondary)] to-[var(--color-primary)] rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300"
          >
            <div className="h-24 w-full overflow-hidden">
              <img
                src={req.sender.coverPic || "/cover.jpg"}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="p-5 text-[var(--color-text)]">
              <div className="flex items-center space-x-4">
                <img
                  src={req.sender.profilePic || "/avatar.svg"}
                  alt={req.sender.fullname}
                  className="w-16 h-16 rounded-full border-4 border-[var(--color-accent)] object-cover -mt-10"
                />
                <div>
                  <h3 className="font-semibold text-lg cursor-pointer hover:underline" onClick={() => navigate(`/profile/${req.sender._id}`)}>{req.sender.fullname}</h3>
                  <p className="text-sm text-[var(--color-highlight)] cursor-pointer hover:underline" onClick={() => navigate(`/profile/${req.sender._id}`)}>@{req.sender.username}</p>
                </div>
              </div>

              <p className="text-sm text-[var(--color-muted)] mt-2 line-clamp-2">
                {req.sender.bio || "No bio available"}
              </p>

              {/* Email & Location */}
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex flex-col space-y-1">
                    <p className="text-xs text-[var(--color-muted)]">{req.sender.email}</p>
                    {req.sender.location && (
                      <p className="text-xs text-[var(--color-muted)]">📍 {req.sender.location}</p>
                    )}
                  </div>
                </div>

              <div className="mt-4 flex space-x-2">
                <button
                  className="mt-4 bg-gradient-to-r from-[var(--color-secondary)] to-[var(--color-highlight)] hover:from-[var(--color-accent)] hover:to-[var(--color-highlight)] text-[var(--color-text)] py-2 px-4 rounded-xl w-full font-semibold shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center"
                  onClick={() => handleAcceptRequest(req._id)}
                >
                  Accept
                </button>
                <button
                  className="mt-4 bg-gradient-to-r from-red-600 to-red-400 hover:from-[var(--color-accent)] hover:to-[var(--color-highlight)] text-[var(--color-text)] py-2 px-4 rounded-xl w-full font-semibold shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center"
                  onClick={() => handleRejectRequest(req._id)}
                >
                  Decline
                </button>
              </div>
            </div>
          </div>
        ))
      ) : (
        <p className="text-[var(--color-muted)] col-span-full text-center">No connection requests.</p>
      )}
    </div>
  );
};

export default ReceiveRequestConnection;
