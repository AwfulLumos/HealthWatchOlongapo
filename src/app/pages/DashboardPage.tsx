import { TrendingUp, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import {
  statsCards,
  consultationsChartData,
  monthlyPatientData,
  diagnosisData,
  recentPatients,
  upcomingAppointments,
  patientStatusColors,
} from "../statics/dashboard";

const statusColor = patientStatusColors;

export function DashboardPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-gray-900" style={{ fontSize: "1.5rem", fontWeight: 700 }}>Dashboard</h1>
          <p className="text-gray-500 mt-0.5" style={{ fontSize: "0.875rem" }}>
            Saturday, March 28, 2026 &mdash; Health Watch Olongapo
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 px-3 py-1.5 rounded-full shadow-sm" style={{ fontSize: "0.8rem", fontWeight: 500 }}>
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            System Online
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statsCards.map((card, index) => (
          <div 
            key={card.label} 
            className="bg-white rounded-xl border border-gray-200 p-5 flex items-start gap-4 hover-lift cursor-default animate-fade-in-up shadow-card hover:shadow-card-hover"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className={`${card.light} p-3 rounded-xl transition-transform hover:scale-110`}>
              <card.icon className={`w-6 h-6 ${card.text}`} />
            </div>
            <div>
              <p className="text-gray-500" style={{ fontSize: "0.8rem" }}>{card.label}</p>
              <p className="text-gray-900 mt-0.5" style={{ fontSize: "1.5rem", fontWeight: 700 }}>{card.value}</p>
              <p className={`mt-0.5 ${card.text}`} style={{ fontSize: "0.75rem" }}>
                <TrendingUp className="inline w-3 h-3 mr-0.5" />
                {card.change}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Weekly Consultations Bar */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5 shadow-card hover:shadow-card-hover transition-all duration-300 animate-fade-in-up animation-delay-300">
          <h3 className="text-gray-800 mb-4" style={{ fontWeight: 600, fontSize: "0.95rem" }}>
            Weekly Consultations
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={consultationsChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" style={{ fontSize: "0.75rem" }} tick={{ fill: "#6B7280" }} />
              <YAxis style={{ fontSize: "0.75rem" }} tick={{ fill: "#6B7280" }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: 'none', 
                  borderRadius: '12px', 
                  boxShadow: '0 10px 40px rgba(0,0,0,0.1)' 
                }} 
              />
              <Bar dataKey="consultations" fill="#3B82F6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Diagnosis Pie */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-card hover:shadow-card-hover transition-all duration-300 animate-fade-in-up animation-delay-400">
          <h3 className="text-gray-800 mb-4" style={{ fontWeight: 600, fontSize: "0.95rem" }}>
            Top Diagnoses
          </h3>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie data={diagnosisData} cx="50%" cy="50%" outerRadius={60} dataKey="value">
                {diagnosisData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: 'none', 
                  borderRadius: '12px', 
                  boxShadow: '0 10px 40px rgba(0,0,0,0.1)' 
                }} 
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1 mt-2">
            {diagnosisData.map((item) => (
              <div key={item.name} className="flex items-center justify-between hover:bg-gray-50 rounded-lg px-2 py-1 transition-colors">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-gray-600" style={{ fontSize: "0.75rem" }}>{item.name}</span>
                </div>
                <span className="text-gray-800" style={{ fontSize: "0.75rem", fontWeight: 600 }}>{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly Trend */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-card hover:shadow-card-hover transition-all duration-300 animate-fade-in-up animation-delay-500">
        <h3 className="text-gray-800 mb-4" style={{ fontWeight: 600, fontSize: "0.95rem" }}>
          Monthly Patient Trend
        </h3>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={monthlyPatientData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" style={{ fontSize: "0.75rem" }} tick={{ fill: "#6B7280" }} />
            <YAxis style={{ fontSize: "0.75rem" }} tick={{ fill: "#6B7280" }} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: 'none', 
                borderRadius: '12px', 
                boxShadow: '0 10px 40px rgba(0,0,0,0.1)' 
              }} 
            />
            <Line type="monotone" dataKey="patients" stroke="#14B8A6" strokeWidth={2} dot={{ fill: "#14B8A6", strokeWidth: 2, r: 4 }} activeDot={{ r: 6, fill: "#14B8A6" }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Patients */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-card hover:shadow-card-hover transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-800" style={{ fontWeight: 600, fontSize: "0.95rem" }}>Recent Patient Activity</h3>
            <a href="/patients" className="text-blue-600 hover:text-blue-700 hover:underline transition-colors" style={{ fontSize: "0.8rem" }}>View all</a>
          </div>
          <div className="space-y-3">
            {recentPatients.map((p, index) => (
              <div 
                key={p.id} 
                className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0 hover:bg-blue-50/50 rounded-lg px-2 -mx-2 transition-all duration-200 cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center text-blue-700 group-hover:scale-110 transition-transform" style={{ fontSize: "0.7rem", fontWeight: 700 }}>
                    {p.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-gray-800 group-hover:text-blue-700 transition-colors" style={{ fontSize: "0.8rem", fontWeight: 600 }}>{p.name}</p>
                    <p className="text-gray-400" style={{ fontSize: "0.72rem" }}>{p.barangay} &bull; {p.date}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full ${statusColor[p.status]} transition-transform group-hover:scale-105`} style={{ fontSize: "0.7rem", fontWeight: 500 }}>
                  {p.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-card hover:shadow-card-hover transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-800" style={{ fontWeight: 600, fontSize: "0.95rem" }}>Today's Appointments</h3>
            <a href="/appointments" className="text-blue-600 hover:text-blue-700 hover:underline transition-colors" style={{ fontSize: "0.8rem" }}>View all</a>
          </div>
          <div className="space-y-3">
            {upcomingAppointments.map((appt, i) => (
              <div key={i} className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0 hover:bg-blue-50/50 rounded-lg px-2 -mx-2 transition-all duration-200 cursor-pointer group">
                <div className="flex-shrink-0 bg-gradient-to-br from-blue-50 to-blue-100 text-blue-700 px-2 py-1.5 rounded-lg text-center group-hover:from-blue-100 group-hover:to-blue-200 transition-all" style={{ minWidth: "72px" }}>
                  <p style={{ fontSize: "0.72rem", fontWeight: 600 }}>{appt.time}</p>
                </div>
                <div className="flex-1">
                  <p className="text-gray-800 group-hover:text-blue-700 transition-colors" style={{ fontSize: "0.8rem", fontWeight: 600 }}>{appt.patient}</p>
                  <p className="text-gray-500" style={{ fontSize: "0.72rem" }}>{appt.purpose}</p>
                  <p className="text-blue-500" style={{ fontSize: "0.72rem" }}>{appt.staff}</p>
                </div>
                <Clock className="w-4 h-4 text-gray-300 flex-shrink-0 mt-0.5 group-hover:text-blue-400 transition-colors" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-card">
        <h3 className="text-gray-800 mb-4" style={{ fontWeight: 600, fontSize: "0.95rem" }}>System Alerts</h3>
        <div className="space-y-2">
          <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-lg hover:shadow-md transition-all duration-200 cursor-pointer group">
            <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
            <p className="text-yellow-700" style={{ fontSize: "0.8rem" }}>
              3 patients have follow-up appointments due this week with no confirmation yet.
            </p>
          </div>
          <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg hover:shadow-md transition-all duration-200 cursor-pointer group">
            <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
            <p className="text-blue-700" style={{ fontSize: "0.8rem" }}>
              Monthly health report for February 2026 is ready for review.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
