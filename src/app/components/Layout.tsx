import { useState, useCallback } from "react";
import { NavLink, Outlet, useNavigate } from "react-router";
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  Calendar,
  Pill,
  UserCog,
  BarChart3,
  LogOut,
  Menu,
  X,
  Bell,
  ChevronDown,
  ClipboardList,
} from "lucide-react";
import { LogoutScreen } from "./LogoutScreen";
import { SessionTimeoutWarning } from "./SessionTimeoutWarning";
import { useAuth, useSessionTimeout } from "../hooks";
import logoImage from "../../styles/Images/HealthWatchLogoPortrait.jpg";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/patients", label: "Patients", icon: Users },
  { to: "/consultations", label: "Consultations", icon: Stethoscope },
  { to: "/appointments", label: "Appointments", icon: Calendar },
  { to: "/prescriptions", label: "Prescriptions", icon: Pill },
  { to: "/vital-signs", label: "Vital Signs", icon: ClipboardList },
  { to: "/staff", label: "Staff", icon: UserCog },
  { to: "/reports", label: "Reports", icon: BarChart3 },
];

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [showLogoutScreen, setShowLogoutScreen] = useState(false);
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = useCallback(() => {
    setShowTimeoutWarning(false);
    setShowLogoutScreen(true);
  }, []);

  const handleLogoutComplete = useCallback(() => {
    logout();
    navigate("/login");
  }, [logout, navigate]);

  // Session timeout hook - 30 minutes timeout, 5 minute warning
  const { 
    isWarning, 
    remainingSeconds, 
    extendSession 
  } = useSessionTimeout({
    timeoutMs: 30 * 60 * 1000,  // 30 minutes
    warningMs: 5 * 60 * 1000,   // 5 minute warning
    onTimeout: handleLogoutComplete,
    onWarning: () => setShowTimeoutWarning(true),
    enabled: true,
  });

  const handleExtendSession = useCallback(() => {
    setShowTimeoutWarning(false);
    extendSession();
  }, [extendSession]);

  if (showLogoutScreen) {
    return (
      <LogoutScreen 
        userName={user?.username ? user.username.charAt(0).toUpperCase() + user.username.slice(1) : "User"}
        onComplete={handleLogoutComplete}
        duration={2000}
      />
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Session Timeout Warning Modal */}
      {(showTimeoutWarning || isWarning) && (
        <SessionTimeoutWarning
          remainingSeconds={remainingSeconds}
          onExtend={handleExtendSession}
          onLogout={handleLogout}
        />
      )}

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:relative inset-y-0 left-0 z-50
          ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          ${sidebarOpen ? "lg:w-56" : "lg:w-16"}
          w-[85vw] max-w-[16rem] lg:w-auto
          bg-gradient-to-b from-blue-900 via-blue-900 to-blue-950 
          flex flex-col transition-all duration-300 ease-in-out flex-shrink-0 shadow-xl
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-blue-800/50">
          <div className="flex-shrink-0 w-9 h-9 bg-white rounded-lg overflow-hidden shadow-md hover:scale-105 transition-transform">
            <img src={logoImage} alt="Health Watch Olongapo" className="w-full h-full object-cover" />
          </div>
          <div className={`overflow-hidden transition-all duration-300 ${sidebarOpen || mobileSidebarOpen ? "opacity-100 w-auto" : "lg:opacity-0 lg:w-0"}`}>
            <p className="text-white truncate text-xs font-bold leading-tight">
              Health Watch
            </p>
            <p className="text-blue-300 truncate text-[0.65rem]">
              Olongapo
            </p>
          </div>
          {/* Close button for mobile */}
          <button 
            onClick={() => setMobileSidebarOpen(false)}
            className="lg:hidden ml-auto text-blue-200 hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 overflow-y-auto">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMobileSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 mx-2 rounded-lg transition-all duration-200 group relative ${
                  isActive
                    ? "bg-blue-600/90 text-white shadow-lg shadow-blue-600/30"
                    : "text-blue-200 hover:bg-blue-800/50 hover:text-white"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-white rounded-r-full" />
                  )}
                  <Icon className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 transition-transform duration-200 ${isActive ? "" : "group-hover:scale-110"}`} />
                  <span 
                    className={`truncate transition-all duration-300 text-sm font-medium ${sidebarOpen || mobileSidebarOpen ? "opacity-100" : "lg:opacity-0 lg:w-0"}`}
                  >
                    {label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-blue-800/50">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-2 py-2 text-blue-200 hover:text-white hover:bg-red-500/20 rounded-lg transition-all duration-200 group"
          >
            <LogOut className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 group-hover:scale-110 transition-transform" />
            <span className={`transition-all duration-300 text-sm font-medium ${sidebarOpen || mobileSidebarOpen ? "opacity-100" : "lg:opacity-0 lg:w-0"}`}>
              Logout
            </span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 flex items-center justify-between px-3 sm:px-6 py-2.5 sm:py-3 flex-shrink-0 sticky top-0 z-10">
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-all duration-200"
            >
              <Menu className="w-5 h-5" />
            </button>
            {/* Desktop sidebar toggle */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden lg:block text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-all duration-200 hover:scale-105 active:scale-95"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="hidden md:block">
              <input
                type="text"
                placeholder="Search patients, records..."
                className="w-40 sm:w-48 md:w-56 lg:w-72 px-3 sm:px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200 text-sm"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Notifications */}
            <button className="relative text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-all duration-200">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse ring-2 ring-white" />
            </button>

            {/* Profile */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 hover:bg-gray-100 rounded-lg px-2 py-1 transition-all duration-200"
              >
                <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white shadow-md text-xs font-bold">
                  {user?.username ? user.username.charAt(0).toUpperCase() : "A"}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-gray-800 text-xs sm:text-sm font-semibold">
                    {user?.username ? user.username.charAt(0).toUpperCase() + user.username.slice(1) : "Admin"}
                  </p>
                  <p className="text-gray-400 text-[0.65rem] sm:text-xs">
                    {user?.role || "System User"}
                  </p>
                </div>
                <ChevronDown className={`hidden sm:block w-4 h-4 text-gray-400 transition-transform duration-200 ${profileOpen ? "rotate-180" : ""}`} />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 sm:w-56 bg-white border border-gray-200 rounded-xl shadow-xl py-2 z-50 animate-fade-in-down">
                  <div className="px-4 py-3 border-b border-gray-100 mb-1">
                    <p className="text-gray-800 text-sm font-semibold">
                      {user?.username ? user.username.charAt(0).toUpperCase() + user.username.slice(1) : "Admin User"}
                    </p>
                    <p className="text-gray-400 text-xs">{user?.email || "user@healthwatch.ph"}</p>
                  </div>
                  <button className="w-full text-left px-4 py-2.5 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors flex items-center gap-2 text-sm">
                    <UserCog className="w-4 h-4" />
                    Profile Settings
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2.5 text-red-500 hover:bg-red-50 transition-colors flex items-center gap-2 text-sm"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 to-gray-100/50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
