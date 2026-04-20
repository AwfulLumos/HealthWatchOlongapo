import { useState } from "react";
import { useNavigate } from "react-router";
import { Eye, EyeOff, Lock, User, Mail, Shield, AlertTriangle, CheckCircle2, ArrowLeft } from "lucide-react";
import { validateRegistrationForm, type RegistrationFormInput } from "../utils/validation";
import { authService } from "../services/authService";
import logoImage from "../../styles/Images/HealthWatchLogoPortrait.jpg";

export function RegistrationPage() {
  const navigate = useNavigate();
  
  // Form state
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<'Admin' | 'Employee'>('Employee');
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
      staffId: staffId || undefined
    };

    const validation = validateRegistrationForm(formData);
    
    if (!validation.success) {
      // Convert validation errors to field-specific errors
      const errors: Record<string, string> = {};
      validation.errors.forEach(err => {
        errors[err.field] = err.message;
      });
      setFieldErrors(errors);
      setError(validation.errors[0]?.message || "Please fix the errors below");
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Call registration API using authService
      const result = await authService.register(validation.data!);

      if (result.success) {
        setSuccess(true);
        // Redirect to staff page after 2 seconds
        setTimeout(() => {
          navigate('/staff');
        }, 2000);
      } else {
        setError(result.error || "Registration failed. Please try again.");
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError("An error occurred during registration. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show success message
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-600 via-green-700 to-green-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center animate-fade-in-up">
          <CheckCircle2 className="w-20 h-20 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Successful!</h2>
          <p className="text-gray-600 mb-4">
            User account has been created successfully. Redirecting...
          </p>
        </div>
      </div>
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

      <div className="relative w-full max-w-6xl flex flex-col lg:flex-row items-center justify-center gap-8 sm:gap-10 lg:gap-16">

        {/* LEFT — Logo & Branding */}
        <div className="flex-1 flex flex-col items-center text-center animate-fade-in-up">
          {/* Logo */}
          <div className="mb-5 sm:mb-7">
            <div className="w-36 h-36 sm:w-48 sm:h-48 md:w-60 md:h-60 lg:w-72 lg:h-72 bg-white/95 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden hover-lift transition-all duration-300 cursor-default">
              <img src={logoImage} alt="Health Watch Olongapo" className="w-full h-full object-cover" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-white mb-2 sm:mb-3 font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl leading-tight">
            Health Watch<br />Olongapo
          </h1>
          
          {/* Subtitle */}
          <p className="text-blue-100 font-medium mb-5 sm:mb-7 text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed">
            User Registration<br />Admin Portal
          </p>

          {/* Decorative divider */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="w-8 sm:w-10 h-0.5 bg-blue-300 rounded-full" />
            <span className="text-blue-200 font-medium text-xs sm:text-sm">Create New User Account</span>
            <div className="w-8 sm:w-10 h-0.5 bg-blue-300 rounded-full" />
          </div>
        </div>

        {/* RIGHT — Registration Card */}
        <div className="w-full sm:w-[420px] lg:w-[450px] flex-shrink-0 animate-fade-in-up animation-delay-200">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-6">
            {/* Header with Back Button */}
            <div className="flex items-center gap-2 mb-3">
              <button
                type="button"
                onClick={() => navigate('/staff')}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h2 className="text-gray-900 font-bold text-lg sm:text-xl">
                  Register New User
                </h2>
                <p className="text-gray-500 font-medium text-xs sm:text-sm">
                  Create a new admin or employee account
                </p>
              </div>
            </div>

            <form onSubmit={handleRegister} className="space-y-3">{/* Username */}
              <div className="animate-fade-in animation-delay-300">
                <label className="block text-gray-700 mb-1 font-semibold text-xs sm:text-sm">
                  Username <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 transition-colors group-focus-within:text-blue-600" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username"
                    className={`w-full pl-9 pr-3 py-2 border-2 rounded-lg bg-gray-50 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200 font-medium text-xs sm:text-sm ${
                      fieldErrors.username ? 'border-red-300' : 'border-gray-200'
                    }`}
                  />
                </div>
                {fieldErrors.username && (
                  <p className="mt-0.5 text-xs text-red-600 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {fieldErrors.username}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="animate-fade-in animation-delay-350">
                <label className="block text-gray-700 mb-1 font-semibold text-xs sm:text-sm">
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 transition-colors group-focus-within:text-blue-600" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email address"
                    className={`w-full pl-9 pr-3 py-2 border-2 rounded-lg bg-gray-50 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200 font-medium text-xs sm:text-sm ${
                      fieldErrors.email ? 'border-red-300' : 'border-gray-200'
                    }`}
                  />
                </div>
                {fieldErrors.email && (
                  <p className="mt-0.5 text-xs text-red-600 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {fieldErrors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="animate-fade-in animation-delay-400">
                <label className="block text-gray-700 mb-1 font-semibold text-xs sm:text-sm">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 transition-colors group-focus-within:text-blue-600" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password (min 8 characters)"
                    className={`w-full pl-9 pr-10 py-2 border-2 rounded-lg bg-gray-50 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200 font-medium text-xs sm:text-sm ${
                      fieldErrors.password ? 'border-red-300' : 'border-gray-200'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="mt-0.5 text-xs text-red-600 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {fieldErrors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="animate-fade-in animation-delay-450">
                <label className="block text-gray-700 mb-1 font-semibold text-xs sm:text-sm">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 transition-colors group-focus-within:text-blue-600" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    className={`w-full pl-9 pr-10 py-2 border-2 rounded-lg bg-gray-50 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200 font-medium text-xs sm:text-sm ${
                      fieldErrors.confirmPassword ? 'border-red-300' : 'border-gray-200'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {fieldErrors.confirmPassword && (
                  <p className="mt-0.5 text-xs text-red-600 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {fieldErrors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Role Selection */}
              <div className="animate-fade-in animation-delay-500">
                <label className="block text-gray-700 mb-1 font-semibold text-xs sm:text-sm">
                  Role <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 transition-colors group-focus-within:text-blue-600 z-10" />
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as 'Admin' | 'Employee')}
                    className="w-full pl-9 pr-3 py-2 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200 font-medium text-xs sm:text-sm appearance-none cursor-pointer"
                  >
                    <option value="Employee">Employee</option>
                    <option value="Admin">Admin</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Staff ID (Optional) */}
              <div className="animate-fade-in animation-delay-550">
                <label className="block text-gray-700 mb-1 font-semibold text-xs sm:text-sm">
                  Staff ID <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <div className="relative group">
                  <input
                    type="text"
                    value={staffId}
                    onChange={(e) => setStaffId(e.target.value)}
                    placeholder="Enter staff ID if available"
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200 font-medium text-xs sm:text-sm"
                  />
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border-2 border-red-200 text-red-600 px-3 py-2 rounded-lg animate-fade-in-down font-medium text-xs sm:text-sm flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-2.5 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 mt-4 text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed animate-fade-in animation-delay-600"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creating Account...
                  </span>
                ) : (
                  'Create User Account'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
