import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Eye,
  EyeOff,
  Lock,
  User,
  Mail,
  Shield,
  AlertTriangle,
  CheckCircle2,
  ArrowLeft,
  UserPlus,
  ShieldCheck,
  Building2,
  Sparkles,
  Info,
  BadgeCheck,
} from "lucide-react";
import { validateRegistrationForm, type RegistrationFormInput } from "../utils/validation";
import { authService } from "../services/authService";

export function RegistrationPage() {
  const navigate = useNavigate();

  // Form state
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"Admin" | "Employee">("Employee");
  const [staffId, setStaffId] = useState("");

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    // Validate input
    const formData: RegistrationFormInput = {
      username,
      email,
      password,
      confirmPassword,
      role,
      staffId: staffId || undefined,
    };

    const validation = validateRegistrationForm(formData);

    if (!validation.success) {
      const errors: Record<string, string> = {};
      validation.errors.forEach((err) => {
        errors[err.field] = err.message;
      });
      setFieldErrors(errors);
      setError(validation.errors[0]?.message || "Please fix the validation errors below.");
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await authService.register(validation.data!);

      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate("/staff");
        }, 1800);
      } else {
        setError(result.error || "Registration failed. Please try again.");
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError("An unexpected error occurred during user registration.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="p-4 sm:p-8 flex items-center justify-center min-h-[70vh]">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200/80 p-8 sm:p-10 max-w-md w-full text-center animate-scale-in">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm shadow-emerald-500/20">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-2">
            Personnel Enrolled!
          </h2>
          <p className="text-slate-500 text-sm mb-6 leading-relaxed">
            The account for <span className="font-semibold text-slate-800">@{username}</span> has been provisioned with{" "}
            <span className="font-semibold text-blue-600">{role === "Admin" ? "System Administrator" : "Public Health Administrator"}</span> permissions.
          </p>
          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Redirecting to Staff Directory...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Top Breadcrumb & Action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <button
            onClick={() => navigate("/staff")}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Staff Directory
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Enroll Healthcare Personnel
              </h1>
              <p className="text-slate-500 text-xs sm:text-sm">
                Create new authenticated accounts for Barangay Health Workers & Administrators.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
            Admin Authorization Required
          </span>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT / SIDEBAR: Guidance & Role Explanations */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-600" />
              Role Responsibilities
            </h2>

            <div className="space-y-3">
              <div
                onClick={() => setRole("Employee")}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${role === "Employee"
                  ? "bg-blue-50/70 border-blue-300 ring-2 ring-blue-500/20"
                  : "bg-slate-50 border-slate-200/70 hover:bg-slate-100/70"
                  }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-bold text-slate-800">Public Health Admin</p>
                  {role === "Employee" && <BadgeCheck className="w-4 h-4 text-blue-600" />}
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Full clinical access to Patient Profiles, Consultations, Vital Signs, Prescriptions, Appointments, and DOH Reports.
                </p>
              </div>

              <div
                onClick={() => setRole("Admin")}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${role === "Admin"
                  ? "bg-indigo-50/70 border-indigo-300 ring-2 ring-indigo-500/20"
                  : "bg-slate-50 border-slate-200/70 hover:bg-slate-100/70"
                  }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-bold text-slate-800">System Administrator</p>
                  {role === "Admin" && <BadgeCheck className="w-4 h-4 text-indigo-600" />}
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Platform management, RBAC policy control, Staff onboarding, Immutable Audit Trail, and Security configurations.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-900 to-indigo-950 rounded-2xl p-5 text-white shadow-md">
            <div className="flex items-center gap-2 text-cyan-300 text-xs font-bold mb-2">
              <Info className="w-4 h-4" />
              Security Protocol Notice
            </div>
            <p className="text-[11px] text-slate-200 leading-relaxed">
              In accordance with RA 10173 (Data Privacy Act of 2012), passwords must be at least 8 characters, include upper and lowercase letters, a number, and a special character.
            </p>
          </div>
        </div>

        {/* RIGHT / MAIN: User Registration Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 mb-5">Personnel Credentials & Account Info</h2>

            <form onSubmit={handleRegister} className="space-y-4">
              {/* Username & Staff ID Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 mb-1.5 font-bold text-xs uppercase tracking-wider">
                    Username <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative group">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g. maria.santos"
                      className={`w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border rounded-xl text-slate-900 placeholder-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all ${fieldErrors.username ? "border-rose-300" : "border-slate-200"
                        }`}
                    />
                  </div>
                  {fieldErrors.username && (
                    <p className="mt-1 text-xs text-rose-600 flex items-center gap-1 font-medium">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      {fieldErrors.username}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-slate-700 mb-1.5 font-bold text-xs uppercase tracking-wider">
                    Staff / Employee ID <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <div className="relative group">
                    <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                    <input
                      type="text"
                      value={staffId}
                      onChange={(e) => setStaffId(e.target.value)}
                      placeholder="e.g. CHO-2026-089"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-slate-700 mb-1.5 font-bold text-xs uppercase tracking-wider">
                  Official Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative group">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. maria.santos@olongapocity.gov.ph"
                    className={`w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border rounded-xl text-slate-900 placeholder-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all ${fieldErrors.email ? "border-rose-300" : "border-slate-200"
                      }`}
                  />
                </div>
                {fieldErrors.email && (
                  <p className="mt-1 text-xs text-rose-600 flex items-center gap-1 font-medium">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {fieldErrors.email}
                  </p>
                )}
              </div>

              {/* Password Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-slate-700 mb-1.5 font-bold text-xs uppercase tracking-wider">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 8 characters"
                      className={`w-full pl-10 pr-10 py-2.5 bg-slate-50 border rounded-xl text-slate-900 placeholder-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all ${fieldErrors.password ? "border-rose-300" : "border-slate-200"
                        }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {fieldErrors.password && (
                    <p className="mt-1 text-xs text-rose-600 flex items-center gap-1 font-medium">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      {fieldErrors.password}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-slate-700 mb-1.5 font-bold text-xs uppercase tracking-wider">
                    Confirm Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      className={`w-full pl-10 pr-10 py-2.5 bg-slate-50 border rounded-xl text-slate-900 placeholder-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all ${fieldErrors.confirmPassword ? "border-rose-300" : "border-slate-200"
                        }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {fieldErrors.confirmPassword && (
                    <p className="mt-1 text-xs text-rose-600 flex items-center gap-1 font-medium">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      {fieldErrors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>

              {/* General Error Banner */}
              {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl animate-fade-in font-medium text-xs flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => navigate("/staff")}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold text-xs shadow-md shadow-blue-600/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Provisioning Account...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      Enroll Personnel
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

