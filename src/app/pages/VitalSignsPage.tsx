import { useState } from "react";
import { Search, Activity, Heart, Thermometer, TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { mockVitals, bpTrendData } from "../statics/vitals";

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

  const filtered = mockVitals.filter(v =>
    `${v.patient} ${v.id} ${v.consultId}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div className="flex items-center justify-between animate-fade-in-up">
        <div>
          <h1 className="text-gray-900" style={{ fontSize: "1.5rem", fontWeight: 700 }}>Vital Signs</h1>
          <p className="text-gray-500" style={{ fontSize: "0.875rem" }}>Monitor and track patient vital signs</p>
        </div>
        <button
          onClick={() => setShowTrend(!showTrend)}
          className="flex items-center gap-2 border border-blue-300 text-blue-600 hover:bg-blue-50 px-4 py-2.5 rounded-lg transition-colors"
          style={{ fontSize: "0.875rem", fontWeight: 600 }}
        >
          <TrendingUp className="w-4 h-4" /> {showTrend ? "Hide" : "Show"} Trend
        </button>
      </div>

      {showTrend && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-gray-800 mb-1" style={{ fontWeight: 600, fontSize: "0.95rem" }}>Maria Santos — Blood Pressure Trend</h3>
          <p className="text-gray-400 mb-4" style={{ fontSize: "0.8rem" }}>Jan 2026 – Mar 2026</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={bpTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" style={{ fontSize: "0.72rem" }} tick={{ fill: "#6B7280" }} />
              <YAxis style={{ fontSize: "0.72rem" }} tick={{ fill: "#6B7280" }} domain={[60, 180]} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: "0.75rem" }} />
              <Line type="monotone" dataKey="systolic" stroke="#EF4444" strokeWidth={2} name="Systolic" dot={{ fill: "#EF4444" }} />
              <Line type="monotone" dataKey="diastolic" stroke="#3B82F6" strokeWidth={2} name="Diastolic" dot={{ fill: "#3B82F6" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-4 flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by patient name or consultation ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ fontSize: "0.875rem" }}
          />
        </div>
        <input type="date" className="px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 focus:outline-none" style={{ fontSize: "0.875rem" }} />
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Avg Blood Pressure", value: "136/89", icon: Heart, color: "text-red-500", bg: "bg-red-50" },
          { label: "Avg Pulse Rate", value: "85 bpm", icon: Activity, color: "text-orange-500", bg: "bg-orange-50" },
          { label: "Avg Temperature", value: "37.2 °C", icon: Thermometer, color: "text-yellow-500", bg: "bg-yellow-50" },
          { label: "Avg Blood Sugar", value: "145 mg/dL", icon: Activity, color: "text-violet-500", bg: "bg-violet-50" },
        ].map((card, index) => (
          <div 
            key={card.label} 
            className={`${card.bg} rounded-xl p-4 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 animate-fade-in-up`}
            style={{ animationDelay: `${index * 75}ms` }}
          >
            <div className="flex items-center gap-2 mb-1">
              <card.icon className={`w-4 h-4 ${card.color}`} />
              <p className="text-gray-500" style={{ fontSize: "0.72rem" }}>{card.label}</p>
            </div>
            <p className={`${card.color}`} style={{ fontSize: "1.25rem", fontWeight: 700 }}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {["Record ID", "Patient", "Date", "BP (mmHg)", "Pulse", "Resp. Rate", "Temp (°C)", "Blood Sugar", "Weight", "Height", "BMI"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-gray-500 whitespace-nowrap" style={{ fontSize: "0.72rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
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
                  <tr key={v.id} className={`border-b border-gray-50 hover:bg-blue-50/30 transition-colors ${i % 2 === 0 ? "" : "bg-gray-50/30"}`}>
                    <td className="px-4 py-3">
                      <span className="text-blue-600" style={{ fontSize: "0.75rem", fontWeight: 600 }}>{v.id}</span>
                      <p className="text-gray-400" style={{ fontSize: "0.7rem" }}>{v.consultId}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-800" style={{ fontSize: "0.8rem", fontWeight: 500 }}>{v.patient}</td>
                    <td className="px-4 py-3 text-gray-500" style={{ fontSize: "0.8rem" }}>{v.date}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-gray-800" style={{ fontSize: "0.8rem", fontWeight: 600 }}>{v.bpSystolic}/{v.bpDiastolic}</span>
                        <span className={`px-1.5 py-0.5 rounded ${bp.bg} ${bp.color}`} style={{ fontSize: "0.65rem", fontWeight: 500 }}>{bp.label}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-700" style={{ fontSize: "0.8rem" }}>{v.pulseRate} bpm</td>
                    <td className="px-4 py-3 text-gray-700" style={{ fontSize: "0.8rem" }}>{v.respRate}/min</td>
                    <td className="px-4 py-3 text-gray-700" style={{ fontSize: "0.8rem" }}>{v.temp}°C</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-gray-800" style={{ fontSize: "0.8rem", fontWeight: 600 }}>{v.bloodSugar}</span>
                        <span className={`px-1.5 py-0.5 rounded ${bs.bg} ${bs.color}`} style={{ fontSize: "0.65rem", fontWeight: 500 }}>{bs.label}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-700" style={{ fontSize: "0.8rem" }}>{v.weight} kg</td>
                    <td className="px-4 py-3 text-gray-700" style={{ fontSize: "0.8rem" }}>{v.height} cm</td>
                    <td className="px-4 py-3">
                      <span className={`${v.bmi >= 25 ? "text-orange-600" : "text-green-600"}`} style={{ fontSize: "0.8rem", fontWeight: 600 }}>{v.bmi}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
