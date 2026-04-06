import { useState } from "react";
import { useNavigate } from "react-router";
import { Eye, EyeOff, Lock, User, AlertTriangle } from "lucide-react";
import { useAuth } from "../hooks";
import { LoadingScreen } from "../components/LoadingScreen";
import { validateLoginForm } from "../utils/validation";
import logoImage from "../../styles/Images/HealthWatchLogoPortrait.jpg";

export function LoginPage() {
  const navigate = useNavigate();
  const { login, rateLimitInfo } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loadingState, setLoadingState] = useState<'idle' | 'authenticating' | 'success'>('idle');
  const [loggedInUserName, setLoggedInUserName] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted"); // Debug log
    setError("");

    // Validate input
    const validation = validateLoginForm({ username, password });
    if (!validation.success) {
      setError(validation.errors[0]?.message || "Invalid input");
      console.log("Validation failed:", validation.errors); // Debug log
      return;
    }

    // Check if rate limited
    if (rateLimitInfo.lockedUntil && new Date() < rateLimitInfo.lockedUntil) {
      setError(`Too many failed attempts. Try again at ${rateLimitInfo.lockedUntil.toLocaleTimeString()}`);
      console.log("Rate limited"); // Debug log
      return;
    }

    try {
      // Show authenticating loading screen
      console.log("Setting loading state to authenticating"); // Debug log
      setLoadingState('authenticating');
      
      // Call backend authentication
      const result = await login({ username: validation.data!.username, password: validation.data!.password });
      
      console.log("Login result:", result); // Debug log
      
      if (result.success) {
        const displayName = result.user?.username 
          ? result.user.username.charAt(0).toUpperCase() + result.user.username.slice(1)
          : username;
        setLoggedInUserName(displayName);
        // Switch to success mode
        console.log("Login successful, switching to success mode"); // Debug log
        setLoadingState('success');
      } else {
        // Hide loading screen and show error
        console.log("Login failed, showing error:", result.error); // Debug log
        setLoadingState('idle');
        setError(result.error || "Invalid credentials.");
      }
    } catch (err) {
      // Handle unexpected errors
      console.error("Unexpected login error:", err); // Debug log
      setLoadingState('idle');
      setError("An error occurred during login. Please try again.");
    }
  };

  const handleLoadingComplete = () => {
    navigate("/dashboard");
  };

  // Show loading screen when authenticating or successful
  if (loadingState !== 'idle') {
    return (
      <LoadingScreen 
        userName={loggedInUserName} 
        onComplete={handleLoadingComplete}
        duration={2500}
        mode={loadingState}
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
                <div className="bg-red-50 border-2 border-red-200 text-red-600 px-4 py-3 rounded-xl animate-fade-in-down font-medium text-sm sm:text-base flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Rate Limit Warning */}
              {rateLimitInfo.remainingAttempts < 5 && rateLimitInfo.remainingAttempts > 0 && (
                <div className="bg-amber-50 border-2 border-amber-200 text-amber-700 px-4 py-3 rounded-xl animate-fade-in font-medium text-xs sm:text-sm flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>Warning: {rateLimitInfo.remainingAttempts} login attempt{rateLimitInfo.remainingAttempts !== 1 ? 's' : ''} remaining before lockout.</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loadingState !== 'idle' || (rateLimitInfo.lockedUntil !== null && new Date() < rateLimitInfo.lockedUntil)}
                className="w-full py-3 sm:py-3.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed mt-2 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 active:shadow-md press-effect font-bold text-sm sm:text-base"
              >
                {rateLimitInfo.lockedUntil && new Date() < rateLimitInfo.lockedUntil ? "Account Locked" : "Sign In"}
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