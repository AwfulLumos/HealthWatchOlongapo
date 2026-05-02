import { useState, useEffect, useCallback } from "react";
import { Download, Users, Stethoscope, Activity, Heart, Pill, AlertTriangle } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line,
} from "recharts";
import { dashboardService, buildMonthOptions } from "../services/dashboardService";
import { ReportsSkeleton } from "../components/skeletons/ReportsSkeleton";

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

  const reportCards = [
    { title: "Patient Demographics", desc: "Complete patient statistics", icon: Users, color: "bg-blue-100 text-blue-600" },
    { title: "Consultation Summary", desc: "Monthly consultation breakdown", icon: Stethoscope, color: "bg-green-100 text-green-600" },
    { title: "Diagnosis Report", desc: "Top diagnoses and trends", icon: Activity, color: "bg-purple-100 text-purple-600" },
    { title: "Vital Signs Summary", desc: "Population health indicators", icon: Heart, color: "bg-red-100 text-red-600" },
    { title: "Prescription Analytics", desc: "Medication dispensing report", icon: Pill, color: "bg-teal-100 text-teal-600" },
  ];

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
          <button className="flex items-center gap-1 sm:gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-colors text-xs sm:text-sm font-semibold">
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
              key={card.title}
              className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 hover:border-blue-300 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group cursor-pointer animate-fade-in-up"
              style={{ animationDelay: `${300 + index * 50}ms` }}
            >
              <div className="flex items-start justify-between mb-2 sm:mb-3">
                <div className={`p-2 sm:p-2.5 rounded-xl ${card.color.split(" ")[0]} group-hover:scale-110 transition-transform duration-300`}>
                  <card.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${card.color.split(" ")[1]}`} />
                </div>
                <button className="opacity-100 sm:opacity-0 group-hover:opacity-100 flex items-center gap-1 text-blue-600 hover:text-blue-700 transition-all text-[0.65rem] sm:text-xs">
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
  );
}
