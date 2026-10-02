import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Eye,
  EyeOff,
  Lock,
  User,
  AlertTriangle,
  ShieldCheck,
  Building2,
  Activity,
  HeartPulse,
  Sparkles,
  Info,
  CheckCircle2,
} from "lucide-react";
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
  const [loadingState, setLoadingState] = useState<"idle" | "authenticating" | "success">("idle");
  const [loggedInUserName, setLoggedInUserName] = useState("");
  const [redirectPath, setRedirectPath] = useState("/dashboard");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate input
    const validation = validateLoginForm({ username, password });
    if (!validation.success) {
      setError(validation.errors[0]?.message || "Invalid input");
      return;
    }

    // Check if rate limited
    if (rateLimitInfo.lockedUntil && new Date() < rateLimitInfo.lockedUntil) {
      setError(`Too many failed attempts. Try again at ${rateLimitInfo.lockedUntil.toLocaleTimeString()}`);
      return;
    }

    try {
      setLoadingState("authenticating");

      const result = await login({ username: validation.data!.username, password: validation.data!.password });

      if (result.success) {
        const displayName = result.user?.username
          ? result.user.username.charAt(0).toUpperCase() + result.user.username.slice(1)
          : username;
        setLoggedInUserName(displayName);
        setRedirectPath(result.user?.role === "Admin" ? "/sysadmin/rbac" : "/dashboard");
        setLoadingState("success");
      } else {
        setLoadingState("idle");
        setError(result.error || "Invalid username or password. Please verify and try again.");
      }
    } catch (err) {
      console.error("Unexpected login error:", err);
      setLoadingState("idle");
      setError("An unexpected network error occurred. Please check your connection.");
    }
  };

  const handleLoadingComplete = () => {
    navigate(redirectPath);
  };

  // Quick fill helper for clinical or admin login
  const fillCredentials = (role: "admin" | "employee") => {
    if (role === "admin") {
      setUsername("admin");
      setPassword("Admin@1234");
    } else {
      setUsername("employee");
      setPassword("Employee@1234");
    }
    setError("");
  };

  if (loadingState !== "idle") {
    return (
      <LoadingScreen
        userName={loggedInUserName}
        onComplete={handleLoadingComplete}
        duration={2200}
        mode={loadingState}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#071326] via-[#0D2447] to-[#0A192F] flex items-center justify-center p-4 sm:p-6 lg:p-10 relative overflow-hidden font-sans">
      {/* Ambient Lighting Orbs */}
      <div className="absolute top-[-15%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-600/15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[550px] h-[550px] rounded-full bg-cyan-500/15 blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-indigo-500/10 blur-[160px] pointer-events-none" />

      {/* Subtle Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: "36px 36px",
        }}
      />

      <div className="relative w-full max-w-5xl flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-16 z-10">
        {/* LEFT — Branding, City Health Info & Clinical Trust Badges */}
        <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left animate-fade-in-up">
          {/* Logo container with ambient glow */}
          <div className="relative mb-6 group cursor-default">
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-blue-500 to-cyan-400 opacity-30 blur-md group-hover:opacity-60 transition duration-500" />
            <div className="relative w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-1 overflow-hidden ring-1 ring-white/30">
              <img
                src={logoImage}
                alt="Health Watch Olongapo"
                className="w-full h-full object-cover rounded-xl sm:rounded-2xl"
              />
            </div>
          </div>

          {/* Title with Gradient Accent */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-cyan-300 text-xs font-semibold mb-3">
            <HeartPulse className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            City Health Office Digital Portal
          </div>

          <h1 className="text-white font-extrabold text-3xl sm:text-4xl lg:text-5xl leading-tight tracking-tight mb-3">
            Health Watch <br />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-300 to-indigo-200 bg-clip-text text-transparent">
              Olongapo City
            </span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base font-normal max-w-md leading-relaxed mb-8">
            Integrated Barangay Health Center Management & Electronic Medical Records (EMR) System.
          </p>

          {/* Trust Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-md">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-sm">
              <div className="w-9 h-9 rounded-lg bg-blue-500/20 text-cyan-300 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-white">RA 10173 Compliant</p>
                <p className="text-[11px] text-slate-400">Data Privacy & Security</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-sm">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center flex-shrink-0">
                <Activity className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-white">17 Health Centers</p>
                <p className="text-[11px] text-slate-400">Barangay Triage Network</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT — Elevated Login Card */}
        <div className="w-full sm:w-[460px] lg:w-[480px] flex-shrink-0 animate-fade-in-up animation-delay-200">
          <div className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl p-7 sm:p-9 border border-white/40 ring-1 ring-black/5">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-slate-900 font-extrabold text-2xl tracking-tight">
                  Sign In
                </h2>
                <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Secure System
                </span>
              </div>
              <p className="text-slate-500 text-sm font-medium">
                Enter your authorized clinical credentials to access patient records.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              {/* Username Field */}
              <div>
                <label className="block text-slate-700 mb-1.5 font-bold text-xs uppercase tracking-wider">
                  Username or Staff ID
                </label>
                <div className="relative group">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 transition-colors group-focus-within:text-blue-600" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    autoComplete="username"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all duration-200 shadow-2xs"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-slate-700 font-bold text-xs uppercase tracking-wider">
                    Password
                  </label>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 transition-colors group-focus-within:text-blue-600" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    autoComplete="current-password"
                    className="w-full pl-10 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all duration-200 shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 rounded transition-colors"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Error Message Banner */}
              {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 px-3.5 py-2.5 rounded-xl animate-fade-in-down font-medium text-xs flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Rate Limit Warning */}
              {rateLimitInfo.remainingAttempts < 5 && rateLimitInfo.remainingAttempts > 0 && (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 px-3.5 py-2.5 rounded-xl animate-fade-in font-medium text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <span>
                    Warning: {rateLimitInfo.remainingAttempts} login attempt
                    {rateLimitInfo.remainingAttempts !== 1 ? "s" : ""} remaining before lockout.
                  </span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loadingState !== "idle" || (rateLimitInfo.lockedUntil !== null && new Date() < rateLimitInfo.lockedUntil)}
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.99] text-white rounded-xl transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed mt-2 font-bold text-sm shadow-md shadow-blue-600/30 flex items-center justify-center gap-2"
              >
                <span>{rateLimitInfo.lockedUntil && new Date() < rateLimitInfo.lockedUntil ? "Account Locked" : "Sign In to HealthWatch"}</span>
              </button>
            </form>

            {/* Quick-Fill Demo Helpers for Development / Evaluation */}
            <div className="mt-5 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between text-[11px] text-slate-500 mb-2">
                <span className="font-semibold text-slate-600">Quick Test Credentials:</span>
                <span className="text-[10px] text-slate-400">Click to autofill</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => fillCredentials("employee")}
                  className="py-1.5 px-2 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-700 transition-colors text-center"
                >
                  Health Admin
                </button>
                <button
                  type="button"
                  onClick={() => fillCredentials("admin")}
                  className="py-1.5 px-2 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-700 transition-colors text-center"
                >
                  System Admin
                </button>
              </div>
            </div>

            {/* Compliance Footer */}
            <div className="mt-5 text-center text-slate-400 text-[11px] leading-tight">
              HealthWatch Olongapo • Authorized Personnel Only
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}