import { useEffect, useState } from "react";
import Sidebar from "../Components/Connections/Sidebar";
import ShowAllUser from "../Components/Connections/Page/ShowAllUser";
import YourTotalConnection from "../Components/Connections/Page/YourTotalConnection";
import SendRequestConnection from "../Components/Connections/Page/SendRequestConnection";
import ReceiveRequestConnection from "../Components/Connections/Page/ReceiveRequestConnection";
import AppContext from "../Context/UseContext";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";

const Connection = () => {
  const navigate = useNavigate();
  const [displayName, setdisplayName] = useState(1);
  const { requests, loading, user, allUser, setShowImage } =
    useContext(AppContext);
  const [requestBarOpen, setRequestBarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResult, setSearchResult] = useState("");

  const values = [
    { id: 1, element: <ShowAllUser />, name: "Discover People", icon: "🔍" },
    {
      id: 2,
      element: <YourTotalConnection />,
      name: "My Connections",
      icon: "👥",
    },
    {
      id: 3,
      element: <SendRequestConnection />,
      name: "Sent Requests",
      icon: "📤",
    },
  ];

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setRequestBarOpen(true);
      } else {
        setRequestBarOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    // You can implement search functionality here
    const searchUser = allUser.filter(
      (u) =>
        u.username.toLowerCase().includes(e.target.value.toLowerCase()) ||
        u.fullname.toLowerCase().includes(e.target.value.toLowerCase())
    );
    setSearchResult(searchUser);
  };

  if (loading)
    return (
      <div className="bg-[var(--color-primary)] min-h-screen text-[var(--color-text)] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-accent)] mb-4"></div>
          <p className="text-lg">Loading your connections...</p>
        </div>
      </div>
    );

  return (
    <div className="grid lg:grid-cols-4 sm:grid-cols-1 gap-4 mt-5 lg:mx-10 min-h-screen">
      {/* Enhanced Sidebar Section */}
      <div className="md:mx-2 md:space-y-4 lg:sticky lg:top-0">
        {/* User Profile Card */}
        <div className="bg-[var(--color-primary)] md:rounded-xl p-4 border border-[var(--color-secondary)] shadow-lg md:block hidden">
          <div className="flex items-center space-x-3 mb-3">
            <div className="relative">
              <img
                src={user?.profilePic || "/avatar.svg"}
                alt=""
                className="w-12 h-12 rounded-full"
                onClick={() => setShowImage(user?.profilePic || "/avatar.svg")}
              />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[var(--color-secondary)]"></div>
            </div>
            <div className="flex-1">
              <h3 className="text-[var(--color-text)] font-semibold">
                @{user?.username || "User"}
              </h3>
              <p className="text-xs line-clamp-1">{user?.bio}</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-[var(--color-secondary)]/75 rounded p-2">
              <p className="text-[var(--color-text)] font-bold">{user?.friends.length}</p>
              <p className="text-[var(--color-muted)]">Connections</p>
            </div>
            <div className="bg-[var(--color-secondary)]/75 rounded p-2">
              <p className="text-[var(--color-text)] font-bold">{user?.following.length}</p>
              <p className="text-[var(--color-muted)]">Post</p>
            </div>
            <div className="bg-[var(--color-secondary)]/75 rounded p-2">
              <p className="text-[var(--color-text)] font-bold">0</p>
              <p className="text-[var(--color-muted)]">Groups</p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-[var(--color-primary)] md:rounded-xl p-3 border border-[var(--color-secondary)]">
          <div className="relative">
            <input
              type="text"
              placeholder="Search connections..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full bg-[var(--color-secondary)] text-[var(--color-text)] rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-highlight)]"
            />
            <div className="absolute left-3 top-2.5 text-[var(--color-muted)]">🔍</div>
            <div className="relative flex flex-col">
              {searchTerm && (
                <div className="absolute bg-[var(--color-secondary)] border border-[var(--color-secondary)] rounded-lg mt-1 w-full overflow-y-auto z-10">
                  {searchResult.length > 0 ? (
                    <>
                      {searchResult.map((user) => (
                        <div
                          key={user._id}
                          className="flex items-center p-2 hover:bg-[var(--color-secondary)]/75 cursor-pointer"
                          onClick={() => {
                            navigate(`/profile/${user._id}`);
                            setSearchTerm("");
                            setSearchResult([]);
                          }}
                        >
                          <img
                            src={user.profilePic || "/avatar.svg"}
                            alt=""
                            className="w-8 h-8 rounded-full mr-3"
                          />
                          <div>
                            <p className="text-[var(--color-text)] text-sm font-medium">
                              @{user.username}
                            </p>
                            <p className="text-[var(--color-muted)] text-xs line-clamp-1">
                              {user.fullname}
                            </p>
                          </div>
                        </div>
                      ))}
                    </>
                  ) : (
                    "No Results Found"
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Sidebar */}
        <Sidebar setdisplayName={setdisplayName} displayName={displayName} />

        {/* Quick Actions */}
        {/* <div className="bg-[var(--color-secondary)] md:rounded-xl p-4 border border-[var(--color-secondary)] md:block hidden">
          <h3 className="text-[var(--color-text)] font-semibold text-sm mb-3">
            Quick Actions
          </h3>
          <div className="space-y-2">
            <button
              className="w-full bg-gradient-to-r from-[var(--color-secondary)] to-[var(--color-highlight)] text-[var(--color-text)] rounded-lg py-2 px-3 text-sm font-medium hover:from-[var(--color-highlight)] hover:to-[var(--color-accent)] transition-all duration-200 flex items-center justify-center space-x-2 cursor-no-drop"
              disabled={true}
            >
              <span>👥</span>
              <span>Create Group</span>
            </button>
            <button
              className="w-full bg-gradient-to-r from-[var(--color-accent)] to-green-700 text-[var(--color-text)] rounded-lg py-2 px-3 text-sm font-medium hover:from-green-700 hover:to-[var(--color-highlight)] transition-all duration-200 flex items-center justify-center space-x-2 cursor-no-drop"
              disabled={true}
            >
              <span>📧</span>
              <span>Invite Friends</span>
            </button>
          </div>
        </div> */}

        {/* Footer */}
        {requestBarOpen && (
          <div className="bg-[var(--color-secondary)] md:rounded-xl p-4 border border-[var(--color-secondary)] mt-4">
            <div className="text-center text-[var(--color-muted)] text-xs space-y-2">
              <div className="flex justify-center space-x-4 text-xs">
                <a href="#" className="hover:text-[var(--color-text)] transition-colors">
                  Privacy
                </a>
                <a href="#" className="hover:text-[var(--color-text)] transition-colors">
                  Terms
                </a>
                <a href="#" className="hover:text-[var(--color-text)] transition-colors">
                  Help
                </a>
              </div>
              <p className="text-[var(--color-muted)]">@lingolive 2025</p>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="lg:col-span-3 mt-5 space-y-6">
        {/* Enhanced Requests Section */}
        {displayName === 1 && (
          <div>
            {requests.length > 0 ? (
              <>
                <div className="bg-gradient-to-r from-[var(--color-secondary)] to-[var(--color-primary)] rounded-xl p-4 mx-2 border border-[var(--color-secondary)] mb-4">
                  <h1 className="text-[var(--color-text)] text-2xl font-bold mb-2 flex items-center">
                    <span className="mr-2">🎯</span>
                    Friend Requests
                  </h1>
                  <p className="text-[var(--color-muted)]">You have {requests.length} pending friend requests</p>
                </div>
                <ReceiveRequestConnection />
                <hr className="my-6 border-[var(--color-secondary)]" />
              </>
            ) : requestBarOpen ? (
              <>
                <div className="bg-gradient-to-br from-[var(--color-secondary)] to-[var(--color-primary)] p-6 rounded-xl md:mx-2 border-2 border-[var(--color-secondary)] shadow-lg">
                  <div className="text-center">
                    <div className="text-4xl mb-3">👋</div>
                    <h1 className="text-[var(--color-text)] text-xl font-bold mb-2">Friend Requests</h1>
                    <p className="text-[var(--color-muted)] mb-4">
                      No Friend Requests Available
                    </p>
                    <button className="bg-gradient-to-r from-[var(--color-secondary)] to-[var(--color-highlight)] text-[var(--color-text)] rounded-lg py-2 px-6 font-medium hover:from-[var(--color-highlight)] hover:to-[var(--color-accent)] transition-all duration-200">
                      Find New Friends
                    </button>
                  </div>
                </div>
                <hr className="my-6 border-[var(--color-secondary)]" />
              </>
            ) : null}
          </div>
        )}

        {/* Dynamic Content Display */}
        <div className="bg-gradient-to-br from-[var(--color-secondary)] to-[var(--color-primary)] md:rounded-xl border border-[var(--color-secondary)] shadow-lg md:mx-2">
          {displayName === 1 ? (
            <ShowAllUser />
          ) : displayName === 2 ? (
            <YourTotalConnection />
          ) : displayName === 3 ? (
            <SendRequestConnection />
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Connection;
