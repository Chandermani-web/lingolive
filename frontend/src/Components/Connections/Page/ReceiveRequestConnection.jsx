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

  if (loading) return <div className="bg-gradient-to-br from-gray-900 via-gray-950 to-black min-h-screen text-gray-100"> Loading...</div>;

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
      <h1 className="col-span-full text-2xl font-bold text-white">Received Connection Requests</h1>
      {requests.length > 0 ? (
        requests.map((req) => (
          <div
          className="bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300"
          >
            <div className="h-24 w-full overflow-hidden">
              <img
                src={req.sender.coverPic || "/cover.jpg"}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="p-5 text-white">
              <div className="flex items-center space-x-4">
                <img
                  src={req.sender.profilePic || "/avatar.svg"}
                  alt={req.sender.fullname}
                  className="w-16 h-16 rounded-full border-4 border-green-500 object-cover -mt-10"
                />
                <div>
                  <h3 className="font-semibold text-lg cursor-pointer hover:underline" onClick={() => navigate(`/profile/${req.sender._id}`)}>{req.sender.fullname}</h3>
                  <p className="text-sm text-blue-400 cursor-pointer hover:underline" onClick={() => navigate(`/profile/${req.sender._id}`)}>@{req.sender.username}</p>
                </div>
              </div>

              <p className="text-sm text-gray-300 mt-2 line-clamp-2">
                {req.sender.bio || "No bio available"}
              </p>

              {/* Email & Location */}
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex flex-col space-y-1">
                    <p className="text-xs text-gray-400">{req.sender.email}</p>
                    {req.sender.location && (
                      <p className="text-xs text-gray-400">📍 {req.sender.location}</p>
                    )}
                  </div>
                </div>

              <div className="mt-4 flex space-x-2">
                <button
                  className="mt-4 bg-gradient-to-r from-blue-500 to-indigo-400 hover:from-green-600 hover:to-teal-500 text-white py-2 px-4 rounded-xl w-full font-semibold shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center"
                  onClick={() => handleAcceptRequest(req._id)}
                >
                  Accept
                </button>
                <button
                  className="mt-4 bg-gradient-to-r from-red-600 to-red-400 hover:from-green-600 hover:to-teal-500 text-white py-2 px-4 rounded-xl w-full font-semibold shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center"
                  onClick={() => handleRejectRequest(req._id)}
                >
                  Decline
                </button>
              </div>
            </div>
          </div>
        ))
      ) : (
        <p className="text-gray-400 col-span-full text-center">No connection requests.</p>
      )}
    </div>
  );
};

export default ReceiveRequestConnection;
