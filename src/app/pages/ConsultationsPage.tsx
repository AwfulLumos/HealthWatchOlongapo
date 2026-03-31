import { useState } from "react";
import { Search, Plus, Eye, Edit2, X, Activity, Thermometer, Heart } from "lucide-react";
import { 
  mockConsultations, 
  consultationTypeColors, 
  consultationStatusColors 
} from "../statics/consultations";

const typeColor = consultationTypeColors;
const statusColor = consultationStatusColors;

function ConsultationModal({ consultation, onClose, mode }: { consultation?: any; onClose: () => void; mode: "view" | "add" }) {
  const [tab, setTab] = useState<"info" | "vitals" | "prescription">("info");

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white/90 backdrop-blur-sm z-10">
          <div>
            <h2 className="text-gray-900" style={{ fontSize: "1.1rem", fontWeight: 700 }}>
              {mode === "add" ? "New Consultation" : `Consultation — ${consultation?.id}`}
            </h2>
            {consultation && <p className="text-gray-400" style={{ fontSize: "0.8rem" }}>{consultation.patient} &bull; {consultation.date}</p>}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-all duration-200 hover:rotate-90">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 px-6 bg-gray-50/50">
          {[
            { key: "info", label: "Consultation Info" },
            { key: "vitals", label: "Vital Signs" },
            { key: "prescription", label: "Prescription" },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as any)}
              className={`px-4 py-3 border-b-2 transition-all duration-200 relative ${tab === t.key ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100"}`}
              style={{ fontSize: "0.875rem", fontWeight: tab === t.key ? 600 : 400 }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {tab === "info" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Patient", value: consultation?.patient || "" },
                  { label: "Staff / Doctor", value: consultation?.staff || "" },
                  { label: "Consultation Date", value: consultation?.date || "", type: "date" },
                  { label: "Consultation Type", value: consultation?.type || "" },
                  { label: "Chief Complaint", value: consultation?.chiefComplaint || "", fullWidth: true },
                  { label: "Symptoms", value: consultation?.symptoms || "", fullWidth: true },
                  { label: "Diagnosis", value: consultation?.diagnosis || "", fullWidth: true },
                  { label: "ICD Code", value: consultation?.icdCode || "" },
                  { label: "Notes", value: "", fullWidth: true },
                ].map(({ label, value, type, fullWidth }) => (
                  <div key={label} className={fullWidth ? "col-span-2" : ""}>
                    <label className="block text-gray-500 mb-1" style={{ fontSize: "0.75rem" }}>{label}</label>
                    {mode === "view" ? (
                      <p className="text-gray-800 py-2 border-b border-gray-100" style={{ fontSize: "0.875rem", fontWeight: 500 }}>
                        {value || "—"}
                      </p>
                    ) : fullWidth && label === "Notes" ? (
                      <textarea
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        style={{ fontSize: "0.875rem" }}
                      />
                    ) : (
                      <input
                        type={type || "text"}
                        defaultValue={value}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        style={{ fontSize: "0.875rem" }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "vitals" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  { label: "BP Systolic (mmHg)", icon: Heart, value: "140", color: "text-red-500" },
                  { label: "BP Diastolic (mmHg)", icon: Heart, value: "90", color: "text-red-400" },
                  { label: "Pulse Rate (bpm)", icon: Activity, value: "82", color: "text-orange-500" },
                  { label: "Respiratory Rate", icon: Activity, value: "18", color: "text-blue-500" },
                  { label: "Temperature (°C)", icon: Thermometer, value: "36.8", color: "text-yellow-500" },
                  { label: "Blood Sugar (mg/dL)", icon: Activity, value: "110", color: "text-violet-500" },
                  { label: "Weight (kg)", icon: Activity, value: "65", color: "text-teal-500" },
                  { label: "Height (cm)", icon: Activity, value: "162", color: "text-teal-400" },
                  { label: "BMI", icon: Activity, value: "24.8", color: "text-green-500" },
                ].map(({ label, icon: Icon, value, color }) => (
                  <div key={label} className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className={`w-4 h-4 ${color}`} />
                      <p className="text-gray-500" style={{ fontSize: "0.72rem" }}>{label}</p>
                    </div>
                    {mode === "view" ? (
                      <p className={`${color}`} style={{ fontSize: "1.25rem", fontWeight: 700 }}>{value}</p>
                    ) : (
                      <input
                        type="number"
                        defaultValue={value}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        style={{ fontSize: "0.875rem" }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "prescription" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-gray-600" style={{ fontSize: "0.875rem" }}>Prescribed Medications</p>
                {mode !== "view" && (
                  <button className="flex items-center gap-1 text-blue-600 hover:text-blue-700" style={{ fontSize: "0.8rem", fontWeight: 600 }}>
                    <Plus className="w-4 h-4" /> Add Medicine
                  </button>
                )}
              </div>
              {[
                { medicine: "Amlodipine", dosage: "5mg", frequency: "Once daily", duration: "30 days", instructions: "Take in the morning" },
                { medicine: "Metformin", dosage: "500mg", frequency: "Twice daily", duration: "30 days", instructions: "Take with meals" },
              ].map((rx, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Medicine Name", value: rx.medicine },
                      { label: "Dosage", value: rx.dosage },
                      { label: "Frequency", value: rx.frequency },
                      { label: "Duration", value: rx.duration },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <p className="text-gray-400 mb-0.5" style={{ fontSize: "0.72rem" }}>{label}</p>
                        {mode === "view" ? (
                          <p className="text-gray-800" style={{ fontSize: "0.875rem", fontWeight: 500 }}>{value}</p>
                        ) : (
                          <input
                            type="text"
                            defaultValue={value}
                            className="w-full px-3 py-1.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            style={{ fontSize: "0.875rem" }}
                          />
                        )}
                      </div>
                    ))}
                    <div className="col-span-2">
                      <p className="text-gray-400 mb-0.5" style={{ fontSize: "0.72rem" }}>Instructions</p>
                      {mode === "view" ? (
                        <p className="text-gray-800" style={{ fontSize: "0.875rem", fontWeight: 500 }}>{rx.instructions}</p>
                      ) : (
                        <input
                          type="text"
                          defaultValue={rx.instructions}
                          className="w-full px-3 py-1.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          style={{ fontSize: "0.875rem" }}
                        />
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Follow-up section */}
              <div className="border-t border-gray-100 pt-4">
                <p className="text-gray-600 mb-3" style={{ fontSize: "0.875rem", fontWeight: 600 }}>Schedule Follow-up Appointment</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-500 mb-1" style={{ fontSize: "0.75rem" }}>Follow-up Date</label>
                    <input type="date" className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500" style={{ fontSize: "0.875rem" }} />
                  </div>
                  <div>
                    <label className="block text-gray-500 mb-1" style={{ fontSize: "0.75rem" }}>Purpose</label>
                    <input type="text" placeholder="Purpose of follow-up" className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500" style={{ fontSize: "0.875rem" }} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {mode !== "view" && (
          <div className="p-6 border-t border-gray-100 flex gap-3 justify-end bg-gray-50/50">
            <button onClick={onClose} className="px-5 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-100 transition-all duration-200 hover:border-gray-300" style={{ fontSize: "0.875rem" }}>
              Cancel
            </button>
            <button onClick={onClose} className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg press-effect" style={{ fontSize: "0.875rem", fontWeight: 600 }}>
              Save Consultation
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function ConsultationsPage() {
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<{ mode: "view" | "add"; consultation?: any } | null>(null);

  const filtered = mockConsultations.filter(c =>
    `${c.patient} ${c.id} ${c.diagnosis}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div className="flex items-center justify-between animate-fade-in-up">
        <div>
          <h1 className="text-gray-900" style={{ fontSize: "1.5rem", fontWeight: 700 }}>Consultations</h1>
          <p className="text-gray-500" style={{ fontSize: "0.875rem" }}>Log and manage patient consultations</p>
        </div>
        <button
          onClick={() => setModal({ mode: "add" })}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg transition-colors"
          style={{ fontSize: "0.875rem", fontWeight: 600 }}
        >
          <Plus className="w-4 h-4" /> New Consultation
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search consultations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ fontSize: "0.875rem" }}
          />
        </div>
        <select className="px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 focus:outline-none" style={{ fontSize: "0.875rem" }}>
          <option>All Types</option>
          <option>Regular</option>
          <option>Follow-up</option>
          <option>Emergency</option>
        </select>
        <input type="date" className="px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500" style={{ fontSize: "0.875rem" }} />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {["Consult ID", "Patient", "Staff / Doctor", "Date", "Chief Complaint", "Diagnosis", "Type", "Status", "Actions"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-gray-500" style={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => (
                <tr key={c.id} className={`border-b border-gray-50 hover:bg-blue-50/30 transition-colors ${i % 2 === 0 ? "" : "bg-gray-50/30"}`}>
                  <td className="px-4 py-3">
                    <span className="text-blue-600" style={{ fontSize: "0.8rem", fontWeight: 600 }}>{c.id}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-gray-800" style={{ fontSize: "0.8rem", fontWeight: 600 }}>{c.patient}</p>
                      <p className="text-gray-400" style={{ fontSize: "0.72rem" }}>{c.patientId}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600" style={{ fontSize: "0.8rem" }}>{c.staff}</td>
                  <td className="px-4 py-3 text-gray-600" style={{ fontSize: "0.8rem" }}>{c.date}</td>
                  <td className="px-4 py-3 text-gray-600 max-w-[160px]" style={{ fontSize: "0.8rem" }}>
                    <span className="truncate block">{c.chiefComplaint}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 max-w-[180px]" style={{ fontSize: "0.8rem" }}>
                    <span className="truncate block">{c.diagnosis}</span>
                    <span className="text-gray-400" style={{ fontSize: "0.7rem" }}>{c.icdCode}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full ${typeColor[c.type]}`} style={{ fontSize: "0.72rem", fontWeight: 500 }}>{c.type}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full ${statusColor[c.status]}`} style={{ fontSize: "0.72rem", fontWeight: 500 }}>{c.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => setModal({ mode: "view", consultation: c })} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <ConsultationModal mode={modal.mode} consultation={modal.consultation} onClose={() => setModal(null)} />
      )}
    </div>
  );
}
