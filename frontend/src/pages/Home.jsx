import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles, Plus, Radio } from "lucide-react";
import AppContext from "../Context/UseContext";
import LeftSideBar from "../Components/Home/LeftSideBar";
import RightSideBar from "../Components/Home/RightSideBar";
import ShowPost from "../Components/Post/ShowPost";

const Home = () => {
  const { user, posts, auth } = useContext(AppContext);
  const navigate = useNavigate();

  if (!auth) {
    return (
      <div className="min-h-screen bg-app flex items-center justify-center p-4 relative overflow-hidden">
        <div className="bg-app-fixed" />
        <div className="glow-purple" style={{ top: '-200px', left: '-200px' }} />
        <div className="glow-blue" style={{ bottom: '-200px', right: '-200px' }} />

        <div className="relative z-10 text-center max-w-lg animate-fadeUp">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#3B82F6] mb-6 shadow-xl shadow-purple-500/20">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="heading-hero text-white mb-4">
            Welcome to <span className="text-gradient-brand">LingoLive</span>
          </h1>
          <p className="text-secondary text-base mb-8">
            Connect with people around the world. Start conversations, share moments, and build meaningful relationships.
          </p>
          <Link to="/login" className="btn-primary">
            Get Started
          </Link>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-app flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#18202B] border-t-[#7C3AED] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app relative">
      <div className="bg-app-fixed" />

      <div className="relative z-10 max-w-[1600px] mx-auto px-4 md:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar */}
          <aside className="hidden lg:block lg:col-span-3">
            <LeftSideBar />
          </aside>

          {/* Main */}
          <main className="lg:col-span-6 space-y-6">
            {/* Welcome Banner */}
            <div className="card-static p-6 md:p-7 relative overflow-hidden animate-fadeUp">
              <div className="absolute inset-0 opacity-40 pointer-events-none"
                style={{
                  background: 'radial-gradient(circle at 85% 40%, rgba(124,58,237,0.15), transparent 55%)'
                }}
              />
              <div className="relative">
                <p className="text-xs font-semibold text-[#8B5CF6] uppercase tracking-wider mb-2">
                  Welcome back
                </p>
                <h1 className="heading-lg text-white mb-2">
                  Hey {user.fullname?.split(' ')[0] || user.username} 👋
                </h1>
                <p className="text-secondary text-sm">
                  Here's what's happening in your community today.
                </p>
              </div>
            </div>

            {/* Create Post */}
            <button
              onClick={() => navigate("/create-post")}
              className="w-full card p-3 flex items-center gap-3 text-left animate-fadeUp delay-1"
            >
              <img
                src={user?.profilePic || "/avatar.svg"}
                alt=""
                className="w-10 h-10 rounded-full object-cover border border-[#18202B]"
              />
              <div className="flex-1 px-4 py-2.5 rounded-xl bg-[#0B1017] border border-[#18202B] text-muted text-sm">
                Share something with your community...
              </div>
              <div className="p-2.5 rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#3B82F6] text-white">
                <Plus className="w-4 h-4" />
              </div>
            </button>

            {/* Feed */}
            <section className="animate-fadeUp delay-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="heading-sm text-white">Recent Activity</h2>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-[#10B981] rounded-full" />
                  <span className="text-xs text-muted">Live</span>
                </div>
              </div>

              {posts.length > 0 ? (
                <ShowPost />
              ) : (
                <div className="card-static p-10 text-center">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-[#0F141C] border border-[#18202B] flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-[#7C3AED]" />
                  </div>
                  <p className="heading-sm text-white mb-1">No posts yet</p>
                  <p className="text-muted text-sm mb-5">Be the first to share something</p>
                  <button
                    onClick={() => navigate("/create-post")}
                    className="btn-primary"
                  >
                    <Plus className="w-4 h-4" />
                    Create Post
                  </button>
                </div>
              )}
            </section>
          </main>

          {/* Right Sidebar */}
          <aside className="hidden lg:block lg:col-span-3">
            <RightSideBar />
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Home;