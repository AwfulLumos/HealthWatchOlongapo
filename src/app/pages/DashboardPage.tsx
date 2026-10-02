import { useState, useEffect, useMemo } from "react";
import {
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  Users,
  Stethoscope,
  Calendar,
  Activity,
  RefreshCw,
  ArrowUpRight,
  UserPlus,
  FileText,
  HeartPulse,
  CalendarCheck,
  MapPin,
  ChevronRight,
  ShieldAlert,
  Sparkles,
  Filter,
  Check
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { Link } from "react-router";
import { dashboardService, buildMonthOptions } from "../services/dashboardService";
import { DashboardSkeleton } from "../components/skeletons/DashboardSkeleton";

const statusColor: Record<string, { badge: string; dot: string; text: string }> = {
  Active: {
    badge: "bg-emerald-50 text-emerald-700 border border-emerald-200/80",
    dot: "bg-emerald-500",
    text: "text-emerald-700",
  },
  Inactive: {
    badge: "bg-slate-100 text-slate-600 border border-slate-200",
    dot: "bg-slate-400",
    text: "text-slate-600",
  },
  Critical: {
    badge: "bg-rose-50 text-rose-700 border border-rose-200/80 animate-pulse",
    dot: "bg-rose-500",
    text: "text-rose-700",
  },
  Followup: {
    badge: "bg-amber-50 text-amber-700 border border-amber-200/80",
    dot: "bg-amber-500",
    text: "text-amber-700",
  },
};

// Curated clinical palette for diagnosis donut chart
const diagnosisColors = ["#0284c7", "#0d9488", "#f59e0b", "#e11d48", "#8b5cf6", "#06b6d4"];

export function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [statsData, setStatsData] = useState({
    totalPatients: 0,
    monthlyConsultations: 0,
    todayAppointments: 0,
    totalStaff: 0,
  });
  const [consultationsChartData, setConsultationsChartData] = useState<any[]>([]);
  const [diagnosisData, setDiagnosisData] = useState<any[]>([]);
  const [monthlyPatientData, setMonthlyPatientData] = useState<any[]>([]);
  const [recentPatients, setRecentPatients] = useState<any[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
  const [dismissedAlerts, setDismissedAlerts] = useState<number[]>([]);

  const monthOptions = useMemo(() => buildMonthOptions(6), []);

  const loadData = async (month?: string) => {
    try {
      const [stats, consultationChart, diagnosisBreakdown, recentActivity, upcomingAppts, monthlyPatients] = await Promise.all([
        month ? dashboardService.getMonthlyStats(month) : dashboardService.getStats(),
        dashboardService.getConsultationsChart(month),
        dashboardService.getDiagnosisBreakdown(month),
        dashboardService.getRecentActivity(),
        dashboardService.getUpcomingAppointments(),
        dashboardService.getMonthlyPatients(month),
      ]);

      if (stats && typeof stats === 'object') {
        setStatsData({
          totalPatients: stats.totalPatients ?? 0,
          monthlyConsultations: stats.monthlyConsultations ?? 0,
          todayAppointments: stats.todayAppointments ?? 0,
          totalStaff: stats.totalStaff ?? 0,
        });
      }

      const normalizedConsultations = (consultationChart || []).map((item: any) => ({
        day: item.day || item.month || "",
        consultations: Number(item.consultations ?? item.count ?? 0),
      }));
      setConsultationsChartData(normalizedConsultations);

      const coloredDiagnosis = (diagnosisBreakdown || []).map((item: any, index: number) => ({
        name: item.diagnosis || item.name || "General Checkup",
        value: Number(item.count || item.value || 0),
        color: item.color || diagnosisColors[index % diagnosisColors.length],
      }));
      setDiagnosisData(coloredDiagnosis);

      const transformedPatients = (recentActivity || []).map((p: any) => ({
        ...p,
        name: p.name || `${p.firstName || ''} ${p.lastName || ''}`.trim() || "Anonymous Patient",
        barangay: typeof p.barangay === 'object' ? p.barangay?.name : p.barangay || "Olongapo City",
        date: p.date || (p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "Today"),
        status: p.status || "Active",
      }));
      setRecentPatients(transformedPatients);

      const transformedAppts = (upcomingAppts || []).map((appt: any) => ({
        ...appt,
        patientName: appt.patientName || (appt.patient ? `${appt.patient.firstName || ''} ${appt.patient.lastName || ''}`.trim() : "Patient Visit"),
        staffName: appt.staffName || (appt.staff ? `${appt.staff.firstName || ''} ${appt.staff.lastName || ''}`.trim() : "On-duty Clinician"),
        time: appt.time || (appt.scheduledDate ? new Date(appt.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Scheduled"),
        purpose: appt.purpose || appt.notes || "General Consultation",
      }));
      setUpcomingAppointments(transformedAppts);

      const normalizedMonthlyPatients = (monthlyPatients || []).map((item: any) => ({
        month: item.month || "",
        patients: Number(item.patients ?? item.count ?? 0),
      }));
      setMonthlyPatientData(normalizedMonthlyPatients);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    }
  };

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await loadData(selectedMonth || undefined);
      setIsLoading(false);
    };
    init();
  }, [selectedMonth]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData(selectedMonth || undefined);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const totalDiagnosisCases = useMemo(() => {
    return diagnosisData.reduce((acc, curr) => acc + (curr.value || 0), 0);
  }, [diagnosisData]);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="p-3.5 sm:p-5 lg:p-7 space-y-5 sm:space-y-6 max-w-7xl mx-auto">
      {/* Top Clinical Header & Period Selector */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-slate-900 via-sky-950 to-teal-950 text-white rounded-2xl p-5 sm:p-6 shadow-xl border border-sky-800/40 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Health Network
            </span>
            <span className="text-sky-300/80 text-xs hidden sm:inline">&bull;</span>
            <span className="text-sky-200/80 text-xs font-medium hidden sm:inline">
              Olongapo City Health Command Center
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            Clinical Overview & Triage
          </h1>
          <p className="text-sky-100/70 text-xs sm:text-sm">
            {new Date().toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            {" "}&bull; Philippine Standard Time (PST)
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Period selector */}
          <div className="flex items-center gap-1.5 bg-white/10 hover:bg-white/15 backdrop-blur-md rounded-xl px-3 py-1.5 border border-white/15 transition-all text-xs">
            <Filter className="w-3.5 h-3.5 text-sky-300" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-white focus:outline-none font-medium text-xs cursor-pointer pr-2"
              aria-label="Filter clinical period"
            >
              <option value="" className="bg-slate-900 text-white">Current Period (All Time)</option>
              {monthOptions.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-slate-900 text-white">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Refresh button */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 bg-sky-500/20 hover:bg-sky-500/30 text-sky-200 border border-sky-400/30 px-3 py-1.5 rounded-xl text-xs font-semibold backdrop-blur-md transition-all duration-200 active:scale-95 disabled:opacity-50"
            title="Refresh dashboard metrics"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-white" : ""}`} />
            <span className="hidden sm:inline">{isRefreshing ? "Syncing..." : "Sync"}</span>
          </button>
        </div>
      </div>

      {/* Quick Action Navigation Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5">
        <Link
          to="/patients"
          className="group flex items-center gap-3 p-3 sm:p-3.5 rounded-xl bg-white border border-slate-200/80 hover:border-sky-300 hover:shadow-md transition-all duration-200"
        >
          <div className="p-2.5 rounded-xl bg-sky-50 text-sky-600 group-hover:bg-sky-600 group-hover:text-white transition-colors duration-200">
            <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-semibold text-slate-800 group-hover:text-sky-600 transition-colors truncate">
              Patients
            </p>
            <p className="text-[11px] text-slate-400 truncate">Registry & records</p>
          </div>
        </Link>

        <Link
          to="/consultations"
          className="group flex items-center gap-3 p-3 sm:p-3.5 rounded-xl bg-white border border-slate-200/80 hover:border-teal-300 hover:shadow-md transition-all duration-200"
        >
          <div className="p-2.5 rounded-xl bg-teal-50 text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-colors duration-200">
            <Stethoscope className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-semibold text-slate-800 group-hover:text-teal-600 transition-colors truncate">
              Consultation
            </p>
            <p className="text-[11px] text-slate-400 truncate">SOAP & diagnosis</p>
          </div>
        </Link>

        <Link
          to="/vitals"
          className="group flex items-center gap-3 p-3 sm:p-3.5 rounded-xl bg-white border border-slate-200/80 hover:border-rose-300 hover:shadow-md transition-all duration-200"
        >
          <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-colors duration-200">
            <HeartPulse className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-semibold text-slate-800 group-hover:text-rose-600 transition-colors truncate">
              Vital Signs
            </p>
            <p className="text-[11px] text-slate-400 truncate">Triage biometrics</p>
          </div>
        </Link>

        <Link
          to="/appointments"
          className="group flex items-center gap-3 p-3 sm:p-3.5 rounded-xl bg-white border border-slate-200/80 hover:border-purple-300 hover:shadow-md transition-all duration-200"
        >
          <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors duration-200">
            <CalendarCheck className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-semibold text-slate-800 group-hover:text-purple-600 transition-colors truncate">
              Appointments
            </p>
            <p className="text-[11px] text-slate-400 truncate">Schedule & queue</p>
          </div>
        </Link>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Patients */}
        <Link
          to="/patients"
          className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 hover:border-sky-300 hover:shadow-lg transition-all duration-200 group flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div className="p-2.5 sm:p-3 rounded-xl bg-sky-50 text-sky-600 group-hover:scale-105 transition-transform duration-200 border border-sky-100">
              <Users className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <span className="flex items-center text-[11px] font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200/60">
              <TrendingUp className="w-3 h-3 mr-1" />
              Active
            </span>
          </div>
          <div className="mt-3 sm:mt-4">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Patients</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-0.5 tracking-tight">
              {statsData.totalPatients.toLocaleString()}
            </p>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
              <span>City registry</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </div>
        </Link>

        {/* Monthly Consultations */}
        <Link
          to="/consultations"
          className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 hover:border-teal-300 hover:shadow-lg transition-all duration-200 group flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div className="p-2.5 sm:p-3 rounded-xl bg-teal-50 text-teal-600 group-hover:scale-105 transition-transform duration-200 border border-teal-100">
              <Stethoscope className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <span className="flex items-center text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200/60">
              <TrendingUp className="w-3 h-3 mr-1" />
              This Month
            </span>
          </div>
          <div className="mt-3 sm:mt-4">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Consultations</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-0.5 tracking-tight">
              {statsData.monthlyConsultations.toLocaleString()}
            </p>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
              <span>Medical encounters</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </div>
        </Link>

        {/* Appointments Today */}
        <Link
          to="/appointments"
          className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 hover:border-purple-300 hover:shadow-lg transition-all duration-200 group flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div className="p-2.5 sm:p-3 rounded-xl bg-purple-50 text-purple-600 group-hover:scale-105 transition-transform duration-200 border border-purple-100">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <span className="flex items-center text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200/60">
              Queue Today
            </span>
          </div>
          <div className="mt-3 sm:mt-4">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Appointments Today</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-0.5 tracking-tight">
              {statsData.todayAppointments.toLocaleString()}
            </p>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
              <span>Scheduled visits</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </div>
        </Link>

        {/* Active Health Staff */}
        <Link
          to="/staff"
          className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 hover:border-amber-300 hover:shadow-lg transition-all duration-200 group flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div className="p-2.5 sm:p-3 rounded-xl bg-amber-50 text-amber-600 group-hover:scale-105 transition-transform duration-200 border border-amber-100">
              <Activity className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <span className="flex items-center text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60">
              Roster
            </span>
          </div>
          <div className="mt-3 sm:mt-4">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Health Staff</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-0.5 tracking-tight">
              {statsData.totalStaff.toLocaleString()}
            </p>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
              <span>Doctors, nurses & BHWs</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </div>
        </Link>
      </div>

      {/* Main Charts Row: Weekly Consultations & Diagnosis Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
        {/* Weekly Consultations Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
            <div>
              <h3 className="text-slate-900 font-bold text-base sm:text-lg flex items-center gap-2">
                Consultation Volume & Load
              </h3>
              <p className="text-slate-500 text-xs mt-0.5">
                Distribution of patient consultations across clinical days
              </p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-[11px] font-semibold bg-sky-50 text-sky-700 px-2.5 py-1 rounded-full border border-sky-200/60">
                Peak Load Analysis
              </span>
            </div>
          </div>

          <div className="h-[220px] sm:h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={consultationsChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="consultationBarGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0284c7" stopOpacity={0.95} />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity={0.4} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="day"
                  tick={{ fill: "#64748b", fontSize: 11, fontWeight: 500 }}
                  axisLine={{ stroke: "#e2e8f0" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#64748b", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  cursor={{ fill: "rgba(2, 132, 199, 0.05)" }}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-900 text-white px-3.5 py-2.5 rounded-xl shadow-xl border border-slate-700 text-xs">
                          <p className="font-semibold text-sky-300">{label}</p>
                          <p className="mt-1 flex items-center justify-between gap-4">
                            <span className="text-slate-300">Consultations:</span>
                            <span className="font-bold text-white text-sm">{payload[0].value}</span>
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="consultations"
                  fill="url(#consultationBarGradient)"
                  radius={[8, 8, 2, 2]}
                  maxBarSize={48}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Diagnoses Donut Chart */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-slate-900 font-bold text-base sm:text-lg">
                Top Diagnoses
              </h3>
              <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                Morbidity
              </span>
            </div>
            <p className="text-slate-500 text-xs mb-4">
              Leading health cases reported in the city
            </p>

            <div className="relative h-[160px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={diagnosisData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={72}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {diagnosisData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white px-3 py-2 rounded-xl shadow-xl text-xs border border-slate-700">
                            <p className="font-medium text-slate-200">{data.name}</p>
                            <p className="font-bold text-sky-300 mt-0.5">{data.value} cases</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Center Donut Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-lg font-black text-slate-800">{totalDiagnosisCases}</span>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Cases</span>
              </div>
            </div>
          </div>

          {/* Diagnosis Breakdown Legend List */}
          <div className="space-y-1.5 mt-3 pt-3 border-t border-slate-100 max-h-[140px] overflow-y-auto custom-scrollbar">
            {diagnosisData.length === 0 ? (
              <p className="text-slate-400 text-center py-2 text-xs">No diagnosis entries recorded</p>
            ) : (
              diagnosisData.slice(0, 5).map((item) => {
                const percentage = totalDiagnosisCases > 0 ? Math.round((item.value / totalDiagnosisCases) * 100) : 0;
                return (
                  <div key={item.name} className="flex items-center justify-between text-xs py-1 px-1.5 rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-slate-700 font-medium truncate max-w-[130px]" title={item.name}>
                        {item.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-900 font-bold">{item.value}</span>
                      <span className="text-slate-400 text-[11px] w-8 text-right font-medium">{percentage}%</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Monthly Patient Admissions & Consultations Trend */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-slate-900 font-bold text-base sm:text-lg flex items-center gap-2">
              Monthly Community Health Trend
            </h3>
            <p className="text-slate-500 text-xs mt-0.5">
              Longitudinal tracking of patient registry additions and active care visits
            </p>
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200/60 self-start sm:self-auto">
            <Activity className="w-3.5 h-3.5 text-teal-600" />
            Epidemiological Curve
          </span>
        </div>

        <div className="h-[180px] sm:h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyPatientData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="patientTrendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0d9488" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#0d9488" stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fill: "#64748b", fontSize: 11 }}
                axisLine={{ stroke: "#e2e8f0" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#64748b", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-slate-900 text-white px-3.5 py-2 rounded-xl shadow-xl border border-slate-700 text-xs">
                        <p className="font-semibold text-teal-300">{label}</p>
                        <p className="mt-1 flex items-center justify-between gap-4">
                          <span className="text-slate-300">Patients Recorded:</span>
                          <span className="font-bold text-white text-sm">{payload[0].value}</span>
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="patients"
                stroke="#0d9488"
                strokeWidth={2.5}
                fill="url(#patientTrendGradient)"
                activeDot={{ r: 6, fill: "#0d9488", stroke: "#ffffff", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two-Column Clinical Feed: Recent Activity & Upcoming Appointments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        {/* Recent Patients */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-slate-900 font-bold text-base sm:text-lg">Recent Patient Activity</h3>
              <p className="text-slate-500 text-xs mt-0.5">Latest patients triaged or registered</p>
            </div>
            <Link
              to="/patients"
              className="text-sky-600 hover:text-sky-700 font-semibold text-xs flex items-center gap-1 group"
            >
              View all
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {recentPatients.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-500 text-xs font-medium">No recent patient records logged</p>
              </div>
            ) : (
              recentPatients.slice(0, 5).map((p) => {
                const badgeInfo = statusColor[p.status] || statusColor.Active;
                return (
                  <Link
                    key={p.id}
                    to={p.id ? `/patients/${p.id}` : "/patients"}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-sky-50/50 border border-slate-100 hover:border-sky-200 transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-100 to-sky-200 text-sky-700 flex items-center justify-center font-bold text-xs flex-shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                        {(p.name || "?").split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-slate-900 font-semibold text-xs sm:text-sm group-hover:text-sky-600 transition-colors truncate">
                          {p.name}
                        </p>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5 truncate">
                          <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                          <span className="truncate">{p.barangay}</span>
                          <span>&bull;</span>
                          <span>{p.date}</span>
                        </div>
                      </div>
                    </div>

                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide uppercase ${badgeInfo.badge} flex-shrink-0`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${badgeInfo.dot}`} />
                      {p.status}
                    </span>
                  </Link>
                );
              })
            )}
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-slate-900 font-bold text-base sm:text-lg">Upcoming Appointments</h3>
              <p className="text-slate-500 text-xs mt-0.5">Scheduled clinical consultations and reviews</p>
            </div>
            <Link
              to="/appointments"
              className="text-sky-600 hover:text-sky-700 font-semibold text-xs flex items-center gap-1 group"
            >
              View all
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {upcomingAppointments.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <CalendarCheck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-500 text-xs font-medium">No upcoming appointments scheduled</p>
              </div>
            ) : (
              upcomingAppointments.slice(0, 5).map((appt, i) => (
                <div
                  key={appt.id || i}
                  className="flex items-start justify-between p-3 rounded-xl hover:bg-purple-50/40 border border-slate-100 hover:border-purple-200 transition-all duration-200 group"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="bg-purple-50 border border-purple-100 text-purple-700 px-2.5 py-1.5 rounded-xl text-center flex-shrink-0 min-w-[62px]">
                      <Clock className="w-3.5 h-3.5 mx-auto mb-0.5 text-purple-500" />
                      <p className="text-[11px] font-bold tracking-tight">{appt.time}</p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-slate-900 font-semibold text-xs sm:text-sm group-hover:text-purple-700 transition-colors truncate">
                        {appt.patientName}
                      </p>
                      <p className="text-slate-500 text-[11px] font-medium truncate mt-0.5">
                        {appt.purpose}
                      </p>
                      <p className="text-purple-600 text-[11px] font-medium truncate mt-0.5 flex items-center gap-1">
                        <Stethoscope className="w-3 h-3 text-purple-500 flex-shrink-0" />
                        {appt.staffName}
                      </p>
                    </div>
                  </div>

                  <span className="inline-flex items-center text-[10px] font-semibold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full flex-shrink-0">
                    Scheduled
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Clinical Surveillance & City Health Advisory Alerts */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
              <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h3 className="text-slate-900 font-bold text-base sm:text-lg">
                City Health Alerts & Clinical Advisories
              </h3>
              <p className="text-slate-500 text-xs mt-0.5">
                Surveillance notifications and operational updates
              </p>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
            Active Feed
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {!dismissedAlerts.includes(1) && (
            <div className="flex items-start justify-between gap-3 p-3.5 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 hover:shadow-sm transition-all group">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-amber-900">
                    Follow-up Consultations Required
                  </p>
                  <p className="text-xs text-amber-800/80 mt-0.5">
                    3 patients have pending hypertension and prenatal follow-ups scheduled for this week.
                  </p>
                  <Link
                    to="/appointments"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 hover:text-amber-800 mt-2"
                  >
                    Review Schedule <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
              <button
                onClick={() => setDismissedAlerts([...dismissedAlerts, 1])}
                className="text-amber-500 hover:text-amber-700 p-1 rounded-lg text-xs"
                title="Dismiss alert"
              >
                &times;
              </button>
            </div>
          )}

          {!dismissedAlerts.includes(2) && (
            <div className="flex items-start justify-between gap-3 p-3.5 rounded-xl bg-gradient-to-r from-sky-50 to-teal-50 border border-sky-200/80 hover:shadow-sm transition-all group">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-teal-900">
                    Monthly Health Summary Ready
                  </p>
                  <p className="text-xs text-teal-800/80 mt-0.5">
                    The automated community morbidity and consultation report is ready for export and DOH filing.
                  </p>
                  <Link
                    to="/reports"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-700 hover:text-teal-800 mt-2"
                  >
                    View Reports <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
              <button
                onClick={() => setDismissedAlerts([...dismissedAlerts, 2])}
                className="text-teal-500 hover:text-teal-700 p-1 rounded-lg text-xs"
                title="Dismiss alert"
              >
                &times;
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

