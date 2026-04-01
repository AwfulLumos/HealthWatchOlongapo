import { useState, useEffect } from "react";
import { Download } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import {
  monthlyConsultations,
  diagnosisBreakdown,
  stationPerformanceData,
  genderDistribution,
  reportCards,
} from "../statics/reports";
import { ReportsSkeleton } from "../components/skeletons/ReportsSkeleton";

const stationData = stationPerformanceData;
const genderData = genderDistribution;

export function ReportsPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate data loading - replace with actual API call when backend is ready
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <ReportsSkeleton />;
  }
  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 animate-fade-in-up">
        <div>
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-xs sm:text-sm text-gray-500">Generate reports and view system analytics</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <select className="px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-200 rounded-lg bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm">
            <option>March 2026</option>
            <option>February 2026</option>
            <option>January 2026</option>
          </select>
          <button className="flex items-center gap-1 sm:gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-colors text-xs sm:text-sm font-semibold">
            <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Export
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
        {[
          { label: "Total Patients (Mar)", value: "312", change: "+5.4%", up: true },
          { label: "Consultations (Mar)", value: "190", change: "+8.2%", up: true },
          { label: "Avg Daily Consults", value: "6.3", change: "+1.1", up: true },
          { label: "Referrals", value: "12", change: "-2", up: false },
        ].map((m, index) => (
          <div 
            key={m.label} 
            className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 animate-fade-in-up"
            style={{ animationDelay: `${index * 75}ms` }}
          >
            <p className="text-gray-400 text-[0.65rem] sm:text-xs">{m.label}</p>
            <p className="text-gray-900 mt-1 text-lg sm:text-2xl font-bold">{m.value}</p>
            <p className={`mt-1 text-[0.65rem] sm:text-xs font-medium ${m.up ? "text-green-600" : "text-red-500"}`}>
              {m.change} vs last month
            </p>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 animate-fade-in-up" style={{ animationDelay: "150ms" }}>
        {/* Monthly Consultations */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-3 sm:p-5 hover:shadow-md transition-all duration-300">
          <h3 className="text-gray-800 mb-3 sm:mb-4 text-sm sm:text-base font-semibold">Consultations by Type (Last 6 Months)</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={monthlyConsultations}>
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
        </div>

        {/* Diagnosis */}
        <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-5">
          <h3 className="text-gray-800 mb-3 sm:mb-4 text-sm sm:text-base font-semibold">Diagnosis Breakdown</h3>
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
                  <span className="text-gray-500 text-[0.65rem] sm:text-xs">{item.name}</span>
                </div>
                <span className="text-gray-700 text-[0.65rem] sm:text-xs font-semibold">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
        {/* Station comparison */}
        <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-5">
          <h3 className="text-gray-800 mb-3 sm:mb-4 text-sm sm:text-base font-semibold">Station Performance</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={stationData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
              <XAxis type="number" style={{ fontSize: "0.65rem" }} tick={{ fill: "#6B7280" }} />
              <YAxis type="category" dataKey="station" width={60} style={{ fontSize: "0.6rem" }} tick={{ fill: "#6B7280" }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: "0.7rem" }} />
              <Bar dataKey="patients" name="Patients" fill="#3B82F6" radius={[0, 2, 2, 0]} />
              <Bar dataKey="consultations" name="Consultations" fill="#14B8A6" radius={[0, 2, 2, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gender distribution */}
        <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-5">
          <h3 className="text-gray-800 mb-3 sm:mb-4 text-sm sm:text-base font-semibold">Patient Demographics</h3>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
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
            <div className="flex sm:flex-col gap-4 sm:gap-3">
              {genderData.map((g) => (
                <div key={g.name} className="flex items-center gap-2 sm:gap-3">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full" style={{ backgroundColor: g.color }} />
                  <div>
                    <p className="text-gray-700 text-xs sm:text-sm font-semibold">{g.name}</p>
                    <p className="text-base sm:text-xl font-bold" style={{ color: g.color }}>{g.value}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100 grid grid-cols-3 gap-2">
            {[
              { label: "0–17 yrs", value: "18%", color: "text-blue-500" },
              { label: "18–59 yrs", value: "55%", color: "text-teal-500" },
              { label: "60+ yrs", value: "27%", color: "text-orange-500" },
            ].map(({ label, value, color }) => (
              <div key={label} className="text-center bg-gray-50 rounded-lg p-1.5 sm:p-2">
                <p className={`${color} text-sm sm:text-base font-bold`}>{value}</p>
                <p className="text-gray-400 text-[0.6rem] sm:text-[0.7rem]">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Report Downloads */}
      <div className="animate-fade-in-up" style={{ animationDelay: "250ms" }}>
        <h2 className="text-gray-800 mb-3 sm:mb-4 text-sm sm:text-base font-semibold">Generate & Download Reports</h2>
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
