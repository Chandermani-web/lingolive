import { useContext, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { Eye, EyeOff, User, Mail, Lock, Sparkles } from "lucide-react";
import AppContext from "../Context/UseContext";

const Signup = () => {
  const [formdata, setformdata] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [showpassword, setshowpassword] = useState(false);
  const { setUser } = useContext(AppContext);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setformdata({ ...formdata, [name]: value });
  }; 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("https://lingolive.onrender.com/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formdata),
      });
      const data = await response.json();
      console.log(data);

      setUser(data.user);

      if (response.ok) {
        toast.success(`🎉 Welcome! ${data.message}`, {
          autoClose: 1500,
          onClose: () => {
            window.location.href = "/profile";
          },
        });
      } else {
        toast.error(`Signup failed! ${data.message}`, { autoClose: 2000 });
      }
    } catch (error) {
      console.error(error);
      toast.error(`Signup failed! ${error.message}`, { autoClose: 2000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--color-primary)] via-[var(--color-secondary)] to-[var(--color-primary)] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-4 h-4 bg-[var(--color-highlight)] rounded-full animate-bounce"></div>
        <div className="absolute top-40 right-20 w-3 h-3 bg-[var(--color-highlight)]/80 rounded-full animate-pulse"></div>
        <div className="absolute bottom-32 left-1/4 w-2 h-2 bg-[var(--color-accent)] rounded-full animate-ping"></div>
      </div>

      <div className="max-w-md w-full relative z-10">
        <div className="bg-[var(--color-secondary)]/40 backdrop-blur-xl rounded-3xl shadow-2xl border border-[var(--color-secondary)]/50 p-8 transform hover:scale-[1.02] transition-all duration-300">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-r from-[var(--color-secondary)] to-[var(--color-highlight)] rounded-2xl flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-[var(--color-text)]" />
                </div>
              </div>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-[var(--color-highlight)] bg-clip-text text-transparent mb-2">
              Join Our Community
            </h1>
            <p className="text-[var(--color-muted)]">Start your amazing journey with us</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="group">
              <label className="block text-sm font-medium text-[var(--color-muted)] mb-3">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[var(--color-muted)] w-5 h-5 group-focus-within:text-[var(--color-highlight)] transition-colors" />
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formdata.email}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-4 bg-[var(--color-secondary)]/50 border border-[var(--color-secondary)]/50 rounded-xl text-[var(--color-text)] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-highlight)]/50 focus:border-transparent transition-all duration-300"
                  required
                />
              </div>
            </div>

            {/* Username Field */}
            <div className="group">
              <label className="block text-sm font-medium text-[var(--color-muted)] mb-3">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[var(--color-muted)] w-5 h-5 group-focus-within:text-[var(--color-highlight)] transition-colors" />
                <input
                  type="text"
                  name="username"
                  placeholder="Choose a username"
                  value={formdata.username}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-4 bg-[var(--color-secondary)]/50 border border-[var(--color-secondary)]/50 rounded-xl text-[var(--color-text)] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-highlight)]/50 focus:border-transparent transition-all duration-300"
                  required
                />
              </div>
            </div>
            
            {/* Password Field */}
            <div className="group">
              <label className="block text-sm font-medium text-[var(--color-muted)] mb-3">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[var(--color-muted)] w-5 h-5 group-focus-within:text-[var(--color-highlight)] transition-colors" />
                <input
                  type={showpassword ? "text" : "password"}
                  name="password"
                  placeholder="Create a secure password"
                  value={formdata.password}
                  onChange={handleChange}
                  className="w-full pl-12 pr-12 py-4 bg-[var(--color-secondary)]/50 border border-[var(--color-secondary)]/50 rounded-xl text-[var(--color-text)] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-highlight)]/50 focus:border-transparent transition-all duration-300"
                  required
                />
                <button
                  type="button"
                  onClick={() => setshowpassword(!showpassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors"
                >
                  {showpassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            
            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gradient-to-r from-[var(--color-secondary)] to-[var(--color-highlight)] hover:from-[var(--color-secondary)] hover:to-[var(--color-accent)] disabled:opacity-50 text-[var(--color-text)] font-semibold py-4 px-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-[var(--color-secondary)]/40 border-t-white rounded-full animate-spin mr-2"></div>
                  Creating Your Account...
                </div>
              ) : (
                "Create Account"
              )}
            </button>
          </form>
          
          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-[var(--color-muted)]">
              Already have an account?{' '}
              <a href="/login" className="text-[var(--color-highlight)] hover:text-[var(--color-highlight)] font-medium transition-colors hover:underline">
                Sign in here
              </a>
            </p>
          </div>
        </div>
      </div>
      <ToastContainer 
        position="top-right"
        theme="dark"
        toastClassName="bg-[var(--color-secondary)] text-[var(--color-text)]"
      />
    </div>
  );
};

export default Signup;