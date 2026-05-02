import { useState, useEffect, useCallback } from "react";
import { Download, Users, Stethoscope, Activity, Heart, Pill, AlertTriangle, FileText, X } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line,
} from "recharts";
import { dashboardService, buildMonthOptions } from "../services/dashboardService";
import { ReportsSkeleton } from "../components/skeletons/ReportsSkeleton";
import { FormLoadingOverlay } from "../components/feedback/FormLoadingOverlay";
import { prescriptionService } from "../services/prescriptionService";
import { vitalSignsService } from "../services/vitalSignsService";

interface DiseaseTrend {
  diagnosis: string;
  totalCases: number;
  latestMonthCases: number;
  previousMonthCases: number;
  growthRate: number;
}

interface OutbreakAlert {
  diagnosis: string;
  latestMonthCases: number;
  previousMonthCases: number;
  growthRate: number;
  mostAffectedBarangays: Array<{ barangay: string; count: number }>;
}

interface DiseaseTrendAnalysis {
  trendChart: Array<Record<string, string | number>>;
  trends: DiseaseTrend[];
  potentialOutbreaks: OutbreakAlert[];
}

type ReportKey =
  | "patient-demographics"
  | "consultation-summary"
  | "diagnosis-report"
  | "vital-signs-summary"
  | "prescription-analytics";

type ExportRange = {
  startDate: string;
  endDate: string;
};

// Build dynamic month options (last 12 months)
const MONTH_OPTIONS = buildMonthOptions(12);

// Default colors for charts
const chartColors = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#14B8A6"];

export function ReportsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(MONTH_OPTIONS[0].value); // current month

  // Real stats
  const [totalPatients, setTotalPatients] = useState(0);
  const [monthlyConsultations, setMonthlyConsultations] = useState(0);
  const [avgDailyConsults, setAvgDailyConsults] = useState("0");
  const [totalStaff, setTotalStaff] = useState(0);

  // Charts
  const [consultationChart, setConsultationChart] = useState<any[]>([]);
  const [diagnosisBreakdown, setDiagnosisBreakdown] = useState<any[]>([]);
  const [genderData, setGenderData] = useState<any[]>([]);
  const [diseaseTrendAnalysis, setDiseaseTrendAnalysis] = useState<DiseaseTrendAnalysis | null>(null);

  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ReportKey>("patient-demographics");
  const [exportRange, setExportRange] = useState<ExportRange>({ startDate: "", endDate: "" });
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const reportCards: Array<{
    key: ReportKey;
    title: string;
    desc: string;
    icon: typeof Users;
    color: string;
  }> = [
    { key: "patient-demographics", title: "Patient Demographics", desc: "Complete patient statistics", icon: Users, color: "bg-blue-100 text-blue-600" },
    { key: "consultation-summary", title: "Consultation Summary", desc: "Monthly consultation breakdown", icon: Stethoscope, color: "bg-green-100 text-green-600" },
    { key: "diagnosis-report", title: "Diagnosis Report", desc: "Top diagnoses and trends", icon: Activity, color: "bg-purple-100 text-purple-600" },
    { key: "vital-signs-summary", title: "Vital Signs Summary", desc: "Population health indicators", icon: Heart, color: "bg-red-100 text-red-600" },
    { key: "prescription-analytics", title: "Prescription Analytics", desc: "Medication dispensing report", icon: Pill, color: "bg-teal-100 text-teal-600" },
  ];

  const openExportModal = (reportKey?: ReportKey) => {
    setSelectedReport(reportKey || reportCards[0].key);
    setExportModalOpen(true);
    setExportError(null);
  };

  const closeExportModal = () => {
    if (isExporting) return;
    setExportModalOpen(false);
  };

  const getDateBounds = () => {
    const start = exportRange.startDate ? new Date(exportRange.startDate) : null;
    if (start) start.setHours(0, 0, 0, 0);
    const end = exportRange.endDate ? new Date(exportRange.endDate) : null;
    if (end) end.setHours(23, 59, 59, 999);
    return { start, end };
  };

  const matchesDateRange = (dateValue: string | undefined, bounds: { start: Date | null; end: Date | null }) => {
    if (!bounds.start && !bounds.end) return true;
    if (!dateValue) return false;
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return false;
    if (bounds.start && date < bounds.start) return false;
    if (bounds.end && date > bounds.end) return false;
    return true;
  };

  const toCsvValue = (value: unknown) => {
    if (value === null || value === undefined) return "";
    const raw = String(value).replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    const escaped = raw.replace(/"/g, '""');
    if (/[",\n]/.test(escaped)) {
      return `"${escaped}"`;
    }
    return escaped;
  };

  const rowsToCsv = (rows: Array<Record<string, unknown>>) => {
    if (!rows.length) return "";
    const headers = Object.keys(rows[0]);
    const lines = [
      headers.map(toCsvValue).join(","),
      ...rows.map((row) => headers.map((h) => toCsvValue(row[h])).join(",")),
    ];
    return lines.join("\n");
  };

  const downloadCsv = (filename: string, rows: Array<Record<string, unknown>>) => {
    const csv = rowsToCsv(rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const average = (values: number[]) => {
    if (!values.length) return 0;
    const total = values.reduce((sum, v) => sum + v, 0);
    return Number((total / values.length).toFixed(1));
  };

  const buildExportRows = async (reportKey: ReportKey): Promise<Array<Record<string, unknown>>> => {
    if (reportKey === "patient-demographics") {
      if (!genderData.length) {
        return [{ Notice: "No demographic data available" }];
      }
      return genderData.map((g) => ({
        Category: g.name || "Unknown",
        Percent: g.value ?? 0,
        Count: g.count ?? "",
      }));
    }

    if (reportKey === "consultation-summary") {
      if (!consultationChart.length) {
        return [{ Notice: "No consultation data available" }];
      }
      return consultationChart.map((item) => ({
        Month: item.month ?? "",
        Regular: item.regular ?? 0,
        FollowUp: item.followUp ?? 0,
        Emergency: item.emergency ?? 0,
      }));
    }

    if (reportKey === "diagnosis-report") {
      if (!diagnosisBreakdown.length) {
        return [{ Notice: "No diagnosis data available" }];
      }
      return diagnosisBreakdown.map((item) => ({
        Diagnosis: item.name ?? "Unknown",
        Cases: item.value ?? 0,
      }));
    }

    if (reportKey === "vital-signs-summary") {
      const bounds = getDateBounds();
      const vitals = await vitalSignsService.getAll();
      const filtered = vitals.filter((v) => matchesDateRange(v.date, bounds));

      if (!filtered.length) {
        return [{ Notice: "No vital signs data available" }];
      }

      const toNumber = (value: unknown) => (typeof value === "number" && Number.isFinite(value) ? value : null);
      const pick = (values: Array<number | null>) => values.filter((v): v is number => v !== null);

      const systolic = pick(filtered.map((v) => toNumber(v.bpSystolic)));
      const diastolic = pick(filtered.map((v) => toNumber(v.bpDiastolic)));
      const pulse = pick(filtered.map((v) => toNumber(v.pulseRate)));
      const resp = pick(filtered.map((v) => toNumber(v.respRate)));
      const temps = pick(filtered.map((v) => toNumber((v as { temp?: number; temperature?: number }).temp ?? (v as { temperature?: number }).temperature)));
      const sugars = pick(filtered.map((v) => toNumber(v.bloodSugar)));
      const weights = pick(filtered.map((v) => toNumber(v.weight)));
      const heights = pick(filtered.map((v) => toNumber(v.height)));
      const bmis = pick(filtered.map((v) => toNumber(v.bmi)));

      return [
        { Metric: "Records", Value: filtered.length, Unit: "" },
        { Metric: "Avg Systolic BP", Value: average(systolic), Unit: "mmHg" },
        { Metric: "Avg Diastolic BP", Value: average(diastolic), Unit: "mmHg" },
        { Metric: "Avg Pulse Rate", Value: average(pulse), Unit: "bpm" },
        { Metric: "Avg Respiratory Rate", Value: average(resp), Unit: "rpm" },
        { Metric: "Avg Temperature", Value: average(temps), Unit: "C" },
        { Metric: "Avg Blood Sugar", Value: average(sugars), Unit: "mg/dL" },
        { Metric: "Avg Weight", Value: average(weights), Unit: "kg" },
        { Metric: "Avg Height", Value: average(heights), Unit: "cm" },
        { Metric: "Avg BMI", Value: average(bmis), Unit: "" },
      ];
    }

    const bounds = getDateBounds();
    const prescriptions = await prescriptionService.getAll();
    const filtered = prescriptions.filter((p) => matchesDateRange(p.date, bounds));

    if (!filtered.length) {
      return [{ Notice: "No prescription data available" }];
    }

    const counts = filtered.reduce((acc, p) => {
      const name = p.medicine?.trim() || "Unknown";
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(counts)
      .map(([medicine, count]) => ({ Medicine: medicine, Count: count }))
      .sort((a, b) => (b.Count as number) - (a.Count as number));
  };

  const handleExport = async () => {
    if (isExporting) return;
    setIsExporting(true);
    setExportError(null);

    try {
      const rows = await buildExportRows(selectedReport);
      const safeKey = selectedReport.replace(/[^a-z0-9-]/gi, "_");
      const dateStamp = new Date().toISOString().slice(0, 10);
      const filename = `report-${safeKey}-${dateStamp}.csv`;
      downloadCsv(filename, rows);
      setExportModalOpen(false);
    } catch (error) {
      console.error("Failed to export report:", error);
      setExportError("Failed to generate report. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const fetchReportsData = useCallback(async (yearMonth: string) => {
    setIsLoading(true);
    try {
      const [stats, chartData, diagnosisData, demographicsData, diseaseTrends] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getConsultationsChart(),
        dashboardService.getDiagnosisBreakdown(),
        dashboardService.getPatientDemographics(),
        dashboardService.getDiseaseTrendAnalysis(),
      ]);

      // Real stats from backend
      if (stats && typeof stats === "object") {
        setTotalPatients(stats.totalPatients ?? 0);
        setMonthlyConsultations(stats.monthlyConsultations ?? 0);
        setTotalStaff(stats.totalStaff ?? 0);
        // Average daily consultations = monthly / days in selected month
        const [y, m] = yearMonth.split("-").map(Number);
        const daysInMonth = new Date(y, m, 0).getDate();
        const avg = daysInMonth > 0
          ? ((stats.monthlyConsultations ?? 0) / daysInMonth).toFixed(1)
          : "0";
        setAvgDailyConsults(avg);
      }

      setConsultationChart(chartData || []);

      // Transform diagnosis data
      const transformedDiagnosis = (diagnosisData || []).map((item: any, index: number) => ({
        name: item.diagnosis || item.name || "Unknown",
        value: item.count || item.value || 0,
        color: item.color || chartColors[index % chartColors.length],
      }));
      setDiagnosisBreakdown(transformedDiagnosis);
      setGenderData(demographicsData || []);
      setDiseaseTrendAnalysis(diseaseTrends);
    } catch (error) {
      console.error("Failed to fetch reports data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReportsData(selectedMonth);
  }, [selectedMonth, fetchReportsData]);

  if (isLoading) {
    return <ReportsSkeleton />;
  }

  const trendSeries = diseaseTrendAnalysis?.trends ?? [];
  const trendChart = diseaseTrendAnalysis?.trendChart ?? [];
  const outbreaks = diseaseTrendAnalysis?.potentialOutbreaks ?? [];

  const formatGrowth = (value: number) => `${value >= 0 ? "+" : ""}${(value * 100).toFixed(0)}%`;

  // Selected month label for display
  const selectedMonthLabel = MONTH_OPTIONS.find(o => o.value === selectedMonth)?.label ?? selectedMonth;

  return (
    <>
      <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 animate-fade-in-up">
        <div>
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Reports &amp; Analytics</h1>
          <p className="text-xs sm:text-sm text-gray-500">Generate reports and view system analytics</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-200 rounded-lg bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
          >
            {MONTH_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => openExportModal()}
            className="flex items-center gap-1 sm:gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-colors text-xs sm:text-sm font-semibold"
          >
            <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Export
          </button>
        </div>
      </div>

      {/* Key Metrics — real data */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        {[
          { label: `Total Patients`, value: totalPatients.toLocaleString(), sub: "Registered patients", up: true },
          { label: `Consultations (${selectedMonthLabel})`, value: monthlyConsultations.toLocaleString(), sub: "This month", up: true },
          { label: "Avg Daily Consults", value: avgDailyConsults, sub: "This month average", up: true },
          { label: "Active Staff", value: totalStaff.toLocaleString(), sub: "Health workers", up: true },
        ].map((m, index) => (
          <div
            key={m.label}
            className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 animate-fade-in-up"
            style={{ animationDelay: `${index * 75}ms` }}
          >
            <p className="text-gray-400 text-[0.65rem] sm:text-xs">{m.label}</p>
            <p className="text-gray-900 mt-1 text-lg sm:text-2xl font-bold">{m.value}</p>
            <p className={`mt-1 text-[0.65rem] sm:text-xs font-medium ${m.up ? "text-green-600" : "text-red-500"}`}>
              {m.sub}
            </p>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 animate-fade-in-up" style={{ animationDelay: "150ms" }}>
        {/* Monthly Consultations */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-3 sm:p-5 hover:shadow-md transition-all duration-300">
          <h3 className="text-gray-800 mb-3 sm:mb-4 text-sm sm:text-base font-semibold">Consultations by Type (Last 6 Months)</h3>
          {consultationChart.length === 0 ? (
            <p className="text-gray-400 text-xs sm:text-sm py-8 text-center">No consultation data available yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={consultationChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" style={{ fontSize: "0.65rem" }} tick={{ fill: "#6B7280" }} />
                <YAxis style={{ fontSize: "0.65rem" }} tick={{ fill: "#6B7280" }} width={30} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: "0.7rem" }} />
                <Bar dataKey="regular" name="Regular" fill="#3B82F6" radius={[2, 2, 0, 0]} />
                <Bar dataKey="followUp" name="Follow-up" fill="#14B8A6" radius={[2, 2, 0, 0]} />
                <Bar dataKey="emergency" name="Emergency" fill="#EF4444" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Diagnosis Breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-5">
          <h3 className="text-gray-800 mb-3 sm:mb-4 text-sm sm:text-base font-semibold">Diagnosis Breakdown</h3>
          {diagnosisBreakdown.length === 0 ? (
            <p className="text-gray-400 text-xs sm:text-sm py-8 text-center">No diagnosis data yet.</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={diagnosisBreakdown} cx="50%" cy="50%" outerRadius={55} dataKey="value">
                    {diagnosisBreakdown.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1 mt-2">
                {diagnosisBreakdown.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-gray-500 text-[0.65rem] sm:text-xs truncate max-w-[120px]">{item.name}</span>
                    </div>
                    <span className="text-gray-700 text-[0.65rem] sm:text-xs font-semibold">{item.value} cases</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Patient Demographics */}
      <div className="grid grid-cols-1 gap-3 sm:gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-5">
          <h3 className="text-gray-800 mb-3 sm:mb-4 text-sm sm:text-base font-semibold">Patient Demographics</h3>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
            {genderData.length > 0 ? (
              <ResponsiveContainer width={120} height={120}>
                <PieChart>
                  <Pie data={genderData} cx="50%" cy="50%" innerRadius={35} outerRadius={55} dataKey="value">
                    {genderData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-[120px] h-[120px] flex items-center justify-center text-gray-300 text-xs">No data</div>
            )}
            <div className="flex sm:flex-col gap-4 sm:gap-3">
              {genderData.map((g) => (
                <div key={g.name} className="flex items-center gap-2 sm:gap-3">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full" style={{ backgroundColor: g.color }} />
                  <div>
                    <p className="text-gray-700 text-xs sm:text-sm font-semibold">{g.name}</p>
                    <p className="text-base sm:text-xl font-bold" style={{ color: g.color }}>
                      {g.value}% <span className="text-xs font-normal text-gray-400">({g.count ?? ""})</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Disease Trend + Outbreak Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-3 sm:p-5">
          <h3 className="text-gray-800 mb-3 sm:mb-4 text-sm sm:text-base font-semibold">Disease Trend Analysis (Last 6 Months)</h3>
          {trendChart.length === 0 ? (
            <p className="text-gray-500 text-xs sm:text-sm">No diagnosis trend data available yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trendChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" style={{ fontSize: "0.65rem" }} tick={{ fill: "#6B7280" }} />
                <YAxis style={{ fontSize: "0.65rem" }} tick={{ fill: "#6B7280" }} width={30} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: "0.7rem" }} />
                {trendSeries.map((item, index) => (
                  <Line
                    key={item.diagnosis}
                    type="monotone"
                    dataKey={item.diagnosis}
                    stroke={chartColors[index % chartColors.length]}
                    strokeWidth={2}
                    dot={{ r: 2 }}
                    activeDot={{ r: 4 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          )}
          {trendSeries.length > 0 && (
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {trendSeries.map((item) => (
                <div key={item.diagnosis} className="rounded-lg border border-gray-100 bg-gray-50 p-2">
                  <p className="text-xs font-semibold text-gray-800">{item.diagnosis}</p>
                  <p className="text-[0.7rem] text-gray-500">Total cases: {item.totalCases}</p>
                  <p className="text-[0.7rem] text-gray-500">Current month: {item.latestMonthCases}</p>
                  <p className={`text-[0.7rem] font-medium ${item.growthRate >= 0.3 ? "text-red-600" : "text-gray-600"}`}>
                    Change vs last month: {formatGrowth(item.growthRate)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-5">
          <h3 className="text-gray-800 mb-3 sm:mb-4 text-sm sm:text-base font-semibold">Potential Outbreak Alerts</h3>
          {outbreaks.length === 0 ? (
            <p className="text-gray-500 text-xs sm:text-sm">No outbreak signals detected from recent diagnosis trends.</p>
          ) : (
            <div className="space-y-2">
              {outbreaks.map((outbreak) => (
                <div key={outbreak.diagnosis} className="rounded-lg border border-red-100 bg-red-50 p-2.5">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-red-700">{outbreak.diagnosis}</p>
                      <p className="text-[0.7rem] text-red-600">
                        {outbreak.latestMonthCases} cases this month ({formatGrowth(outbreak.growthRate)} vs {outbreak.previousMonthCases} last month)
                      </p>
                      <p className="text-[0.7rem] text-red-700 mt-1">
                        Hotspots: {outbreak.mostAffectedBarangays.map((b) => `${b.barangay} (${b.count})`).join(", ") || "Not specified"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Report Downloads */}
      <div className="animate-fade-in-up" style={{ animationDelay: "250ms" }}>
        <h2 className="text-gray-800 mb-3 sm:mb-4 text-sm sm:text-base font-semibold">Generate &amp; Download Reports</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {reportCards.map((card, index) => (
            <div
              key={card.key}
              onClick={() => openExportModal(card.key)}
              className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 hover:border-blue-300 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group cursor-pointer animate-fade-in-up"
              style={{ animationDelay: `${300 + index * 50}ms` }}
            >
              <div className="flex items-start justify-between mb-2 sm:mb-3">
                <div className={`p-2 sm:p-2.5 rounded-xl ${card.color.split(" ")[0]} group-hover:scale-110 transition-transform duration-300`}>
                  <card.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${card.color.split(" ")[1]}`} />
                </div>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    openExportModal(card.key);
                  }}
                  className="opacity-100 sm:opacity-0 group-hover:opacity-100 flex items-center gap-1 text-blue-600 hover:text-blue-700 transition-all text-[0.65rem] sm:text-xs"
                >
                  <Download className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Export
                </button>
              </div>
              <p className="text-gray-800 mb-1 text-xs sm:text-sm font-semibold">{card.title}</p>
              <p className="text-gray-400 text-[0.65rem] sm:text-xs">{card.desc}</p>
            </div>
          ))}
        </div>
      </div>
      </div>

      {exportModalOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-3 sm:p-4 animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-label="Generate report"
        >
          <div className="relative w-full max-w-lg rounded-2xl border border-white/40 bg-white/90 shadow-2xl overflow-hidden animate-scale-in">
            <div className="flex items-center justify-between gap-4 p-4 sm:p-5 border-b border-gray-100 bg-white/80 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-gray-900 font-bold text-sm sm:text-base">Generate Report</h2>
                  <p className="text-[0.7rem] sm:text-xs text-gray-500">Export report data with filters</p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeExportModal}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-all duration-200"
                aria-label="Close report modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-500 mb-1 text-[0.65rem] sm:text-xs">Report Type</label>
                  <select
                    value={selectedReport}
                    onChange={(event) => setSelectedReport(event.target.value as ReportKey)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                    disabled={isExporting}
                  >
                    {reportCards.map((card) => (
                      <option key={card.key} value={card.key}>
                        {card.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-500 mb-1 text-[0.65rem] sm:text-xs">Format</label>
                  <select
                    value="csv"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 text-xs sm:text-sm"
                    disabled
                  >
                    <option value="csv">CSV (default)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-500 mb-1 text-[0.65rem] sm:text-xs">From</label>
                  <input
                    type="date"
                    value={exportRange.startDate}
                    onChange={(event) => setExportRange((prev) => ({ ...prev, startDate: event.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                    disabled={isExporting}
                  />
                </div>
                <div>
                  <label className="block text-gray-500 mb-1 text-[0.65rem] sm:text-xs">To</label>
                  <input
                    type="date"
                    value={exportRange.endDate}
                    onChange={(event) => setExportRange((prev) => ({ ...prev, endDate: event.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                    disabled={isExporting}
                  />
                </div>
              </div>

              <div className="rounded-lg border border-blue-100 bg-blue-50/60 px-3 py-2 text-[0.65rem] sm:text-xs text-blue-700">
                Date filters apply to vital signs and prescriptions only. Chart-based reports export the current dashboard data.
              </div>

              {exportError && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-[0.65rem] sm:text-xs text-rose-700">
                  {exportError}
                </div>
              )}
            </div>

            <div className="p-4 sm:p-6 border-t border-gray-100 flex flex-col sm:flex-row gap-2 sm:gap-3 justify-end bg-gray-50/60">
              <button
                type="button"
                onClick={closeExportModal}
                disabled={isExporting}
                className="px-3 sm:px-5 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-100 transition-all duration-200 text-xs sm:text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExport}
                disabled={isExporting}
                className="px-3 sm:px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg text-xs sm:text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isExporting ? "Generating..." : "Generate & Download"}
              </button>
            </div>

            <FormLoadingOverlay
              open={isExporting}
              title="Generating report..."
              message="Preparing export file"
              tone="info"
            />
          </div>
        </div>
      )}
    </>
  );
}
