import { useState } from "react";
import { Search, Plus, Eye, Edit2, Filter, ChevronLeft, ChevronRight, X } from "lucide-react";
import { mockPatients, type Patient } from "../statics/patients";

function PatientModal({ patient, onClose, mode }: { patient?: Patient | null; onClose: () => void; mode: "view" | "add" | "edit" }) {
  const isView = mode === "view";
  const title = mode === "add" ? "Register New Patient" : mode === "edit" ? "Edit Patient" : "Patient Details";

  const [form, setForm] = useState(patient || {
    id: "", firstName: "", lastName: "", dob: "", gender: "", bloodType: "", barangay: "",
    contact: "", status: "Active", registered: "", philhealth: "",
  });

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white/90 backdrop-blur-sm z-10">
          <h2 className="text-gray-900" style={{ fontSize: "1.1rem", fontWeight: 700 }}>{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-all duration-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Patient Info */}
          <div>
            <h3 className="text-gray-600 mb-3 flex items-center gap-2" style={{ fontSize: "0.8rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              <span className="w-5 h-0.5 bg-blue-500 inline-block" /> Personal Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "First Name", key: "firstName" },
                { label: "Last Name", key: "lastName" },
                { label: "Date of Birth", key: "dob", type: "date" },
                { label: "Gender", key: "gender" },
                { label: "Blood Type", key: "bloodType" },
                { label: "Civil Status", key: "civilStatus" },
              ].map(({ label, key, type }) => (
                <div key={key}>
                  <label className="block text-gray-500 mb-1" style={{ fontSize: "0.75rem" }}>{label}</label>
                  {isView ? (
                    <p className="text-gray-800 py-2 border-b border-gray-100" style={{ fontSize: "0.875rem", fontWeight: 500 }}>
                      {(form as any)[key] || "—"}
                    </p>
                  ) : (
                    <input
                      type={type || "text"}
                      value={(form as any)[key] || ""}
                      onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{ fontSize: "0.875rem" }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-gray-600 mb-3 flex items-center gap-2" style={{ fontSize: "0.8rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              <span className="w-5 h-0.5 bg-teal-500 inline-block" /> Contact Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Contact Number", key: "contact" },
                { label: "Barangay", key: "barangay" },
                { label: "Address", key: "address" },
                { label: "Emergency Contact", key: "emergencyContact" },
                { label: "Emergency Contact No.", key: "emergencyContactNumber" },
                { label: "PhilHealth No.", key: "philhealth" },
              ].map(({ label, key }) => (
                <div key={key}>
                  <label className="block text-gray-500 mb-1" style={{ fontSize: "0.75rem" }}>{label}</label>
                  {isView ? (
                    <p className="text-gray-800 py-2 border-b border-gray-100" style={{ fontSize: "0.875rem", fontWeight: 500 }}>
                      {(form as any)[key] || "—"}
                    </p>
                  ) : (
                    <input
                      type="text"
                      value={(form as any)[key] || ""}
                      onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{ fontSize: "0.875rem" }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Medical History (view only) */}
          {isView && (
            <div>
              <h3 className="text-gray-600 mb-3 flex items-center gap-2" style={{ fontSize: "0.8rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                <span className="w-5 h-0.5 bg-violet-500 inline-block" /> Medical History
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500" style={{ fontSize: "0.8rem" }}>Hypertension</span>
                  <span className="text-green-600" style={{ fontSize: "0.8rem", fontWeight: 500 }}>Active</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-500" style={{ fontSize: "0.8rem" }}>Type 2 Diabetes</span>
                  <span className="text-gray-400" style={{ fontSize: "0.8rem", fontWeight: 500 }}>Resolved</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {!isView && (
          <div className="p-6 border-t border-gray-100 flex gap-3 justify-end bg-gray-50/50">
            <button onClick={onClose} className="px-5 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-100 transition-all duration-200 hover:border-gray-300" style={{ fontSize: "0.875rem" }}>
              Cancel
            </button>
            <button onClick={onClose} className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg press-effect" style={{ fontSize: "0.875rem", fontWeight: 600 }}>
              {mode === "add" ? "Register Patient" : "Save Changes"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function PatientsPage() {
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<{ mode: "view" | "add" | "edit"; patient?: Patient } | null>(null);

  const filtered = mockPatients.filter(p =>
    `${p.firstName} ${p.lastName} ${p.id} ${p.barangay}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-gray-900" style={{ fontSize: "1.5rem", fontWeight: 700 }}>Patients</h1>
          <p className="text-gray-500" style={{ fontSize: "0.875rem" }}>Manage and view patient records</p>
        </div>
        <button
          onClick={() => setModal({ mode: "add" })}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 press-effect"
          style={{ fontSize: "0.875rem", fontWeight: 600 }}
        >
          <Plus className="w-4 h-4" /> Register Patient
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-3 items-center shadow-card animate-fade-in-up animation-delay-100">
        <div className="relative flex-1 min-w-[240px] group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 transition-colors group-focus-within:text-blue-500" />
          <input
            type="text"
            placeholder="Search by name, ID, barangay..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200"
            style={{ fontSize: "0.875rem" }}
          />
        </div>
        <select className="px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-gray-300 transition-all duration-200 cursor-pointer" style={{ fontSize: "0.875rem" }}>
          <option>All Barangays</option>
          <option>Sta. Rita</option>
          <option>Gordon Heights</option>
          <option>New Ilalim</option>
          <option>Kalaklan</option>
        </select>
        <select className="px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-gray-300 transition-all duration-200 cursor-pointer" style={{ fontSize: "0.875rem" }}>
          <option>All Status</option>
          <option>Active</option>
          <option>Inactive</option>
        </select>
        <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200" style={{ fontSize: "0.875rem" }}>
          <Filter className="w-4 h-4" /> More Filters
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-card animate-fade-in-up animation-delay-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-200">
                {["Patient ID", "Name", "Date of Birth", "Gender", "Blood Type", "Barangay", "Contact", "Status", "Actions"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-gray-500" style={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <tr 
                  key={p.id} 
                  className={`border-b border-gray-50 hover:bg-blue-50/50 transition-all duration-200 cursor-pointer group ${i % 2 === 0 ? "" : "bg-gray-50/30"}`}
                >
                  <td className="px-4 py-3">
                    <span className="text-blue-600 group-hover:text-blue-700 transition-colors" style={{ fontSize: "0.8rem", fontWeight: 600 }}>{p.id}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center text-blue-700 flex-shrink-0 group-hover:scale-110 transition-transform" style={{ fontSize: "0.65rem", fontWeight: 700 }}>
                        {p.firstName[0]}{p.lastName[0]}
                      </div>
                      <span className="text-gray-800 group-hover:text-blue-700 transition-colors" style={{ fontSize: "0.875rem", fontWeight: 500 }}>{p.firstName} {p.lastName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600" style={{ fontSize: "0.8rem" }}>{p.dob}</td>
                  <td className="px-4 py-3 text-gray-600" style={{ fontSize: "0.8rem" }}>{p.gender}</td>
                  <td className="px-4 py-3">
                    <span className="bg-violet-100 text-violet-700 px-2 py-0.5 rounded transition-transform group-hover:scale-105 inline-block" style={{ fontSize: "0.75rem", fontWeight: 500 }}>{p.bloodType}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600" style={{ fontSize: "0.8rem" }}>{p.barangay}</td>
                  <td className="px-4 py-3 text-gray-600" style={{ fontSize: "0.8rem" }}>{p.contact}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full transition-all group-hover:shadow-sm ${p.status === "Active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`} style={{ fontSize: "0.72rem", fontWeight: 500 }}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setModal({ mode: "view", patient: p })} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:scale-110">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button onClick={() => setModal({ mode: "edit", patient: p })} className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-all duration-200 hover:scale-110">
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50/50">
          <p className="text-gray-400" style={{ fontSize: "0.8rem" }}>Showing {filtered.length} of {mockPatients.length} patients</p>
          <div className="flex items-center gap-1">
            <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200 hover:scale-105">
              <ChevronLeft className="w-4 h-4" />
            </button>
            {[1, 2, 3].map(n => (
              <button key={n} className={`w-8 h-8 rounded-lg transition-all duration-200 ${n === 1 ? "bg-blue-600 text-white shadow-md" : "text-gray-500 hover:bg-gray-100"}`} style={{ fontSize: "0.8rem" }}>
                {n}
              </button>
            ))}
            <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200 hover:scale-105">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {modal && (
        <PatientModal mode={modal.mode} patient={modal.patient} onClose={() => setModal(null)} />
      )}
    </div>
  );
}
