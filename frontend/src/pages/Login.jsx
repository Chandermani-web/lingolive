import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Radio } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import AppContext from "../Context/UseContext";

const Login = () => {
  const [formdata, setFormdata] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setUser, BASE_URL } = useContext(AppContext);

  const handleChange = (e) => {
    setFormdata({ ...formdata, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formdata),
      });
      const data = await response.json();
      setUser(data.user);

      if (response.ok) {
        localStorage.setItem("auth", "true");
        toast.success(`Welcome back!`, { autoClose: 1200 });
        setTimeout(() => (window.location.href = "/"), 800);
      } else {
        toast.error(data.message || "Login failed");
      }
    } catch (error) {
      toast.error(error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-app flex items-center justify-center p-4 relative overflow-hidden">
      <div className="bg-app-fixed" />
      <div className="glow-purple" style={{ top: '-200px', left: '-200px' }} />
      <div className="glow-blue" style={{ bottom: '-200px', right: '-200px' }} />

      <div className="relative z-10 w-full max-w-[420px] animate-fadeUp">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#3B82F6] mb-5 shadow-xl shadow-purple-500/20">
            <Radio className="w-7 h-7 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="heading-xl text-white mb-2">Welcome back</h1>
          <p className="text-secondary text-sm">Sign in to continue to LingoLive</p>
        </div>

        {/* Card */}
        <div className="card-static p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-secondary mb-2 uppercase tracking-wide">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formdata.email}
                  onChange={handleChange}
                  className="input pl-11"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-secondary mb-2 uppercase tracking-wide">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={formdata.password}
                  onChange={handleChange}
                  className="input pl-11 pr-11"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-primary transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[#18202B] text-center">
            <p className="text-sm text-secondary">
              New to LingoLive?{" "}
              <Link to="/signup" className="text-gradient-brand font-semibold hover:opacity-80 transition-opacity">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>

      <ToastContainer position="top-right" theme="dark" />
    </div>
  );
};

export default Login;