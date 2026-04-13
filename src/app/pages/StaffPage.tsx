import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Search, Plus, Eye, Edit2, X, UserPlus } from "lucide-react";
import { staffService } from "../services/staffService";
import { StaffSkeleton } from "../components/skeletons/StaffSkeleton";
import { formatEntityId } from "../utils";

const roleColor = {
  Admin: "text-blue-600 bg-blue-50 border-blue-200",
  Employee: "text-green-600 bg-green-50 border-green-200"
};

function StaffModal({ staff, onClose, mode }: { staff?: any; onClose: () => void; mode: "view" | "add" | "edit" }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-2 sm:p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100 sticky top-0 bg-white/90 backdrop-blur-sm z-10">
          <h2 className="text-sm sm:text-base lg:text-lg font-bold text-gray-900">
            {mode === "add" ? "Add Staff Member" : mode === "edit" ? "Edit Staff" : "Staff Details"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-all duration-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {mode === "view" && staff && (
          <div className="p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-700 text-base sm:text-xl font-bold">
                {staff.firstName[0]}{staff.lastName[0]}
              </div>
              <div>
                <p className="text-sm sm:text-lg font-bold text-gray-900">{staff.firstName} {staff.lastName}</p>
                <span className={`px-2 py-0.5 rounded-full text-[0.65rem] sm:text-xs font-medium ${roleColor[staff.role as keyof typeof roleColor] || "bg-gray-100 text-gray-600"}`}>
                  {staff.role}
                </span>
              </div>
            </div>
            <div className="space-y-2 sm:space-y-3">
              {[
                { label: "Staff ID", value: formatEntityId(staff.id, "STF") },
                { label: "Barangay Station", value: staff.station },
                { label: "License Number", value: staff.licenseNumber },
                { label: "Contact Number", value: staff.contact },
                { label: "Email", value: staff.email },
                { label: "Account Status", value: staff.accountStatus },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between py-1.5 sm:py-2 border-b border-gray-50">
                  <span className="text-gray-400 text-xs sm:text-sm">{label}</span>
                  <span className="text-gray-800 text-xs sm:text-sm font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {mode !== "view" && (
          <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
                  <label className="block text-gray-500 mb-1 text-[0.65rem] sm:text-xs">{label}</label>
                  <input
                    type={type || "text"}
                    defaultValue={value || ""}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {mode !== "view" && (
          <div className="p-4 sm:p-6 border-t border-gray-100 flex flex-col sm:flex-row gap-2 sm:gap-3 justify-end">
            <button onClick={onClose} className="px-3 sm:px-5 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors text-xs sm:text-sm">Cancel</button>
            <button onClick={onClose} className="px-3 sm:px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm font-semibold">
              {mode === "add" ? "Add Staff" : "Save Changes"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function StaffPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<{ mode: "view" | "add" | "edit"; staff?: any } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [staff, setStaff] = useState<any[]>([]);

  useEffect(() => {
    const fetchStaff = async () => {
      setIsLoading(true);
      const data = await staffService.getAll();
      // Transform nested station object to flat string
      const transformed = data.map((s: any) => ({
        ...s,
        station: typeof s.station === 'object' ? s.station?.name : s.station || "N/A",
        username: s.user?.username || s.username || "N/A",
      }));
      setStaff(transformed);
      setIsLoading(false);
    };
    fetchStaff();
  }, []);

  const filtered = staff.filter(s =>
    `${s.firstName} ${s.lastName} ${s.id} ${s.role} ${s.station}`.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return <StaffSkeleton />;
  }

  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 animate-fade-in-up">
        <div>
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-xs sm:text-sm text-gray-500">Manage health center staff and accounts</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => navigate('/register')}
            className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg transition-colors text-xs sm:text-sm font-semibold"
          >
            <UserPlus className="w-4 h-4" /> Register User
          </button>
          <button
            onClick={() => setModal({ mode: "add" })}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg transition-colors text-xs sm:text-sm font-semibold"
          >
            <Plus className="w-4 h-4" /> Add Staff
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 flex flex-col sm:flex-row gap-2 sm:gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search staff by name, role, station..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
          />
        </div>
        <select className="px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 focus:outline-none text-xs sm:text-sm">
          <option>All Roles</option>
          <option>Doctor</option>
          <option>Nurse</option>
          <option>Midwife</option>
          <option>BHW</option>
        </select>
      </div>

      {/* Staff cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
        {filtered.map((s, index) => (
          <div 
            key={s.id} 
            className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 hover:border-blue-300 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-in-up"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-start justify-between mb-3 sm:mb-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-700 text-sm sm:text-base font-bold">
                  {s.firstName[0]}{s.lastName[0]}
                </div>
                <div>
                  <p className="text-gray-900 text-sm sm:text-base font-bold">{s.firstName} {s.lastName}</p>
                  <span className={`inline-block px-2 py-0.5 rounded-full mt-0.5 text-[0.6rem] sm:text-[0.7rem] font-medium ${roleColor[s.role as keyof typeof roleColor] || "bg-gray-100 text-gray-600"}`}>
                    {s.role}
                  </span>
                </div>
              </div>
              <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[0.6rem] sm:text-[0.7rem] font-medium ${s.accountStatus === "Active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                {s.accountStatus}
              </span>
            </div>
            <div className="space-y-1 sm:space-y-1.5 mb-3 sm:mb-4">
              <p className="text-gray-500 text-[0.65rem] sm:text-xs">
                <span className="text-gray-400">Station: </span>{s.station}
              </p>
              <p className="text-gray-500 text-[0.65rem] sm:text-xs">
                <span className="text-gray-400">License: </span>{s.licenseNumber}
              </p>
              <p className="text-gray-500 text-[0.65rem] sm:text-xs">
                <span className="text-gray-400">Contact: </span>{s.contact}
              </p>
              <p className="text-gray-500 truncate text-[0.65rem] sm:text-xs">
                <span className="text-gray-400">Email: </span>{s.email}
              </p>
            </div>
            <div className="flex gap-2 border-t border-gray-50 pt-2 sm:pt-3">
              <button
                onClick={() => setModal({ mode: "view", staff: s })}
                className="flex-1 flex items-center justify-center gap-1 sm:gap-1.5 py-1.5 border border-gray-200 text-gray-500 hover:text-blue-600 hover:border-blue-300 rounded-lg transition-colors text-[0.65rem] sm:text-xs"
              >
                <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> View
              </button>
              <button
                onClick={() => setModal({ mode: "edit", staff: s })}
                className="flex-1 flex items-center justify-center gap-1 sm:gap-1.5 py-1.5 border border-gray-200 text-gray-500 hover:text-teal-600 hover:border-teal-300 rounded-lg transition-colors text-[0.65rem] sm:text-xs"
              >
                <Edit2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Edit
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
