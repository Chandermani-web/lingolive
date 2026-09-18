import { useContext, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home, Users, MessageCircle, Bell, User as UserIcon, LogOut, Menu, X, Search, Radio
} from "lucide-react";
import AppContext from "../../Context/UseContext";

const Navbar = () => {
  const { auth, setUser, notifications, BASE_URL } = useContext(AppContext);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await fetch(`${BASE_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      localStorage.setItem("auth", "false");
      setUser(null);
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const navLinks = [
    { to: "/", icon: Home, label: "Home" },
    { to: "/connections", icon: Users, label: "Friends" },
    { to: "/message", icon: MessageCircle, label: "Messages" },
    { to: "/notifications", icon: Bell, label: "Notifications", badge: true },
    { to: "/profile", icon: UserIcon, label: "Profile" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-[#05070A]/85 backdrop-blur-xl border-b border-[#18202B]">
      <div className="max-w-[1600px] mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="relative w-9 h-9 rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#3B82F6] flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Radio className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <div className="hidden sm:block">
              <span className="text-lg font-bold text-white tracking-tight">
                Lingo<span className="text-gradient-brand">Live</span>
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          {auth && (
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(({ to, icon: Icon, label, badge }) => {
                const active = isActive(to);
                return (
                  <Link
                    key={to}
                    to={to}
                    className={`nav-item ${active ? "active" : ""}`}
                  >
                    <div className="relative">
                      <Icon className="w-[18px] h-[18px]" strokeWidth={2} />
                      {badge && (
                        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#10B981] rounded-full" />
                      )}
                    </div>
                    <span>{label}</span>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {auth && (
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="btn-ghost hidden sm:flex"
                aria-label="Search"
              >
                <Search className="w-[18px] h-[18px]" />
              </button>
            )}

            {auth && (
              <button
                onClick={handleLogout}
                className="hidden md:flex btn-ghost text-[#F43F5E]"
              >
                <LogOut className="w-[18px] h-[18px]" />
              </button>
            )}

            <button
              className="md:hidden btn-ghost"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && auth && (
          <div className="md:hidden py-3 border-t border-[#18202B] animate-fadeUp">
            <div className="flex flex-col gap-1">
              {navLinks.map(({ to, icon: Icon, label }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMobileOpen(false)}
                  className={`nav-item ${isActive(to) ? "active" : ""}`}
                >
                  <Icon className="w-[18px] h-[18px]" />
                  <span>{label}</span>
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="nav-item text-[#F43F5E] hover:bg-[#F43F5E]/5"
              >
                <LogOut className="w-[18px] h-[18px]" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;