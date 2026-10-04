import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Users, UserPlus, Compass, Target } from "lucide-react";
import AppContext from "../Context/UseContext";
import Sidebar from "../Components/Connections/Sidebar";
import ShowAllUser from "../Components/Connections/Page/ShowAllUser";
import YourTotalConnection from "../Components/Connections/Page/YourTotalConnection";
import SendRequestConnection from "../Components/Connections/Page/SendRequestConnection";
import ReceiveRequestConnection from "../Components/Connections/Page/ReceiveRequestConnection";

const Connection = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(1);
  const { requests, loading, user, allUser, setShowImage } = useContext(AppContext);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [showSearch, setShowSearch] = useState(false);

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    if (!val.trim()) {
      setSearchResult([]);
      return;
    }
    const results = allUser.filter(
      (u) =>
        u.username?.toLowerCase().includes(val.toLowerCase()) ||
        u.fullname?.toLowerCase().includes(val.toLowerCase())
    );
    setSearchResult(results);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-app flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#18202B] border-t-[#7C3AED] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app relative">
      <div className="bg-app-fixed" />

      <div className="relative z-10 max-w-[1400px] mx-auto px-4 md:px-6 py-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 animate-fadeUp">
          <div>
            <h1 className="heading-xl text-white mb-1">Connections</h1>
            <p className="text-secondary text-sm">
              Discover people and manage your network
            </p>
          </div>

          {/* Search */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717A] pointer-events-none z-10" />
            <input
              type="text"
              placeholder="Search connections..."
              value={searchTerm}
              onChange={handleSearch}
              onFocus={() => setShowSearch(true)}
              onBlur={() => setTimeout(() => setShowSearch(false), 200)}
              className="input-search"
            />
            {showSearch && searchTerm && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#0A0E14] border border-[#18202B] rounded-xl overflow-hidden z-20 max-h-72 overflow-y-auto custom-scrollbar shadow-2xl animate-fadeUp">
                {searchResult.length > 0 ? (
                  searchResult.map((u) => (
                    <button
                      key={u._id}
                      onClick={() => { navigate(`/profile/${u._id}`); setSearchTerm(""); }}
                      className="w-full flex items-center gap-3 p-3 hover:bg-white/[0.03] transition-colors border-b border-[#111820] last:border-b-0 text-left"
                    >
                      <img src={u.profilePic || "/avatar.svg"} alt="" className="w-8 h-8 rounded-full object-cover" />
                      <div className="min-w-0">
                        <p className="text-sm text-white truncate font-medium">@{u.username}</p>
                        <p className="text-xs text-muted truncate">{u.fullname}</p>
                      </div>
                    </button>
                  ))
                ) : (
                  <p className="text-xs text-muted text-center py-4">No results found</p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <aside className="lg:col-span-1 space-y-4">
            {/* Profile quick card */}
            <div className="card-static p-4 hidden lg:block">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={user?.profilePic || "/avatar.svg"}
                    alt=""
                    className="w-11 h-11 rounded-full object-cover border-2 border-[#18202B] cursor-pointer"
                    onClick={() => setShowImage(user?.profilePic || "/avatar.svg")}
                  />
                  <span className="status-dot-online" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-white font-semibold truncate">
                    @{user?.username}
                  </p>
                  <p className="text-[11px] text-muted">
                    {user?.friends?.length || 0} friends
                  </p>
                </div>
              </div>
            </div>

            {/* Tab sidebar */}
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
          </aside>

          {/* Main */}
          <main className="lg:col-span-3 space-y-6">
            {/* Header for active tab */}
            <div className="flex items-center gap-3 animate-fadeUp">
              <div className="w-10 h-10 rounded-xl bg-[#0F141C] border border-[#18202B] flex items-center justify-center">
                {activeTab === 1 && <Compass className="w-5 h-5 text-[#22D3EE]" />}
                {activeTab === 2 && <Users className="w-5 h-5 text-[#8B5CF6]" />}
                {activeTab === 3 && <UserPlus className="w-5 h-5 text-[#10B981]" />}
              </div>
              <div>
                <h2 className="heading-md text-white">
                  {activeTab === 1 && "Discover People"}
                  {activeTab === 2 && "My Connections"}
                  {activeTab === 3 && "Sent Requests"}
                </h2>
                <p className="text-xs text-muted">
                  {activeTab === 1 && "Find new friends to connect with"}
                  {activeTab === 2 && `${user?.friends?.length || 0} total connections`}
                  {activeTab === 3 && "People you've followed"}
                </p>
              </div>
            </div>

            {/* Pending Requests Banner */}
            {activeTab === 1 && requests.length > 0 && (
              <div className="card-static p-5 border-l-2 border-l-[#10B981] animate-fadeUp">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#10B981]/10 border border-[#10B981]/20 flex items-center justify-center">
                    <Target className="w-5 h-5 text-[#10B981]" />
                  </div>
                  <div>
                    <h3 className="heading-sm text-white">Friend Requests</h3>
                    <p className="text-xs text-muted">
                      You have{" "}
                      <span className="text-[#10B981] font-semibold">
                        {requests.length}
                      </span>{" "}
                      pending {requests.length === 1 ? "request" : "requests"}
                    </p>
                  </div>
                </div>
                <ReceiveRequestConnection />
              </div>
            )}

            {/* Content */}
            <div className="animate-fadeUp delay-1">
              {activeTab === 1 && <ShowAllUser />}
              {activeTab === 2 && <YourTotalConnection />}
              {activeTab === 3 && <SendRequestConnection />}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Connection;