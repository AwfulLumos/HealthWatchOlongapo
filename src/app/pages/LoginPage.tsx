import { useState } from "react";
import { useNavigate } from "react-router";
import { Eye, EyeOff, Lock, User } from "lucide-react";
import { useAuth } from "../hooks";
import { LoadingScreen } from "../components/LoadingScreen";
import logoImage from "../../styles/Images/HealthWatchLogoPortrait.jpg";

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showLoadingScreen, setShowLoadingScreen] = useState(false);
  const [loggedInUserName, setLoggedInUserName] = useState("");

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
        // Capitalize the username for display
        const displayName = result.user?.username 
          ? result.user.username.charAt(0).toUpperCase() + result.user.username.slice(1)
          : username;
        setLoggedInUserName(displayName);
        setShowLoadingScreen(true);
      } else {
        setError(result.error || "Invalid credentials.");
      }
    }, 500);
  };

  const handleLoadingComplete = () => {
    navigate("/dashboard");
  };

  if (showLoadingScreen) {
    return (
      <LoadingScreen 
        userName={loggedInUserName} 
        onComplete={handleLoadingComplete}
        duration={2500}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full" style={{ 
          backgroundImage: 'radial-gradient(circle at 25px 25px, rgba(255, 255, 255, 0.2) 2%, transparent 0%)',
          backgroundSize: '50px 50px'
        }} />
      </div>

      <div className="relative w-full max-w-5xl flex flex-col lg:flex-row items-center justify-center gap-8 sm:gap-10 lg:gap-16">

        {/* LEFT — Logo & Branding */}
        <div className="flex-1 flex flex-col items-center text-center animate-fade-in-up">
          {/* Logo - Increased by 80% */}
          <div className="mb-5 sm:mb-7">
            <div className="w-36 h-36 sm:w-48 sm:h-48 md:w-60 md:h-60 lg:w-72 lg:h-72 bg-white/95 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden hover-lift transition-all duration-300 cursor-default">
              <img src={logoImage} alt="Health Watch Olongapo" className="w-full h-full object-cover" />
            </div>
          </div>

          {/* Title - Increased by 80% */}
          <h1 className="text-white mb-2 sm:mb-3 font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl leading-tight">
            Health Watch<br />Olongapo
          </h1>
          
          {/* Subtitle - Increased by 80% */}
          <p className="text-blue-100 font-medium mb-5 sm:mb-7 text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed">
            Barangay Health Center<br />Management System
          </p>

          {/* Decorative divider - Hidden on small screens */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="w-8 sm:w-10 h-0.5 bg-blue-300 rounded-full" />
            <span className="text-blue-200 font-medium text-xs sm:text-sm">Olongapo City Health Office</span>
            <div className="w-8 sm:w-10 h-0.5 bg-blue-300 rounded-full" />
          </div>
        </div>

        {/* RIGHT — Login Card - Increased by 80% */}
        <div className="w-full sm:w-[450px] lg:w-[480px] flex-shrink-0 animate-fade-in-up animation-delay-200">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8">
            {/* Header */}
            <h2 className="text-gray-900 mb-1.5 sm:mb-2 font-bold text-xl sm:text-2xl">
              Sign In
            </h2>
            <p className="text-gray-500 mb-5 sm:mb-6 font-medium text-sm sm:text-base">
              Enter your credentials to access the system
            </p>

            <form onSubmit={handleLogin} className="space-y-4 sm:space-y-5">
              {/* Username */}
              <div className="animate-fade-in animation-delay-300">
                <label className="block text-gray-700 mb-1.5 font-semibold text-sm sm:text-base">
                  Username
                </label>
                <div className="relative group">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 transition-colors group-focus-within:text-blue-600" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200 font-medium text-sm sm:text-base"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="animate-fade-in animation-delay-400">
                <label className="block text-gray-700 mb-1.5 font-semibold text-sm sm:text-base">
                  Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 transition-colors group-focus-within:text-blue-600" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-11 pr-12 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200 font-medium text-sm sm:text-base"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-50 border-2 border-red-200 text-red-600 px-4 py-3 rounded-xl animate-fade-in-down font-medium text-sm sm:text-base">
                  {error}
                </div>
              )}

              {/* Demo Accounts Hint */}
              <div className="bg-blue-50 border-2 border-blue-200 text-blue-700 px-4 py-3 rounded-xl animate-fade-in animation-delay-500 text-xs sm:text-sm">
                <p className="font-bold mb-1.5">Demo accounts:</p>
                <div className="space-y-0.5 font-medium">
                  <p>admin / admin123</p>
                  <p>doctor / doctor123</p>
                  <p>nurse / nurse123</p>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 sm:py-3.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed mt-2 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 active:shadow-md press-effect font-bold text-sm sm:text-base"
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

            {/* Footer */}
            <div className="mt-6 pt-5 border-t border-gray-100 text-center text-gray-400 font-medium text-xs sm:text-sm">
              Health Watch Olongapo © 2026 — All rights reserved
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}