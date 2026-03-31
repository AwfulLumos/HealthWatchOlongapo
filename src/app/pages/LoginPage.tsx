import { useState } from "react";
import { useNavigate } from "react-router";
import { Activity, Eye, EyeOff, Lock, User } from "lucide-react";
import { useAuth } from "../hooks";

export function LoginPage() {
  const navigate = useNavigate();
  const { login, loading: authLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!username || !password) {
      setError("Please enter your username and password.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const result = login({ username, password });
      setLoading(false);
      if (result.success) {
        navigate("/dashboard");
      } else {
        setError(result.error || "Invalid credentials.");
      }
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background blobs with floating animation */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-[-80px] left-[-80px] w-96 h-96 rounded-full bg-white blur-3xl animate-float" />
        <div className="absolute bottom-[-60px] right-[-60px] w-[500px] h-[500px] rounded-full bg-blue-400 blur-3xl animate-float animation-delay-200" style={{ animationDuration: '8s' }} />
        <div className="absolute top-1/2 left-1/3 w-72 h-72 rounded-full bg-indigo-300 blur-3xl animate-float animation-delay-400" style={{ animationDuration: '7s' }} />
      </div>

      <div className="relative w-full max-w-5xl flex flex-col md:flex-row items-center gap-12 md:gap-16">

        {/* LEFT — Logo & Branding */}
        <div className="flex-1 flex flex-col items-center text-center animate-fade-in-up">
          {/* Logo */}
          <div className="mb-8">
            <div className="w-48 h-48 md:w-64 md:h-64 bg-white rounded-3xl shadow-2xl flex items-center justify-center hover-lift hover-glow transition-all duration-300 cursor-default">
              <Activity className="w-24 h-24 md:w-32 md:h-32 text-blue-700" />
            </div>
          </div>

          <h1
            className="text-white mb-3"
            style={{ fontSize: "2.5rem", fontWeight: 800, lineHeight: 1.15, letterSpacing: "-0.02em" }}
          >
            Health Watch<br />Olongapo
          </h1>
          <p
            className="text-blue-200"
            style={{ fontSize: "1.05rem", lineHeight: 1.6 }}
          >
            Barangay Health Center<br />Management System
          </p>

          {/* Decorative divider */}
          <div className="flex items-center gap-3 mt-10">
            <div className="w-10 h-0.5 bg-blue-400 rounded-full" />
            <span className="text-blue-300" style={{ fontSize: "0.8rem" }}>Olongapo City Health Office</span>
            <div className="w-10 h-0.5 bg-blue-400 rounded-full" />
          </div>
        </div>

        {/* RIGHT — Login Card */}
        <div className="w-full md:w-[420px] flex-shrink-0 animate-fade-in-up animation-delay-200">
          <div className="bg-white rounded-3xl shadow-2xl p-8 hover:shadow-[0_25px_60px_rgba(0,0,0,0.2)] transition-shadow duration-500">
            <h2
              className="text-gray-900 mb-1"
              style={{ fontSize: "1.6rem", fontWeight: 700 }}
            >
              Sign In
            </h2>
            <p className="text-gray-500 mb-7" style={{ fontSize: "0.9rem" }}>
              Enter your credentials to access the system
            </p>

            <form onSubmit={handleLogin} className="space-y-4">
              {/* Username */}
              <div className="animate-fade-in animation-delay-300">
                <label
                  className="block text-gray-700 mb-1.5"
                  style={{ fontSize: "0.875rem", fontWeight: 600 }}
                >
                  Username
                </label>
                <div className="relative group">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 transition-colors group-focus-within:text-blue-500" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200"
                    style={{ fontSize: "0.875rem" }}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="animate-fade-in animation-delay-400">
                <label
                  className="block text-gray-700 mb-1.5"
                  style={{ fontSize: "0.875rem", fontWeight: 600 }}
                >
                  Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 transition-colors group-focus-within:text-blue-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-11 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200"
                    style={{ fontSize: "0.875rem" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors hover:scale-110 active:scale-95"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div
                  className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl animate-fade-in-down"
                  style={{ fontSize: "0.875rem" }}
                >
                  {error}
                </div>
              )}

              {/* Hint */}
              <div
                className="bg-blue-50 border border-blue-200 text-blue-600 px-4 py-3 rounded-xl animate-fade-in animation-delay-500"
                style={{ fontSize: "0.8rem" }}
              >
                <strong>Demo accounts:</strong><br />
                admin / admin123<br />
                doctor / doctor123<br />
                nurse / nurse123
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-blue-700 hover:bg-blue-800 active:bg-blue-900 text-white rounded-xl transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed mt-2 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-md press-effect"
                style={{ fontWeight: 700, fontSize: "1rem" }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Signing in...
                  </span>
                ) : "Sign In"}
              </button>
            </form>

            <div
              className="mt-7 pt-6 border-t border-gray-100 text-center text-gray-400"
              style={{ fontSize: "0.78rem" }}
            >
              Health Watch Olongapo &copy; 2026 &mdash; All rights reserved
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}