import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { User, Mail, Lock, Eye, EyeOff, Radio, ArrowRight } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import AppContext from "../Context/UseContext";

const Signup = () => {
  const [formdata, setFormdata] = useState({ username: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setUser, BASE_URL } = useContext(AppContext);

  const handleChange = (e) => setFormdata({ ...formdata, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formdata),
      });
      const data = await response.json();
      setUser(data.user);

      if (response.ok) {
        toast.success("Account created! Welcome to LingoLive");
        setTimeout(() => (window.location.href = "/profile"), 1200);
      } else {
        toast.error(data.message || "Signup failed");
      }
    } catch (error) {
      toast.error(error.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-app flex items-center justify-center p-4 relative overflow-hidden">
      <div className="bg-app-fixed" />
      <div className="absolute top-[-200px] right-[-200px] w-[400px] h-[400px] rounded-full blur-3xl opacity-40"
        style={{ background: "radial-gradient(circle, rgba(37,99,235,0.15), transparent 65%)" }} />
      <div className="absolute bottom-[-200px] left-[-200px] w-[400px] h-[400px] rounded-full blur-3xl opacity-40"
        style={{ background: "radial-gradient(circle, rgba(124,58,237,0.18), transparent 65%)" }} />

      <div className="relative z-10 w-full max-w-[420px] animate-fadeUp">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#3B82F6] mb-5 shadow-xl shadow-purple-500/20">
            <Radio className="w-7 h-7 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="heading-xl text-white mb-2">Create your account</h1>
          <p className="text-secondary text-sm">Join thousands of people connecting on LingoLive</p>
        </div>

        <div className="card-static p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-secondary mb-2 uppercase tracking-wide">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none z-10" />
                <input
                  type="text"
                  name="username"
                  placeholder="Choose a username"
                  value={formdata.username}
                  onChange={handleChange}
                  className="input-icon"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-secondary mb-2 uppercase tracking-wide">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none z-10" />
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formdata.email}
                  onChange={handleChange}
                  className="input-icon"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-secondary mb-2 uppercase tracking-wide">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none z-10" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Create a strong password"
                  value={formdata.password}
                  onChange={handleChange}
                  className="input-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-primary transition-colors z-10"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[#18202B] text-center">
            <p className="text-sm text-secondary">
              Already have an account?{" "}
              <Link to="/login" className="text-gradient-brand font-semibold hover:opacity-80">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>

      <ToastContainer position="top-right" theme="dark" />
    </div>
  );
};

export default Signup;