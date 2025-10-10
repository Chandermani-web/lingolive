import { useContext } from "react";
import AppContext from "../../../Context/UseContext";
import { useNavigate } from "react-router-dom";

const SendRequestConnection = () => {
  const { user } = useContext(AppContext);
  const navigate = useNavigate();

  // Extract IDs for easier comparison
  const friendIds = user.friends.map((f) => f._id);

  // Filter out users who are followed but not yet friends
  const sendRequest = user.following.filter((u) => !friendIds.includes(u._id));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
      <h1 className="col-span-full text-2xl font-bold text-white">
        Sent Connection Requests
      </h1>
      {sendRequest.map((u) => (
        <div
          key={u._id}
          className="bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300"
        >
          <div className="h-24 w-full overflow-hidden">
            <img
              src={u.coverPic || "/default-cover.jpg"}
              alt="Cover"
              className="w-full h-full object-cover brightness-90 hover:brightness-100 transition-all duration-300"
            />
          </div>

          <div className="p-5 text-white">
            <div className="flex items-center space-x-4">
              <img
                src={u.profilePic || "/avatar.svg"}
                alt={u.fullname}
                className="w-14 h-14 rounded-full object-cover border-4 border-indigo-500 -mt-10"
              />
              <div>
                <h3
                  className="font-bold text-lg text-white cursor-pointer hover:underline"
                  onClick={() => navigate(`/profile/${u._id}`)}
                >
                  {u.fullname}
                </h3>
                <p
                  className="text-sm text-indigo-400 cursor-pointer hover:underline"
                  onClick={() => navigate(`/profile/${u._id}`)}
                >
                  @{u.username}
                </p>
              </div>
            </div>

            <p className="text-sm text-gray-300 mt-2 line-clamp-2">
              {u.bio || "No bio available"}
            </p>

            {/* Email & Location */}
            <div className="mt-3 flex items-center justify-between">
              <div className="flex flex-col space-y-1">
                <p className="text-xs text-gray-400">{u.email}</p>
                {u.location && (
                  <p className="text-xs text-gray-400">📍 {u.location}</p>
                )}
              </div>
            </div>

            <button className="mt-4 bg-gradient-to-r from-gray-500 to-zinc-400 hover:from-green-600 hover:to-teal-500 text-white py-2 px-4 rounded-xl w-full font-semibold shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center">
              <i className="ri-user-add-line mr-2"></i>
              Following
            </button>
          </div>
        </div>
      ))}

      {sendRequest.length === 0 && (
        <p className="text-gray-400 col-span-full text-center">
          No connection send.
        </p>
      )}
    </div>
  );
};

export default SendRequestConnection;
