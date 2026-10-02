import { useState, useCallback, useEffect, useRef } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router";
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
  UserPlus,
  ChevronDown,
  ClipboardList,
  ShieldCheck,
  LockKeyhole,
  FileClock,
  Search,
  Clock,
  Sparkles,
  Command,
  CheckCircle2,
  AlertTriangle,
  Info,
  ChevronRight,
  Activity,
  HeartPulse,
} from "lucide-react";
import { LogoutScreen } from "./LogoutScreen";
import { SessionTimeoutWarning } from "./SessionTimeoutWarning";
import { useAuth, useSessionTimeout } from "../hooks";
import type { UserRole } from "../models";
import logoImage from "../../styles/Images/HealthWatchLogoPortrait.jpg";

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: UserRole[];
  badge?: string;
  description?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

function getRoleLabel(role?: UserRole): string {
  if (role === "Employee") return "Public Health Administrator";
  if (role === "Admin") return "System Administrator";
  return "System User";
}

const navSections: NavSection[] = [
  {
    title: "Overview",
    items: [
      { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["Employee"], description: "Analytics & KPI metrics" },
    ],
  },
  {
    title: "Clinical Services",
    items: [
      { to: "/patients", label: "Patients", icon: Users, roles: ["Employee"], description: "Medical records directory" },
      { to: "/consultations", label: "Consultations", icon: Stethoscope, roles: ["Employee"], description: "Diagnosis & checkups" },
      { to: "/appointments", label: "Appointments", icon: Calendar, roles: ["Employee"], description: "Schedule & clinic bookings" },
      { to: "/prescriptions", label: "Prescriptions", icon: Pill, roles: ["Employee"], description: "Rx & pharmacy dispense" },
      { to: "/vital-signs", label: "Vital Signs", icon: ClipboardList, roles: ["Employee"], description: "Triage & biometric logs" },
    ],
  },
  {
    title: "Administration",
    items: [
      { to: "/staff", label: "Staff", icon: UserCog, roles: ["Admin", "Employee"], description: "Healthcare personnel directory" },
      { to: "/register", label: "Register User", icon: UserPlus, roles: ["Admin"], description: "Onboard new medical staff" },
      { to: "/reports", label: "Reports", icon: BarChart3, roles: ["Employee"], description: "DOH & City Health summaries" },
    ],
  },
  {
    title: "System & Security",
    items: [
      { to: "/sysadmin/rbac", label: "RBAC", icon: ShieldCheck, roles: ["Admin"], description: "Roles and permissions" },
      { to: "/sysadmin/security", label: "Security", icon: LockKeyhole, roles: ["Admin"], description: "Password policies & audit" },
      { to: "/sysadmin/audit-trail", label: "Audit Trail", icon: FileClock, roles: ["Admin"], description: "Immutable system activity" },
    ],
  },
];

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: "info" | "warning" | "success";
  unread: boolean;
}

const initialNotifications: NotificationItem[] = [
  {
    id: "1",
    title: "Vaccination Inventory Update",
    message: "New batch of Pentavalent & MMR vaccines logged for Barangay Barretto Health Center.",
    time: "10m ago",
    type: "info",
    unread: true,
  },
  {
    id: "2",
    title: "High Consultation Volume",
    message: "Pediatric triage queue exceeded standard threshold (8 waiting).",
    time: "25m ago",
    type: "warning",
    unread: true,
  },
  {
    id: "3",
    title: "Audit Log Synchronized",
    message: "Daily patient records database backup verified with City Health Office central node.",
    time: "1h ago",
    type: "success",
    unread: false,
  },
];

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [currentTime, setCurrentTime] = useState("");
  const [showLogoutScreen, setShowLogoutScreen] = useState(false);
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const profileRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // Live Philippine Standard Time clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-PH", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard shortcut Ctrl+K / Cmd+K for quick command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
        setNotificationsOpen(false);
        setProfileOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleLogout = useCallback(() => {
    setShowTimeoutWarning(false);
    setShowLogoutScreen(true);
  }, []);

  const handleLogoutComplete = useCallback(() => {
    logout();
    navigate("/login");
  }, [logout, navigate]);

  // Session timeout hook - 30 minutes timeout, 5 minute warning
  const { isWarning, remainingSeconds, extendSession } = useSessionTimeout({
    timeoutMs: 30 * 60 * 1000,
    warningMs: 5 * 60 * 1000,
    onTimeout: handleLogoutComplete,
    onWarning: () => setShowTimeoutWarning(true),
    enabled: true,
  });

  const handleExtendSession = useCallback(() => {
    setShowTimeoutWarning(false);
    extendSession();
  }, [extendSession]);

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const unreadCount = notifications.filter((n) => n.unread).length;

  // Flattened accessible nav items
  const allNavItems = navSections.flatMap((s) => s.items);
  const currentNav = allNavItems.find((item) => location.pathname.startsWith(item.to));

  // Filtered items for command search modal
  const filteredSearchItems = allNavItems
    .filter((item) => !item.roles || (user ? item.roles.includes(user.role) : false))
    .filter((item) =>
      item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

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
    <div className="flex h-screen bg-slate-900 text-slate-800 antialiased overflow-hidden font-sans">
      {/* Session Timeout Warning Modal */}
      {(showTimeoutWarning || isWarning) && (
        <SessionTimeoutWarning
          remainingSeconds={remainingSeconds}
          onExtend={handleExtendSession}
          onLogout={handleLogout}
        />
      )}

      {/* Quick Search / Command Dialog */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-950/60 backdrop-blur-md animate-fade-in">
          <div
            className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transform animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center px-4 py-3.5 border-b border-slate-100 bg-slate-50/50">
              <Search className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Jump to page, records, or clinical modules..."
                className="w-full bg-transparent text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none"
              />
              <span className="text-[11px] font-semibold text-slate-400 bg-slate-200/80 px-2 py-0.5 rounded border border-slate-300">
                ESC
              </span>
            </div>

            <div className="max-h-80 overflow-y-auto p-2 space-y-1 custom-scrollbar">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1.5">
                Quick Navigation
              </p>
              {filteredSearchItems.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm">
                  No matching clinical pages found for "{searchQuery}"
                </div>
              ) : (
                filteredSearchItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.to}
                      onClick={() => {
                        navigate(item.to);
                        setSearchOpen(false);
                        setSearchQuery("");
                      }}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left hover:bg-blue-50/80 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-100/60 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800 group-hover:text-blue-700">
                            {item.label}
                          </p>
                          {item.description && (
                            <p className="text-xs text-slate-400 line-clamp-1">{item.description}</p>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition-colors" />
                    </button>
                  );
                })
              )}
            </div>
            <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>HealthWatch Olongapo Navigation</span>
              <span>Press ESC to close</span>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Sidebar Backdrop Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-40 lg:hidden animate-fade-in"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Modern Medical Sidebar */}
      <aside
        className={`
          fixed lg:relative inset-y-0 left-0 z-50
          ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          ${sidebarOpen ? "lg:w-64" : "lg:w-20"}
          w-[85vw] max-w-[17rem] lg:w-auto
          bg-gradient-to-b from-[#0B192C] via-[#0F223D] to-[#0A1627]
          border-r border-slate-800/80
          flex flex-col transition-all duration-300 ease-in-out flex-shrink-0 shadow-2xl
        `}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-slate-800/80 bg-slate-950/20">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white p-0.5 shadow-md shadow-blue-500/10 ring-2 ring-blue-500/20 hover:scale-105 transition-transform flex items-center justify-center overflow-hidden">
              <img
                src={logoImage}
                alt="Health Watch Olongapo"
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            <div
              className={`transition-all duration-300 overflow-hidden ${sidebarOpen || mobileSidebarOpen ? "opacity-100 w-auto" : "lg:opacity-0 lg:w-0"
                }`}
            >
              <div className="flex items-center gap-1.5">
                <span className="text-white font-extrabold text-sm tracking-tight truncate">
                  HealthWatch
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  CHO
                </span>
              </div>
              <p className="text-slate-400 truncate text-[11px] font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Olongapo City
              </p>
            </div>
          </div>

          {/* Close button for mobile */}
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Sections */}
        <nav className="flex-1 px-3 py-3 overflow-y-auto sidebar-scrollbar space-y-4">
          {navSections.map((section) => {
            const visibleItems = section.items.filter(
              (item) => !item.roles || (user ? item.roles.includes(user.role) : false)
            );
            if (visibleItems.length === 0) return null;

            return (
              <div key={section.title} className="space-y-1">
                {/* Section title (visible when expanded) */}
                <div
                  className={`px-3 py-1 transition-all duration-200 ${sidebarOpen || mobileSidebarOpen ? "block" : "lg:hidden"
                    }`}
                >
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    {section.title}
                  </p>
                </div>

                {visibleItems.map(({ to, label, icon: Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={() => setMobileSidebarOpen(false)}
                    title={!sidebarOpen ? label : undefined}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${isActive
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-lg shadow-blue-600/30"
                        : "text-slate-300 hover:bg-white/[0.07] hover:text-white font-medium"
                      } ${!sidebarOpen ? "lg:justify-center lg:px-2" : ""}`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-white rounded-r-full shadow-sm" />
                        )}
                        <Icon
                          className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 ${isActive ? "scale-110 text-white" : "text-slate-400 group-hover:text-blue-300 group-hover:scale-110"
                            }`}
                        />
                        <span
                          className={`truncate text-sm transition-all duration-300 ${sidebarOpen || mobileSidebarOpen
                            ? "opacity-100 w-auto"
                            : "lg:opacity-0 lg:w-0 lg:hidden"
                            }`}
                        >
                          {label}
                        </span>
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            );
          })}
        </nav>

        {/* User Card & Logout Footer */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
          <div
            className={`flex items-center gap-3 px-2 py-2 mb-2 rounded-xl bg-white/[0.04] border border-white/[0.06] ${sidebarOpen || mobileSidebarOpen ? "justify-between" : "lg:justify-center"
              }`}
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-500 to-cyan-400 text-white flex items-center justify-center font-bold text-xs shadow-md flex-shrink-0">
                {user?.username ? user.username.charAt(0).toUpperCase() : "U"}
              </div>
              <div
                className={`overflow-hidden transition-all duration-300 ${sidebarOpen || mobileSidebarOpen ? "opacity-100" : "lg:opacity-0 lg:w-0 lg:hidden"
                  }`}
              >
                <p className="text-white text-xs font-semibold truncate leading-tight">
                  {user?.username ? user.username.charAt(0).toUpperCase() + user.username.slice(1) : "Staff"}
                </p>
                <p className="text-blue-400 text-[10px] font-medium truncate">
                  {user?.role === "Admin" ? "System Admin" : "Health Admin"}
                </p>
              </div>
            </div>
            {(sidebarOpen || mobileSidebarOpen) && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50 flex-shrink-0" />
            )}
          </div>

          <button
            onClick={handleLogout}
            title="Sign out of HealthWatch"
            className={`flex items-center gap-3 w-full px-3 py-2 text-rose-300 hover:text-white hover:bg-rose-500/20 rounded-xl transition-all duration-200 group text-sm font-medium ${!sidebarOpen ? "lg:justify-center lg:px-2" : ""
              }`}
          >
            <LogOut className="w-4 h-4 flex-shrink-0 group-hover:scale-110 transition-transform" />
            <span
              className={`transition-all duration-300 ${sidebarOpen || mobileSidebarOpen ? "opacity-100" : "lg:opacity-0 lg:w-0 lg:hidden"
                }`}
            >
              Sign Out
            </span>
          </button>
        </div>
      </aside>

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50 overflow-hidden">
        {/* Modern Elevated Top Bar */}
        <header className="bg-white/90 backdrop-blur-xl border-b border-slate-200/80 flex items-center justify-between px-3 sm:px-6 py-2.5 sm:py-3 flex-shrink-0 sticky top-0 z-30 shadow-xs">
          {/* Left: Sidebar Toggle, Page Context & Search */}
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden text-slate-600 hover:text-slate-900 p-2 rounded-xl hover:bg-slate-100 transition-colors"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Desktop sidebar collapse/expand toggle */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden lg:flex text-slate-500 hover:text-slate-900 p-2 rounded-xl hover:bg-slate-100 transition-all duration-200 hover:scale-105 active:scale-95"
              title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Dynamic Breadcrumbs & Section Title */}
            <div className="hidden md:flex items-center gap-2 text-xs font-medium text-slate-500">
              <span className="flex items-center gap-1.5 text-blue-700 font-semibold">
                <HeartPulse className="w-3.5 h-3.5 text-blue-600" />
                HealthWatch CHO
              </span>
              <span className="text-slate-300">/</span>
              <span className="text-slate-800 font-bold capitalize">
                {currentNav?.label || "Workspace"}
              </span>
            </div>

            {/* Quick Search Trigger Bar */}
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200/70 border border-slate-200/80 rounded-xl text-slate-500 hover:text-slate-800 text-xs font-medium transition-all group shadow-2xs"
            >
              <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors" />
              <span className="hidden sm:inline">Search records & modules...</span>
              <span className="sm:hidden">Search...</span>
              <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 bg-white border border-slate-200 rounded-md shadow-2xs">
                <Command className="w-2.5 h-2.5" /> K
              </kbd>
            </button>
          </div>

          {/* Right: PST Clock, Online Badge, Notifications, User Menu */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* Live Clock Badge (PST) */}
            <div className="hidden xl:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-xs font-medium">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <span>{currentTime || "PST"}</span>
              <span className="text-[10px] text-slate-400 font-semibold">PST</span>
            </div>

            {/* System Status Pill */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/70 text-emerald-700 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="hidden md:inline">CHO Online</span>
            </div>

            {/* Interactive Notifications Center */}
            <div className="relative" ref={notificationsRef}>
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative text-slate-600 hover:text-slate-900 p-2 rounded-xl hover:bg-slate-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white animate-pulse" />
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 glass-dropdown rounded-2xl p-0 z-50 animate-fade-in-down overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/70">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-800">Clinical Alerts</span>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllNotificationsRead}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 custom-scrollbar">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400">
                        No active clinical alerts at this time.
                      </div>
                    ) : (
                      notifications.map((item) => (
                        <div
                          key={item.id}
                          className={`p-3.5 hover:bg-slate-50 transition-colors flex gap-3 ${item.unread ? "bg-blue-50/40" : ""
                            }`}
                        >
                          <div className="flex-shrink-0 mt-0.5">
                            {item.type === "warning" && (
                              <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                                <AlertTriangle className="w-4 h-4" />
                              </div>
                            )}
                            {item.type === "info" && (
                              <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                                <Info className="w-4 h-4" />
                              </div>
                            )}
                            {item.type === "success" && (
                              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                <CheckCircle2 className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1 mb-0.5">
                              <p className="text-xs font-bold text-slate-800 truncate">{item.title}</p>
                              <span className="text-[10px] text-slate-400 flex-shrink-0">{item.time}</span>
                            </div>
                            <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                              {item.message}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 hover:bg-slate-100 rounded-xl p-1.5 sm:px-2.5 sm:py-1.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 group"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                  {user?.username ? user.username.charAt(0).toUpperCase() : "A"}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-slate-800 text-xs font-bold leading-tight">
                    {user?.username ? user.username.charAt(0).toUpperCase() + user.username.slice(1) : "Administrator"}
                  </p>
                  <p className="text-slate-400 text-[10px] font-medium leading-none mt-0.5">
                    {user?.role === "Admin" ? "System Admin" : "Health Admin"}
                  </p>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${profileOpen ? "rotate-180 text-blue-600" : ""
                    }`}
                />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 glass-dropdown rounded-2xl py-2 z-50 animate-fade-in-down shadow-2xl">
                  <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                    <p className="text-slate-800 text-sm font-bold truncate">
                      {user?.username ? user.username.charAt(0).toUpperCase() + user.username.slice(1) : "Administrator"}
                    </p>
                    <p className="text-slate-400 text-xs truncate mt-0.5">{user?.email || "user@healthwatch.ph"}</p>
                    <div className="mt-2">
                      <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 text-blue-700">
                        {getRoleLabel(user?.role)}
                      </span>
                    </div>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        navigate("/staff");
                      }}
                      className="w-full text-left px-4 py-2 text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-2.5 text-xs font-medium"
                    >
                      <UserCog className="w-4 h-4 text-slate-400" />
                      Staff Directory & Roles
                    </button>
                    {user?.role === "Admin" && (
                      <button
                        onClick={() => {
                          setProfileOpen(false);
                          navigate("/sysadmin/security");
                        }}
                        className="w-full text-left px-4 py-2 text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-2.5 text-xs font-medium"
                      >
                        <ShieldCheck className="w-4 h-4 text-slate-400" />
                        System Security Hub
                      </button>
                    )}
                  </div>

                  <div className="border-t border-slate-100 pt-1">
                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        handleLogout();
                      }}
                      className="w-full text-left px-4 py-2 text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-2.5 text-xs font-bold"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Page Content Shell */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 via-slate-50 to-blue-50/20 custom-scrollbar">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

