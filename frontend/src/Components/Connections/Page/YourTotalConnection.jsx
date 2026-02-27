import { useContext, useEffect } from "react";
import AppContext from "../../../Context/UseContext";
import { useNavigate } from "react-router-dom";

const YourTotalConnection = () => {
  const { friendList, fetchFriendlist, loading } = useContext(AppContext);
  const navigate = useNavigate();
  ("Friend List in YourTotalConnection:", friendList);

  useEffect(() => {
    fetchFriendlist();
  }, []);

  if (!friendList) {
    return <div>Loading...</div>;
  }

  if (loading)
    return (
      <div className="bg-gradient-to-br from-gray-900 via-gray-950 to-black min-h-screen text-gray-100">
        {" "}
        Loading...
      </div>
    );

    const handleRemoveFriend = async (friendId) => {
      try{
        const response = await fetch(`https://lingolive.onrender.com/api/friends/remove-friend`, {
          method: "DELETE",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ friendId }),
        });
        if (!response.ok) {
          throw new Error("Failed to remove friend");
        }
        fetchFriendlist(); // Refresh the friend list after removal
      } catch (err) {
        console.error("Error removing friend:", err);
      }
    }

  return (
    <div className="grid grid-cols-1 gap-6 p-4">
      <h1 className="col-span-full text-2xl font-bold text-white">
        Your Total Connections
      </h1>
      {friendList.length > 0 ? (
        friendList.map((friend) => (
          <div
            key={friend._id}
            className="bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300"
          >
            <div className="p-4 text-white flex justify-around items-center">
              <div className="flex items-center space-x-3 flex-1">
                <img
                  src={friend.profilePic || "/avatar.svg"}
                  alt={friend.fullname}
                  className="w-14 h-14 rounded-full object-cover border-4 border-indigo-400 cursor-pointer hover:scale-105 transition-transform duration-300"
                />
                <div className="flex flex-col">
                  <h3
                    className="font-semibold text-lg cursor-pointer hover:underline"
                    onClick={() => {
                      navigate(`/profile/${friend._id}`);
                    }}
                  >
                    {friend.fullname}
                  </h3>
                  <p
                    className="text-sm text-indigo-400 cursor-pointer hover:underline"
                    onClick={() => {
                      navigate(`/profile/${friend._id}`);
                    }}
                  >
                    @{friend.username}
                  </p>
                </div>
              </div>

              <div className="flex gap-5">
                <button className="mt-4 bg-gradient-to-r from-blue-500 to-indigo-400 hover:from-green-600 hover:to-teal-500 text-white py-2 px-4 rounded-xl w-full font-semibold shadow-md hover:shadow-lg transition-all duration-300 flex-1" onClick={()=>{
                  navigate(`/message/${friend._id}`)
                }}>
                  Message
                </button>
                <button 
                  className="mt-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-2 px-4 rounded-xl w-full font-semibold shadow-md hover:shadow-lg transition-all duration-300 flex-1" 
                  onClick={() => handleRemoveFriend(friend._id)}
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))
      ) : (
        <p className="text-gray-400 col-span-full text-center">
          No connection requests.
        </p>
      )}
    </div>
  );
};

export default YourTotalConnection;
