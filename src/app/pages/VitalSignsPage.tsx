import { useState, useEffect, useMemo } from "react";
import {
  Search,
  Activity,
  Heart,
  Thermometer,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  User,
  Calendar,
  ChevronRight,
  Filter,
  CheckCircle2,
  X,
  Droplet
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine
} from "recharts";
import { Link } from "react-router";
import { vitalSignsService } from "../services/vitalSignsService";
import { VitalSignsSkeleton } from "../components/skeletons/VitalSignsSkeleton";
import { formatEntityId } from "../utils";

type VitalApiRow = {
  id: string;
  consultId?: string;
  patient?: string | { id?: string; firstName?: string; lastName?: string };
  patientId?: string;
  date: string;
  bpSystolic: number;
  bpDiastolic: number;
  pulseRate: number;
  respRate: number;
  temp: number;
  bloodSugar: number;
  weight: number;
  height: number;
  bmi: number;
};

type VitalRow = Omit<VitalApiRow, "patient"> & {
  patient: string;
};

type TrendPoint = {
  date: string;
  systolic: number;
  diastolic: number;
};

function getBPStatus(systolic: number, diastolic: number) {
  if (systolic >= 180 || diastolic >= 120) {
    return { label: "Crisis", color: "text-rose-700", bg: "bg-rose-100 border border-rose-300 animate-pulse", dot: "bg-rose-600" };
  }
  if (systolic >= 140 || diastolic >= 90) {
    return { label: "High", color: "text-rose-700", bg: "bg-rose-50 border border-rose-200", dot: "bg-rose-500" };
  }
  if (systolic >= 130 || diastolic >= 80) {
    return { label: "Elevated", color: "text-amber-700", bg: "bg-amber-50 border border-amber-200", dot: "bg-amber-500" };
  }
  if (systolic < 90 || diastolic < 60) {
    return { label: "Low", color: "text-sky-700", bg: "bg-sky-50 border border-sky-200", dot: "bg-sky-500" };
  }
  return { label: "Normal", color: "text-emerald-700", bg: "bg-emerald-50 border border-emerald-200", dot: "bg-emerald-500" };
}

function getBSStatus(bs: number) {
  if (!bs) return { label: "N/A", color: "text-slate-500", bg: "bg-slate-100" };
  if (bs >= 200) return { label: "High", color: "text-rose-700", bg: "bg-rose-50 border border-rose-200" };
  if (bs >= 140) return { label: "Elevated", color: "text-amber-700", bg: "bg-amber-50 border border-amber-200" };
  return { label: "Normal", color: "text-emerald-700", bg: "bg-emerald-50 border border-emerald-200" };
}

export function VitalSignsPage() {
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [showTrend, setShowTrend] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [vitals, setVitals] = useState<VitalRow[]>([]);
  const [bpTrendData, setBpTrendData] = useState<TrendPoint[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [selectedPatientName, setSelectedPatientName] = useState<string>("");

  useEffect(() => {
    const fetchVitals = async () => {
      setIsLoading(true);
      const data = await vitalSignsService.getAll();
      const transformed: VitalRow[] = data.map((v: VitalApiRow) => ({
        ...v,
        patient: typeof v.patient === "object"
          ? `${v.patient?.firstName || ""} ${v.patient?.lastName || ""}`.trim()
          : v.patient || "Unknown",
        patientId: v.patientId || (typeof v.patient === "object" ? v.patient?.id : ""),
      }));
      setVitals(transformed);
      setIsLoading(false);
    };
    fetchVitals();
  }, []);

  const filtered = useMemo(() => {
    return vitals.filter(v => {
      const matchQuery = `${v.patient} ${v.id} ${v.consultId}`.toLowerCase().includes(search.toLowerCase());
      const matchDate = !dateFilter || v.date.includes(dateFilter);
      return matchQuery && matchDate;
    });
  }, [vitals, search, dateFilter]);

  const hasSelectablePatients = filtered.some(v => !!v.patientId);

  useEffect(() => {
    if (!filtered.length) {
      setSelectedPatientId("");
      setSelectedPatientName("");
      return;
    }

    const hasSelectedInFiltered = filtered.some(v => v.patientId === selectedPatientId);
    if (!selectedPatientId || !hasSelectedInFiltered) {
      const firstWithPatient = filtered.find(v => v.patientId);
      if (firstWithPatient?.patientId) {
        setSelectedPatientId(firstWithPatient.patientId);
        setSelectedPatientName(firstWithPatient.patient as string);
      }
    }
  }, [filtered, selectedPatientId]);

  useEffect(() => {
    const fetchTrend = async () => {
      if (!selectedPatientId) {
        setBpTrendData([]);
        return;
      }

      const trend = await vitalSignsService.getBPTrend(selectedPatientId);
      setBpTrendData(trend);
    };

    fetchTrend();
  }, [selectedPatientId]);

  // Aggregate clinical telemetry
  const telemetry = useMemo(() => {
    if (!vitals.length) {
      return { avgBP: "120/80", avgPulse: 75, avgTemp: 36.8, highBPCount: 0 };
    }
    const count = vitals.length;
    const sysSum = vitals.reduce((acc, v) => acc + (v.bpSystolic || 0), 0);
    const diaSum = vitals.reduce((acc, v) => acc + (v.bpDiastolic || 0), 0);
    const pulseSum = vitals.reduce((acc, v) => acc + (v.pulseRate || 0), 0);
    const tempSum = vitals.reduce((acc, v) => acc + (v.temp || 0), 0);
    const highBPCount = vitals.filter(v => v.bpSystolic >= 140 || v.bpDiastolic >= 90).length;

    return {
      avgBP: `${Math.round(sysSum / count)}/${Math.round(diaSum / count)}`,
      avgPulse: Math.round(pulseSum / count),
      avgTemp: (tempSum / count).toFixed(1),
      highBPCount,
    };
  }, [vitals]);

  const trendDateRange =
    bpTrendData.length > 0
      ? `${new Date(bpTrendData[0].date).toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${new Date(bpTrendData[bpTrendData.length - 1].date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
      : "No trend data available";

  if (isLoading) {
    return <VitalSignsSkeleton />;
  }

  return (
    <div className="p-3.5 sm:p-5 lg:p-7 space-y-5 max-w-7xl mx-auto">
      {/* Top Clinical Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
              <Activity className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Vital Signs & Triage Telemetry
            </h1>
          </div>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Real-time biometric monitoring, blood pressure trends, and metabolic screening
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            disabled={!hasSelectablePatients}
            onClick={() => setShowTrend(!showTrend)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-xs ${showTrend
              ? "bg-slate-900 text-white"
              : "bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200"
              } disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            <TrendingUp className="w-4 h-4" />
            {showTrend ? "Hide Longitudinal Curve" : "View BP Longitudinal Curve"}
          </button>
        </div>
      </div>

      {/* Aggregate Telemetry Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Average BP</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <Heart className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{telemetry.avgBP}</p>
          <span className="text-[11px] text-slate-400 font-medium">mmHg clinic average</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Average Pulse</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{telemetry.avgPulse} <span className="text-xs font-normal text-slate-400">bpm</span></p>
          <span className="text-[11px] text-slate-400 font-medium">Resting heart rate</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Average Temp</span>
            <div className="p-2 rounded-xl bg-teal-50 text-teal-600">
              <Thermometer className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{telemetry.avgTemp} <span className="text-xs font-normal text-slate-400">°C</span></p>
          <span className="text-[11px] text-slate-400 font-medium">Normothermic</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">High BP Alerts</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-rose-600">{telemetry.highBPCount}</p>
          <span className="text-[11px] text-rose-600 font-semibold">Requiring triage follow-up</span>
        </div>
      </div>

      {/* Expandable Longitudinal Trend Chart */}
      {showTrend && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm animate-scale-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-slate-900 font-bold text-base sm:text-lg">
                  {selectedPatientName || "Patient"} &mdash; BP Progression
                </h3>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                  {trendDateRange}
                </span>
              </div>
              <p className="text-slate-500 text-xs mt-0.5">
                Systolic vs. Diastolic pressure variations plotted across recent health evaluations
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-rose-600">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Systolic
              </span>
              <span className="flex items-center gap-1.5 text-sky-600">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500" /> Diastolic
              </span>
            </div>
          </div>

          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={bpTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="vtlSysGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#f43f5e" stopOpacity={0.01} />
                  </linearGradient>
                  <linearGradient id="vtlDiaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={{ stroke: "#e2e8f0" }} />
                <YAxis domain={[50, 190]} tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "none",
                    borderRadius: "12px",
                    color: "#fff",
                    fontSize: "11px",
                  }}
                />
                {/* Clinical standard threshold lines */}
                <ReferenceLine y={140} stroke="#f43f5e" strokeDasharray="3 3" strokeOpacity={0.4} label={{ value: "Stage 2 (140)", fill: "#f43f5e", fontSize: 9 }} />
                <ReferenceLine y={90} stroke="#0ea5e9" strokeDasharray="3 3" strokeOpacity={0.4} label={{ value: "Diastolic Threshold (90)", fill: "#0ea5e9", fontSize: 9 }} />
                <Area type="monotone" dataKey="systolic" name="Systolic (mmHg)" stroke="#f43f5e" strokeWidth={2.5} fill="url(#vtlSysGrad)" />
                <Area type="monotone" dataKey="diastolic" name="Diastolic (mmHg)" stroke="#0ea5e9" strokeWidth={2.5} fill="url(#vtlDiaGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 sm:p-4 shadow-xs flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by patient name, vitals ID, or consultation..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs sm:text-sm font-medium transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-700 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
          {dateFilter && (
            <button
              onClick={() => setDateFilter("")}
              className="text-xs text-sky-600 hover:underline px-1"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Vitals Data Table (Desktop) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-4 py-3.5">Record ID</th>
                <th className="px-4 py-3.5">Patient Details</th>
                <th className="px-4 py-3.5">Evaluation Date</th>
                <th className="px-4 py-3.5">Blood Pressure</th>
                <th className="px-4 py-3.5">Heart Rate</th>
                <th className="px-4 py-3.5">Resp. / Temp</th>
                <th className="px-4 py-3.5">Blood Glucose</th>
                <th className="px-4 py-3.5">Weight / BMI</th>
                <th className="px-4 py-3.5 text-right">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-slate-400">
                    <Activity className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-slate-600">No vital sign records found</p>
                    <p className="text-xs text-slate-400 mt-0.5">Try clearing the search query or date filter</p>
                  </td>
                </tr>
              ) : (
                filtered.map((v, i) => {
                  const bp = getBPStatus(v.bpSystolic, v.bpDiastolic);
                  const bs = getBSStatus(v.bloodSugar);
                  const isSelected = selectedPatientId === v.patientId;

                  return (
                    <tr
                      key={v.id}
                      onClick={() => {
                        if (v.patientId) {
                          setSelectedPatientId(v.patientId);
                          setSelectedPatientName(v.patient as string);
                          setShowTrend(true);
                        }
                      }}
                      className={`hover:bg-sky-50/40 transition-colors cursor-pointer group ${isSelected ? "bg-sky-50/60" : ""
                        }`}
                    >
                      <td className="px-4 py-3.5">
                        <span className="font-mono text-xs font-bold text-sky-600" title={v.id}>
                          {formatEntityId(v.id, "VTL")}
                        </span>
                        {v.consultId && (
                          <p className="text-[11px] text-slate-400 font-mono" title={v.consultId}>
                            {formatEntityId(v.consultId, "CON")}
                          </p>
                        )}
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                            {v.patient?.[0]}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
                              {v.patient}
                            </span>
                            {v.patientId && (
                              <Link
                                to={`/patients/${v.patientId}`}
                                onClick={(e) => e.stopPropagation()}
                                className="block text-[11px] text-slate-400 hover:text-sky-600"
                              >
                                View Patient Record
                              </Link>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-slate-600 font-medium">
                        {v.date}
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">
                            {v.bpSystolic}/{v.bpDiastolic}
                          </span>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${bp.bg} ${bp.color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${bp.dot}`} />
                            {bp.label}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-slate-700 font-semibold">
                        {v.pulseRate} <span className="text-[11px] text-slate-400 font-normal">bpm</span>
                      </td>

                      <td className="px-4 py-3.5 text-slate-600 font-medium">
                        <span>{v.respRate}/min</span>
                        <span className="text-slate-300 mx-1.5">&bull;</span>
                        <span>{v.temp}°C</span>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900">{v.bloodSugar || "—"}</span>
                          {v.bloodSugar ? (
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${bs.bg} ${bs.color}`}>
                              {bs.label}
                            </span>
                          ) : null}
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-slate-700 font-medium">
                        <div>
                          <span>{v.weight} kg</span>
                          <span className="text-slate-300 mx-1.5">&bull;</span>
                          <span className={`font-bold ${v.bmi >= 25 ? "text-amber-600" : "text-emerald-600"}`}>
                            BMI {v.bmi}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <button
                          className="p-1.5 text-slate-400 group-hover:text-sky-600 rounded-lg transition-colors"
                          title="View patient curve"
                        >
                          <TrendingUp className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="lg:hidden divide-y divide-slate-100">
          {filtered.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              No vital sign records found
            </div>
          ) : (
            filtered.map((v) => {
              const bp = getBPStatus(v.bpSystolic, v.bpDiastolic);
              const bs = getBSStatus(v.bloodSugar);

              return (
                <div
                  key={v.id}
                  onClick={() => {
                    if (v.patientId) {
                      setSelectedPatientId(v.patientId);
                      setSelectedPatientName(v.patient as string);
                      setShowTrend(true);
                    }
                  }}
                  className="p-4 hover:bg-slate-50/60 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-xs font-mono font-bold text-sky-600">
                        {formatEntityId(v.id, "VTL")}
                      </span>
                      <p className="font-bold text-slate-900 text-sm mt-0.5">{v.patient}</p>
                      <p className="text-[11px] text-slate-400">{v.date}</p>
                    </div>

                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${bp.bg} ${bp.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${bp.dot}`} />
                      {bp.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-slate-400 text-[10px] block">Blood Pressure</span>
                      <span className="font-bold text-slate-900">{v.bpSystolic}/{v.bpDiastolic} mmHg</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-slate-400 text-[10px] block">Heart Rate</span>
                      <span className="font-bold text-slate-900">{v.pulseRate} bpm</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-slate-400 text-[10px] block">Temp / Resp</span>
                      <span className="font-bold text-slate-900">{v.temp}°C &bull; {v.respRate}/m</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-slate-400 text-[10px] block">Weight / BMI</span>
                      <span className="font-bold text-slate-900">{v.weight}kg &bull; BMI {v.bmi}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
