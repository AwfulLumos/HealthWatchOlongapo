import { useState } from "react";
import { Search, Plus, Eye, Edit2, X, UserCog } from "lucide-react";
import { mockStaff, roleColors } from "../statics/staff";

const roleColor = roleColors;

function StaffModal({ staff, onClose, mode }: { staff?: any; onClose: () => void; mode: "view" | "add" | "edit" }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white/90 backdrop-blur-sm z-10">
          <h2 className="text-gray-900" style={{ fontSize: "1.1rem", fontWeight: 700 }}>
            {mode === "add" ? "Add Staff Member" : mode === "edit" ? "Edit Staff" : "Staff Details"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-all duration-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {mode === "view" && staff && (
          <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-700" style={{ fontSize: "1.25rem", fontWeight: 700 }}>
                {staff.firstName[0]}{staff.lastName[0]}
              </div>
              <div>
                <p className="text-gray-900" style={{ fontSize: "1.1rem", fontWeight: 700 }}>{staff.firstName} {staff.lastName}</p>
                <span className={`px-2 py-0.5 rounded-full ${roleColor[staff.role] || "bg-gray-100 text-gray-600"}`} style={{ fontSize: "0.75rem", fontWeight: 500 }}>
                  {staff.role}
                </span>
              </div>
            </div>
            <div className="space-y-3">
              {[
                { label: "Staff ID", value: staff.id },
                { label: "Barangay Station", value: staff.station },
                { label: "License Number", value: staff.licenseNumber },
                { label: "Contact Number", value: staff.contact },
                { label: "Email", value: staff.email },
                { label: "Account Status", value: staff.accountStatus },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-400" style={{ fontSize: "0.8rem" }}>{label}</span>
                  <span className="text-gray-800" style={{ fontSize: "0.8rem", fontWeight: 500 }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {mode !== "view" && (
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "First Name", key: "firstName", value: staff?.firstName },
                { label: "Last Name", key: "lastName", value: staff?.lastName },
                { label: "Role", key: "role", value: staff?.role },
                { label: "License Number", key: "licenseNumber", value: staff?.licenseNumber },
                { label: "Contact Number", key: "contact", value: staff?.contact },
                { label: "Email", key: "email", value: staff?.email, type: "email" },
                { label: "Barangay Station", key: "station", value: staff?.station },
                { label: "Account Status", key: "accountStatus", value: staff?.accountStatus },
              ].map(({ label, key, value, type }) => (
                <div key={key}>
                  <label className="block text-gray-500 mb-1" style={{ fontSize: "0.75rem" }}>{label}</label>
                  <input
                    type={type || "text"}
                    defaultValue={value || ""}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ fontSize: "0.875rem" }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {mode !== "view" && (
          <div className="p-6 border-t border-gray-100 flex gap-3 justify-end">
            <button onClick={onClose} className="px-5 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors" style={{ fontSize: "0.875rem" }}>Cancel</button>
            <button onClick={onClose} className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors" style={{ fontSize: "0.875rem", fontWeight: 600 }}>
              {mode === "add" ? "Add Staff" : "Save Changes"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function StaffPage() {
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<{ mode: "view" | "add" | "edit"; staff?: any } | null>(null);

  const filtered = mockStaff.filter(s =>
    `${s.firstName} ${s.lastName} ${s.id} ${s.role} ${s.station}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between animate-fade-in-up">
        <div>
          <h1 className="text-gray-900" style={{ fontSize: "1.5rem", fontWeight: 700 }}>Staff Management</h1>
          <p className="text-gray-500" style={{ fontSize: "0.875rem" }}>Manage health center staff and accounts</p>
        </div>
        <button
          onClick={() => setModal({ mode: "add" })}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg transition-colors"
          style={{ fontSize: "0.875rem", fontWeight: 600 }}
        >
          <Plus className="w-4 h-4" /> Add Staff
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search staff by name, role, station..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ fontSize: "0.875rem" }}
          />
        </div>
        <select className="px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 focus:outline-none" style={{ fontSize: "0.875rem" }}>
          <option>All Roles</option>
          <option>Doctor</option>
          <option>Nurse</option>
          <option>Midwife</option>
          <option>BHW</option>
        </select>
      </div>

      {/* Staff cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((s, index) => (
          <div 
            key={s.id} 
            className="bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-in-up"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-700" style={{ fontSize: "1rem", fontWeight: 700 }}>
                  {s.firstName[0]}{s.lastName[0]}
                </div>
                <div>
                  <p className="text-gray-900" style={{ fontSize: "0.9rem", fontWeight: 700 }}>{s.firstName} {s.lastName}</p>
                  <span className={`inline-block px-2 py-0.5 rounded-full mt-0.5 ${roleColor[s.role] || "bg-gray-100 text-gray-600"}`} style={{ fontSize: "0.7rem", fontWeight: 500 }}>
                    {s.role}
                  </span>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full ${s.accountStatus === "Active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`} style={{ fontSize: "0.7rem", fontWeight: 500 }}>
                {s.accountStatus}
              </span>
            </div>
            <div className="space-y-1.5 mb-4">
              <p className="text-gray-500" style={{ fontSize: "0.75rem" }}>
                <span className="text-gray-400">Station: </span>{s.station}
              </p>
              <p className="text-gray-500" style={{ fontSize: "0.75rem" }}>
                <span className="text-gray-400">License: </span>{s.licenseNumber}
              </p>
              <p className="text-gray-500" style={{ fontSize: "0.75rem" }}>
                <span className="text-gray-400">Contact: </span>{s.contact}
              </p>
              <p className="text-gray-500 truncate" style={{ fontSize: "0.75rem" }}>
                <span className="text-gray-400">Email: </span>{s.email}
              </p>
            </div>
            <div className="flex gap-2 border-t border-gray-50 pt-3">
              <button
                onClick={() => setModal({ mode: "view", staff: s })}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 border border-gray-200 text-gray-500 hover:text-blue-600 hover:border-blue-300 rounded-lg transition-colors"
                style={{ fontSize: "0.75rem" }}
              >
                <Eye className="w-3.5 h-3.5" /> View
              </button>
              <button
                onClick={() => setModal({ mode: "edit", staff: s })}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 border border-gray-200 text-gray-500 hover:text-teal-600 hover:border-teal-300 rounded-lg transition-colors"
                style={{ fontSize: "0.75rem" }}
              >
                <Edit2 className="w-3.5 h-3.5" /> Edit
              </button>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <StaffModal mode={modal.mode} staff={modal.staff} onClose={() => setModal(null)} />
      )}
    </div>
  );
}
