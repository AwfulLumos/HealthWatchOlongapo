import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router";
import {
  Activity,
  LayoutDashboard,
  Users,
  Stethoscope,
  Calendar,
  Pill,
  UserCog,
  Building2,
  BarChart3,
  LogOut,
  Menu,
  X,
  Bell,
  ChevronDown,
  ClipboardList,
} from "lucide-react";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/patients", label: "Patients", icon: Users },
  { to: "/consultations", label: "Consultations", icon: Stethoscope },
  { to: "/appointments", label: "Appointments", icon: Calendar },
  { to: "/prescriptions", label: "Prescriptions", icon: Pill },
  { to: "/vital-signs", label: "Vital Signs", icon: ClipboardList },
  { to: "/staff", label: "Staff", icon: UserCog },
  { to: "/barangay-stations", label: "Barangay Stations", icon: Building2 },
  { to: "/reports", label: "Reports", icon: BarChart3 },
];

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/");
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-16"
        } bg-gradient-to-b from-blue-900 via-blue-900 to-blue-950 flex flex-col transition-all duration-300 ease-in-out flex-shrink-0 shadow-xl`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-blue-800/50">
          <div className="flex-shrink-0 w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-md hover:scale-105 transition-transform">
            <Activity className="w-5 h-5 text-blue-700" />
          </div>
          <div className={`overflow-hidden transition-all duration-300 ${sidebarOpen ? "opacity-100 w-auto" : "opacity-0 w-0"}`}>
            <p className="text-white truncate" style={{ fontSize: "0.8rem", fontWeight: 700, lineHeight: "1.2" }}>
              Health Watch
            </p>
            <p className="text-blue-300 truncate" style={{ fontSize: "0.7rem" }}>
              Olongapo
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {navItems.map(({ to, label, icon: Icon }, index) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-all duration-200 group relative ${
                  isActive
                    ? "bg-blue-600/90 text-white shadow-lg shadow-blue-600/30"
                    : "text-blue-200 hover:bg-blue-800/50 hover:text-white hover:translate-x-1"
                }`
              }
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full" />
                  )}
                  <Icon className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 ${isActive ? "" : "group-hover:scale-110"}`} />
                  <span 
                    className={`truncate transition-all duration-300 ${sidebarOpen ? "opacity-100" : "opacity-0 w-0"}`} 
                    style={{ fontSize: "0.875rem", fontWeight: 500 }}
                  >
                    {label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-blue-800/50">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-2 py-2 text-blue-200 hover:text-white hover:bg-red-500/20 rounded-lg transition-all duration-200 group"
          >
            <LogOut className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform" />
            <span className={`transition-all duration-300 ${sidebarOpen ? "opacity-100" : "opacity-0 w-0"}`} style={{ fontSize: "0.875rem", fontWeight: 500 }}>
              Logout
            </span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 flex items-center justify-between px-6 py-3 flex-shrink-0 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-all duration-200 hover:scale-105 active:scale-95"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="hidden md:block">
              <input
                type="text"
                placeholder="Search patients, records..."
                className="w-72 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200"
                style={{ fontSize: "0.875rem" }}
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <button className="relative text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-all duration-200 hover:scale-105 active:scale-95">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse ring-2 ring-white" />
            </button>

            {/* Profile */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 hover:bg-gray-100 rounded-lg px-2 py-1 transition-all duration-200"
              >
                <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white shadow-md hover:shadow-lg transition-shadow" style={{ fontSize: "0.75rem", fontWeight: 700 }}>
                  AD
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-gray-800" style={{ fontSize: "0.8rem", fontWeight: 600 }}>
                    Admin User
                  </p>
                  <p className="text-gray-400" style={{ fontSize: "0.7rem" }}>
                    System Administrator
                  </p>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${profileOpen ? "rotate-180" : ""}`} />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-xl py-2 z-50 animate-fade-in-down">
                  <div className="px-4 py-3 border-b border-gray-100 mb-1">
                    <p className="text-gray-800" style={{ fontSize: "0.85rem", fontWeight: 600 }}>Admin User</p>
                    <p className="text-gray-400" style={{ fontSize: "0.75rem" }}>admin@healthwatch.ph</p>
                  </div>
                  <button className="w-full text-left px-4 py-2.5 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors flex items-center gap-2" style={{ fontSize: "0.875rem" }}>
                    <UserCog className="w-4 h-4" />
                    Profile Settings
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2.5 text-red-500 hover:bg-red-50 transition-colors flex items-center gap-2"
                    style={{ fontSize: "0.875rem" }}
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
