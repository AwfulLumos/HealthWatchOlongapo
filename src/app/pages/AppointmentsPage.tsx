import { useState } from "react";
import { Search, Plus, X, ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { mockAppointments, appointmentStatusColors } from "../statics/appointments";

const statusColor = appointmentStatusColors;

function AppointmentModal({ appt, onClose, mode }: { appt?: any; onClose: () => void; mode: "view" | "add" | "edit" }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white/90 backdrop-blur-sm z-10">
          <h2 className="text-gray-900" style={{ fontSize: "1.1rem", fontWeight: 700 }}>
            {mode === "add" ? "Schedule Appointment" : mode === "edit" ? "Edit Appointment" : "Appointment Details"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-all duration-200">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          {[
            { label: "Patient", key: "patient", value: appt?.patient },
            { label: "Staff / Doctor", key: "staff", value: appt?.staff },
            { label: "Scheduled Date & Time", key: "scheduledDate", type: "datetime-local", value: appt?.scheduledDate },
            { label: "Purpose", key: "purpose", value: appt?.purpose },
            { label: "Status", key: "status", value: appt?.status },
            { label: "Notes", key: "notes", value: appt?.notes, textarea: true },
          ].map(({ label, key, value, type, textarea }) => (
            <div key={key}>
              <label className="block text-gray-500 mb-1" style={{ fontSize: "0.75rem" }}>{label}</label>
              {mode === "view" ? (
                <p className="text-gray-800 py-2 border-b border-gray-100" style={{ fontSize: "0.875rem", fontWeight: 500 }}>{value || "—"}</p>
              ) : textarea ? (
                <textarea
                  rows={3}
                  defaultValue={value || ""}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200"
                  style={{ fontSize: "0.875rem" }}
                />
              ) : (
                <input
                  type={type || "text"}
                  defaultValue={value || ""}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200"
                  style={{ fontSize: "0.875rem" }}
                />
              )}
            </div>
          ))}
        </div>
        {mode !== "view" && (
          <div className="p-6 border-t border-gray-100 flex gap-3 justify-end bg-gray-50/50">
            <button onClick={onClose} className="px-5 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-100 transition-all duration-200 hover:border-gray-300" style={{ fontSize: "0.875rem" }}>Cancel</button>
            <button onClick={onClose} className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg press-effect" style={{ fontSize: "0.875rem", fontWeight: 600 }}>
              {mode === "add" ? "Schedule" : "Update"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const calendarDays = Array.from({ length: 35 }, (_, i) => {
  const day = i - 5; // offset
  return day > 0 && day <= 31 ? day : null;
});

const appointmentDays = [28, 30, 31];

export function AppointmentsPage() {
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"list" | "calendar">("list");
  const [modal, setModal] = useState<{ mode: "view" | "add" | "edit"; appt?: any } | null>(null);

  const filtered = mockAppointments.filter(a =>
    `${a.patient} ${a.id} ${a.purpose}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between animate-fade-in-up">
        <div>
          <h1 className="text-gray-900" style={{ fontSize: "1.5rem", fontWeight: 700 }}>Appointments</h1>
          <p className="text-gray-500" style={{ fontSize: "0.875rem" }}>Manage patient appointments and schedules</p>
        </div>
        <div className="flex gap-2">
          <div className="flex border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setView("list")}
              className={`px-3 py-2 transition-colors ${view === "list" ? "bg-blue-600 text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}
              style={{ fontSize: "0.8rem" }}
            >
              List
            </button>
            <button
              onClick={() => setView("calendar")}
              className={`px-3 py-2 transition-colors ${view === "calendar" ? "bg-blue-600 text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}
              style={{ fontSize: "0.8rem" }}
            >
              Calendar
            </button>
          </div>
          <button
            onClick={() => setModal({ mode: "add" })}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg transition-colors"
            style={{ fontSize: "0.875rem", fontWeight: 600 }}
          >
            <Plus className="w-4 h-4" /> Schedule
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search appointments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ fontSize: "0.875rem" }}
          />
        </div>
        <select className="px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 focus:outline-none" style={{ fontSize: "0.875rem" }}>
          <option>All Status</option>
          <option>Confirmed</option>
          <option>Pending</option>
          <option>Cancelled</option>
        </select>
        <input type="date" className="px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 focus:outline-none" style={{ fontSize: "0.875rem" }} />
      </div>

      {view === "list" ? (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {["Appt ID", "Patient", "Staff / Doctor", "Scheduled Date", "Purpose", "Status", "Notes", "Actions"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-gray-500" style={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((a, i) => (
                <tr key={a.id} className={`border-b border-gray-50 hover:bg-blue-50/30 transition-colors ${i % 2 === 0 ? "" : "bg-gray-50/30"}`}>
                  <td className="px-4 py-3">
                    <span className="text-blue-600" style={{ fontSize: "0.8rem", fontWeight: 600 }}>{a.id}</span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-gray-800" style={{ fontSize: "0.8rem", fontWeight: 600 }}>{a.patient}</p>
                    <p className="text-gray-400" style={{ fontSize: "0.72rem" }}>{a.patientId}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600" style={{ fontSize: "0.8rem" }}>{a.staff}</td>
                  <td className="px-4 py-3 text-gray-600" style={{ fontSize: "0.8rem" }}>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-blue-400" />
                      {a.scheduledDate}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600" style={{ fontSize: "0.8rem" }}>{a.purpose}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full ${statusColor[a.status]}`} style={{ fontSize: "0.72rem", fontWeight: 500 }}>{a.status}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 max-w-[120px]" style={{ fontSize: "0.75rem" }}>
                    <span className="truncate block">{a.notes || "—"}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => setModal({ mode: "view", appt: a })} className="px-2 py-1 text-blue-600 hover:bg-blue-50 rounded text-xs transition-colors" style={{ fontSize: "0.72rem" }}>View</button>
                      <button onClick={() => setModal({ mode: "edit", appt: a })} className="px-2 py-1 text-gray-500 hover:bg-gray-100 rounded text-xs transition-colors" style={{ fontSize: "0.72rem" }}>Edit</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Calendar View */
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-gray-800" style={{ fontWeight: 700, fontSize: "1rem" }}>March 2026</h3>
            <div className="flex gap-2">
              <button className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"><ChevronLeft className="w-4 h-4" /></button>
              <button className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {daysOfWeek.map(d => (
              <div key={d} className="text-center text-gray-400 py-2" style={{ fontSize: "0.75rem", fontWeight: 600 }}>{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, i) => (
              <div
                key={i}
                className={`min-h-[80px] p-2 rounded-lg border transition-colors ${
                  day === 28 ? "border-blue-400 bg-blue-50" :
                  day ? "border-gray-100 hover:bg-gray-50" :
                  "border-transparent"
                }`}
              >
                {day && (
                  <>
                    <p className={`${day === 28 ? "text-blue-700" : "text-gray-600"} mb-1`} style={{ fontSize: "0.8rem", fontWeight: day === 28 ? 700 : 400 }}>
                      {day}
                    </p>
                    {appointmentDays.includes(day) && (
                      <div className="space-y-0.5">
                        {day === 28 && (
                          <>
                            <div className="bg-blue-500 text-white px-1 py-0.5 rounded truncate" style={{ fontSize: "0.6rem" }}>09:00 Villanueva</div>
                            <div className="bg-teal-500 text-white px-1 py-0.5 rounded truncate" style={{ fontSize: "0.6rem" }}>13:00 Pascual</div>
                          </>
                        )}
                        {day === 30 && (
                          <div className="bg-yellow-500 text-white px-1 py-0.5 rounded truncate" style={{ fontSize: "0.6rem" }}>09:00 Santos</div>
                        )}
                        {day === 31 && (
                          <div className="bg-violet-500 text-white px-1 py-0.5 rounded truncate" style={{ fontSize: "0.6rem" }}>10:00 Dela Cruz</div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {modal && (
        <AppointmentModal mode={modal.mode} appt={modal.appt} onClose={() => setModal(null)} />
      )}
    </div>
  );
}
