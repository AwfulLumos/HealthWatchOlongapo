import { useState, useEffect } from "react";
import { Search, Activity, Heart, Thermometer, TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
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
  if (systolic >= 140 || diastolic >= 90) return { label: "High", color: "text-red-600", bg: "bg-red-100" };
  if (systolic >= 130 || diastolic >= 80) return { label: "Elevated", color: "text-orange-600", bg: "bg-orange-100" };
  return { label: "Normal", color: "text-green-600", bg: "bg-green-100" };
}

function getBSStatus(bs: number) {
  if (bs >= 200) return { label: "High", color: "text-red-600", bg: "bg-red-100" };
  if (bs >= 140) return { label: "Elevated", color: "text-orange-600", bg: "bg-orange-100" };
  return { label: "Normal", color: "text-green-600", bg: "bg-green-100" };
}

export function VitalSignsPage() {
  const [search, setSearch] = useState("");
  const [showTrend, setShowTrend] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [vitals, setVitals] = useState<VitalRow[]>([]);
  const [bpTrendData, setBpTrendData] = useState<TrendPoint[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [selectedPatientName, setSelectedPatientName] = useState<string>("");

  useEffect(() => {
    const fetchVitals = async () => {
      setIsLoading(true);
      console.log("[VitalSigns] Fetching list");
      const data = await vitalSignsService.getAll();
      const transformed: VitalRow[] = data.map((v: VitalApiRow) => ({
        ...v,
        patient: typeof v.patient === "object"
          ? `${v.patient?.firstName || ""} ${v.patient?.lastName || ""}`.trim()
          : v.patient || "Unknown",
        patientId: v.patientId || (typeof v.patient === "object" ? v.patient?.id : ""),
      }));
      setVitals(transformed);
      console.log("[VitalSigns] List loaded", { count: transformed.length });
      setIsLoading(false);
    };
    fetchVitals();
  }, []);

  const filtered = vitals.filter(v =>
    `${v.patient} ${v.id} ${v.consultId}`.toLowerCase().includes(search.toLowerCase())
  );

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

      console.log("[VitalSigns] Fetching BP trend", { patientId: selectedPatientId });
      const trend = await vitalSignsService.getBPTrend(selectedPatientId);
      setBpTrendData(trend);
      console.log("[VitalSigns] BP trend loaded", {
        patientId: selectedPatientId,
        points: trend.length,
      });
    };

    fetchTrend();
  }, [selectedPatientId]);

  const trendDateRange =
    bpTrendData.length > 0
      ? `${new Date(bpTrendData[0].date).toLocaleDateString("en-US", { month: "short", year: "numeric" })} - ${new Date(bpTrendData[bpTrendData.length - 1].date).toLocaleDateString("en-US", { month: "short", year: "numeric" })}`
      : "No trend data available";

  if (isLoading) {
    return <VitalSignsSkeleton />;
  }

  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-5 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 animate-fade-in-up">
        <div>
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Vital Signs</h1>
          <p className="text-xs sm:text-sm text-gray-500">Monitor and track patient vital signs</p>
        </div>
        <button
          disabled={!hasSelectablePatients}
          onClick={() => setShowTrend(!showTrend)}
          className={`flex items-center justify-center gap-2 border px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg transition-colors text-xs sm:text-sm font-semibold ${hasSelectablePatients ? "border-blue-300 text-blue-600 hover:bg-blue-50" : "border-gray-200 text-gray-400 cursor-not-allowed"}`}
        >
          <TrendingUp className="w-4 h-4" /> {showTrend ? "Hide" : "Show"} Trend
        </button>
      </div>

      {showTrend && (
        <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-5">
          {!hasSelectablePatients ? (
            <div className="h-[180px] flex flex-col items-center justify-center text-center px-4">
              <h3 className="text-gray-800 text-sm sm:text-base font-semibold mb-1">Select a patient to view trend</h3>
              <p className="text-gray-500 text-xs sm:text-sm">No patient records match your current search. Clear or adjust the search to view trend data.</p>
            </div>
          ) : (
            <>
              <h3 className="text-gray-800 mb-1 text-sm sm:text-base font-semibold">{selectedPatientName || "No Patient Selected"} - Blood Pressure Trend</h3>
              <p className="text-gray-400 mb-3 sm:mb-4 text-xs sm:text-sm">{trendDateRange}</p>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={bpTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" style={{ fontSize: "0.65rem" }} tick={{ fill: "#6B7280" }} />
                  <YAxis style={{ fontSize: "0.65rem" }} tick={{ fill: "#6B7280" }} domain={[60, 180]} width={30} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: "0.7rem" }} />
                  <Line type="monotone" dataKey="systolic" stroke="#EF4444" strokeWidth={2} name="Systolic" dot={{ fill: "#EF4444" }} />
                  <Line type="monotone" dataKey="diastolic" stroke="#3B82F6" strokeWidth={2} name="Diastolic" dot={{ fill: "#3B82F6" }} />
                </LineChart>
              </ResponsiveContainer>
            </>
          )}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 flex flex-col sm:flex-row gap-2 sm:gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by patient name or consultation ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
          />
        </div>
        <input type="date" className="px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 focus:outline-none text-xs sm:text-sm" />
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
        {[
          { label: "Avg Blood Pressure", value: "136/89", icon: Heart, color: "text-red-500", bg: "bg-red-50" },
          { label: "Avg Pulse Rate", value: "85 bpm", icon: Activity, color: "text-orange-500", bg: "bg-orange-50" },
          { label: "Avg Temperature", value: "37.2 °C", icon: Thermometer, color: "text-yellow-500", bg: "bg-yellow-50" },
          { label: "Avg Blood Sugar", value: "145 mg/dL", icon: Activity, color: "text-violet-500", bg: "bg-violet-50" },
        ].map((card, index) => (
          <div 
            key={card.label} 
            className={`${card.bg} rounded-xl p-3 sm:p-4 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 animate-fade-in-up`}
            style={{ animationDelay: `${index * 75}ms` }}
          >
            <div className="flex items-center gap-1 sm:gap-2 mb-1">
              <card.icon className={`w-3 h-3 sm:w-4 sm:h-4 ${card.color}`} />
              <p className="text-gray-500 text-[0.6rem] sm:text-xs">{card.label}</p>
            </div>
            <p className={`${card.color} text-base sm:text-xl font-bold`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {["Record ID", "Patient", "Date", "BP (mmHg)", "Pulse", "Resp. Rate", "Temp (°C)", "Blood Sugar", "Weight", "Height", "BMI"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-gray-500 whitespace-nowrap text-xs font-semibold uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((v, i) => {
                const bp = getBPStatus(v.bpSystolic, v.bpDiastolic);
                const bs = getBSStatus(v.bloodSugar);
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
                    className={`border-b border-gray-50 hover:bg-blue-50/30 transition-colors cursor-pointer ${i % 2 === 0 ? "" : "bg-gray-50/30"} ${selectedPatientId === v.patientId ? "bg-blue-50" : ""}`}
                  >
                    <td className="px-4 py-3">
                      <span className="text-blue-600 text-xs font-semibold" title={v.id}>{formatEntityId(v.id, "VTL")}</span>
                      <p className="text-gray-400 text-[0.65rem]" title={v.consultId}>{formatEntityId(v.consultId, "CON")}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-800 text-sm font-medium">{v.patient}</td>
                    <td className="px-4 py-3 text-gray-500 text-sm">{v.date}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-gray-800 text-sm font-semibold">{v.bpSystolic}/{v.bpDiastolic}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[0.65rem] font-medium ${bp.bg} ${bp.color}`}>{bp.label}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-700 text-sm">{v.pulseRate} bpm</td>
                    <td className="px-4 py-3 text-gray-700 text-sm">{v.respRate}/min</td>
                    <td className="px-4 py-3 text-gray-700 text-sm">{v.temp}°C</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-gray-800 text-sm font-semibold">{v.bloodSugar}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[0.65rem] font-medium ${bs.bg} ${bs.color}`}>{bs.label}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-700 text-sm">{v.weight} kg</td>
                    <td className="px-4 py-3 text-gray-700 text-sm">{v.height} cm</td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-semibold ${v.bmi >= 25 ? "text-orange-600" : "text-green-600"}`}>{v.bmi}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {filtered.map((v) => {
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
              className={`bg-white rounded-xl border border-gray-200 p-4 cursor-pointer ${selectedPatientId === v.patientId ? "ring-2 ring-blue-200" : ""}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="text-blue-600 text-xs font-semibold" title={v.id}>{formatEntityId(v.id, "VTL")}</span>
                  <p className="text-gray-800 text-sm font-semibold mt-0.5">{v.patient}</p>
                  <p className="text-gray-400 text-xs">{v.date}</p>
                </div>
                <span className="text-gray-400 text-[0.65rem]" title={v.consultId}>{formatEntityId(v.consultId, "CON")}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-red-50 rounded-lg p-2">
                  <p className="text-gray-500 text-[0.65rem]">Blood Pressure</p>
                  <div className="flex items-center gap-1">
                    <span className="text-red-600 text-sm font-bold">{v.bpSystolic}/{v.bpDiastolic}</span>
                    <span className={`px-1 py-0.5 rounded text-[0.55rem] font-medium ${bp.bg} ${bp.color}`}>{bp.label}</span>
                  </div>
                </div>
                <div className="bg-orange-50 rounded-lg p-2">
                  <p className="text-gray-500 text-[0.65rem]">Pulse Rate</p>
                  <span className="text-orange-600 text-sm font-bold">{v.pulseRate} bpm</span>
                </div>
                <div className="bg-yellow-50 rounded-lg p-2">
                  <p className="text-gray-500 text-[0.65rem]">Temperature</p>
                  <span className="text-yellow-600 text-sm font-bold">{v.temp}°C</span>
                </div>
                <div className="bg-violet-50 rounded-lg p-2">
                  <p className="text-gray-500 text-[0.65rem]">Blood Sugar</p>
                  <div className="flex items-center gap-1">
                    <span className="text-violet-600 text-sm font-bold">{v.bloodSugar}</span>
                    <span className={`px-1 py-0.5 rounded text-[0.55rem] font-medium ${bs.bg} ${bs.color}`}>{bs.label}</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-between text-xs border-t border-gray-50 pt-2">
                <span className="text-gray-400">Weight: <span className="text-gray-600 font-medium">{v.weight} kg</span></span>
                <span className="text-gray-400">Height: <span className="text-gray-600 font-medium">{v.height} cm</span></span>
                <span className="text-gray-400">BMI: <span className={`font-semibold ${v.bmi >= 25 ? "text-orange-600" : "text-green-600"}`}>{v.bmi}</span></span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
