import { useState, useEffect } from "react";
import { Search, Plus, X, ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { appointmentService } from "../services/appointmentService";
import { AppointmentsSkeleton, AppointmentsCalendarSkeleton } from "../components/skeletons/AppointmentsSkeleton";

const statusColor = {
  Confirmed: "text-green-600 bg-green-50 border-green-200",
  Pending: "text-orange-600 bg-orange-50 border-orange-200",
  Cancelled: "text-gray-600 bg-gray-50 border-gray-200"
};

function AppointmentModal({ appt, onClose, mode }: { appt?: any; onClose: () => void; mode: "view" | "add" | "edit" }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-2 sm:p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100 sticky top-0 bg-white/90 backdrop-blur-sm z-10">
          <h2 className="text-sm sm:text-base lg:text-lg font-bold text-gray-900">
            {mode === "add" ? "Schedule Appointment" : mode === "edit" ? "Edit Appointment" : "Appointment Details"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-all duration-200">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
          {[
            { label: "Patient", key: "patient", value: appt?.patient },
            { label: "Staff / Doctor", key: "staff", value: appt?.staff },
            { label: "Scheduled Date & Time", key: "scheduledDate", type: "datetime-local", value: appt?.scheduledDate },
            { label: "Purpose", key: "purpose", value: appt?.purpose },
            { label: "Status", key: "status", value: appt?.status },
            { label: "Notes", key: "notes", value: appt?.notes, textarea: true },
          ].map(({ label, key, value, type, textarea }) => (
            <div key={key}>
              <label className="block text-gray-500 mb-1 text-[0.65rem] sm:text-xs">{label}</label>
              {mode === "view" ? (
                <p className="text-gray-800 py-2 border-b border-gray-100 text-xs sm:text-sm font-medium">{value || "—"}</p>
              ) : textarea ? (
                <textarea
                  rows={3}
                  defaultValue={value || ""}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200 text-xs sm:text-sm"
                />
              ) : (
                <input
                  type={type || "text"}
                  defaultValue={value || ""}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200 text-xs sm:text-sm"
                />
              )}
            </div>
          ))}
        </div>
        {mode !== "view" && (
          <div className="p-4 sm:p-6 border-t border-gray-100 flex flex-col sm:flex-row gap-2 sm:gap-3 justify-end bg-gray-50/50">
            <button onClick={onClose} className="px-3 sm:px-5 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-100 transition-all duration-200 hover:border-gray-300 text-xs sm:text-sm">Cancel</button>
            <button onClick={onClose} className="px-3 sm:px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg press-effect text-xs sm:text-sm font-semibold">
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
  const [isLoading, setIsLoading] = useState(true);
  const [appointments, setAppointments] = useState<any[]>([]);

  useEffect(() => {
    const fetchAppointments = async () => {
      setIsLoading(true);
      const data = await appointmentService.getAll();
      // Transform nested patient/staff objects to flat strings
      const transformed = data.map((a: any) => ({
        ...a,
        patient: typeof a.patient === 'object' 
          ? `${a.patient?.firstName || ''} ${a.patient?.lastName || ''}`.trim() 
          : a.patient || "Unknown",
        patientId: a.patientId || a.patient?.id || "N/A",
        staff: typeof a.staff === 'object' 
          ? `${a.staff?.firstName || ''} ${a.staff?.lastName || ''}`.trim() 
          : a.staff || "Unknown",
      }));
      setAppointments(transformed);
      setIsLoading(false);
    };
    fetchAppointments();
  }, []);

  const filtered = appointments.filter(a =>
    `${a.patient} ${a.id} ${a.purpose}`.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return view === "list" ? <AppointmentsSkeleton /> : <AppointmentsCalendarSkeleton />;
  }

  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 animate-fade-in-up">
        <div>
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Appointments</h1>
          <p className="text-xs sm:text-sm text-gray-500">Manage patient appointments and schedules</p>
        </div>
        <div className="flex gap-2">
          <div className="flex border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setView("list")}
              className={`px-2 sm:px-3 py-1.5 sm:py-2 transition-colors text-xs sm:text-sm ${view === "list" ? "bg-blue-600 text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}
            >
              List
            </button>
            <button
              onClick={() => setView("calendar")}
              className={`px-2 sm:px-3 py-1.5 sm:py-2 transition-colors text-xs sm:text-sm ${view === "calendar" ? "bg-blue-600 text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}
            >
              Calendar
            </button>
          </div>
          <button
            onClick={() => setModal({ mode: "add" })}
            className="flex items-center gap-1 sm:gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg transition-colors text-xs sm:text-sm font-semibold"
          >
            <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Schedule</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 flex flex-col sm:flex-row gap-2 sm:gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search appointments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
          />
        </div>
        <div className="flex gap-2 sm:gap-3">
          <select className="flex-1 sm:flex-none px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 focus:outline-none text-xs sm:text-sm">
            <option>All Status</option>
            <option>Confirmed</option>
            <option>Pending</option>
            <option>Cancelled</option>
          </select>
          <input type="date" className="flex-1 sm:flex-none px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 focus:outline-none text-xs sm:text-sm" />
        </div>
      </div>

      {view === "list" ? (
        <>
          {/* Desktop Table */}
          <div className="hidden lg:block bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {["Appt ID", "Patient", "Staff / Doctor", "Scheduled Date", "Purpose", "Status", "Notes", "Actions"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-gray-500 text-xs font-semibold uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-gray-400 text-sm">
                      No appointments found. {appointments.length === 0 ? "Click 'Schedule Appointment' to add one." : "Try adjusting your search."}
                    </td>
                  </tr>
                ) : (
                  filtered.map((a, i) => (
                    <tr key={a.id} className={`border-b border-gray-50 hover:bg-blue-50/30 transition-colors ${i % 2 === 0 ? "" : "bg-gray-50/30"}`}>
                      <td className="px-4 py-3">
                        <span className="text-blue-600 text-sm font-semibold">{a.id}</span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-gray-800 text-sm font-semibold">{a.patient}</p>
                        <p className="text-gray-400 text-xs">{a.patientId}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-sm">{a.staff}</td>
                      <td className="px-4 py-3 text-gray-600 text-sm">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-blue-400" />
                          {a.scheduledDate}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-sm">{a.purpose}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor[a.status as keyof typeof statusColor] || 'bg-gray-100 text-gray-600'}`}>{a.status}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 max-w-[120px] text-xs">
                        <span className="truncate block">{a.notes || "—"}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button onClick={() => setModal({ mode: "view", appt: a })} className="px-2 py-1 text-blue-600 hover:bg-blue-50 rounded text-xs transition-colors">View</button>
                          <button onClick={() => setModal({ mode: "edit", appt: a })} className="px-2 py-1 text-gray-500 hover:bg-gray-100 rounded text-xs transition-colors">Edit</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-3">
            {filtered.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">
                No appointments found. {appointments.length === 0 ? "Click 'Schedule Appointment' to add one." : "Try adjusting your search."}
              </div>
            ) : (
              filtered.map((a) => (
                <div key={a.id} className="bg-white rounded-xl border border-gray-200 p-4 hover:border-blue-300 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="text-blue-600 text-xs font-semibold">{a.id}</span>
                      <p className="text-gray-800 text-sm font-semibold mt-0.5">{a.patient}</p>
                    <p className="text-gray-400 text-xs">{a.patientId}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-[0.65rem] font-medium ${statusColor[a.status as keyof typeof statusColor] || statusColor.Pending}`}>{a.status}</span>
                </div>
                <div className="space-y-1.5 mb-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-xs">Staff</span>
                    <span className="text-gray-600 text-xs">{a.staff}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-xs">Date</span>
                    <span className="text-gray-600 text-xs flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-blue-400" />
                      {a.scheduledDate}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-xs">Purpose</span>
                    <span className="text-gray-600 text-xs">{a.purpose}</span>
                  </div>
                </div>
                <div className="flex gap-2 border-t border-gray-50 pt-3">
                  <button onClick={() => setModal({ mode: "view", appt: a })} className="flex-1 py-1.5 text-blue-600 hover:bg-blue-50 rounded text-xs transition-colors border border-gray-200">View</button>
                  <button onClick={() => setModal({ mode: "edit", appt: a })} className="flex-1 py-1.5 text-gray-500 hover:bg-gray-100 rounded text-xs transition-colors border border-gray-200">Edit</button>
                </div>
              </div>
            ))
            )}
          </div>
        </>
      ) : (
        /* Calendar View */
        <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h3 className="text-gray-800 text-sm sm:text-base font-bold">March 2026</h3>
            <div className="flex gap-2">
              <button className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"><ChevronLeft className="w-4 h-4" /></button>
              <button className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-0.5 sm:gap-1 mb-2">
            {daysOfWeek.map(d => (
              <div key={d} className="text-center text-gray-400 py-1 sm:py-2 text-[0.65rem] sm:text-xs font-semibold">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
            {calendarDays.map((day, i) => (
              <div
                key={i}
                className={`min-h-[50px] sm:min-h-[80px] p-1 sm:p-2 rounded-lg border transition-colors ${
                  day === 28 ? "border-blue-400 bg-blue-50" :
                  day ? "border-gray-100 hover:bg-gray-50" :
                  "border-transparent"
                }`}
              >
                {day && (
                  <>
                    <p className={`${day === 28 ? "text-blue-700" : "text-gray-600"} mb-0.5 sm:mb-1 text-[0.65rem] sm:text-sm ${day === 28 ? "font-bold" : "font-normal"}`}>
                      {day}
                    </p>
                    {appointmentDays.includes(day) && (
                      <div className="space-y-0.5 hidden sm:block">
                        {day === 28 && (
                          <>
                            <div className="bg-blue-500 text-white px-1 py-0.5 rounded truncate text-[0.5rem] sm:text-[0.6rem]">09:00 Villanueva</div>
                            <div className="bg-teal-500 text-white px-1 py-0.5 rounded truncate text-[0.5rem] sm:text-[0.6rem]">13:00 Pascual</div>
                          </>
                        )}
                        {day === 30 && (
                          <div className="bg-yellow-500 text-white px-1 py-0.5 rounded truncate text-[0.5rem] sm:text-[0.6rem]">09:00 Santos</div>
                        )}
                        {day === 31 && (
                          <div className="bg-violet-500 text-white px-1 py-0.5 rounded truncate text-[0.5rem] sm:text-[0.6rem]">10:00 Dela Cruz</div>
                        )}
                      </div>
                    )}
                    {appointmentDays.includes(day) && (
                      <div className="sm:hidden">
                        <div className={`w-1.5 h-1.5 rounded-full ${day === 28 ? "bg-blue-500" : day === 30 ? "bg-yellow-500" : "bg-violet-500"}`}></div>
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
